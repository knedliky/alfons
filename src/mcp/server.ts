/**
 * The Alfons MCP server (D-158).
 *
 * A package dependency cannot stop an agent reinventing a component, because
 * it is only consulted once the author already knows what to import. A service
 * can, because asking it is cheaper than guessing. That is the whole argument
 * for this existing alongside @alfons/design rather than instead of it.
 *
 * The tool descriptions below are load-bearing. They are the only thing a
 * calling agent reads before choosing, so they are written to say when to
 * reach for a tool, not merely what it returns.
 *
 * Run: bun run mcp
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { reloadingManifest, storybookBase } from './manifest.js';
import { applyFixes, libraryFindings, review } from '../rules/index.js';
import { scaffoldComponent } from './scaffold.js';
import { planPrototypeRound, promotePrototype } from './prototypes.js';
import {
	findComponents,
	findDesignMemory,
	getComponent,
	getLayoutRecipe,
	getTokens,
	listSurfaces
} from './tools.js';

// One complete manifest per call. Hook refreshes replace the file atomically,
// and the next call adopts the validated snapshot without restarting stdio.
const manifest = reloadingManifest();

const server = new McpServer({ name: 'alfons', version: '0.1.0' });

/** Every tool answers with JSON text; the shape is the contract, not prose. */
function reply(payload: unknown) {
	return { content: [{ type: 'text' as const, text: JSON.stringify(payload, null, 2) }] };
}

server.registerTool(
	'find_components',
	{
		title: 'Find components',
		description:
			'Search the Alfons component library by what you need it to do, in plain language — ' +
			'"something to show a status", "a way to lay out cards in a grid". Returns ranked ' +
			'matches with a one-line summary each. Call this BEFORE writing any new Svelte ' +
			'component: building a second one that already exists is the ' +
			'failure this server was built to prevent. Follow up with get_component for the props.',
		inputSchema: {
			query: z.string().describe('What the component should do, in plain language.'),
			limit: z.number().int().min(1).max(50).optional().describe('Maximum matches (default 10).')
		}
	},
	async ({ query, limit }) => reply(findComponents(manifest(), query, limit))
);

server.registerTool(
	'find_design_memory',
	{
		title: 'Find design memory',
		description:
			'Search Alfons before making a design choice. Returns both existing components and ' +
			'confirmed design decisions matching an intent, including the rationale behind current ' +
			'patterns. Call this BEFORE creating a component or introducing a new visual or ' +
			'interaction pattern: it answers not only what exists, but what Alfons has already ' +
			'decided and why. Results are refreshed by project hooks after component creation and ' +
			'successful ledger record_decision calls.',
		inputSchema: {
			query: z.string().describe('The component, pattern or design question to investigate.'),
			limit: z.number().int().min(1).max(50).optional().describe('Maximum results per kind.')
		}
	},
	async ({ query, limit }) => reply(findDesignMemory(manifest(), query, limit))
);

server.registerTool(
	'get_component',
	{
		title: 'Get component',
		description:
			'Everything needed to use one Alfons component: props with their types, which props ' +
			'are snippets (slots), the legal values of every variant prop, the import statement, ' +
			'a usage example and a link to its Storybook story. Use this once you know the name, ' +
			'whether from find_components or from existing markup. If the name was retired, the ' +
			'answer names its replacement and the decision that retired it rather than reporting ' +
			'it as unknown.',
		inputSchema: {
			name: z.string().describe('Component name, e.g. Button. Case-insensitive.')
		}
	},
	async ({ name }) => reply(getComponent(manifest(), name, storybookBase()))
);

server.registerTool(
	'get_tokens',
	{
		title: 'Get design tokens',
		description:
			'The design tokens legal on a given surface, optionally narrowed to one category ' +
			'(colours, spacing, typography, elevation, motion). Call this instead of writing a ' +
			'raw colour, size or duration — every literal value in Alfons markup is a bug that ' +
			'a token would have prevented. The surface argument matters: --admin-* tokens are ' +
			'legal on admin surfaces only, and nothing in the CSS itself enforces that, because ' +
			'admin.css and public.css both define into :root. Deprecated tokens are excluded ' +
			'unless asked for, and when included they carry their replacement.',
		inputSchema: {
			surface: z
				.enum(['public', 'admin'])
				.optional()
				.describe('Which surface the markup is for. Defaults to public.'),
			category: z
				.string()
				.optional()
				.describe('Token category, e.g. colours. Omit for every category.'),
			includeDeprecated: z.boolean().optional().describe('Include deprecated tokens.')
		}
	},
	async ({ surface, category, includeDeprecated }) =>
		reply(getTokens(manifest(), { surface, category, includeDeprecated }))
);

