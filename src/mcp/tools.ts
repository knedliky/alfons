/**
 * The answers the Alfons MCP gives.
 *
 * Every function here reads the loaded manifest and nothing else — no .svelte
 * is opened, no CSS is parsed, no database is reached. That is what makes a
 * tool call a lookup, and it is why the manifest is generated rather than
 * derived on demand (D-158, D-162).
 *
 * These are pure functions over a Manifest, separate from the protocol wiring
 * in server.ts, so they can be exercised without standing a server up. The
 * smoke test does exactly that.
 */
import { LAYOUT_TIER_ORDER } from '../manifest/types.js';
import type { ComponentEntry, Manifest, Surface, TokenEntry } from '../manifest/types.js';

// ---------------------------------------------------------------------------
// find_components
// ---------------------------------------------------------------------------

/**
 * Words carrying no signal in a design-system query.
 *
 * "something to show a status" is three quarters noise, and without this the
 * overlap score is dominated by whichever component happens to say "to" most.
 */
const STOPWORDS = new Set([
	'a',
	'an',
	'the',
	'to',
	'for',
	'of',
	'in',
	'on',
	'with',
	'and',
	'or',
	'is',
	'it',
	'that',
	'this',
	'something',
	'anything',
	'component',
	'components',
	'show',
	'display',
	'need',
	'want',
	'use',
	'using',
	'me',
	'i',
	'my',
	'some',
	'any',
	'how',
	'what'
]);

function terms(text: string): string[] {
	return text
		.toLowerCase()
		.split(/[^a-z0-9]+/)
		.filter((word) => word.length > 1 && !STOPWORDS.has(word));
}

/**
 * Split a PascalCase name into words, so "StatusBadge" matches "status".
 *
 * Without this the only way to find a component is to already know its name,
 * which is precisely the situation the MCP exists to fix.
 */
function nameTerms(name: string): string[] {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
		.toLowerCase()
		.split(/\s+/);
}

/**
 * Weighted field overlap.
 *
 * The weights encode what a name is worth relative to prose: a component whose
 * name contains the query term is almost always the answer, whereas one that
 * mentions it in a feature bullet is a candidate. Deprecated entries are
 * pushed down rather than hidden — an agent searching for what exists should
 * still see them, just not first.
 */
function score(component: ComponentEntry, queryTerms: string[]): number {
	const fields: Array<[string[], number]> = [
		[nameTerms(component.name), 10],
		[terms(component.summary ?? ''), 4],
		[terms(component.category), 3],
		[component.features.flatMap(terms), 2],
		[component.props.map((prop) => prop.name.toLowerCase()), 1]
	];

	let total = 0;
	for (const [words, weight] of fields) {
		const set = new Set(words);
		for (const term of queryTerms) {
			if (set.has(term)) total += weight;
			// A prefix hit catches "status" against "statuses" and "badge"
			// against "badges" without dragging in a stemmer.
			else if (words.some((word) => word.startsWith(term) || term.startsWith(word))) {
				total += weight / 2;
			}
		}
	}

	if (component.lifecycle?.status === 'deprecated') total *= 0.4;
	return total;
}

export interface ComponentMatch {
	name: string;
	category: string;
	summary: string | null;
	score: number;
	status: string;
}

export function findComponents(manifest: Manifest, query: string, limit = 10): ComponentMatch[] {
	const queryTerms = terms(query);
	if (!queryTerms.length) return [];

	return manifest.components
		.map((component) => ({
			name: component.name,
			category: component.category,
			summary: component.summary,
			score: Math.round(score(component, queryTerms) * 10) / 10,
			status: component.lifecycle?.status ?? 'live'
		}))
		.filter((match) => match.score > 0)
		.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
		.slice(0, limit);
}

// ---------------------------------------------------------------------------
// get_component
// ---------------------------------------------------------------------------

/**
 * Snippet-typed props are slots.
 *
 * Svelte 5 has no separate slot concept — a slot IS a prop whose type is a
 * Snippet — but an agent asking "what slots does this take" is asking a real
 * question, and answering it means reading the type rather than a field the
 * manifest does not have.
 */
function slotsOf(component: ComponentEntry): string[] {
	return component.props
		.filter((prop) => /\bSnippet\b/.test(prop.type ?? ''))
		.map((prop) => prop.name);
}

/**
 * Variants are the string-union props.
 *
 * `variant`, `size` and `theme` are all written as unions of string literals,
 * so the legal values are in the type and nowhere else. Returning them as a
 * list saves the caller parsing TypeScript to find out that a Button can be
 * `ghost`.
 */
