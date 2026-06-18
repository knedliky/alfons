<script lang="ts" module>
	import type { Snippet } from 'svelte';

	type SurfaceElement = 'div' | 'section' | 'article' | 'aside';

	export interface SurfaceProps {
		/** Element to render. */
		as?: SurfaceElement;
		/** Corner radius. Defaults to the shared --radius-message. */
		radius?: string;
		/** Applied alongside the base surface class so callers add their own
		 *  layout, padding, and any border-colour override (e.g. a tinted edge). */
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}
</script>

<script lang="ts">
	/**
	 * Surface — the frosted glass panel shared by the agent input and the chat
	 * message bubbles: a translucent fill (--surface-glass-bg), a blurred backdrop,
	 * a thin edge (a single faint border in dark, directional borders in light for
	 * the raised feel), and the shared --shadow-glass drop shadow.
	 *
	 * Distinct from Card: Card is a solid, padded content container; Surface is the
	 * lighter, blurred chat-surface treatment. Consumers add their own layout and
	 * padding via the class prop, and can override the edge colour there too (the
	 * agent reply bubble tints the border sky-blue, for example).
	 */
	let {
		as: Element = 'div',
		radius = 'var(--radius-message)',
		class: className = '',
		children,
		...restProps
	}: SurfaceProps = $props();
</script>

<svelte:element this={Element} class="surface {className}" style:border-radius={radius} {...restProps}>
	{@render children?.()}
</svelte:element>

<style>
	.surface {
		background: var(--surface-glass-bg);
		box-shadow: var(--shadow-glass);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	/* Dark — a single faint edge. */
	:global([data-colour-mode='dark']) .surface {
		border: 1px solid color-mix(in srgb, var(--text-primary) 10%, transparent);
	}

	/* Light — directional borders for the raised, tactile feel (matches Card). */
	:global([data-colour-mode='light']) .surface {
		border-top: 1px solid var(--card-border-top);
		border-left: 1px solid var(--card-border-left);
		border-right: 1px solid var(--card-border-right);
		border-bottom: 1px solid var(--card-border-bottom);
	}
</style>
