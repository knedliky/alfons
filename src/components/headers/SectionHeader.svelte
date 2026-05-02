<script lang="ts" module>
	export interface SectionHeaderProps {
		title: string;
		subtitle?: string;
		align?: 'left' | 'center' | 'right';
		spacing?: 'compact' | 'standard' | 'spacious';
		variant?: 'public' | 'admin';
		/** Optional accent colour for the decorative bar above the title */
		accentColour?: 'default' | 'depth';
	}
</script>

<script lang="ts">
	/**
	 * SectionHeader — section-level h2 with optional subtitle.
	 *
	 * Usage:
	 *   <SectionHeader
	 *     title="The AI Builders Field Guide"
	 *     subtitle="Practical wisdom for building intelligent systems."
	 *     align="center"
	 *     spacing="standard"
	 *   />
	 *
	 * Features:
	 * - Alignment variants: left, center, right
	 * - Spacing variants: compact, standard, spacious
	 * - Admin variant uses admin token namespace
	 * - Responsive spacing on mobile
	 */

	let {
		title,
		subtitle,
		align = 'center',
		spacing = 'standard',
		variant = 'public',
		accentColour
	}: SectionHeaderProps = $props();
</script>

<div
	class="section-header"
	class:align-left={align === 'left'}
	class:align-center={align === 'center'}
	class:align-right={align === 'right'}
	class:spacing-compact={spacing === 'compact'}
	class:spacing-standard={spacing === 'standard'}
	class:spacing-spacious={spacing === 'spacious'}
	class:variant-admin={variant === 'admin'}
>
	{#if accentColour}
		<div class="accent-bar" class:accent-depth={accentColour === 'depth'}></div>
	{/if}
	<h2 class="section-title">{title}</h2>
	{#if subtitle}
		<p class="section-subtitle">{subtitle}</p>
	{/if}
</div>

<style>
	.section-header {
		width: 100%;
	}

	/* Decorative accent bar above the title — gradient for visual warmth */
	.accent-bar {
		width: 3rem;
		height: 3px;
		margin-bottom: var(--space-3);
		background: var(--gradient-sunset);
		border-radius: 2px;
	}

	/* Aubergine-to-navy gradient for depth accent */
	.accent-depth {
		background: var(--gradient-depth);
	}

	/* Align accent bar with text alignment */
	.align-center .accent-bar {
		margin-left: auto;
		margin-right: auto;
	}

	.align-right .accent-bar {
		margin-left: auto;
		margin-right: 0;
	}

	/* Inherits global h2 typography from app.css */
	.section-title {
		color: var(--text-primary);
		margin: 0 0 var(--space-2) 0;
	}

	.section-subtitle {
		max-width: var(--section-header-max-width);
		font-size: 1.25rem;
		line-height: 1.625;
		color: var(--text-secondary);
	}

	@media (min-width: 768px) {
		.section-subtitle {
			font-size: 1.25rem;
		}
	}

	.align-left {
		text-align: left;
	}

	.align-left p {
		margin-left: 0;
		margin-right: auto;
	}

	.align-center {
		text-align: center;
	}

	.align-center p {
		margin-left: auto;
		margin-right: auto;
	}

	.align-right {
		text-align: right;
	}

	.align-right p {
		margin-left: auto;
		margin-right: 0;
	}

	.spacing-compact {
		margin-bottom: var(--space-5);
	}

	.spacing-standard {
		margin-bottom: var(--space-8);
	}

	.spacing-spacious {
		margin-bottom: var(--space-10);
	}

	/* Admin variant uses admin token namespace */
	.variant-admin .section-title {
		color: var(--admin-text);
		margin-bottom: var(--space-2);
	}

	.variant-admin .section-subtitle {
		color: var(--admin-text-secondary);
	}

	@media (max-width: 767px) {
		.spacing-compact {
			margin-bottom: var(--space-4);
		}

		.spacing-standard {
			margin-bottom: var(--space-6);
		}

		.spacing-spacious {
			margin-bottom: var(--space-8);
		}
	}
</style>
