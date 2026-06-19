<script lang="ts" module>
	export interface SkeletonProps {
		/** Shape variant — rectangle (default), circle, or multi-line text placeholder */
		variant?: 'rectangle' | 'circle' | 'text';
		/** CSS width for rectangle variant (e.g. '100%', '200px') */
		width?: string;
		/** CSS height for rectangle variant (e.g. '1rem', '40px') */
		height?: string;
		/** CSS dimension for circle variant — sets both width and height */
		size?: string;
		/** Number of text lines to render for the text variant */
		lines?: number;
		/** Theme context — admin uses --admin-* tokens, public uses --card-* tokens */
		theme?: 'admin' | 'public';
		/** Additional CSS classes */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Skeleton — token-driven loading placeholder with shimmer animation.
	 *
	 * Usage:
	 *   <Skeleton />
	 *   <Skeleton variant="circle" size="48px" />
	 *   <Skeleton variant="text" lines={3} />
	 *   <Skeleton width="200px" height="1.5rem" theme="admin" />
	 *
	 * Features:
	 * - Three variants: rectangle (block), circle, and multi-line text
	 * - Shimmer animation using design token durations
	 * - Supports admin and public theme contexts
	 * - Accessible: aria-hidden with screen-reader-only loading text
	 */

	let {
		variant = 'rectangle',
		width = '100%',
		height = '1rem',
		size = '48px',
		lines = 3,
		theme = 'public',
		class: className = ''
	}: SkeletonProps = $props();

	/**
	 * Generate width for each text line following a repeating pattern:
	 * 100%, 100%, 75% — gives a natural paragraph appearance.
	 */
	function getLineWidth(index: number): string {
		const pattern = [100, 100, 75];
		return `${pattern[index % pattern.length]}%`;
	}
</script>

<div class="skeleton-wrapper {className}" role="status" data-theme={theme}>
	<span class="sr-only">Loading...</span>

	{#if variant === 'text'}
		<div class="skeleton-text-group" aria-hidden="true">
			{#each Array(lines) as _, index (index)}
				<div class="skeleton-bone skeleton-text-line" style:width={getLineWidth(index)}></div>
			{/each}
		</div>
	{:else if variant === 'circle'}
		<div
			class="skeleton-bone skeleton-circle"
			style:width={size}
			style:height={size}
			aria-hidden="true"
		></div>
	{:else}
		<div class="skeleton-bone skeleton-rectangle" style:width style:height aria-hidden="true"></div>
	{/if}
</div>

<style>
	/* Shimmer keyframe — self-contained so the component works without global animation definitions */
	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	/* Screen-reader-only text — visible to assistive tech, hidden visually */
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.skeleton-wrapper {
		display: block;
	}

	/* Base shimmer bone — shared by all variants */
	.skeleton-bone {
		background: linear-gradient(
			90deg,
			var(--card-bg) 0%,
			rgba(255, 255, 255, 0.06) 50%,
			var(--card-bg) 100%
		);
		background-size: 400% 100%;
		animation: shimmer var(--duration-slow) infinite linear;
	}

	/* Light mode: brighter highlight pass for contrast against warm surfaces */
	:global([data-colour-mode='light']) .skeleton-bone {
		background: linear-gradient(
			90deg,
			var(--card-bg) 0%,
			rgba(255, 255, 255, 0.5) 50%,
			var(--card-bg) 100%
		);
		background-size: 400% 100%;
	}

	/* Admin theme — uses admin surface tokens instead of public card tokens */
	.skeleton-wrapper[data-theme='admin'] .skeleton-bone {
		background: linear-gradient(
			90deg,
			var(--admin-bg) 0%,
			rgba(255, 255, 255, 0.06) 50%,
			var(--admin-bg) 100%
		);
		background-size: 400% 100%;
	}

	/* Rectangle variant */
	.skeleton-rectangle {
		display: block;
		border-radius: var(--radius);
	}

	/* Circle variant */
	.skeleton-circle {
		display: block;
		border-radius: var(--radius-pill);
	}

	/* Text variant — stacked lines with spacing */
	.skeleton-text-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.skeleton-text-line {
		display: block;
		height: var(--text-body);
		border-radius: var(--radius);
	}

	/* Pause animation when user prefers reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.skeleton-bone {
			animation: none;
		}
	}
</style>
