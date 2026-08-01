<script lang="ts">
	/**
	 * LongreadSection — one passage of a LongreadArticle.
	 *
	 * Renders a centred serif title and a measured prose column. The section
	 * dims to background opacity until it takes scroll focus. Running text is
	 * --text-primary — supporting greys are reserved for captions and labels,
	 * never body copy. Registration is browser-only ($effect), so SSR output
	 * and no-JS readers always get the fully visible state; used outside a
	 * LongreadArticle the section simply never dims.
	 */
	import type { Snippet } from 'svelte';
	import { getLongreadContext } from './context';

	interface Props {
		title: string;
		/** Optional stable anchor id (deep-link contracts live on the section). */
		id?: string;
		children: Snippet;
	}

	let { title, id, children }: Props = $props();

	const context = getLongreadContext();
	let root = $state<HTMLElement>();
	let index = $state(-1);

	$effect(() => {
		if (context && root && index === -1) {
			index = context.register(root);
		}
	});

	// Until registered (SSR, no-JS, or standalone use) the section is fully
	// visible.
	const isActive = $derived(!context || index < 0 || context.isActive(index));
</script>

<section {id} bind:this={root} class="longread-section" class:in-view={isActive}>
	<h2 class="section-title">{title}</h2>

	<div class="section-passage">
		{@render children()}
	</div>
</section>

<style>
	.longread-section {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		scroll-margin-top: var(--scroll-margin-top);
		/* Out-of-focus sections recede; 0.45 settled in prototype round 3. */
		opacity: 0.45;
		transition: opacity var(--duration-slow) ease;
	}

	.longread-section.in-view {
		opacity: 1;
	}

	@media (prefers-reduced-motion: reduce) {
		.longread-section {
			opacity: 1;
		}
	}

	.section-title {
		font-family: var(--font-display);
		font-size: 1.875rem;
		color: var(--text-primary);
		text-align: center;
		/* The retired divider carried the space between sections; its vertical
		   rhythm now lives on the title so passages keep their breathing room. */
		margin: var(--space-7) 0 var(--space-5);
	}

	.section-passage {
		max-width: 42rem;
		width: 100%;
	}

	/* Template-wide prose: reading serif (IBM Plex Serif via --font-display),
	   primary text, comfortable measure and leading. Longreads read as an
	   editorial serif column; pages style their own specialised blocks
	   (asides, tables, lists). */
	.section-passage :global(p) {
		font-family: var(--font-display);
		font-size: var(--text-body);
		/* Serif reads tighter than sans at the same leading; 1.85 gives the
		   editorial column room to breathe. */
		line-height: 1.85;
		color: var(--text-primary);
		margin: 0 0 var(--space-5);
	}

	.section-passage :global(strong) {
		color: var(--text-primary);
		font-weight: 600;
	}
</style>
