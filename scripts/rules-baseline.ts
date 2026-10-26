/**
 * Run every rule over Alfons and its consuming repositories, record what it
 * found, and refuse any rise in that record.
 *
 * D-159 makes the rules advisory in v1 and defers promotion to blocking until
 * each has a measured false-positive rate. This is the measurement. Without it
 * "promote once calibrated" is a sentence with no procedure behind it, and the
 * rules stay advisory forever by default rather than by decision.
 *
 * The output is a per-rule count per repository and a sample, written to
 * rules-baseline.json so successive runs can be compared. What it deliberately
 * does NOT do is decide which findings are false positives — that is a reading,
 * not a count, and pretending a script can do it would put a number on the one
 * part of this that needs a person.
 *
 * With --check the same counts become a ratchet (AL-024). A count may fall but
 * never rise: any rule whose count in any repository climbs above the committed
 * number fails the run, and any that fell is lowered in the file so the gain
 * cannot be given back. This blocks growth only. Existing findings stay
 * advisory, so no rule is promoted to blocking before D-159 says it may be.
 *
 * Run:
 *   bun run rules:baseline                   rewrite the baseline from scratch
 *   bun run rules:ratchet                    check every checked-out repository
 *   bun run rules:ratchet --repo <path>      check one repository, any repository
 *   ... --baseline <file>                    use another baseline file (tests)
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, join, resolve } from 'node:path';
import { loadManifest, ROOT } from '../src/mcp/manifest.js';
import { libraryFindings, review, rules } from '../src/rules/index.js';
import type { Manifest, Surface } from '../src/manifest/types.js';

interface Repository {
	name: string;
	/** The checkout. Absent means not checked out on this machine, which says nothing about its findings. */
	root: string;
	/** Where its Svelte lives. Absent under a present root means it has none, which is a count of zero. */
	sourceDir: string;
}

function repository(name: string, root: string, sourceDir = join(root, 'src')): Repository {
	return { name, root, sourceDir };
}

const MOTIVKA = join(homedir(), 'Motivka');

const REPOS: Repository[] = [
	repository('alfons', ROOT, join(ROOT, 'src', 'components')),
	repository('website', join(MOTIVKA, 'website')),
	// Field Notes is a Swift project with no src/ at all. It stays listed so
	// that the day it gains Svelte, the ratchet already covers it.
	repository('field-notes', join(MOTIVKA, 'ios-app'))
];

/** Per repository, per rule id, the number of findings. */
export type RuleCounts = Record<string, Record<string, number>>;

export interface RatchetChange {
	repo: string;
	rule: string;
	committed: number;
	measured: number;
}

export interface RatchetResult {
	rises: RatchetChange[];
	falls: RatchetChange[];
	/** A repository or rule the baseline has never counted. Recorded as found, not judged. */
	adopted: RatchetChange[];
	/** The counts to commit: every fall applied, every rise refused. */
	next: RuleCounts;
}

/**
 * Compare measured counts with committed ones. Pure, so the test can drive it
 * without a filesystem.
 *
 * Only repositories present in `measured` are judged. A repository the run
 * could not reach keeps its committed counts untouched: CI has no sibling
 * checkouts, and reading their absence as zero would lower the baseline to
 * nothing on every push.
 */
export function ratchet(committed: RuleCounts, measured: RuleCounts): RatchetResult {
	const rises: RatchetChange[] = [];
	const falls: RatchetChange[] = [];
	const adopted: RatchetChange[] = [];
	const next: RuleCounts = structuredClone(committed);

	for (const [repo, measuredRules] of Object.entries(measured)) {
		const committedRules = committed[repo];
		next[repo] ??= {};
		for (const [rule, count] of Object.entries(measuredRules)) {
			const previous = committedRules?.[rule];
			const change = { repo, rule, committed: previous ?? 0, measured: count };
			// A new rule or a new repository is a new measurement, not growth: the
			// findings existed before anything counted them. Failing on them would
			// make adding a rule mean fixing every consumer first.
			if (previous === undefined) {
				adopted.push(change);
				next[repo][rule] = count;
			} else if (count > previous) {
				rises.push(change);
			} else if (count < previous) {
				falls.push(change);
				next[repo][rule] = count;
			}
		}
	}

	return { rises, falls, adopted, next };
}

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