function variantsOf(component: ComponentEntry): Record<string, string[]> {
	const variants: Record<string, string[]> = {};
	for (const prop of component.props) {
		const type = prop.type ?? '';
		if (!type.includes('|') || !type.includes("'")) continue;
		const values = [...type.matchAll(/'([^']+)'/g)].map((match) => match[1]);
		if (values.length > 1) variants[prop.name] = values;
	}
	return variants;
}

/**
 * Levenshtein distance, for "did you mean".
 *
 * The search ranker cannot do this job: it matches whole terms, so "Buton"
 * shares nothing with "Button" and scores zero. A misspelling is a different
 * question from a description, and conflating them meant a typo returned an
 * empty list — the one answer that makes an agent build its own component.
 */
function distance(a: string, b: string): number {
	let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
	for (let i = 1; i <= a.length; i++) {
		const current = [i];
		for (let j = 1; j <= b.length; j++) {
			current[j] = Math.min(
				previous[j]! + 1,
				current[j - 1]! + 1,
				previous[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1)
			);
		}
		previous = current;
	}
	return previous[b.length]!;
}

/** Names within a small edit distance, closest first. */
function nearestNames(manifest: Manifest, name: string, limit = 5): string[] {
	const query = name.toLowerCase();
	// A third of the name, so short names stay strict and long ones tolerate a
	// dropped syllable. Minimum 2, or "Card" would match nothing but itself.
	const tolerance = Math.max(2, Math.floor(query.length / 3));

	return manifest.components
		.map((component) => ({
			name: component.name,
			gap: distance(query, component.name.toLowerCase())
		}))
		.filter((candidate) => candidate.gap <= tolerance)
		.sort((a, b) => a.gap - b.gap || a.name.localeCompare(b.name))
		.slice(0, limit)
		.map((candidate) => candidate.name);
}

export function getComponent(manifest: Manifest, name: string, storybookBase: string) {
	const component = manifest.components.find(
		(entry) => entry.name.toLowerCase() === name.toLowerCase()
	);

	if (!component) {
		// A tombstone is the whole reason the lifecycle table exists: the answer
		// for a removed component is its replacement and the decision, not
		// "unknown". Falling back to near-name suggestions covers a typo.
		const tombstone = manifest.tombstones.find(
			(entry) => entry.kind === 'component' && entry.name.toLowerCase() === name.toLowerCase()
		);
		if (tombstone) {
			return {
				found: false,
				name: tombstone.name,
				retired: true,
				...tombstone.lifecycle,
				message:
					`${tombstone.name} was ${tombstone.lifecycle.status}` +
					(tombstone.lifecycle.replacement ? `; use ${tombstone.lifecycle.replacement}` : '') +
					(tombstone.lifecycle.decisionId ? ` (${tombstone.lifecycle.decisionId})` : '')
			};
		}
		return {
			found: false,
			name,
			message: `No component named ${name}.`,
			// Misspellings first, then description matches, so "Buton" gets
			// Button and "status thing" still gets StatusBadge.
			didYouMean: [
				...new Set([
					...nearestNames(manifest, name),
					...findComponents(manifest, name, 5).map((match) => match.name)
				])
			].slice(0, 5)
		};
	}

	return {
		found: true,
		name: component.name,
		category: component.category,
		summary: component.summary,
		importPath: '@alfons/design',
		importStatement: `import { ${component.name} } from '@alfons/design';`,
		props: component.props,
		propsSource: component.propsSource,
		slots: slotsOf(component),
		variants: variantsOf(component),
		usage: component.usage,
		features: component.features,
		composes: component.composes,
		tokensUsed: component.tokensUsed,
		exported: component.exported,
		storybookUrl: component.storyId ? `${storybookBase}/?path=/story/${component.storyId}` : null,
		lifecycle: component.lifecycle
	};
}

// ---------------------------------------------------------------------------
// get_tokens
// ---------------------------------------------------------------------------

/**
 * Tokens legal on a surface, optionally narrowed to one category.
 *
 * The surface filter is the load-bearing part. admin.css and public.css both
 * define into `:root`, so nothing in the CSS itself stops an agent using an
 * --admin-* token on a public page; the manifest records which file defined
 * each token, and this is where that becomes an answer rather than a field.
 *
 * Admin surfaces get public tokens too, because admin.css layers on top of
 * public.css rather than replacing it. The reverse is not true.
 */
