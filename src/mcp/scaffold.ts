/**
 * Generate a component that already satisfies the rules.
 *
 * Discovery and review both act after the fact. find_components answers a
 * question the agent has to think to ask, and review_markup arrives once the
 * markup is written — so every rule added to the engine is friction paid
 * afterwards. Scaffolding moves the compliance to generation time, where it
 * costs nothing, and turns review_markup into a safety net rather than a gate.
 *
 * Nothing here is a fixed template. The tokens come from the manifest filtered
 * by surface, the layout wrapper comes from the authored tiers, and the story
 * stub is shaped from the component's own variants. A hardcoded template would
 * be a second copy of the design system, out of date the day a token lands —
 * which is the failure mode this whole release exists to close.
 */
import { LAYOUT_TIER_ORDER } from '../manifest/types.js';
import type { Manifest, Surface } from '../manifest/types.js';

export interface ScaffoldRequest {
	name: string;
	/** Directory under src/components. Free text: a new category is legitimate. */
	category: string;
	surface: Surface;
	/** Library components the new one should render. */
	composes?: string[];
}

export interface ScaffoldResult {
	name: string;
	/** Where to write it. The caller writes; this server touches no files. */
	path: string;
	storyPath: string;
	component: string;
	story: string;
	/** Tokens the scaffold used, so the caller can see they were not invented. */
	tokensUsed: string[];
	notes: string[];
}

/**
 * Pick a token for a role, preferring the surface's own vocabulary.
 *
 * Falls back through a list of candidates rather than naming one, because an
 * admin surface should get --admin-bg where it exists and the shared token
 * where it does not. Returns null rather than inventing a name — a scaffold
 * referencing a token that does not exist would fail the very review it is
 * meant to pass.
 */
function pickToken(manifest: Manifest, surface: Surface, candidates: string[]): string | null {
	const legal = new Map(
		manifest.tokens
			.filter((token) => surface === 'admin' || token.surface === 'public')
			// A scaffold must not seed new markup with something already on its
			// way out, so deprecated tokens are not candidates.
			.filter((token) => (token.lifecycle?.status ?? 'live') === 'live')
			.map((token) => [token.name, token])
	);

	return candidates.find((name) => legal.has(name)) ?? null;
}

/**
 * The outermost layout a composed component needs around it.
 *
 * C6: naming PageSection should not emit it bare, because a region belongs
 * inside a shell. The wrapper is looked up by tier rather than by name, so it
 * follows D-168 and cannot disagree with the layout-nesting rule.
 */
function wrapperFor(manifest: Manifest, composes: string[]): string | null {
	const tierOf = (name: string) =>
		manifest.components.find((entry) => entry.name === name)?.layoutTier ?? null;

	const innermost = composes
		.map(tierOf)
		.filter((tier): tier is NonNullable<typeof tier> => Boolean(tier))
		.sort((a, b) => LAYOUT_TIER_ORDER.indexOf(a) - LAYOUT_TIER_ORDER.indexOf(b))[0];

	if (!innermost || innermost === 'shell') return null;

	// The first shell that is live and exported, so the wrapper is something the
	// caller can actually import.
	return (
		manifest.components.find(
			(entry) =>
				entry.layoutTier === 'shell' &&
				entry.exported &&
				(entry.lifecycle?.status ?? 'live') === 'live'
		)?.name ?? null
	);
}

