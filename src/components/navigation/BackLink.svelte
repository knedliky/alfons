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
	 * - Themed by tokens alone: --back-link-arrow and --back-link-arrow-weight,
	 *   which the admin overlay sets to muted chrome
	 * - Hover micro-interaction: arrow slides left 4px, colour shifts to primary text
	 * - Fixed mode: pins below header, aligned with the site logo (64rem inner container)
	 */
	let { href, label, fixed = false, class: additionalClasses = '' }: BackLinkProps = $props();

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
	<div class="back-link-fixed">
		<div class="back-link-fixed-inner">
			<a {href} class="back-link {additionalClasses}">
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
	<a {href} class="back-link {additionalClasses}">
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

	/* Arrow renders in the brand accent under Meccano so the back affordance
	   reads as an action rather than muted chrome. The path inherits
	   currentColor from the SVG attribute, so this stroke override is what
	   gives it the accent; the admin overlay sets the token to currentColor,
	   since the accent is a public affordance. */
	.back-arrow path {
		stroke: var(--back-link-arrow);
		stroke-width: var(--back-link-arrow-weight);
	}

	.back-link:hover .back-arrow {
		transform: translateX(-4px);
	}
</style>
