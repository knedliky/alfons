/**
 * Scaffold a component, then review it with the rule engine.
 *
 * This is the primary test and the only one that matters much. Asserting the
 * generated text contains `$props()` checks the template; scaffolding and then
 * running review_markup over the result checks that generation and enforcement
 * agree — and they are the two halves that drift. A rule added to AL-005 that
 * the scaffold does not satisfy fails here, which is the point: the fast path
 * has to stay the compliant path, and nothing else keeps it that way.
 *
 * Run: bun run test:scaffold
 */
import { loadManifest } from '../src/mcp/manifest.js';
import { scaffoldComponent } from '../src/mcp/scaffold.js';
import { review } from '../src/rules/index.js';
import type { Surface } from '../src/manifest/types.js';

const manifest = loadManifest();
let failures = 0;

function check(description: string, condition: boolean, detail?: unknown): void {
	if (condition) {
		console.log(`  ok    ${description}`);
		return;
	}
	failures++;
	console.error(`  FAIL  ${description}`);
	if (detail !== undefined)
		console.error(`        ${JSON.stringify(detail, null, 2).slice(0, 900)}`);
}

// ---------------------------------------------------------------------------
console.log('\nscaffold shape (C1)');
const basic = scaffoldComponent(manifest, {
	name: 'SummaryCard',
	category: 'cards',
	surface: 'public'
});
check('returns component source', basic.component.includes('SummaryCard'));
check('returns a story stub', basic.story.includes('defineMeta'));
check(
	'returns the path to write, rather than writing it',
	basic.path === 'src/components/cards/SummaryCard.svelte'
);
check('and the story path', basic.storyPath === 'src/stories/cards/SummaryCard.stories.svelte');
check(
	'rejects a non-PascalCase name',
	(() => {
		try {
			scaffoldComponent(manifest, { name: 'summary-card', category: 'cards', surface: 'public' });
			return false;
		} catch {
			return true;
		}
	})()
);
check(
	'warns rather than silently duplicating an existing component',
	scaffoldComponent(manifest, { name: 'Button', category: 'atoms', surface: 'public' }).notes.some(
		(note) => note.includes('already exists')
	)
);

// ---------------------------------------------------------------------------
console.log('\ntokens come from the manifest, filtered by surface (C2)');
const known = new Set(manifest.tokens.map((token) => token.name));
check(
	'every token used is a real token',
	basic.tokensUsed.every((token) => known.has(token)),
	basic.tokensUsed.filter((token) => !known.has(token))
);
check('uses more than one token', basic.tokensUsed.length > 1, basic.tokensUsed);

const surfaceOf = new Map(manifest.tokens.map((token) => [token.name, token.surface]));
check(
	'a public scaffold uses no admin token',
	basic.tokensUsed.every((token) => surfaceOf.get(token) === 'public'),
	basic.tokensUsed.filter((token) => surfaceOf.get(token) !== 'public')
);

const adminScaffold = scaffoldComponent(manifest, {
	name: 'AdminPanel',
	category: 'admin',
	surface: 'admin'
});
check(
	'an admin scaffold prefers the admin vocabulary',
	adminScaffold.tokensUsed.some((token) => surfaceOf.get(token) === 'admin'),
	adminScaffold.tokensUsed
);

const lifecycleOf = new Map(
	manifest.tokens.map((token) => [token.name, token.lifecycle?.status ?? 'live'])
);
check(
	'no deprecated token is seeded into new markup',
	basic.tokensUsed.every((token) => lifecycleOf.get(token) === 'live'),
	basic.tokensUsed.map((token) => `${token}:${lifecycleOf.get(token)}`)
);

// ---------------------------------------------------------------------------
console.log('\nscaffold then review — generation and enforcement agree (C3)');

const cases: { name: string; category: string; surface: Surface; composes?: string[] }[] = [
	{ name: 'SummaryCard', category: 'cards', surface: 'public' },
	{ name: 'AdminPanel', category: 'admin', surface: 'admin' },
	{ name: 'ThingList', category: 'atoms', surface: 'public', composes: ['Badge'] },
	{ name: 'ReportPage', category: 'layouts', surface: 'public', composes: ['PageSection'] }
];

for (const request of cases) {
	const scaffold = scaffoldComponent(manifest, request);
	const result = review(scaffold.component, manifest, request.surface);

	check(
		`${request.name} (${request.surface}) parses`,
		result.parseError === null,
		result.parseError
	);
	check(
		`${request.name} (${request.surface}) reviews with no violations`,
		result.violations.length === 0,
		result.violations.map((entry) => `${entry.rule} @${entry.line}: ${entry.message}`)
	);

	const storyReview = review(scaffold.story, manifest, request.surface);
	check(`${request.name} story parses`, storyReview.parseError === null, storyReview.parseError);
}

// ---------------------------------------------------------------------------
console.log('\nSvelte 5 only (C4)');
check('uses $props', basic.component.includes('$props()'));
check('uses $derived', basic.component.includes('$derived('));
check('contains no export let', !basic.component.includes('export let'));
check('contains no reactive label', !/^\s*\$:/m.test(basic.component));
check('contains no createEventDispatcher', !basic.component.includes('createEventDispatcher'));
// Asserted through the rule engine as well as by text, so the two cannot disagree.
check(
	'and svelte5-runes reports nothing',
	review(basic.component, manifest).violations.every((entry) => entry.rule !== 'svelte5-runes')
);

// ---------------------------------------------------------------------------
console.log('\nstory stub (C5)');
check(
	'imports the component by its real path',
	basic.story.includes("from '../../components/cards/SummaryCard.svelte'")
);
check('declares a title Storybook can route', basic.story.includes("title: 'Cards/SummaryCard'"));
check('declares the component', basic.story.includes('component: SummaryCard'));
check('carries at least two stories', (basic.story.match(/<Story /g) ?? []).length >= 2);
check(
	'its argTypes match the props the component declares',
	basic.story.includes("options: ['default', 'subtle']") &&
		basic.component.includes("variant?: 'default' | 'subtle'")
);

// ---------------------------------------------------------------------------
console.log('\nlayout composition (C6)');
const withRegion = scaffoldComponent(manifest, {
	name: 'ReportPage',
	category: 'layouts',
	surface: 'public',
	composes: ['PageSection']
});
check(
	'nests a region inside a shell rather than emitting it bare',
	/<(PageFrame|MainLayout|PageLayout)>/.test(withRegion.component),
	withRegion.component
);
check(
	'and says why',
	withRegion.notes.some((note) => note.includes('D-168')),
	withRegion.notes
);
check(
	'layout-nesting reports nothing on the result',
	review(withRegion.component, manifest).violations.every(
		(entry) => entry.rule !== 'layout-nesting'
	),
	review(withRegion.component, manifest).violations
);

const noLayout = scaffoldComponent(manifest, {
	name: 'PlainThing',
	category: 'atoms',
	surface: 'public',
	composes: ['Badge']
});
check('does not wrap when nothing needs wrapping', !/<PageFrame>/.test(noLayout.component));

// ---------------------------------------------------------------------------
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
