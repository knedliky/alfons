/**
 * The D-238 theme rules (AL-027): a complete theme sets every token the
 * complete themes set, and no theme sets a primitive.
 *
 * Two layers, as in test-rules-ratchet.ts. The check itself is driven directly
 * over fixture token trees, which is where the cases live. Then
 * `generate-manifest.ts --check` is run for real over a throwaway copy of the
 * repository holding a broken theme, because a check that is correct but never
 * called from manifest:check gates nothing.
 *
 * Run: bun run test:themes
 */
import { cpSync, mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { themeViolations } from './generate-manifest.ts';

const ROOT = join(import.meta.dirname, '..');

let failures = 0;

function check(description: string, condition: boolean, detail?: unknown): void {
	if (condition) {
		console.log(`  ok    ${description}`);
		return;
	}
	failures++;
	console.error(`  FAIL  ${description}`);
	if (detail !== undefined)
		console.error(`        ${JSON.stringify(detail, null, 2).slice(0, 600)}`);
}

const PRIMITIVES = `:root {\n\t--part-red: #e22d2e;\n\t--ink: #efe8db;\n}\n`;

function theme(kind: 'complete' | 'overlay' | null, selector: string, tokens: string[]): string {
	const marker = kind ? `/* @theme ${kind} */\n` : '/* no marker */\n';
	return `${marker}${selector} {\n${tokens.map((token) => `\t${token};`).join('\n')}\n}\n`;
}

/** A token tree under a fresh temporary directory; returns its path. */
function tokenTree(files: Record<string, string>): string {
	const dir = mkdtempSync(join(tmpdir(), 'alfons-themes-'));
	for (const [name, content] of Object.entries(files)) {
		mkdirSync(dirname(join(dir, name)), { recursive: true });
		writeFileSync(join(dir, name), content);
	}
	return dir;
}

const meccano = theme('complete', ':root', [
	'--accent: var(--part-red)',
	'--text-primary: var(--ink)',
	'--field-border: var(--ink)'
]);

function violationsOf(files: Record<string, string>): string[] {
	const dir = tokenTree({ 'primitives.css': PRIMITIVES, ...files });
	try {
		return themeViolations(dir);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

console.log('the check');

{
	const found = violationsOf({
		'themes/meccano.css': meccano,
		'themes/second.css': theme('complete', "[data-theme='second']", [
			'--accent: var(--ink)',
			'--text-primary: var(--part-red)',
			'--field-border: transparent'
		]),
		'themes/admin.css': theme('overlay', "[data-theme='admin']", ['--field-border: transparent']),
		'spacing.css': ':root {\n\t--space-1: 4px;\n}\n'
	});
	check('two complete themes and an overlay that keep the rules pass', found.length === 0, found);
}

{
	const found = violationsOf({
		'themes/meccano.css': meccano,
		'themes/second.css': theme('complete', "[data-theme='second']", [
			'--accent: var(--ink)',
			'--text-primary: var(--part-red)'
		])
	});
	check(
		'a complete theme that leaves a semantic token unset is refused, naming the token',
		found.length === 1 &&
			found[0].includes('themes/second.css') &&
			found[0].includes('--field-border'),
		found
	);
}

{
	const found = violationsOf({
		'themes/meccano.css': meccano,
		'themes/admin.css': theme('overlay', "[data-theme='admin']", [
			'--field-border: transparent',
			'--part-red: #000'
		])
	});
	check(
		'an overlay that sets a primitive token is refused, naming the token',
		found.length === 1 && found[0].includes('primitive') && found[0].includes('--part-red'),
		found
	);
}

{
	const found = violationsOf({
		'themes/meccano.css': theme('complete', ':root', ['--accent: var(--part-red)', '--ink: #fff'])
	});
	check(
		'a complete theme that sets a primitive token is refused too',
		found.length === 1 && found[0].includes('--ink'),
		found
	);
}

{
	const found = violationsOf({
		'themes/meccano.css': meccano,
		'themes/admin.css': theme('overlay', "[data-theme='admin']", ['--admin-only: transparent'])
	});
	check(
		'an overlay that sets a token no complete theme defines is refused',
		found.length === 1 && found[0].includes('--admin-only'),
		found
	);
}

{
	const found = violationsOf({
		'themes/meccano.css': meccano,
		'themes/admin.css': theme('overlay', "[data-theme='admin']", ['--space-1: 2px']),
		'spacing.css': ':root {\n\t--space-1: 4px;\n}\n'
	});
	check(
		'an overlay may set a shared semantic token a complete theme does not',
		found.length === 0,
		found
	);
}

{
	let message = '';
	try {
		violationsOf({ 'themes/meccano.css': theme(null, ':root', ['--accent: var(--part-red)']) });
	} catch (error) {
		message = String(error);
	}
	check(
		'a theme that does not say its kind is refused',
		message.includes('@theme complete'),
		message
	);
}

{
	const found = themeViolations(join(ROOT, 'src', 'tokens'));
	check('the shipped themes keep the rules', found.length === 0, found);
}

console.log('\nmanifest:check');

/**
 * A throwaway repository: the generator and what it imports, the real token
 * tree with one theme broken, and node_modules linked in. The theme check runs
 * before anything reads components or the committed manifest, so nothing else
 * needs copying.
 */
function brokenRepository(brokenTheme: string): string {
	const dir = mkdtempSync(join(tmpdir(), 'alfons-themes-repo-'));
	for (const path of ['scripts/generate-manifest.ts', 'scripts/psql.ts', 'src/manifest/types.ts']) {
		mkdirSync(dirname(join(dir, path)), { recursive: true });
		cpSync(join(ROOT, path), join(dir, path));
	}
	cpSync(join(ROOT, 'src', 'tokens'), join(dir, 'src', 'tokens'), { recursive: true });
	writeFileSync(join(dir, 'src', 'tokens', 'themes', 'broken.css'), brokenTheme);
	symlinkSync(join(ROOT, 'node_modules'), join(dir, 'node_modules'));
	return dir;
}

for (const [description, brokenTheme, expected] of [
	[
		'fails on a complete theme that leaves a semantic token unset',
		theme('complete', "[data-theme='broken']", ['--accent: var(--girder-red)']),
		'leaves'
	],
	[
		'fails on an overlay theme that sets a primitive token',
		theme('overlay', "[data-theme='broken']", ['--girder-red: #000']),
		'primitive'
	]
] as const) {
	const dir = brokenRepository(brokenTheme);
	try {
		const run = spawnSync('bun', ['run', join(dir, 'scripts', 'generate-manifest.ts'), '--check'], {
			cwd: dir,
			encoding: 'utf8'
		});
		check(
			description,
			run.status === 1 && run.stderr.includes('themes/broken.css') && run.stderr.includes(expected),
			{ status: run.status, stderr: run.stderr.slice(0, 400) }
		);
	} finally {
		rmSync(dir, { recursive: true, force: true });
	}
}

if (failures) {
	console.error(`\n${failures} check(s) failed.`);
	process.exit(1);
}
console.log('\nall theme checks passed.');
