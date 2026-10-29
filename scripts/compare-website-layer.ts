/**
 * Compare the website's local Meccano layer with what Alfons defines.
 *
 * The website imports Alfons and then its own `src/lib/styles/meccano/`, which
 * re-declares Alfons tokens unlayered and after it, so the website's value wins
 * on every page. AL-033 moves everything that layer holds into Alfons, and the
 * website task that follows deletes the layer. This script is how both sides
 * prove the move: it lists every token the layer declares that Alfons is
 * missing, or that renders differently, and says which value should win.
 *
 * The rule for a difference (Simon, 2026-10-29): the website's value wins for
 * typography and fonts (D-245); Alfons's value wins for colour, surfaces,
 * elevation and motion (D-245), and for spacing and layout (D-246). A
 * difference in a subject the script cannot place has no winner, and is a
 * failure.
 *
 * Values are compared after resolving every var() chain on both sides, because
 * the two layers name the same value differently: the website's
 * `--radius-surface: var(--radius-2)` and Alfons's `var(--radius-2)` agree,
 * while the website's `--font-display: var(--font-heading)` and Alfons's
 * `'Moderat', …` do not, though neither is a literal.
 *
 *   bun run scripts/compare-website-layer.ts [--website <path>] [--json]
 *
 * Exits 1 when a typography or font token differs, when a website-only token is
 * neither defined nor retired with a replacement in Alfons, or when a
 * difference falls outside both halves of the rule.
 */
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import postcss from 'postcss';
import valueParser from 'postcss-value-parser';
import type { Manifest, TokenEntry } from '../src/manifest/types.js';

/** The layer's files in the order the website's app.css imports them; later wins. */
const LAYER_FILES = [
	'fonts.css',
	'colors.css',
	'effects.css',
	'typography.css',
	'spacing.css',
	'motion.css',
	'base.css',
	'compat.css'
];

/** The subject of a token declared only by the website, from the file it is in. */
const WEBSITE_FILE_SUBJECTS: Record<string, Subject> = {
	'fonts.css': 'typography',
	'typography.css': 'typography',
	'colors.css': 'colours',
	'effects.css': 'elevation',
	'motion.css': 'motion',
	'spacing.css': 'spacing'
};

type Subject = 'typography' | 'colours' | 'elevation' | 'motion' | 'spacing' | 'unknown';
type Winner = 'website' | 'alfons' | 'none';

/** Which side's value the rule says should win, by subject. */
const WINNER_BY_SUBJECT: Record<Subject, Winner> = {
	typography: 'website',
	colours: 'alfons',
	elevation: 'alfons',
	motion: 'alfons',
	spacing: 'alfons',
	unknown: 'none'
};

/** Typography by name, whatever file holds it: the families, ladder and composites. */
const TYPOGRAPHY_NAME = /^--(font|type|fs|fw|lh|ls|tracking)-/;

type Finding =
	| { kind: 'missing'; name: string; subject: Subject; websiteValue: string }
	| {
			kind: 'differs';
			name: string;
			subject: Subject;
			winner: Winner;
			alfonsValue: string;
			websiteValue: string;
	  }
	| {
			kind: 'retired';
			name: string;
			subject: Subject;
			replacement: string;
			alfonsValue: string;
			websiteValue: string;
	  };

interface Options {
	website: string;
	json: boolean;
}

function parseOptions(argv: string[]): Options {
	const options: Options = { website: join(homedir(), 'Motivka/website'), json: false };
	for (let index = 0; index < argv.length; index++) {
		if (argv[index] === '--website') options.website = argv[++index];
		else if (argv[index] === '--json') options.json = true;
		else throw new Error(`Unknown argument ${argv[index]}`);
	}
	return options;
}

interface Declared {
	value: string;
	file: string;
}

/**
 * Every custom property the layer declares on :root, in cascade order.
 *
 * Only top-level :root rules count: a declaration inside a media query or on
 * another selector is a scoped override, not the value a page starts from.
 */
