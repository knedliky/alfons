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
	 * a thin faint edge, and the shared --shadow-glass drop shadow.
	 *
	 * Distinct from Card: Card is a solid, padded content container; Surface is the
	 * lighter, blurred chat-surface treatment. Consumers add their own layout and
	 * padding via the class prop, and can tint the edge by setting the
	 * `--surface-edge` custom property (the agent reply bubble sets it sky-blue).
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
		/* Raised-tier frost — light enough that the technical grid reads through. */
		backdrop-filter: blur(var(--surface-raised-frost));
		-webkit-backdrop-filter: blur(var(--surface-raised-frost));
	}

	/* A single faint edge. Consumers override the colour via --surface-edge. */
	:global([data-colour-mode='dark']) .surface {
		border: 1px solid var(--surface-edge, color-mix(in srgb, var(--text-primary) 10%, transparent));
	}
</style>