interface Sample {
	file: string;
	line: number;
	message: string;
}

interface RepositoryScan {
	components: number;
	unparseable: number;
	counts: Record<string, number>;
	files: Map<string, Set<string>>;
	samples: Map<string, Sample[]>;
}

/** Every rule appears in the counts, zeros included, so a missing key can only mean a rule added since. */
function scan(repo: Repository, manifest: Manifest): RepositoryScan {
	const result: RepositoryScan = {
		components: 0,
		unparseable: 0,
		counts: Object.fromEntries(rules.map((rule) => [rule.id, 0])),
		files: new Map(rules.map((rule) => [rule.id, new Set()])),
		samples: new Map(rules.map((rule) => [rule.id, []]))
	};
	if (!existsSync(repo.sourceDir)) return result;

	for (const file of svelteFiles(repo.sourceDir)) {
		const outcome = review(readFileSync(file, 'utf8'), manifest, surfaceOf(file));
		result.components++;

		if (outcome.parseError && !outcome.violations.length) {
			result.unparseable++;
			continue;
		}

		for (const found of outcome.violations) {
			result.counts[found.rule]++;
			result.files.get(found.rule)!.add(file);
			const samples = result.samples.get(found.rule)!;
			if (samples.length < 3) {
				samples.push({
					file: file.replace(repo.root + '/', `${repo.name}/`),
					line: found.line,
					message: found.message
				});
			}
		}
	}
	return result;
}

interface RepositoryEntry {
	components?: number;
	findings: number;
	rules: Record<string, number>;
}

interface BaselineFile {
	repositories?: Record<string, RepositoryEntry>;
	[key: string]: unknown;
}

function sum(counts: Record<string, number>): number {
	return Object.values(counts).reduce((total, count) => total + count, 0);
}

function readBaseline(path: string): BaselineFile {
	return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as BaselineFile) : {};
}

function committedCounts(baseline: BaselineFile): RuleCounts {
	return Object.fromEntries(
		Object.entries(baseline.repositories ?? {}).map(([name, entry]) => [name, entry.rules])
	);
}

function writeJson(path: string, value: unknown): void {
	writeFileSync(path, `${JSON.stringify(value, null, '\t')}\n`);
}

/**
 * A path names a known repository when it is that repository's checkout, so
 * `--repo ~/Motivka/website` and a bare `rules:ratchet` judge the same counts.
 * Anything else is taken as a repository whose Svelte lives under src/.
 */
function repositoryAt(path: string): Repository {
	const root = resolve(path);
	return REPOS.find((repo) => resolve(repo.root) === root) ?? repository(basename(root), root);
}

interface Options {
	check: boolean;
	repo?: string;
	baseline: string;
}

function parseOptions(argv: string[]): Options {
	const options: Options = { check: false, baseline: join(ROOT, 'rules-baseline.json') };
	for (let index = 0; index < argv.length; index++) {
		const argument = argv[index];
		if (argument === '--check') {
			options.check = true;
			continue;
		}
		const value = argv[++index];
		if (value === undefined) throw new Error(`${argument} needs a value`);
		if (argument === '--repo') options.repo = value;
		else if (argument === '--baseline') options.baseline = resolve(value);
		else throw new Error(`unrecognised argument ${argument}`);
	}
	return options;
}

/** Repositories this run can see. A root that is not checked out is skipped, never counted as zero. */
function reachable(repos: Repository[]): Repository[] {
	return repos.filter((repo) => {
		if (existsSync(repo.root)) return true;
		console.warn(`skipping ${repo.name}: ${repo.root} is not checked out`);
		return false;
	});
}