function readWebsiteLayer(layerDir: string): Map<string, Declared> {
	const declared = new Map<string, Declared>();
	for (const file of LAYER_FILES) {
		const path = join(layerDir, file);
		if (!existsSync(path)) throw new Error(`${path} is missing; is --website right?`);
		const root = postcss.parse(readFileSync(path, 'utf8'), { from: path });
		for (const node of root.nodes) {
			if (node.type !== 'rule' || node.selector.trim() !== ':root') continue;
			node.walkDecls((decl) => {
				if (decl.prop.startsWith('--')) declared.set(decl.prop, { value: decl.value, file });
			});
		}
	}
	return declared;
}

/**
 * Resolve every var() in a value against one set of definitions.
 *
 * Unknown names fall back to their var() fallback, as the browser would, and
 * otherwise stay as written, so an unresolved reference shows as a difference
 * rather than vanishing. A cycle is reported in the value, not thrown.
 */
function resolver(definitions: Map<string, string>): (name: string) => string {
	const cache = new Map<string, string>();

	const resolveValue = (value: string, seen: Set<string>): string => {
		const parsed = valueParser(value);
		parsed.walk((node) => {
			if (node.type !== 'function' || node.value !== 'var') return;
			const [first, ...rest] = node.nodes;
			if (first?.type !== 'word') return false;
			const fallbackStart = rest.findIndex((argument) => argument.type === 'div');
			const fallback =
				fallbackStart === -1 ? null : valueParser.stringify(rest.slice(fallbackStart + 1));
			const resolved = definitions.has(first.value)
				? resolveName(first.value, seen)
				: fallback !== null
					? resolveValue(fallback, seen)
					: `var(${first.value})`;
			Object.assign(node, { type: 'word', value: resolved, nodes: [] });
			return false;
		});
		return parsed.toString();
	};

	const resolveName = (name: string, seen: Set<string>): string => {
		const cached = cache.get(name);
		if (cached !== undefined) return cached;
		if (seen.has(name)) return `<cycle ${name}>`;
		const value = definitions.get(name);
		if (value === undefined) return `var(${name})`;
		const resolved = normalise(resolveValue(value, new Set([...seen, name])));
		cache.set(name, resolved);
		return resolved;
	};

	return (name) => resolveName(name, new Set());
}

/**
 * One spelling for one rendered value: comments out, case and whitespace
 * collapsed, and no space either side of the separators the two layers format
 * differently (`0.6875rem/1` against `0.6875rem / 1`).
 */
