/**
 * Exercise every Alfons MCP tool and assert the answers are usable.
 *
 * Two layers, because they fail differently. The tool functions are checked
 * directly against the manifest — that catches a wrong answer. The server is
 * then spawned over real stdio and asked to list its tools — that catches a
 * server which cannot start, which no amount of testing the pure functions
 * would reveal.
 *
 * Asserting on content rather than on shape is the point. A test that only
 * checks find_components returned an array passes just as happily when it
 * returns the wrong components, and that is the failure mode that matters: an
 * agent acts on the first result.
 *
 * Run: bun run mcp:smoke
 */
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { loadManifest, storybookBase } from '../src/mcp/manifest.ts';
import {
	findComponents,
	getComponent,
	getLayoutRecipe,
	getTokens,
	listSurfaces
} from '../src/mcp/tools.ts';

let failures = 0;

function check(description: string, condition: boolean, detail?: unknown): void {
	if (condition) {
		console.log(`  ok    ${description}`);
		return;
	}
	failures++;
	console.error(`  FAIL  ${description}`);
	if (detail !== undefined) console.error(`        ${JSON.stringify(detail)}`);
}

const manifest = loadManifest();
console.log(`manifest: ${manifest.components.length} components, ${manifest.tokens.length} tokens`);

// ---------------------------------------------------------------------------
console.log('\nfind_components');
// The query from AL-004 C2, verbatim. StatusBadge is the right answer and the
// assertion says so by name — "returned something" would not have caught the
// ranking bug where prop names outweighed the component name.
const statusMatches = findComponents(manifest, 'something to show a status');
check(
	'ranks StatusBadge first for "something to show a status"',
	statusMatches[0]?.name === 'StatusBadge',
	statusMatches.slice(0, 3)
);
check('returns several candidates, not just one', statusMatches.length > 1, statusMatches.length);
check(
	'every match carries a summary',
	statusMatches.every((match) => match.summary),
	statusMatches.filter((m) => !m.summary)
);

const gridMatches = findComponents(manifest, 'lay out cards in a grid');
check(
	'finds Grid for "lay out cards in a grid"',
	gridMatches.some((match) => match.name === 'Grid'),
	gridMatches.slice(0, 3)
);

check(
	'an empty query returns nothing rather than everything',
	findComponents(manifest, '   ').length === 0
);

// ---------------------------------------------------------------------------
console.log('\nget_component');
const button = getComponent(manifest, 'button', storybookBase()) as Record<string, never>;
check('resolves case-insensitively', button.found === true);
check('returns typed props', Array.isArray(button.props) && (button.props as unknown[]).length > 0);
check(
	'extracts variant values from the union type',
	(button.variants as Record<string, string[]>)?.variant?.includes('ghost'),
	button.variants
);
check(
	'returns a usage example',
	typeof button.usage === 'string' && (button.usage as string).includes('<Button')
);
check(
	'returns a Storybook URL',
	typeof button.storybookUrl === 'string' && (button.storybookUrl as string).includes('/story/')
);
check(
	'returns an import statement',
	button.importStatement === "import { Button } from '@alfons/design';"
);

const card = getComponent(manifest, 'Card', storybookBase()) as Record<string, never>;
check(
	'identifies Snippet props as slots',
	Array.isArray(card.slots) && (card.slots as string[]).includes('children'),
	card.slots
);

const missing = getComponent(manifest, 'Buton', storybookBase()) as Record<string, never>;
check('a typo is not found', missing.found === false);
check(
	'a typo suggests the real name',
	(missing.didYouMean as string[])?.includes('Button'),
	missing.didYouMean
);

// ---------------------------------------------------------------------------
console.log('\nget_tokens');
const publicColours = getTokens(manifest, { category: 'colours', surface: 'public' });
check(
	'narrows to the requested category',
	publicColours.tokens.every((token) => token.category === 'colours')
);
check(
	'excludes admin tokens from a public surface',
	publicColours.tokens.every((token) => token.surface === 'public'),
	publicColours.tokens.filter((t) => t.surface !== 'public').slice(0, 3)
);
check(
	'no --admin-* token reaches a public surface',
	!publicColours.tokens.some((token) => token.name.startsWith('--admin-'))
);

const adminColours = getTokens(manifest, { category: 'colours', surface: 'admin' });
check(
	'an admin surface also gets the public tokens',
	adminColours.tokens.length > publicColours.tokens.length,
	{ admin: adminColours.tokens.length, public: publicColours.tokens.length }
);

check(
	'deprecated tokens are hidden by default',
	publicColours.tokens.every((token) => token.status !== 'deprecated')
);
check(
	'and reported as hidden rather than silently dropped',
	publicColours.deprecatedHidden > 0,
	publicColours.deprecatedHidden
);

const withDeprecated = getTokens(manifest, { category: 'colours', includeDeprecated: true });
const deprecated = withDeprecated.tokens.find((token) => token.name === '--color-full') as Record<
	string,
	string
