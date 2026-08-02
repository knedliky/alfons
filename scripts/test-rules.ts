/**
 * Fixtures for the design rule engine.
 *
 * Every rule gets two: one proving it fires, one proving it does not fire on
 * correct code. The second is the one that matters. A rule that only has a
 * positive fixture is indistinguishable from a rule that returns a violation
 * for everything, and D-159 defers the blocking decision to a measured
 * false-positive rate — which a suite with no negative cases cannot measure.
 *
 * The four cases under "grep failures" are carried over from AL-001
 * verification, where a hand-rolled scanner for the same job was wrong twice.
 * They are a free specification of what a naive implementation gets wrong, so
 * C12 requires them as passing fixtures rather than as prose.
 *
 * Run: bun run test:rules
 */
import { loadManifest } from '../src/mcp/manifest.js';
import { applyFixes, review } from '../src/rules/index.js';
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
		console.error(`        ${JSON.stringify(detail, null, 2).slice(0, 600)}`);
}

const ruleIds = (source: string, surface: Surface = 'public') =>
	review(source, manifest, surface).violations.map((entry) => entry.rule);

/** Assert a rule fires, and that the message names what the criterion requires. */
function fires(description: string, rule: string, source: string, surface: Surface = 'public') {
	const hits = review(source, manifest, surface).violations.filter((entry) => entry.rule === rule);
	check(description, hits.length > 0, { got: ruleIds(source, surface) });
	return hits;
}

function silent(description: string, rule: string, source: string, surface: Surface = 'public') {
	const hits = review(source, manifest, surface).violations.filter((entry) => entry.rule === rule);
	check(description, hits.length === 0, hits);
}

const wrap = (style: string, markup = '<div class="a"></div>') =>
	`${markup}\n<style>\n${style}\n</style>`;

// ---------------------------------------------------------------------------
console.log('\nraw-value (C1)');
const rawHits = fires('reports a raw hex', 'raw-value', wrap('.a { background: #d4b896; }'));
check(
	'names the token holding that exact value',
	rawHits.some((hit) => hit.message.includes('--hex-sand')),
	rawHits.map((hit) => hit.message)
);
check(
	'offers a fix only when a token matches',
	rawHits.some((hit) => Boolean(hit.fix))
);
fires('reports rgb()', 'raw-value', wrap('.a { color: rgb(255 0 0); }'));
fires('reports a bare px length', 'raw-value', wrap('.a { padding: 24px; }'));
silent(
	'does not report a token reference',
	'raw-value',
	wrap('.a { background: var(--card-bg); }')
);
silent('does not report a hairline border', 'raw-value', wrap('.a { border-width: 1px; }'));
silent('does not report 0', 'raw-value', wrap('.a { margin: 0; }'));

// ---------------------------------------------------------------------------
console.log('\nadmin-token-on-public (C2)');
const adminToken = manifest.tokens.find((token) => token.surface === 'admin')!.name;
fires(
	`reports ${adminToken} on a public surface`,
	'admin-token-on-public',
	wrap(`.a { color: var(${adminToken}); }`),
	'public'
);
silent(
	'permits the same token on an admin surface',
	'admin-token-on-public',
	wrap(`.a { color: var(${adminToken}); }`),
	'admin'
);
silent(
	'does not report a public token',
	'admin-token-on-public',
	wrap('.a { color: var(--text-primary); }')
);

// ---------------------------------------------------------------------------
console.log('\nunknown-token (C3)');
fires('reports a var() naming nothing', 'unknown-token', wrap('.a { color: var(--not-a-token); }'));
silent('does not report a real token', 'unknown-token', wrap('.a { color: var(--text-primary); }'));

// ---------------------------------------------------------------------------
console.log('\nraw-element (C4)');
fires('reports a bare <button>', 'raw-element', '<button>Save</button>');
fires('reports a bare <input>', 'raw-element', '<input type="text" />');
fires('reports a bare <select>', 'raw-element', '<select><option>a</option></select>');
silent('does not report the Button component', 'raw-element', '<Button>Save</Button>');
silent('does not report an unrelated element', 'raw-element', '<div><span>text</span></div>');