function normalise(value: string): string {
	return value
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/\s+/g, ' ')
		.replace(/\s*([,/()])\s*/g, '$1')
		.replace(/#([0-9a-fA-F]{3,8})\b/g, (hex) => hex.toLowerCase())
		.replace(/"/g, "'")
		.trim();
}

function subjectOf(name: string, alfons: TokenEntry | undefined, declared: Declared): Subject {
	if (TYPOGRAPHY_NAME.test(name)) return 'typography';
	if (alfons) return asSubject(alfons.category);
	return WEBSITE_FILE_SUBJECTS[declared.file] ?? 'unknown';
}

function asSubject(category: string): Subject {
	return (['typography', 'colours', 'elevation', 'motion', 'spacing'] as const).includes(
		category as never
	)
		? (category as Subject)
		: 'unknown';
}

export function compare(websiteDir: string, manifest: Manifest): Finding[] {
	const declared = readWebsiteLayer(join(websiteDir, 'src/lib/styles/meccano'));
	const alfonsTokens = new Map(manifest.tokens.map((token) => [token.name, token]));
	const tombstones = new Map(
		manifest.tombstones.filter((tomb) => tomb.kind === 'token').map((tomb) => [tomb.name, tomb])
	);

	const alfonsDefinitions = new Map(manifest.tokens.map((token) => [token.name, token.value]));
	// What the website renders today: Alfons underneath, the layer over it.
	const websiteDefinitions = new Map(alfonsDefinitions);
	for (const [name, { value }] of declared) websiteDefinitions.set(name, value);

	const alfonsValue = resolver(alfonsDefinitions);
	const websiteValue = resolver(websiteDefinitions);
	const findings: Finding[] = [];

	for (const [name, declaration] of declared) {
		const token = alfonsTokens.get(name);
		const subject = subjectOf(name, token, declaration);
		const rendered = websiteValue(name);

		if (!token) {
			const replacement = tombstones.get(name)?.lifecycle.replacement;
			if (replacement) {
				// A retirement onto a replacement that renders the same is the
				// website's to follow, not a change it will see.
				if (alfonsValue(replacement) === rendered) continue;
				findings.push({
					kind: 'retired',
					name,
					subject,
					replacement,
					alfonsValue: alfonsValue(replacement),
					websiteValue: rendered
				});
			} else {
				findings.push({ kind: 'missing', name, subject, websiteValue: rendered });
			}
			continue;
		}

		const ours = alfonsValue(name);
		if (ours === rendered) continue;
		findings.push({
			kind: 'differs',
			name,
			subject,
			winner: WINNER_BY_SUBJECT[subject],
			alfonsValue: ours,
			websiteValue: rendered
		});
	}
	return findings;
}

/**
 * A finding fails AL-033 when Alfons still has to change for it: a website-only
 * token with nowhere to go, a typography value Alfons has not taken, a
 * difference no half of the rule covers, or a retirement whose replacement
 * renders a typography token differently.
 */
function isFailure(finding: Finding): boolean {
	if (finding.kind === 'missing') return true;
	if (finding.kind === 'retired') {
		return finding.subject === 'typography' && finding.alfonsValue !== finding.websiteValue;
	}
	return finding.winner !== 'alfons';
}

function report(findings: Finding[]): string {
	const lines: string[] = [];
	const section = (title: string, rows: Finding[], line: (finding: Finding) => string) => {
		if (!rows.length) return;
		lines.push(`${title} (${rows.length})`);
		for (const row of rows) lines.push(`  ${line(row)}`);
		lines.push('');
	};
	const failing = findings.filter(isFailure);
	const remaining = findings.filter((finding) => !isFailure(finding));

	section('FAILS: Alfons must change', failing, (finding) => {
		if (finding.kind === 'missing') {
			return `${finding.name} [${finding.subject}] missing from Alfons; website ${finding.websiteValue}`;
		}
		if (finding.kind === 'retired') {
			return `${finding.name} [${finding.subject}] retired for ${finding.replacement}, which renders ${finding.alfonsValue}; website ${finding.websiteValue}`;
		}
		return `${finding.name} [${finding.subject}, winner ${finding.winner}] Alfons ${finding.alfonsValue}; website ${finding.websiteValue}`;
	});
	section('Remaining: Alfons wins, the website will change', remaining, (finding) => {
		if (finding.kind === 'retired') {
			return `${finding.name} [${finding.subject}] retired for ${finding.replacement}: ${finding.websiteValue} -> ${finding.alfonsValue}`;
		}
		if (finding.kind === 'missing') return finding.name;
		return `${finding.name} [${finding.subject}] ${finding.websiteValue} -> ${finding.alfonsValue}`;
	});
	lines.push(
		failing.length
			? `${failing.length} finding(s) fail the rule; ${remaining.length} remaining where Alfons wins.`
			: `No failures. ${remaining.length} remaining where Alfons wins.`
	);
	return lines.join('\n');
}

if (import.meta.main) {
	const options = parseOptions(process.argv.slice(2));
	const manifest = JSON.parse(readFileSync('alfons.manifest.json', 'utf8')) as Manifest;
	const findings = compare(options.website, manifest);
	console.log(
		options.json
			? JSON.stringify(
					findings.map((finding) => ({ ...finding, fails: isFailure(finding) })),
					null,
					'\t'
				)
			: report(findings)
	);
	process.exit(findings.some(isFailure) ? 1 : 0);
}
