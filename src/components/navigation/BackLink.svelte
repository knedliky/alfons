<script lang="ts" module>
	export interface BackLinkProps {
		href: string;
		label: string;
		fixed?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * BackLink — navigational breadcrumb-style link with a left-pointing arrow.
	 *
	 * Usage:
	 *   `<BackLink href="/blog" label="Back to Blog" />`
	 *   `<BackLink href="/blog" label="Back to Blog" fixed />`
	 *
	 * Features:
	 * - Auto-detects admin/public theme via context (no explicit theme prop needed)
	 * - Hover micro-interaction: arrow slides left 4px, colour shifts to primary text
	 * - Fixed mode: pins below header, aligned with the site logo (64rem inner container)
	 * - Design-token-first CSS for both admin and public token namespaces
	 */
	import { getThemeVariant } from '../../contexts/theme.js';

	let { href, label, fixed = false, class: additionalClasses = '' }: BackLinkProps = $props();

	const activeTheme = $derived(getThemeVariant());

	/* When fixed mode is active, override --back-link-height on :root so
	   sticky elements (TOC, scroll-margin) account for this fixed row.
	   Cleaned up on unmount so other pages are unaffected. */
	$effect(() => {
		if (!fixed) return;
		document.documentElement.style.setProperty('--back-link-height', '46px');
		return () => {
			document.documentElement.style.removeProperty('--back-link-height');
		};
	});
</script>

{#if fixed}
	<div class="back-link-fixed" data-theme={activeTheme}>
		<div class="back-link-fixed-inner">
			<a {href} class="back-link {additionalClasses}" data-theme={activeTheme}>
				<svg class="back-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
					<path
						d="M10 12L6 8L10 4"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
				{label}
			</a>
		</div>
	</div>
{:else}
	<a {href} class="back-link {additionalClasses}" data-theme={activeTheme}>
		<svg class="back-arrow" width="16" height="16" viewBox="0 0 16 16" fill="none">
			<path
				d="M10 12L6 8L10 4"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
		{label}
	</a>
{/if}

<style>
	/* Fixed positioning container — mirrors Header.svelte centering */
	.back-link-fixed {
		position: fixed;
		top: var(--header-height);
		left: 0;
		right: 0;
		z-index: var(--z-sticky);
		padding: var(--space-4) var(--space-5);
		pointer-events: none;
	}

	.back-link-fixed-inner {
		max-width: 64rem;
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--text-secondary);
		font-size: 14px;
		text-decoration: none;
		transition: color 200ms ease;
		width: fit-content;
		pointer-events: auto;
	}

	.back-link:hover {
		color: var(--text-primary);
	}

	.back-arrow {
		transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* Arrow renders in the brand accent by default so the back affordance
	   reads as an action rather than muted chrome. The path inherits
	   currentColor from the SVG attribute, so this stroke override is what
	   gives it the accent. Admin theme resets to currentColor below. */
	.back-arrow path {
		stroke: var(--accent);
		stroke-width: 2.5;
	}

	.back-link:hover .back-arrow {
		transform: translateX(-4px);
	}

	/* Admin theme variant */
	.back-link[data-theme='admin'] {
		color: var(--admin-text-secondary);
	}

	.back-link[data-theme='admin']:hover {
		color: var(--admin-text);
	}

	/* Admin surfaces keep the muted chrome arrow — the brand accent is a
	   public-facing affordance, not an admin one. */
	.back-link[data-theme='admin'] .back-arrow path {
		stroke: currentColor;
		stroke-width: 2;
	}
</style>
