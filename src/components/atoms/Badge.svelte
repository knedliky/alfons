<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface BadgeProps {
		/** Visual variant controlling background and text colour */
		variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
		/** Size of the badge — sm for compact contexts, default for standard */
		size?: 'sm' | 'default';
		/** Theme context — admin uses admin tokens, public uses brand tokens */
		theme?: 'admin' | 'public';
		/** Additional CSS classes */
		class?: string;
		/** Badge content */
		children?: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * Badge — theme-aware pill indicator for status labels, counts, and tags.
	 *
	 * Usage:
	 *   <Badge variant="success">Published</Badge>
	 *   <Badge variant="warning" size="sm" theme="admin">In Review</Badge>
	 *
	 * Features:
	 * - Five semantic variants mapped to status colour tokens
	 * - Two sizes: sm (compact tables) and default (standard contexts)
	 * - Square corners for all variants
	 * - Supports admin and public themes via data-theme attribute
	 * - Uses Snippet children for flexible content
	 */

	let {
		variant = 'default',
		size = 'default',
		theme = 'public',
		class: className = '',
		children
	}: BadgeProps = $props();
</script>

<span class="badge {className}" data-variant={variant} data-size={size} data-theme={theme}>
	{#if children}
		{@render children()}
	{/if}
</span>

<style>
	/* A moulded plastic chip: solid part colour under a top sheen, set in the
	   mono spec register. The gloss is what makes it read as a moulded piece
	   rather than as a coloured rectangle, and it is the small-chip treatment
	   (--gloss) rather than the slab one (--shade-part). */
	.badge {
		display: inline-flex;
		align-items: center;
		border-radius: var(--radius-1);
		font-family: var(--font-mono);
		font-weight: var(--fw-regular);
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
		white-space: nowrap;
		background-image: var(--gloss);
		box-shadow: var(--shadow-gloss);
	}

	/* --- Size variants ---
	   Mono is regular-only, so size and tracking carry the emphasis. */

	.badge[data-size='sm'] {
		font-size: 0.625rem;
		height: 18px;
		padding: 0 var(--space-2);
	}

	.badge[data-size='default'] {
		font-size: 0.6875rem;
		height: 20px;
		padding: 0 var(--space-2);
	}

	/* --- Colour variants ---
	   Text colour is not decorative: light and mid plastics take foundry black,
	   the dark ones take bone. Getting this backwards is the single most
	   legible way to look off-brand, so each variant states which it is. */

	.badge[data-variant='default'] {
		background-color: var(--girder-red);
		color: var(--ink-900); /* dark plastic */
	}

	.badge[data-variant='success'] {
		background-color: var(--toolbox-olive);
		color: var(--foundry-black); /* light plastic */
	}

	.badge[data-variant='warning'] {
		background-color: var(--brass-amber);
		color: var(--foundry-black); /* light plastic */
	}

	.badge[data-variant='error'] {
		background-color: var(--girder-red);
		color: var(--ink-900); /* dark plastic */
	}

	.badge[data-variant='info'] {
		background-color: var(--pulley-blue);
		color: var(--foundry-black); /* light plastic */
	}

	/* --- Admin theme ---
	   No colour overrides. They existed because the badge used to be a tint
	   with the status hue as its TEXT, so admin restated that hue from the
	   -text tokens for contrast. The chip is a solid plastic now, and those
	   same tokens are its BACKGROUND — so re-applying them as colour would
	   have painted olive text on an olive chip and made every admin success
	   badge unreadable.

	   A chip is hardware, like the Button cap: it reads identically whether the
	   surrounding page is public or admin, so there is nothing left to
	   override. The neutral variant is the one exception, because a muted chip
	   is a real need on a dense admin surface and no part colour means neutral. */
	.badge[data-theme='admin'][data-variant='default'] {
		background-color: var(--steel-200);
		color: var(--ink-500);
	}
</style>