function runCheck(options: Options, manifest: Manifest): number {
	const repos = reachable(options.repo ? [repositoryAt(options.repo)] : REPOS);
	const baseline = readBaseline(options.baseline);
	const measured: RuleCounts = {};
	for (const repo of repos) measured[repo.name] = scan(repo, manifest).counts;

	const result = ratchet(committedCounts(baseline), measured);

	for (const change of result.adopted) {
		console.log(`  new     ${change.repo} ${change.rule}: ${change.measured} recorded`);
	}
	for (const change of result.falls) {
		console.log(
			`  lowered ${change.repo} ${change.rule}: ${change.committed} -> ${change.measured}`
		);
	}
	for (const change of result.rises) {
		console.error(
			`  ROSE    ${change.repo} ${change.rule}: ${change.committed} -> ${change.measured}`
		);
	}

	if (result.rises.length) {
		console.error(
			`\nrules ratchet failed: ${result.rises.length} rule count(s) rose above ${options.baseline}.` +
				'\nRemove the new findings. The baseline is not rewritten on a failed run.'
		);
		return 1;
	}

	if (result.falls.length || result.adopted.length) {
		const repositories = baseline.repositories ?? {};
		for (const [name, counts] of Object.entries(result.next)) {
			repositories[name] = { ...repositories[name], findings: sum(counts), rules: counts };
		}
		writeJson(options.baseline, { ...baseline, repositories });
		console.log(`\nwrote ${options.baseline}; commit it so the lower counts hold`);
	}

	console.log(`rules ratchet passed over ${repos.map((repo) => repo.name).join(', ')}`);
	return 0;
}

function runBaseline(options: Options, manifest: Manifest): number {
	const previous = readBaseline(options.baseline);
	const previousCounts = committedCounts(previous);
	const repos = options.repo ? [repositoryAt(options.repo)] : REPOS;

	const repositories: Record<string, RepositoryEntry> = {
		...(previous.repositories ?? {})
	};
	const totals = new Map(
		rules.map((rule) => [rule.id, { rule: rule.id, count: 0, files: 0, samples: [] as Sample[] }])
	);
	let reviewed = 0;
	let unparseable = 0;

	for (const repo of reachable(repos)) {
		const found = scan(repo, manifest);
		reviewed += found.components;
		unparseable += found.unparseable;
		const findings = sum(found.counts);
		repositories[repo.name] = { components: found.components, findings, rules: found.counts };
		for (const total of totals.values()) {
			total.count += found.counts[total.rule];
			total.files += found.files.get(total.rule)!.size;
			total.samples.push(...found.samples.get(total.rule)!);
		}
		const before = previousCounts[repo.name];
		const was = before ? sum(before) : '-';
		console.log(`${repo.name}: ${found.components} components, ${findings} findings (was ${was})`);
	}

	const ordered = [...totals.values()]
		.map((total) => ({ ...total, samples: total.samples.slice(0, 3) }))
		.sort((a, b) => b.count - a.count);
	const library = libraryFindings(manifest);

	console.log(`\n${reviewed} components reviewed, ${unparseable} unparseable\n`);
	console.log('rule                      findings   files');
	for (const stat of ordered) {
		console.log(
			`  ${stat.rule.padEnd(24)}${String(stat.count).padStart(6)}${String(stat.files).padStart(8)}`
		);
	}
	console.log(`\nlibrary-scope findings: ${library.length}`);

	writeJson(options.baseline, {
		note:
			'Advisory baseline for D-159. Counts only — which of these are false positives is ' +
			'a reading, not a number, and is deliberately not decided here. A rule is a ' +
			'candidate for promotion to blocking once its findings have been read and its ' +
			'false-positive rate is known. The per-repository rule counts under `repositories` ' +
			'are also a ratchet (AL-024): `bun run rules:ratchet` fails when one rises and ' +
			'lowers it when one falls. The totals under `rules` are from the last full run.',
		componentsReviewed: reviewed,
		unparseable,
		repositories,
		rules: ordered,
		libraryFindings: library.length
	});

	console.log(`\nwrote ${options.baseline}`);
	return 0;
}

if (import.meta.main) {
	const options = parseOptions(process.argv.slice(2));
	const manifest = loadManifest();
	process.exit(options.check ? runCheck(options, manifest) : runBaseline(options, manifest));
}
