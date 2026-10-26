/**
 * The rules ratchet (AL-024): a finding count may fall but never rise.
 *
 * Two layers. The comparison itself is pure and is driven directly, which is
 * where the edge cases live — a repository the run could not reach, a rule
 * added since the baseline. Then the command is run for real over a throwaway
 * repository, because a ratchet whose exit code or file write is wrong passes
 * every unit test and blocks nothing.
 *
 * Run: bun run test:ratchet
 */
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { ratchet, type RuleCounts } from './rules-baseline.js';

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

console.log('comparison');

const committed: RuleCounts = {
	alfons: { 'raw-value': 5, 'raw-element': 2 },
	website: { 'raw-value': 10 }
};

{
	const result = ratchet(committed, { alfons: { 'raw-value': 5, 'raw-element': 2 } });
	check('an unchanged count neither rises nor falls', !result.rises.length && !result.falls.length);
	check(
		'a repository the run did not reach keeps its committed counts',
		result.next.website['raw-value'] === 10,
		result.next
	);
}

{
	const result = ratchet(committed, { alfons: { 'raw-value': 6, 'raw-element': 1 } });
	check(
		'a rise is reported with repository, rule and both counts',
		result.rises.length === 1 &&
			result.rises[0].repo === 'alfons' &&
			result.rises[0].rule === 'raw-value' &&
			result.rises[0].committed === 5 &&
			result.rises[0].measured === 6,
		result.rises
	);
	check('a rise is not written into the next counts', result.next.alfons['raw-value'] === 5);
	check('a fall is lowered in the next counts', result.next.alfons['raw-element'] === 1);
}

{
	const result = ratchet(committed, {
		alfons: { 'raw-value': 5, 'raw-element': 2, 'new-rule': 4 },
		'new-repo': { 'raw-value': 3 }
	});
	check(
		'a rule or repository never counted before is adopted, not failed',
		!result.rises.length && result.adopted.length === 2,
		result
	);
	check('an adopted count is recorded', result.next['new-repo']['raw-value'] === 3);
}

console.log('\ncommand');

const workspace = mkdtempSync(join(tmpdir(), 'alfons-ratchet-'));
const repo = join(workspace, 'consumer');
const repoName = basename(repo);
const baselinePath = join(workspace, 'rules-baseline.json');
mkdirSync(join(repo, 'src'), { recursive: true });

const CLEAN = '<p>Nothing to find here.</p>\n';
// 24px is exactly --space-5, so raw-value fires once and nothing else does.
const ONE_FINDING =
	'<p class="padded">One finding.</p>\n<style>.padded { padding: 24px; }</style>\n';

function runRatchet(): { exitCode: number; output: string } {
	const run = Bun.spawnSync(
		[
			'bun',
			'run',
			join(import.meta.dirname, 'rules-baseline.ts'),
			'--check',
			'--repo',
			repo,
			'--baseline',
			baselinePath
		],
		{ stdout: 'pipe', stderr: 'pipe' }
	);
	return { exitCode: run.exitCode, output: `${run.stdout}${run.stderr}` };
}

function rawValueCount(): number {
	const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
	return baseline.repositories[repoName].rules['raw-value'];
}

try {
	writeFileSync(join(repo, 'src', 'Clean.svelte'), CLEAN);

	const first = runRatchet();
	check('a first run adopts the repository and passes', first.exitCode === 0, first.output);
	check('a first run records a zero count', rawValueCount() === 0);

	const unchanged = runRatchet();
	check('an unchanged tree passes', unchanged.exitCode === 0, unchanged.output);

	writeFileSync(join(repo, 'src', 'Padded.svelte'), ONE_FINDING);
	const added = runRatchet();
	check('one added finding fails the run', added.exitCode === 1, added.output);
	check(
		'the failure names the rule, the repository and both counts',
		added.output.includes(`${repoName} raw-value: 0 -> 1`),
		added.output
	);
	check('a failed run leaves the baseline alone', rawValueCount() === 0);

	// Commit a higher number than the tree holds, as if a finding had just been fixed.
	const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
	baseline.repositories[repoName].rules['raw-value'] = 2;
	writeFileSync(baselinePath, JSON.stringify(baseline));

	const fell = runRatchet();
	check('a fallen count passes', fell.exitCode === 0, fell.output);
	check('a fallen count is lowered in the file', rawValueCount() === 1);

	writeFileSync(join(repo, 'src', 'AlsoPadded.svelte'), ONE_FINDING);
	const climbed = runRatchet();
	check(
		'the count cannot climb back to the number it fell from',
		climbed.exitCode === 1 && climbed.output.includes(`${repoName} raw-value: 1 -> 2`),
		climbed.output
	);
} finally {
	rmSync(workspace, { recursive: true, force: true });
}

if (failures) {
	console.error(`\n${failures} check(s) failed`);
	process.exit(1);
}
console.log('\nall ratchet checks passed');
