/**
 * Proves the Svelte 5 review checklist still fails lint.
 *
 * `eslint.config.js` encodes the checklist as `no-restricted-syntax`
 * selectors over svelte-eslint-parser's AST, plus `svelte/no-reactive-reassign`.
 * A selector that stops matching fails silently: the obvious `LabeledStatement`
 * selector for `$:` matched nothing, and nothing said so. Each fixture here
 * breaks exactly one rule, and this script fails unless eslint reports it.
 *
 * The fixture folder is ignored by `bun run lint`, so the fixtures fail only
 * here. This script lints them with ignores off, and also asserts the folder is
 * still ignored, so neither half can drift without the other noticing.
 *
 * Run: bun run test:lint-checklist (also run by test:rules)
 */
import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const fixtureFolder = 'scripts/fixtures/lint-checklist';

interface ChecklistFixture {
	file: string;
	ruleId: string;
	/** `no-restricted-syntax` carries three selectors; the message tells them apart. */
	messageIncludes?: string;
}

const fixtures: ChecklistFixture[] = [
	{ file: 'export-let.svelte', ruleId: 'no-restricted-syntax', messageIncludes: '`export let`' },
	{ file: 'reactive-statement.svelte', ruleId: 'no-restricted-syntax', messageIncludes: '`$:`' },
	{
		file: 'create-event-dispatcher.svelte',
		ruleId: 'no-restricted-syntax',
		messageIncludes: 'createEventDispatcher'
	},
	{ file: 'reactive-reassign.svelte', ruleId: 'svelte/no-reactive-reassign' }
];

let failures = 0;

function check(description: string, condition: boolean, detail?: unknown): void {
	if (condition) {
		console.log(`  ok    ${description}`);
		return;
	}
	failures++;
	console.error(`  FAIL  ${description}`);
	if (detail !== undefined) console.error(`        ${JSON.stringify(detail, null, 2)}`);
}

const projectLinter = new ESLint({ cwd: repositoryRoot });
const fixtureLinter = new ESLint({ cwd: repositoryRoot, ignore: false });

console.log('lint ignores the fixture folder');
for (const { file } of fixtures) {
	const path = `${fixtureFolder}/${file}`;
	check(`${path} is ignored by bun run lint`, await projectLinter.isPathIgnored(path));
}

console.log('each fixture fails on its checklist rule');
for (const { file, ruleId, messageIncludes } of fixtures) {
	const [result] = await fixtureLinter.lintFiles([`${fixtureFolder}/${file}`]);
	const reported = result.messages.map(({ ruleId, severity, message }) => ({
		ruleId,
		severity,
		message
	}));
	const expected = reported.filter(
		(entry) =>
			entry.ruleId === ruleId &&
			entry.severity === 2 &&
			(messageIncludes === undefined || entry.message.includes(messageIncludes))
	);
	const label = messageIncludes ? `${ruleId} (${messageIncludes})` : ruleId;
	check(`${file} reports ${label} as an error`, expected.length > 0, reported);
}

if (failures > 0) {
	console.error(`\n${failures} lint checklist check(s) failed`);
	process.exit(1);
}
console.log('\nall lint checklist checks passed');