// ---------------------------------------------------------------------------
console.log('\nlayout-nesting (C5)');
fires(
	'reports a shell nested inside an inner layout',
	'layout-nesting',
	'<Stack><PageFrame><div /></PageFrame></Stack>'
);
silent(
	'permits the documented order',
	'layout-nesting',
	'<PageFrame><Container><Stack><div /></Stack></Container></PageFrame>'
);
silent('permits a layout on its own', 'layout-nesting', '<Stack><div /></Stack>');

// ---------------------------------------------------------------------------
console.log('\nsvelte5-runes (C6)');
fires(
	'reports export let',
	'svelte5-runes',
	'<script lang="ts">export let title = "x";</script>\n<div>{title}</div>'
);
fires(
	'reports $: reactivity',
	'svelte5-runes',
	'<script lang="ts">let a = 1; $: b = a * 2;</script>\n<div>{b}</div>'
);
fires(
	'reports createEventDispatcher',
	'svelte5-runes',
	'<script lang="ts">import { createEventDispatcher } from "svelte"; const d = createEventDispatcher();</script>\n<div />'
);
silent(
	'does not report runes',
	'svelte5-runes',
	'<script lang="ts">let { title } = $props(); const upper = $derived(title.toUpperCase());</script>\n<div>{upper}</div>'
);
silent(
	'does not report export const',
	'svelte5-runes',
	'<script lang="ts" module>export const VARIANTS = ["a"];</script>\n<div />'
);

// ---------------------------------------------------------------------------
console.log('\ngrep failures carried over from AL-001 (C12)');

// 1. Tabs. The original scanner anchored on a leading space.
silent(
	'a tab-indented token reference is not an unknown token',
	'unknown-token',
	'<div class="a"></div>\n<style>\n\t.a {\n\t\tcolour: var(--text-primary);\n\t}\n</style>'
);
check(
	'a tab-indented raw value is still found',
	ruleIds(
		'<div class="a"></div>\n<style>\n\t.a {\n\t\tbackground: #d4b896;\n\t}\n</style>'
	).includes('raw-value')
);

// 2. Greedy prefixes. --border must not be satisfied by --border-glass.
const prefixSource = wrap('.a { border-color: var(--border); }');
check(
	'--border is judged on its own, not satisfied by --border-glass',
	manifest.tokens.some((token) => token.name.startsWith('--border-')) &&
		ruleIds(prefixSource).includes('unknown-token') ===
			!manifest.tokens.some((token) => token.name === '--border'),
	{
		borderDefined: manifest.tokens.some((token) => token.name === '--border'),
		reported: ruleIds(prefixSource)
	}
);

// 3. Component-local properties. A component defining its own --dp-bg is not
//    referencing a design token, and must not be reported as using an unknown one.
silent(
	'a component-local custom property is not an unknown token',
	'unknown-token',
	wrap('.a { --dp-bg: var(--card-bg); background: var(--dp-bg); }')
);

// 4. Fallbacks. var(--x, 1rem) is deliberate, not a dangling reference.
silent(
	'a var() with a fallback is not an unknown token',
	'unknown-token',
	wrap('.a { padding: var(--not-a-token, 1rem); }')
);
fires(
	'but the same name without a fallback is',
	'unknown-token',
	wrap('.a { padding: var(--not-a-token); }')
);

// Bonus: a style: directive is not a token reference at all.
silent(
	'a style: directive is not parsed as a token reference',
	'unknown-token',
	'<div style:--local-thing="red"></div>'
);

