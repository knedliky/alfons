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
import { loadManifest, storybookBase } from './manifest.js';
import { findComponents, getComponent, getLayoutRecipe, getTokens, listSurfaces } from './tools.js';

// Loaded once, at startup, and deliberately not reloaded per call: a manifest
// that changed underneath a running server would make two calls in the same
// conversation disagree. It also means a bad manifest stops the server rather
// than producing one wrong answer (C6).
const manifest = loadManifest();

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
			'component: Alfons has 82, and building a second one that already exists is the ' +
			'failure this server was built to prevent. Follow up with get_component for the props.',
		inputSchema: {
			query: z.string().describe('What the component should do, in plain language.'),
			limit: z.number().int().min(1).max(50).optional().describe('Maximum matches (default 10).')
		}
	},
	async ({ query, limit }) => reply(findComponents(manifest, query, limit))
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
	async ({ name }) => reply(getComponent(manifest, name, storybookBase()))
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
		reply(getTokens(manifest, { surface, category, includeDeprecated }))
);

server.registerTool(
	'get_layout_recipe',
	{
		title: 'Get layout recipe',
		description:
			'The composition order for page-level layouts — which Alfons layout component wraps ' +
			'which, outermost first, with a usage example for each. Call this when building a ' +
			'page or a screen rather than a single widget, so the shell, the container and the ' +
			'section nest the way the rest of the system does. The order is derived from what ' +
			'the components actually render, not from a written convention that can go stale.',
		inputSchema: {}
	},
	async () => reply(getLayoutRecipe(manifest))
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
	async () => reply(listSurfaces(manifest))
);

await server.connect(new StdioServerTransport());
