<script lang="ts">
	/**
	 * The deck: one card per screen, with the spine permanently beneath it.
	 *
	 * Movement is a native horizontal scroller with scroll snapping, so a swipe
	 * is the browser's own gesture rather than a pointer-event reimplementation —
	 * it has momentum, it is interruptible, and it needs no pointer at all. On
	 * top of that: the spine, which is tappable, and arrow keys, Home and End on
	 * any spine entry. All three routes drive the same index, and the index is
	 * owned by the page so the count above stays in step.
	 *
	 * What changed from the approach this is built on: the tick rail and the
	 * previous/next buttons are gone. The spine below already names every runner
	 * and marks the current one, so a rail of four identical ticks was a second,
	 * poorer answer to a question the spine answers better, and a pair of arrows
	 * that can only step is strictly worse than four destinations one tap away.
	 * The spine is the deck's only visible control.
	 *
	 * The page itself does not scroll (see Page.svelte), which is how a
	 * horizontal pager and a vertical document are made to coexist: there is no
	 * vertical document.
	 */
	import type { RunningTask } from './tasks.ts';
	import RunnerSpine from './RunnerSpine.svelte';
	import TaskCard from './TaskCard.svelte';

	let {
		tasks,
		index,
		onSelect
	}: { tasks: RunningTask[]; index: number; onSelect: (next: number) => void } = $props();

	let track = $state<HTMLDivElement | null>(null);

	// A smooth scrollTo emits the same scroll events a swipe does, so without
	// this flag the listener reads the animation's own intermediate positions
	// back as reader intent, moves the index to one of them, and the effect
	// chases it. It clears when the animation arrives, with a timer as a
	// backstop for the case where it never does.
	let settling = false;
	let settleTimer: ReturnType<typeof setTimeout> | undefined;

	// The index is the source of truth; the scroller follows it.
	$effect(() => {
		const element = track;
		const target = index;
		if (!element) return;
		const left = element.clientWidth * target;
		if (Math.abs(element.scrollLeft - left) < 2) return;
		settling = true;
		clearTimeout(settleTimer);
		settleTimer = setTimeout(() => (settling = false), 800);
		element.scrollTo({ left, behavior: 'smooth' });
	});

	function syncFromScroll() {
		if (!track || track.clientWidth === 0) return;
		const settled = Math.round(track.scrollLeft / track.clientWidth);
		if (settling) {
			if (settled === index && Math.abs(track.scrollLeft - track.clientWidth * index) < 2) {
				settling = false;
				clearTimeout(settleTimer);
			}
			return;
		}
		if (settled !== index) onSelect(settled);
	}
</script>

<section class="deck" aria-roledescription="carousel" aria-label="Running tasks">
	<div class="track" bind:this={track} onscroll={syncFromScroll}>
		{#each tasks as task, position (task.id)}
			<!-- Off-screen slots are deliberately NOT aria-hidden. Four cards read
			     end to end is a better answer for a screen reader than one card
			     plus a gesture it cannot perform. -->
			<div class="slot">
				<TaskCard {task} position={position + 1} total={tasks.length} />
			</div>
		{/each}
	</div>

	<RunnerSpine {tasks} {index} {onSelect} />
</section>

<style>
	.deck {
		display: flex;
		flex-direction: column;
		min-height: 0;
		flex: 1;
		gap: var(--space-3);
	}

	.track {
		flex: 1;
		min-height: 0;
		display: flex;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x mandatory;
		/* A swipe that runs past the last card must not become a browser back
		   gesture or a rubber-band on the document behind it. */
		overscroll-behavior: contain;
		scrollbar-width: none;
	}

	.track::-webkit-scrollbar {
		display: none;
	}

	.slot {
		flex: 0 0 100%;
		min-width: 0;
		height: 100%;
		scroll-snap-align: center;
		scroll-snap-stop: always;
	}
</style>
