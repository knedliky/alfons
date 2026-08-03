<script lang="ts">
	/**
	 * The card scale: one task per screen, and the three ways to move between them.
	 *
	 * Carried over from the winning approach and kept intact — a native horizontal
	 * scroller with snapping, a visible rail of ticks with previous/next buttons,
	 * and arrow keys on any of those controls. All three drive the same index, and
	 * the index is owned by the page so the count above stays in step.
	 *
	 * Two things this approach adds, both about surviving a scale change.
	 *
	 * 1. The first positioning is instant, not smooth. This deck is mounted fresh
	 *    every time the reader zooms back in, and the index it must land on is
	 *    whatever cell they came from. A smooth scroll would replay the whole deck
	 *    from card one to card three in front of them, which reads as the page
	 *    losing their place and then finding it again.
	 * 2. It can take the focus on arrival. Coming back from the grid by keyboard,
	 *    focus belongs on the pager for the card now on screen, not on the top of
	 *    the document.
	 */
	import { Button, Icon } from '@alfons/design';
	import type { RunningTask } from './tasks.ts';
	import TaskCard from './TaskCard.svelte';

	let {
		tasks,
		index,
		onSelect,
		onOpenRelease,
		onOpenProject,
		autofocus = false
	}: {
		tasks: RunningTask[];
		index: number;
		onSelect: (next: number) => void;
		onOpenRelease: (task: RunningTask, opener: HTMLElement) => void;
		onOpenProject: (task: RunningTask, opener: HTMLElement) => void;
		autofocus?: boolean;
	} = $props();

	let track = $state<HTMLDivElement | null>(null);

	function move(to: number) {
		const next = Math.min(Math.max(to, 0), tasks.length - 1);
		if (next === index) return;
		onSelect(next);
	}

	// A smooth scrollTo emits the same scroll events a swipe does, so without this
	// flag the listener reads the animation's own intermediate positions back as
	// reader intent, moves the index to one of them, and the effect chases it.
	// It clears when the animation arrives, with a timer as a backstop.
	let settling = false;
	let settleTimer: ReturnType<typeof setTimeout> | undefined;
	let positioned = false;

	// The index is the source of truth; the scroller follows it.
	$effect(() => {
		const element = track;
		const target = index;
		if (!element) return;
		const left = element.clientWidth * target;
		if (Math.abs(element.scrollLeft - left) < 2) {
			positioned = true;
			return;
		}
		// Arriving from the grid: jump, do not travel. See the note above.
		if (!positioned) {
			positioned = true;
			element.scrollTo({ left, behavior: 'auto' });
			return;
		}
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

	// Arrow keys live on the rail's own controls rather than on a focusable scroll
	// region. A tabindex on the deck would be a non-interactive element claiming
	// the tab order; the controls are already in it.
	let ticks = $state<(HTMLButtonElement | null)[]>([]);

	// Only when the reader changed scale. On first load nothing steals the focus.
	$effect(() => {
		if (autofocus) ticks[index]?.focus();
	});

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
		// second arrow keeps working.
		ticks[landed]?.focus();
	}
</script>

<section class="deck" aria-roledescription="carousel" aria-label="Running tasks, one at a time">
	<div class="track" bind:this={track} onscroll={syncFromScroll}>
		{#each tasks as task, position (task.id)}
			<!-- Off-screen slots are now inert, and that is a change the second level
			     forced. The approach this builds on left them exposed on purpose:
			     the cards held no controls, so four cards read end to end was a
			     better answer for a screen reader than one card plus a gesture.
			     Every card now holds two destination buttons, and eight off-screen
			     buttons in the tab order means a reader tabbing off card one lands
			     on card three's release. Inert is what removes them from both the
			     tab order and the accessibility tree; the cost is that the deck is
			     now one card at a time for assistive technology too. Recorded as a
			     deviation, because it is the relaxation billing the deck. -->
			<div class="slot" inert={position !== index}>
				<TaskCard
					{task}
					position={position + 1}
					total={tasks.length}
					onOpenRelease={(opener) => onOpenRelease(task, opener)}
					onOpenProject={(opener) => onOpenProject(task, opener)}
				/>
			</div>
		{/each}
	</div>

	{#if tasks.length > 1}
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
	{/if}
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
		/* A swipe past the last card must not become a browser back gesture. */
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

	/* A bare button on purpose. A tick is a 48px hit area wrapped around a 4px
	   bar: Button's icon size is a fixed 3rem square and its padding and
	   background are exactly what has to be removed. */
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
	   verifying and nothing else. */
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