export function scaffoldComponent(manifest: Manifest, request: ScaffoldRequest): ScaffoldResult {
	const { name, category, surface } = request;
	const notes: string[] = [];

	if (!/^[A-Z][A-Za-z0-9]*$/.test(name)) {
		throw new Error(`Component names are PascalCase; got "${name}".`);
	}

	const existing = manifest.components.find(
		(entry) => entry.name.toLowerCase() === name.toLowerCase()
	);
	if (existing) {
		// Refusing outright would be wrong — a caller may genuinely be replacing
		// something — but scaffolding a duplicate silently is how the library
		// acquired two Modals. Say so, loudly, in the returned notes.
		notes.push(
			`${existing.name} already exists at ${existing.path}. Call get_component before ` +
				`writing this: a second component doing the same job is the failure Alfons exists ` +
				`to prevent.`
		);
	}

	// Only components that are exported and live can be composed: importing a
	// deprecated one would seed markup that review_markup then complains about.
	const available = new Set(
		manifest.components
			.filter((entry) => entry.exported && (entry.lifecycle?.status ?? 'live') === 'live')
			.map((entry) => entry.name)
	);
	const composes = (request.composes ?? []).filter((child) => {
		if (available.has(child)) return true;
		notes.push(`${child} is not an exported, live component; left out of the scaffold.`);
		return false;
	});

	const background = pickToken(manifest, surface, [
		'--admin-bg-elevated',
		'--card-bg',
		'--bg-primary'
	]);
	const border = pickToken(manifest, surface, ['--admin-border', '--card-border']);
	const text = pickToken(manifest, surface, ['--admin-text', '--text-primary']);
	const padding = pickToken(manifest, surface, ['--space-5', '--space-4']);
	const radius = pickToken(manifest, surface, ['--radius-surface', '--radius']);

	const tokensUsed = [background, border, text, padding, radius].filter((token): token is string =>
		Boolean(token)
	);

	const wrapper = wrapperFor(manifest, composes);
	if (wrapper) {
		notes.push(
			`${composes.join(', ')} belongs inside a shell, so the markup nests it in ${wrapper} ` +
				`(D-168). Emitting it bare would fail the layout-nesting rule.`
		);
	}

	const imports = [...new Set([...composes, ...(wrapper ? [wrapper] : [])])].sort();
	const importLine = imports.length
		? `\timport { ${imports.join(', ')} } from '@alfons/design';\n`
		: '';

	const children = composes.length
		? composes.map((child) => `\t\t<${child} />`).join('\n')
		: '\t\t{@render children?.()}';

	const body = wrapper
		? `\t<${wrapper}>\n${children}\n\t</${wrapper}>`
		: children.replace(/^\t\t/gm, '\t');

	// $props and $derived only. No export let, no reactive labels, no
	// createEventDispatcher — the three things svelte5-runes reports (C4).
	const component = `<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface ${name}Props {
		children?: Snippet;
		variant?: 'default' | 'subtle';
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * ${name} — one-line summary of what this is for.
	 *
	 * Usage:
	 *   <${name}>content</${name}>
	 *   <${name} variant="subtle">quieter</${name}>
	 *
	 * Features:
	 * - Scaffolded for the ${surface} surface; every token below is legal there
	 * - Svelte 5 runes only
	 */
${importLine}
	let { children, variant = 'default', class: className = '' }: ${name}Props = $props();

	const tone = $derived(variant === 'subtle' ? 'subtle' : 'default');
</script>

<div class="${kebab(name)} {className}" data-variant={tone}>
${body}
</div>

<style>
	.${kebab(name)} {
${styleFor({ background, border, text, padding, radius })}
	}

	.${kebab(name)}[data-variant='subtle'] {
		opacity: 0.7;
	}
</style>
`;

	const story = `<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ${name} from '../../components/${category}/${name}.svelte';

	const { Story } = defineMeta({
		title: '${titleCase(category)}/${name}',
		component: ${name},
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'subtle']
			}
		}
	});
</script>

<Story name="Default" asChild args={{ variant: 'default' }}>
	<${name} variant="default">${name}</${name}>
</Story>

<Story name="Subtle" asChild args={{ variant: 'subtle' }}>
	<${name} variant="subtle">${name}</${name}>
</Story>
`;

	return {
		name,
		path: `src/components/${category}/${name}.svelte`,
		storyPath: `src/stories/${category}/${name}.stories.svelte`,
		component,
		story,
		tokensUsed,
		notes
	};
}

/** Only emit a declaration when a token was actually found for it. */
function styleFor(tokens: Record<string, string | null>): string {
	const properties: [string, string | null][] = [
		['background', tokens.background],
		['border', tokens.border],
		['color', tokens.text],
		['padding', tokens.padding],
		['border-radius', tokens.radius]
	];

	return properties
		.filter(([, token]) => token)
		.map(([property, token]) =>
			property === 'border'
				? `\t\tborder: 1px solid var(${token});`
				: `\t\t${property}: var(${token});`
		)
		.join('\n');
}

function kebab(name: string): string {
	return name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function titleCase(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
