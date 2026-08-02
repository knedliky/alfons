<script lang="ts">
	/**
	 * LongreadFigure — an evidence panel on the Motif elevation ladder.
	 *
	 * Rests at L1 (frosted fill, lit top/left edges, cast shadow), lifts to
	 * L2 on hover, and rises into view once on first intersection. The rise
	 * is armed only after hydration, so SSR output and no-JS readers see the
	 * figure fully visible. Caption is mono microtype — the one place grey
	 * text belongs. Self-contained: works in any page, not only inside a
	 * LongreadArticle.
	 */
	import type { Snippet } from 'svelte';

	interface Props {
		caption?: string;
		children: Snippet;
	}

	let { caption, children }: Props = $props();

	let root = $state<HTMLElement>();
	let armed = $state(false);
	let revealed = $state(false);

	$effect(() => {
		if (!root) return;
		armed = true;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) revealed = true;
			},
			{ threshold: 0.25 }
		);
		observer.observe(root);
		return () => observer.disconnect();
	});
</script>

<figure bind:this={root} class="longread-figure" class:armed class:revealed>
	<div class="figure-body">
		{@render children()}
	</div>
	{#if caption}
		<figcaption>{caption}</figcaption>
	{/if}
</figure>

<style>
	.longread-figure {
		margin: var(--space-6) 0;
		border-radius: var(--radius-surface);
		padding: var(--space-5);
		background: var(--elevation-1-bg);
		border-top: 1px solid var(--el-edge-light);
		border-left: 1px solid var(--el-edge-light);
		border-bottom: 1px solid var(--el-edge-shade);
		border-right: 1px solid var(--el-edge-shade);
		box-shadow: var(--elevation-1);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		transition:
			opacity var(--duration-slow) ease,
			transform var(--duration-slow) var(--ease-spring),
			box-shadow var(--transition-fast),
			background var(--transition-fast);
	}

	.longread-figure:hover {
		background: var(--elevation-2-bg);
		box-shadow: var(--elevation-2);
	}

	/* The rise reveal only exists once JS has armed it — SSR stays visible. */
	.longread-figure.armed:not(.revealed) {
		opacity: 0;
		transform: translateY(16px);
	}

	@media (prefers-reduced-motion: reduce) {
		.longread-figure.armed:not(.revealed) {
			opacity: 1;
			transform: none;
		}
	}

	figcaption {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}
</style>
