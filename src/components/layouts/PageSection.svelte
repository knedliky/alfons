<script lang="ts" module>
	import type { Snippet } from 'svelte';

	type SectionVariant = 'standard' | 'hero' | 'cta';

	export interface PageSectionProps {
		variant?: SectionVariant;
		maxWidth?: string;
		class?: string;
		children?: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * PageSection — full-width section with consistent horizontal padding and variant spacing.
	 *
	 * Usage:
	 *   <PageSection variant="hero">
	 *     <HeroContent />
	 *   </PageSection>
	 *
	 * Features:
	 * - Three spacing variants: standard (equal padding), hero (1.5x with min-height), cta (reduced bottom)
	 * - Centres content via max-width container with margin auto
	 * - Responsive padding via mobile-specific tokens
	 * - No visual styling — layout only
	 */

	let {
		variant = 'standard',
		maxWidth,
		class: additionalClasses = '',
		children
	}: PageSectionProps = $props();

	const variantClass = $derived(
		variant === 'hero'
			? 'page-section-hero'
			: variant === 'cta'
				? 'page-section-cta'
				: 'page-section-standard'
	);
</script>

<section class="page-section {variantClass} {additionalClasses}">
	<div class="page-section-content" style={maxWidth ? `max-width: ${maxWidth}` : undefined}>
		{#if children}
			{@render children()}
		{/if}
	</div>
</section>

<style>
	.page-section {
		width: 100%;
		padding-left: var(--page-padding-x);
		padding-right: var(--page-padding-x);
	}

	/* Centres content within the section */
	.page-section-content {
		margin-left: auto;
		margin-right: auto;
		max-width: var(--page-content-max-width);
		width: 100%;
	}

	.page-section-standard {
		padding-top: var(--page-top-padding);
		padding-bottom: var(--page-top-padding);
	}

	/* Taller vertical padding with vertical centering for prominent sections */
	.page-section-hero {
		padding-top: calc(var(--page-top-padding) * 1.5);
		padding-bottom: calc(var(--page-top-padding) * 1.5);
		display: flex;
		align-items: center;
		min-height: 60vh;
	}

	/* Reduced bottom padding creates visual flow into the next section */
	.page-section-cta {
		padding-top: var(--page-top-padding);
		padding-bottom: calc(var(--page-top-padding) * 0.5);
	}

	/* Light mode: subtle top highlight for section surface separation */
	:global([data-colour-mode='light']) .page-section {
		border-top: 1px solid var(--section-border-top-light);
	}

	/* First section should not have a top border */
	:global([data-colour-mode='light']) .page-section:first-child {
		border-top: none;
	}

	@media (max-width: 768px) {
		.page-section {
			padding-left: var(--page-padding-x-mobile);
			padding-right: var(--page-padding-x-mobile);
		}

		.page-section-standard {
			padding-top: var(--page-top-padding-mobile);
			padding-bottom: var(--page-top-padding-mobile);
		}

		.page-section-hero {
			padding-top: calc(var(--page-top-padding-mobile) * 1.5);
			padding-bottom: calc(var(--page-top-padding-mobile) * 1.5);
			min-height: 50vh;
		}

		.page-section-cta {
			padding-top: var(--page-top-padding-mobile);
			padding-bottom: calc(var(--page-top-padding-mobile) * 0.5);
		}
	}
</style>