export function getTokens(
	manifest: Manifest,
	options: { category?: string; surface?: Surface; includeDeprecated?: boolean } = {}
) {
	const { category, surface = 'public', includeDeprecated = false } = options;

	const legal = (token: TokenEntry) => surface === 'admin' || token.surface === 'public';

	const tokens = manifest.tokens
		.filter(legal)
		.filter((token) => !category || token.category === category)
		.filter((token) => includeDeprecated || token.lifecycle?.status !== 'deprecated')
		.map((token) => ({
			name: token.name,
			value: token.value,
			category: token.category,
			surface: token.surface,
			status: token.lifecycle?.status ?? 'live',
			...(token.lifecycle?.status === 'deprecated'
				? { replacement: token.lifecycle.replacement, decisionId: token.lifecycle.decisionId }
				: {})
		}));

	return {
		surface,
		category: category ?? 'all',
		categories: [...new Set(manifest.tokens.filter(legal).map((token) => token.category))].sort(),
		count: tokens.length,
		deprecatedHidden: includeDeprecated
			? 0
			: manifest.tokens.filter(
					(token) =>
						legal(token) &&
						(!category || token.category === category) &&
						token.lifecycle?.status === 'deprecated'
				).length,
		tokens
	};
}

// ---------------------------------------------------------------------------
// get_layout_recipe
// ---------------------------------------------------------------------------

/**
 * The composition order for page-level layouts, from the authored tiers.
 *
 * This was derived from the compose graph and was wrong (D-168). Eight of the
 * nine layout components render no other layout, so that graph has a single
 * edge; sorting it put PageFrame — the outermost shell — last, and the tests
 * passed because they checked the sort was self-consistent rather than that the
 * answer was right. A field derived from nothing does not come back empty, it
 * comes back confident, which is the worse failure for a tool an agent trusts.
 *
 * The tiers now come from alfons.layout_tiers, and the layout-nesting rule
 * reads the same field, so the order an agent is given and the order its markup
 * is judged against are one fact rather than two that can drift.
 */
export function getLayoutRecipe(manifest: Manifest) {
	const layouts = manifest.components.filter((component) => component.category === 'layouts');
	const names = new Set(layouts.map((component) => component.name));
	const rank = (component: ComponentEntry) =>
		component.layoutTier
			? LAYOUT_TIER_ORDER.indexOf(component.layoutTier)
			: LAYOUT_TIER_ORDER.length;

	return {
		note:
			'Outermost first, by tier: shell frames the page, region divides it, container ' +
			'arranges within a region. A component may not contain one from an outer tier. ' +
			'Within a tier there is no order — a Stack inside a Grid is as correct as the ' +
			'reverse, and D-168 declines to invent a precedence that nobody intends.',
		tiers: LAYOUT_TIER_ORDER.filter((tier) =>
			layouts.some((component) => component.layoutTier === tier)
		),
		layouts: layouts
			.map((component) => ({
				name: component.name,
				tier: component.layoutTier,
				summary: component.summary,
				renders: component.composes.filter((child) => names.has(child)),
				usage: component.usage,
				storyId: component.storyId
			}))
			.sort((a, b) => {
				const byTier =
					rank(layouts.find((entry) => entry.name === a.name)!) -
					rank(layouts.find((entry) => entry.name === b.name)!);
				return byTier || a.name.localeCompare(b.name);
			})
	};
}

// ---------------------------------------------------------------------------
// list_surfaces
// ---------------------------------------------------------------------------

/**
 * What surfaces exist and what is legal on each.
 *
 * Deliberately the tool an agent can call first, knowing nothing. It answers
 * the question behind most misuse — which of these tokens am I allowed here —
 * before the agent has picked a component.
 */
export function listSurfaces(manifest: Manifest) {
	const count = (surface: Surface) =>
		manifest.tokens.filter((token) => token.surface === surface).length;

	return {
		colourMode: 'dark',
		colourModeNote:
			'Dark is the sole colour mode. There is no light theme and no runtime toggle; ' +
			'consumers pin data-colour-mode="dark" on <html> statically.',
		surfaces: [
			{
				name: 'public',
				stylesheet: '@alfons/design/public',
				tokenCount: count('public'),
				legalTokens: 'Every token defined outside admin.css.',
				note: 'The default. An --admin-* token on a public surface is a rule violation.'
			},
			{
				name: 'admin',
				stylesheet: '@alfons/design/admin',
				tokenCount: count('public') + count('admin'),
				legalTokens: 'Public tokens plus the --admin-* set.',
				note: 'admin.css layers on top of public.css and requires it to be imported first.'
			}
		],
		alsoImport: [
			{ specifier: '@alfons/design/base', purpose: 'Global styles, typography and utilities.' },
			{ specifier: '@alfons/design/form-states', purpose: 'Shared form validation states.' }
		]
	};
}
