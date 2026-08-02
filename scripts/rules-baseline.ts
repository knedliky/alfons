/**
 * Run every rule over the consuming repositories and record what it found.
 *
 * D-159 makes the rules advisory in v1 and defers promotion to blocking until
 * each has a measured false-positive rate. This is the measurement. Without it
 * "promote once calibrated" is a sentence with no procedure behind it, and the
 * rules stay advisory forever by default rather than by decision.
 *
 * The output is a per-rule count and a sample, written to rules-baseline.json
 * so successive runs can be compared. What it deliberately does NOT do is
 * decide which findings are false positives — that is a reading, not a count,
 * and pretending a script can do it would put a number on the one part of this
 * that needs a person.
 *
 * Run: bun run rules:baseline
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadManifest, ROOT } from '../src/mcp/manifest.js';
import { libraryFindings, review, rules } from '../src/rules/index.js';
import type { Surface } from '../src/manifest/types.js';

const REPOS = [
	{ name: 'atlas', path: '/Users/knedliky/Agents/atlas' },
	{ name: 'field-notes', path: '/Users/knedliky/Agents/field-notes' }
];

const manifest = loadManifest();

function svelteFiles(dir: string): string[] {
	const found: string[] = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
		const full = join(dir, entry.name);
		if (entry.isDirectory()) found.push(...svelteFiles(full));
		else if (entry.name.endsWith('.svelte')) found.push(full);
	}
	return found;
}

/**
 * Admin surfaces are identified by path, which is a guess and is recorded as
 * one. Getting it wrong inflates admin-token-on-public, so the count below is
 * reported per surface — a reader can see how much of the total rests on it.
 */
function surfaceOf(path: string): Surface {
	return /\/(admin|dashboard)\//.test(path) ? 'admin' : 'public';
}

interface RuleStat {
	rule: string;
	count: number;
	files: number;
	samples: { file: string; line: number; message: string }[];
}

const stats = new Map<string, RuleStat>(
	rules.map((rule) => [rule.id, { rule: rule.id, count: 0, files: 0, samples: [] }])
);
const filesSeenPerRule = new Map<string, Set<string>>(rules.map((rule) => [rule.id, new Set()]));

let reviewed = 0;
let unparseable = 0;
const perRepo: Record<string, number> = {};

for (const repo of REPOS) {
	// Guard on src/, not the repo root. Field Notes is checked out and has no
	// src/ at all — it is a Swift project — so a root-level existence check
	// passed and then the walk threw. A repository with no Svelte in it is a
	// legitimate thing to be asked to review; it just has nothing to say.
	const sourceDir = join(repo.path, 'src');
	if (!existsSync(sourceDir)) {
		console.warn(`skipping ${repo.name}: no ${sourceDir}`);
		perRepo[repo.name] = 0;
		continue;
	}

	const files = svelteFiles(sourceDir);
	let repoViolations = 0;

	for (const file of files) {
		const source = readFileSync(file, 'utf8');
		const result = review(source, manifest, surfaceOf(file));
		reviewed++;

		if (result.parseError && !result.violations.length) {
			unparseable++;
			continue;
		}

		for (const found of result.violations) {
			const stat = stats.get(found.rule)!;
			stat.count++;
			repoViolations++;
			filesSeenPerRule.get(found.rule)!.add(file);
			if (stat.samples.length < 3) {
				stat.samples.push({
					file: file.replace(repo.path + '/', `${repo.name}/`),
					line: found.line,
					message: found.message
				});
			}
		}
	}

	perRepo[repo.name] = repoViolations;
	console.log(`${repo.name}: ${files.length} components, ${repoViolations} findings`);
}

for (const [id, files] of filesSeenPerRule) stats.get(id)!.files = files.size;

const ordered = [...stats.values()].sort((a, b) => b.count - a.count);
const library = libraryFindings(manifest);

console.log(`\n${reviewed} components reviewed, ${unparseable} unparseable\n`);
console.log('rule                      findings   files');
for (const stat of ordered) {
	console.log(
		`  ${stat.rule.padEnd(24)}${String(stat.count).padStart(6)}${String(stat.files).padStart(8)}`
	);
}
console.log(`\nlibrary-scope findings: ${library.length}`);

writeFileSync(
	join(ROOT, 'rules-baseline.json'),
	`${JSON.stringify(
		{
			note:
				'Advisory baseline for D-159. Counts only — which of these are false positives is ' +
				'a reading, not a number, and is deliberately not decided here. A rule is a ' +
				'candidate for promotion to blocking once its findings have been read and its ' +
				'false-positive rate is known.',
			componentsReviewed: reviewed,
			unparseable,
			perRepo,
			rules: ordered,
			libraryFindings: library.length
		},
		null,
		2
	)}\n`
);

console.log('\nwrote rules-baseline.json');