>;
check(
	'a deprecated token carries its replacement',
	deprecated?.replacement === '--colour-full',
	deprecated
);
check('and the decision that deprecated it', deprecated?.decisionId === 'D-167', deprecated);

check(
	'categories are listed for discovery',
	publicColours.categories.includes('spacing'),
	publicColours.categories
);

// ---------------------------------------------------------------------------
console.log('\nget_layout_recipe');
const recipe = getLayoutRecipe(manifest);
check('returns the layout components', recipe.layouts.length > 0);
// Named, not structural. The first version of these assertions checked that
// the ordering was internally consistent — depth non-decreasing, parents before
// children — and passed while the recipe listed PageFrame, the outermost shell,
// last (D-168). Self-consistency is not correctness, and for a derived ordering
// with nothing to derive from it is not even evidence.
check(
	'puts PageFrame in the shell tier',
	recipe.layouts.find((entry) => entry.name === 'PageFrame')?.tier === 'shell',
	recipe.layouts.slice(0, 3)
);
check(
	'puts Stack in the container tier',
	recipe.layouts.find((entry) => entry.name === 'Stack')?.tier === 'container'
);
check(
	'lists every shell before every container',
	(() => {
		const names = recipe.layouts.map((entry) => entry.name);
		const lastShell = Math.max(
			...recipe.layouts
				.filter((entry) => entry.tier === 'shell')
				.map((entry) => names.indexOf(entry.name))
		);
		const firstContainer = Math.min(
			...recipe.layouts
				.filter((entry) => entry.tier === 'container')
				.map((entry) => names.indexOf(entry.name))
		);
		return lastShell < firstContainer;
	})(),
	recipe.layouts.map((entry) => `${entry.name}:${entry.tier}`)
);
check(
	'every layout carries a tier',
	recipe.layouts.every((entry) => entry.tier),
	recipe.layouts.filter((entry) => !entry.tier)
);

// ---------------------------------------------------------------------------
console.log('\nlist_surfaces');
const surfaces = listSurfaces(manifest);
check(
	'lists both surfaces',
	surfaces.surfaces.map((surface) => surface.name).join(',') === 'public,admin'
);
check(
	'admin may use more tokens than public',
	surfaces.surfaces[1]!.tokenCount > surfaces.surfaces[0]!.tokenCount
);
check('states that dark is the only colour mode', surfaces.colourMode === 'dark');

// ---------------------------------------------------------------------------
console.log('\ntombstones');
const retiredToken = manifest.tombstones.find((entry) => entry.name === '--chart-tooltip-bg');
check('a retired token is still answerable', Boolean(retiredToken), manifest.tombstones.length);
check(
	'and names its replacement',
	retiredToken?.lifecycle.replacement === '--chart-tooltip-bg-admin',
	retiredToken
);
check(
	'and the decision that retired it',
	retiredToken?.lifecycle.decisionId === 'D-165',
	retiredToken
);

// ---------------------------------------------------------------------------
// The server over real stdio. Everything above ran in-process and would pass
// even if server.ts did not parse.
console.log('\nserver over stdio');

const listToolsRequest =
	JSON.stringify({
		jsonrpc: '2.0',
		id: 1,
		method: 'initialize',
		params: {
			protocolVersion: '2024-11-05',
			capabilities: {},
			clientInfo: { name: 'mcp-smoke', version: '0' }
		}
	}) +
	'\n' +
	JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) +
	'\n' +
	JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list', params: {} }) +
	'\n';

const child = spawn('bun', ['run', join(import.meta.dirname, '..', 'src', 'mcp', 'server.ts')], {
	stdio: ['pipe', 'pipe', 'pipe']
});

let stdout = '';
let stderr = '';
child.stdout.on('data', (chunk) => (stdout += chunk));
child.stderr.on('data', (chunk) => (stderr += chunk));
child.stdin.write(listToolsRequest);

const exitCode: number = await new Promise((resolve) => {
	// The server holds stdio open by design, so it is stopped once it has
	// answered rather than waited on.
	const timer = setTimeout(() => {
		child.kill();
		resolve(0);
	}, 8000);
	child.on('exit', (code) => {
		clearTimeout(timer);
		resolve(code ?? 0);
	});
});

const listed = stdout
	.split('\n')
	.filter(Boolean)
	.map((line) => {
		try {
			return JSON.parse(line);
		} catch {
			return null;
		}
	})
	.find((message) => message?.id === 2);

const toolNames: string[] = (listed?.result?.tools ?? []).map(
	(tool: { name: string }) => tool.name
);

check('the server starts and answers tools/list', toolNames.length > 0, {
	stderr: stderr.slice(0, 400),
	exitCode
});
for (const expected of [
	'find_components',
	'get_component',
	'get_tokens',
	'get_layout_recipe',
	'list_surfaces'
]) {
	check(`exposes ${expected}`, toolNames.includes(expected), toolNames);
}
check(
	'every tool describes when to reach for it',
	(listed?.result?.tools ?? []).every(
		(tool: { description?: string }) => (tool.description?.length ?? 0) > 120
	),
	toolNames
);

// ---------------------------------------------------------------------------
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