server.registerTool(
	'get_layout_recipe',
	{
		title: 'Get layout recipe',
		description:
			'The composition order for page-level layouts — which Alfons layout component wraps ' +
			'which, outermost first, with a usage example for each. Call this when building a ' +
			'page or a screen rather than a single widget, so the shell, the container and the ' +
			'section nest the way the rest of the system does. Ordered by tier — shell frames ' +
			'the page, region divides it, container arranges within a region — and a component ' +
			'may not contain one from an outer tier. Within a tier there is no order: a Stack ' +
			'inside a Grid is as correct as the reverse (D-168). The layout-nesting rule in ' +
			'review_markup reads this same ordering, so the two cannot disagree.',
		inputSchema: {}
	},
	async () => reply(getLayoutRecipe(manifest()))
);

server.registerTool(
	'list_surfaces',
	{
		title: 'List surfaces',
		description:
			'The surfaces Alfons targets (public and admin), which stylesheet each needs, how ' +
			'many tokens each may use, and the colour-mode rule. Call this first when starting ' +
			'work in an unfamiliar repository — it answers which tokens are legal where before ' +
			'you have picked a component, which is where most misuse begins.',
		inputSchema: {}
	},
	async () => reply(listSurfaces(manifest()))
);

server.registerTool(
	'review_markup',
	{
		title: 'Review markup',
		description:
			'Check Svelte source against the Alfons design rules and return every violation with ' +
			'its rule id, message and position. Call this after writing or editing any component ' +
			'that uses Alfons, before considering it finished. It catches literal colours and ' +
			'lengths where a token exists, admin tokens on public surfaces, var() references that ' +
			'resolve to nothing, retired tokens (answered with their replacement and the decision ' +
			'that retired them), bare <button>/<input>/<select> where an atom exists, layouts ' +
			'nested in the wrong order, Svelte 4 idioms, and tokens Tailwind silently shadows. ' +
			'Findings are ADVISORY: nothing here fails a build or blocks a commit (D-159). Pass ' +
			'source text, never a path — this server cannot read your filesystem.',
		inputSchema: {
			source: z.string().describe('The .svelte source to review, as text.'),
			surface: z
				.enum(['public', 'admin'])
				.optional()
				.describe('Which surface this markup renders on. Defaults to public.')
		}
	},
	async ({ source, surface }) => reply(review(source, manifest(), surface))
);

server.registerTool(
	'apply_fixes',
	{
		title: 'Apply fixes',
		description:
			'Return corrected source for the violations that have an unambiguous fix, plus the ' +
			'list of those left alone. Only substitutions that are provably value-identical are ' +
			'applied — a literal replaced by a token holding exactly that value — so the rendered ' +
			'output does not change. Anything needing a judgement (which token replaces a retired ' +
			'one, how `$:` becomes $derived or $effect) is reported, not guessed. Write the ' +
			'returned text yourself; this server does not touch your files.',
		inputSchema: {
			source: z.string().describe('The .svelte source to correct, as text.'),
			surface: z.enum(['public', 'admin']).optional().describe('Defaults to public.')
		}
	},
	async ({ source, surface }) => reply(applyFixes(source, manifest(), surface))
);

server.registerTool(
	'scaffold_component',
	{
		title: 'Scaffold a component',
		description:
			'Generate a new Alfons component and its Storybook story, already satisfying every ' +
			'design rule: tokens legal on the requested surface, Svelte 5 runes, and layouts nested ' +
			'in the documented order. Call only after find_design_memory has found no existing ' +
			'component or confirmed pattern for the intent, and use this INSTEAD of writing a ' +
			'component from scratch — ' +
			'review_markup then has nothing to report, because the generated path was compliant ' +
			'before it was reviewed. Returns source text and the paths to write it to; the caller ' +
			'writes the files. If a component of that name already exists, the answer says so ' +
			'rather than quietly producing a second one.',
		inputSchema: {
			name: z.string().describe('PascalCase component name, e.g. SummaryCard.'),
			category: z
				.string()
				.describe('Directory under src/components: atoms, cards, layouts, admin, ...'),
			surface: z
				.enum(['public', 'admin'])
				.describe('Which surface it renders on. Decides which tokens are legal.'),
			composes: z
				.array(z.string())
				.optional()
				.describe('Library components it should render. Must be exported and live.')
		}
	},
	async ({ name, category, surface, composes }) =>
		reply(scaffoldComponent(manifest(), { name, category, surface, composes }))
);

