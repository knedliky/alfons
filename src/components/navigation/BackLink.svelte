<script lang="ts" module>
	export interface BackLinkProps {
		href: string;
		label: string;
		fixed?: boolean;
		theme?: 'admin' | 'public';
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
	 * - Fixed mode: pins below header, aligned with the content container
	 * - Design-token-first CSS for both admin and public token namespaces
	 */
	import { getThemeVariant } from '../../contexts/theme.js';

	let { href, label, fixed = false, theme, class: additionalClasses = '' }: BackLinkProps = $props();

	const activeTheme = $derived(theme ?? getThemeVariant());

	/* When fixed mode is active, override --back-link-height on :root so
	   sticky elements (TOC, scroll-margin) account for this fixed row.
	   Cleaned up on unmount so other pages are unaffected.
	   $effect only runs client-side, so document access is safe. */
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
	/* Fixed positioning container — mirrors Header centering */
	.back-link-fixed {
		position: fixed;
		top: var(--header-height, 0px);
		left: 0;
		right: 0;
		z-index: var(--z-sticky, 30);
		padding: var(--space-4, 0.75rem) var(--space-5, 1rem);
		pointer-events: none;
	}

	.back-link-fixed-inner {
		max-width: 64rem;
		margin: 0 auto;
	}

	.back-link {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		color: var(--text-secondary);
		font-size: 14px;
		text-decoration: none;
		transition: color var(--transition-normal);
		width: fit-content;
		pointer-events: auto;
	}

	.back-link:hover {
		color: var(--text-primary);
	}

	.back-arrow {
		transition: transform var(--transition-normal);
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
</style>
