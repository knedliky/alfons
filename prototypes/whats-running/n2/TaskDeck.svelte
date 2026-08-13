<script lang="ts">
	/**
	 * The deck: one card per screen, and the three ways to move between them.
	 *
	 * Movement is a native horizontal scroller with scroll snapping, so a swipe
	 * is the browser's own gesture rather than a pointer-event reimplementation
	 * — it has momentum, it is interruptible, and it needs no pointer at all.
	 * On top of that: a visible rail of ticks plus previous/next buttons, and
	 * arrow keys, Home and End on any of those controls. All three routes drive
	 * the same index, and the index is owned by the page so the count above it
	 * stays in step.
	 *
	 * The page itself does not scroll (see Page.svelte), which is how a
	 * horizontal pager and a vertical document are made to coexist: there is no
	 * vertical document. The only other scroller is inside a card, and it only
	 * exists when a title is long enough to need it.
	 */
	import { Button, Icon } from '@alfons/design';
	import type { RunningTask } from './tasks.ts';
	import TaskCard from './TaskCard.svelte';

	let {
		tasks,
		index,
		onSelect
	}: { tasks: RunningTask[]; index: number; onSelect: (next: number) => void } = $props();

	let track = $state<HTMLDivElement | null>(null);

	function move(to: number) {
		const next = Math.min(Math.max(to, 0), tasks.length - 1);
		if (next === index) return;
		onSelect(next);
	}

	// A smooth scrollTo emits the same scroll events a swipe does, so without
	// this flag the listener reads the animation's own intermediate positions
	// back as reader intent, moves the index to one of them, and the effect
	// chases it. Pressing End then Home landed on card three before the flag
	// existed. It clears when the animation arrives, with a timer as a backstop
	// for the case where it never does.
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

	// Arrow keys live on the rail's own controls rather than on a focusable
	// scroll region. A tabindex on the deck would be a non-interactive element
	// claiming the tab order; the controls are already in it, and a keyboard
	// reader reaches them with one Tab.
	let ticks = $state<(HTMLButtonElement | null)[]>([]);

	function onKeydown(event: KeyboardEvent) {
		const jump =
			event.key === 'ArrowRight'
				? index + 1
				: event.key === 'ArrowLeft'
					? index - 1
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? tasks.length - 1
							: null;
		if (jump === null) return;
		event.preventDefault();
		const landed = Math.min(Math.max(jump, 0), tasks.length - 1);
		move(landed);
		// Roving focus: the arrow that moved the deck also moves the focus, so a
		// second arrow keeps working instead of stranding focus on a tick that is
		// no longer current.
		ticks[landed]?.focus();
	}
</script>

<section class="deck" aria-roledescription="carousel" aria-label="Running tasks">
	<div class="track" bind:this={track} onscroll={syncFromScroll}>
		{#each tasks as task, position (task.id)}
			<!-- Off-screen slots are deliberately NOT aria-hidden. A card can become
			     a scroll container when its title is long, which would make it
			     focusable inside a hidden subtree; and four cards read end to end
			     is a better answer for a screen reader than one card plus a
			     gesture it cannot perform. -->
			<div class="slot">
				<TaskCard {task} position={position + 1} total={tasks.length} />
			</div>
		{/each}
	</div>

	<div class="rail">
		<Button
			variant="secondary"
			size="icon"
			type="button"
			aria-label="Previous task"
			disabled={index === 0}
			onclick={() => move(index - 1)}
			onkeydown={onKeydown}
		>
			<Icon name="arrow-left" size="md" />
		</Button>

		<div class="ticks">
			{#each tasks as task, position (task.id)}
				<button
					type="button"
					class="tick"
					aria-label="Task {position + 1} of {tasks.length}, {task.id}"
					aria-current={position === index ? 'true' : undefined}
					tabindex={position === index ? 0 : -1}
					bind:this={ticks[position]}
					onclick={() => move(position)}
					onkeydown={onKeydown}
				>
					<span class="bar"></span>
				</button>
			{/each}
		</div>

		<Button
			variant="secondary"
			size="icon"
			type="button"
			aria-label="Next task"
			disabled={index === tasks.length - 1}
			onclick={() => move(index + 1)}
			onkeydown={onKeydown}
		>
			<Icon name="arrow-right" size="md" />
		</Button>
	</div>
</section>

<style>
	.deck {
		display: flex;
		flex-direction: column;
		min-height: 0;
		flex: 1;
		gap: var(--space-4);
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

	.rail {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: none;
	}

	.ticks {
		display: flex;
		flex: 1;
		gap: var(--space-2);
	}

	/* A bare button on purpose, and the one raw-element finding this page keeps.
	   A tick is a 48px hit area wrapped around a 4px bar: Button's icon size is
	   a fixed 3rem square and its padding and background are exactly what has to
	   be removed. Overriding all of it would be a Button in name only. */
	.tick {
		appearance: none;
		flex: 1;
		height: var(--space-7);
		padding: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
	}

	/* The ticks stay neutral. Status colour on this page means building or
	   verifying and nothing else, and a coloured position indicator would be
	   colour carrying meaning with no word beside it. */
	.bar {
		width: 100%;
		height: var(--space-1);
		background: var(--border-glass);
		transition: background var(--transition-normal);
	}

	.tick[aria-current='true'] .bar {
		background: var(--text-primary);
	}

	.tick:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}
</style>
