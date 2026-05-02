<script lang="ts" module>
	export interface SkeletonCardGridProps {
		count?: number;
	}
</script>

<script lang="ts">
	/**
	 * SkeletonCardGrid
	 * Usage: `<SkeletonCardGrid count={6} />`
	 * Features: Responsive grid of skeleton cards matching blog/lab page layouts
	 */

	import SkeletonCard from './SkeletonCard.svelte';

	let { count = 6 }: SkeletonCardGridProps = $props();
</script>

<div class="skeleton-grid">
	{#each Array.from({ length: count }, (_, i) => i) as index (index)}
		<SkeletonCard />
	{/each}
</div>

<style>
	/* Single column mobile, two columns desktop */
	.skeleton-grid {
		display: grid;
		gap: var(--space-5);
	}

	@media (min-width: 768px) {
		.skeleton-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style>