server.registerTool(
	'plan_prototype_round',
	{
		title: 'Plan a prototyping round',
		description:
			'Provision a round of five distinctly different page prototypes for /dev/<page-name>. ' +
			'Takes the page brief and five named design directions and returns the files to write: ' +
			'round.json plus one seeded Page.svelte per approach, each already a production-accurate ' +
			'shell — live layout tiers, Header and Footer, tokens legal on the surface — that passes ' +
			'review_markup untouched. Call this INSTEAD of hand-writing prototype scaffolding, and ' +
			'give each approach to a separate agent: one agent, one approach directory, no conflicts. ' +
			'The seeds carry a data-alfons-working marker so the dev app glows around work in ' +
			'progress from the first render. The caller writes the files; this server touches none.',
		inputSchema: {
			page: z.string().describe('Kebab-case page slug; becomes the /dev/<page-name> path.'),
			title: z.string().describe('Human title of the page being prototyped.'),
			brief: z
				.string()
				.describe('The brief distilled from user-journey discovery, in full sentences.'),
			surface: z.enum(['public', 'admin']).optional().describe('Defaults to public.'),
			release: z
				.string()
				.optional()
				.describe('The ledger release slug this round runs under, e.g. proto-landing-page.'),
			approaches: z
				.array(
					z.object({
						slug: z.string().optional().describe('Directory slug; defaults to a1..a5.'),
						title: z.string().describe('Short name of the design direction.'),
						direction: z
							.string()
							.describe('What this approach explores and which constraint it pushes.')
					})
				)
				.length(5)
				.describe('Exactly five distinctly different design directions.')
		}
	},
	async ({ page, title, brief, surface, release, approaches }) =>
		reply(planPrototypeRound(manifest(), { page, title, brief, surface, release, approaches }))
);

server.registerTool(
	'promote_prototype',
	{
		title: 'Promote the winning prototype',
		description:
			'The honest half of promotion: what the library must absorb before the winning ' +
			'prototype can ship. Pass the winning Page.svelte as text (and any components the ' +
			'approach created locally) and the answer names every new component that has to be ' +
			'created to stay component-driven — local .svelte files the library lacks, bare ' +
			'elements a rule flagged — plus full review findings and the checklist that closes ' +
			'the round: extract components, regenerate the manifest, record the losing ' +
			'approaches, merge the round branch. Call this when the user has picked a winner, ' +
			'before touching src/components. Pass source text, never paths.',
		inputSchema: {
			page: z.string().describe('The round’s page slug.'),
			approach: z.string().describe('The winning approach’s slug, e.g. a3.'),
			source: z.string().describe('The winning Page.svelte, as text.'),
			surface: z.enum(['public', 'admin']).optional().describe('Defaults to public.'),
			localComponents: z
				.record(z.string(), z.string())
				.optional()
				.describe('Sources of components the approach created locally, keyed by file name.')
		}
	},
	async ({ page, approach, source, surface, localComponents }) =>
		reply(promotePrototype(manifest(), { page, approach, source, surface, localComponents }))
);

server.registerTool(
	'review_library',
	{
		title: 'Review the library',
		description:
			'Findings about Alfons itself rather than about a piece of markup: tokens with no ' +
			'consumer and no lifecycle row, components exported but imported by nothing, and ' +
			'tokens whose names collide with a Tailwind v4 default. These are questions about the ' +
			'whole manifest, so they cannot be answered from a snippet the way review_markup ' +
			'findings can. Use it when auditing the design system, not when writing a component.',
		inputSchema: {}
	},
	async () => reply({ advisory: true, findings: libraryFindings(manifest()) })
);

await server.connect(new StdioServerTransport());
