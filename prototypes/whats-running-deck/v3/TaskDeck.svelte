<script lang="ts">
	/**
	 * The deck, with the neighbours allowed in at both edges.
	 *
	 * Everything about movement is inherited from the winning approach: a native
	 * horizontal scroller with snapping, so the swipe is the browser's own
	 * gesture, plus a visible rail of ticks with previous/next, plus arrow keys,
	 * Home and End. All three drive one index owned by the page.
	 *
	 * What is new is the geometry. The track carries an inline padding of one
	 * peek and a matching scroll-padding, and each slot is one peek narrower on
	 * each side than the track. A card therefore snaps to `start` and lands
	 * exactly one peek in from the left, which leaves exactly one peek of the
	 * previous card showing on the left and one peek of the next on the right.
	 * Snapping to `center` was the obvious spelling and is the wrong one here:
	 * centre-snapping with an asymmetric first and last card leaves the ends
	 * unreachable, whereas start-snapping with symmetric scroll-padding puts the
	 * scroll extent exactly at index × slot width at both ends, which is also
	 * what makes the index arithmetic below exact rather than approximate.
	 *
	 * There is no gap between the slots. A gap is subtracted from the left peek
	 * and added to the right one, so eight pixels of gutter made a symmetric
	 * design 36px on one side and 52px on the other. The separation between cards
	 * is carried by the peek rail's own border instead, which costs no width.
	 *
	 * How much peek: one --space-7, 48px, at every viewport width. Two decisions
	 * are inside that number. It is fixed rather than proportional because on a
	 * 1280px screen a proportional peek becomes two nearly whole cards flanking
	 * the one being read, which is a three-card layout wearing a deck's clothes;
	 * the affordance should look the same everywhere it appears. And 48px is the
	 * smallest width that is both a legal touch target and wide enough for a
	 * rotated `AL-014` in mono — below that the peek is a hint that something
	 * exists, at that width it says which thing.
	 */
	import { Button, Icon } from '@alfons/design';
	import type { RunningTask } from './tasks.ts';
	import PeekEdge from './PeekEdge.svelte';
	import TaskCard from './TaskCard.svelte';

	let {
		tasks,
		index,
		onSelect
	}: { tasks: RunningTask[]; index: number; onSelect: (next: number) => void } = $props();

	// With one runner there is no neighbour, so there is no peek: two empty
	// gutters flanking a lone card would read as a layout that failed rather than
	// as an end. The card takes the whole width, which is the winning approach
	// unchanged, and the rail goes with it — a pager over a deck of one is
	// furniture pretending to be a control.
	const single = $derived(tasks.length === 1);

	let track = $state<HTMLDivElement | null>(null);
	let slots = $state<(HTMLDivElement | null)[]>([]);

	/** The scroll step. Measured, because the peek makes it narrower than the track. */
	function slotWidth(): number {
		const first = slots[0];
		if (first) return first.getBoundingClientRect().width;
		return track?.clientWidth ?? 0;
	}

	function move(to: number) {
		const next = Math.min(Math.max(to, 0), tasks.length - 1);
		if (next === index) return;
		onSelect(next);
	}

	// A smooth scrollTo emits the same scroll events a swipe does, so without this
	// flag the listener reads the animation's own intermediate positions back as
	// reader intent and the effect chases them. It clears when the animation
	// arrives, with a timer as a backstop for the case where it never does.
	let settling = false;
	let settleTimer: ReturnType<typeof setTimeout> | undefined;

	// The index is the source of truth; the scroller follows it.
	$effect(() => {
		const element = track;
		const target = index;
		if (!element) return;
		const step = slotWidth();
		if (step === 0) return;
		const left = step * target;
		if (Math.abs(element.scrollLeft - left) < 2) return;
		settling = true;
		clearTimeout(settleTimer);
		settleTimer = setTimeout(() => (settling = false), 800);
		element.scrollTo({ left, behavior: 'smooth' });
	});

	function syncFromScroll() {
		if (!track) return;
		const step = slotWidth();
		if (step === 0) return;
		const settled = Math.round(track.scrollLeft / step);
		if (settling) {
			if (settled === index && Math.abs(track.scrollLeft - step * index) < 2) {
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
		// Roving focus: the arrow that moved the deck moves the focus with it, so a
		// second arrow keeps working instead of stranding focus on a stale tick.
		ticks[landed]?.focus();
	}
</script>

<section
	class="deck"
	data-single={single ? 'true' : undefined}
	aria-roledescription="carousel"
	aria-label="Running tasks"
>
	<div class="track" bind:this={track} onscroll={syncFromScroll}>
		{#each tasks as task, position (task.id)}
			<!-- Off-screen slots are deliberately NOT aria-hidden. Four cards read end
			     to end is a better answer for a screen reader than one card plus a
			     gesture it cannot perform, and the peek rails add a labelled way to
			     move without taking a tab stop from the pager below. -->
			<div
				class="slot"
				data-current={position === index ? 'true' : undefined}
				bind:this={slots[position]}
			>
				<TaskCard {task} position={position + 1} total={tasks.length} />
				{#if !single}
					<PeekEdge
						{task}
						position={position + 1}
						total={tasks.length}
						side="leading"
						onselect={() => move(position)}
					/>
					<PeekEdge
						{task}
						position={position + 1}
						total={tasks.length}
						side="trailing"
						onselect={() => move(position)}
					/>
				{/if}
			</div>
		{/each}
	</div>

	{#if !single}
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
		/* The single measurement this approach turns on. See the header comment. */
		--peek: var(--space-7);

		display: flex;
		flex-direction: column;
		min-height: 0;
		flex: 1;
		gap: var(--space-4);
	}

	.deck[data-single='true'] {
		--peek: 0px;
	}

	.track {
		flex: 1;
		min-height: 0;
		display: flex;
		overflow-x: auto;
		overflow-y: hidden;
		/* The peek is made of these three lines and nothing else: a gutter the
		   width of one peek at each end, a snap port inset by the same amount, and
		   slots narrowed to match. */
		padding-inline: var(--peek);
		scroll-padding-inline: var(--peek);
		scroll-snap-type: x mandatory;
		/* A swipe past the last card must not become a browser back gesture or a
		   rubber-band on the document behind it. */
		overscroll-behavior: contain;
		scrollbar-width: none;
	}

	.track::-webkit-scrollbar {
		display: none;
	}

	.slot {
		position: relative;
		/* 100%, not `100% - 2 × peek`: a percentage flex-basis resolves against the
		   track's CONTENT box, which the padding-inline above has already narrowed
		   by exactly two peeks. Subtracting again took the card from 274px to
		   178px and put the peek rails a third of the way across the screen. */
		flex: 0 0 100%;
		min-width: 0;
		height: 100%;
		scroll-snap-align: start;
		scroll-snap-stop: always;
	}

	/* The card being read hides its own rails, so the reader sees the card and not
	   a frame around it. They fade rather than vanish, which is what makes a swipe
	   feel like a card resolving out of a sliver. */
	.slot[data-current='true'] :global(.peek) {
		opacity: 0;
		visibility: hidden;
	}

	.rail {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex: none;
		padding-inline: var(--space-4);
	}

	.ticks {
		display: flex;
		flex: 1;
		gap: var(--space-2);
	}

	/* A bare button on purpose, and one of two raw elements this page keeps. A
	   tick is a 48px hit area wrapped around a 4px bar: Button's icon size is a
	   fixed 3rem square and its padding and background are exactly what has to be
	   removed. Overriding all of it would be a Button in name only. */
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

	/* The ticks stay neutral. Status colour means building or verifying and
	   nothing else, and it is already spent on the peek rails. */
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