// ---------------------------------------------------------------------------
console.log('\nretired-token and tailwind-shadow (C9, C11)');
const retired = manifest.tombstones.find(
	(entry) => entry.kind === 'token' && entry.lifecycle.replacement
)!;
const retiredHits = fires(
	`reports the retired ${retired.name}`,
	'retired-token',
	wrap(`.a { background: var(${retired.name}); }`)
);
check(
	'names the replacement',
	retiredHits.some((hit) => hit.message.includes(retired.lifecycle.replacement!)),
	retiredHits.map((hit) => hit.message)
);
check(
	'names the decision that retired it',
	retiredHits.some((hit) => hit.message.includes(retired.lifecycle.decisionId!)),
	retiredHits.map((hit) => hit.message)
);
check(
	'a retired token is not also reported as merely unknown',
	!ruleIds(wrap(`.a { background: var(${retired.name}); }`)).includes('unknown-token')
);

const shadowed = manifest.tailwindShadowed[0];
check(
	'the manifest records at least one Tailwind collision',
	Boolean(shadowed),
	manifest.tailwindShadowed
);
if (shadowed) {
	fires(
		`reports ${shadowed} as Tailwind-shadowed`,
		'tailwind-shadow',
		wrap(`.a { font-family: var(${shadowed}); }`)
	);
}
silent(
	'does not report an uncontested token',
	'tailwind-shadow',
	wrap('.a { color: var(--text-primary); }')
);

// ---------------------------------------------------------------------------
// A style block is not the only place a token is named. Restricting the rules
// to it made retired-token report zero across all 246 Atlas components while
// three of them referenced the deprecated --color-full from a script literal.
// A clean result that is clean because nothing was looked at.
console.log('\nreferences outside the style block');
fires(
	'finds a token named in a script string literal',
	'retired-token',
	`<script lang="ts">const options = [{ accent: 'var(${retired.name})' }];</script>\n<div />`
);
fires(
	'finds a token named in an attribute value',
	'retired-token',
	`<div style="background: var(${retired.name})"></div>`
);
silent(
	'a live token in a script literal is not reported',
	'retired-token',
	`<script lang="ts">const a = 'var(--text-primary)';</script>\n<div />`
);
check(
	'a string with no var() is not scanned at all',
	review('<script lang="ts">const a = "just text";</script>\n<div />', manifest).violations
		.length === 0
);

// ---------------------------------------------------------------------------
console.log('\napply_fixes (C7)');
const before = wrap('.a { background: #d4b896; padding: 24px; }');
const fixed = applyFixes(before, manifest);
check('rewrites the literal to a token', fixed.source.includes('var(--hex-sand)'), fixed.source);
check(
	'removes the fixed violation on a second pass',
	!ruleIds(fixed.source).includes('raw-value') ||
		review(fixed.source, manifest).violations.filter(
			(v) => v.rule === 'raw-value' && v.message.includes('--hex-sand')
		).length === 0,
	review(fixed.source, manifest).violations.map((v) => v.message)
);
check('reports what it applied', fixed.applied.length > 0, fixed.applied.length);
check('the fixed source still parses', review(fixed.source, manifest).parseError === null);

// A fix must be value-identical, or "rendered output unchanged" is not true.
const tokenValue = manifest.tokens
	.find((token) => token.name === '--hex-sand')
	?.value.toLowerCase();
check(
	'the substituted token holds exactly the replaced value',
	tokenValue === '#d4b896',
	tokenValue
);

const unfixable = '<script lang="ts">export let title = "x";</script>\n<div>{title}</div>';
const untouched = applyFixes(unfixable, manifest);
check('leaves judgement calls alone rather than guessing', untouched.source === unfixable);
check(
	'and reports them as remaining',
	untouched.remaining.some((entry) => entry.rule === 'svelte5-runes'),
	untouched.remaining
);

// ---------------------------------------------------------------------------
console.log('\nengine behaviour');
check(
	'unparseable source reports the error rather than throwing',
	review('<div', manifest).parseError !== null
);
check(
	'and runs no rule against a guessed structure',
	review('<div', manifest).violations.length === 0
);
check('every result is marked advisory (D-159)', review(before, manifest).advisory === true);
check(
	'clean markup produces nothing',
	review('<Button>Save</Button>', manifest).violations.length === 0,
	review('<Button>Save</Button>', manifest).violations
);

// ---------------------------------------------------------------------------
console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
