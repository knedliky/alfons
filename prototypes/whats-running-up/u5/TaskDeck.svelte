<script lang="ts">
	/**
	 * The card scale: one task per screen, and the three ways to move between them.
	 *
	 * A native horizontal scroller with snapping, a rail of controls, and arrow
	 * keys on any of them. All three drive the same index, and the index is owned
	 * by the page so the heading above stays in step. Carried over from the
	 * winning approach.
	 *
	 * Two things this approach had to change.
	 *
	 * 1. **The rail stops being ticks at five cards.** Measured in Chromium at
	 *    370px: the ticks share 218px between the two 48px arrow buttons, so four
	 *    are 49px wide each and five are 35px — under the touch minimum. Below the
	 *    limit the rail shows every card, because being able to see how many there
	 *    are is most of what a rail is for. At or above it, it shows a position
	 *    instead and the arrows do the moving. A deck of sixteen cards has no
	 *    useful rail at any design, and sixteen unhittable slivers would be worse
	 *    than saying so.
	 *
	 *    The number is worth sitting with: four is exactly the running set. The
	 *    rail survives the deck this page was built for and nothing else, which is
	 *    a fair summary of what admitting non-running tasks costs.
	 *
	 * 2. **The deck is remounted when the scope changes**, keyed by the page.
	 *    Refilling a snap container's children in place leaves `scrollLeft`
	 *    pointing at a card that no longer exists — measured: the track keeps its
	 *    old offset and the reader lands between two unrelated cards. Remounting
	 *    resets both the scroll offset and `positioned`, so the deck's first
	 *    positioning after a refill is a jump to the reader's own task rather than
	 *    a smooth scroll past everything between.
	 */
	import { Button, Icon } from '@alfons/design';
	import type { Task } from './tasks.ts';
	import type { Scope } from './scope.ts';
	import TaskCard from './TaskCard.svelte';

	let {
		tasks,
		index,
		scope,
		onSelect,
		onup,
		autofocus = false
	}: {
		tasks: Task[];
		index: number;
		scope: Scope;
		onSelect: (next: number) => void;
		onup: (next: Scope) => void;
		autofocus?: boolean;
	} = $props();

	// Above this many cards a tick is narrower than the touch minimum, measured on
	// a 370px viewport. See the note at the top.
	const TICK_LIMIT = 5;
	const showTicks = $derived(tasks.length > 1 && tasks.length < TICK_LIMIT);
	const showRail = $derived(tasks.length > 1);

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
		// Arriving fresh — first mount, or the first frame after a refill remounted
		// this deck. Jump, do not travel. See the note above.
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
	let nextButton = $state<HTMLElement | null>(null);

	// Only when the reader moved — changed scale, or refilled the deck. On first
	// load nothing steals the focus. After a refill this is what stops the focus
	// sitting on the segment that just became "you are here".
	$effect(() => {
		if (!autofocus) return;
		if (showTicks) ticks[index]?.focus();
		else nextButton?.querySelector('button')?.focus();
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
		// second arrow keeps working. Only meaningful while ticks are rendered;
		// with the counter the focus is already on an arrow button that stays put.
		if (showTicks) ticks[landed]?.focus();
	}
</script>

<section class="deck" aria-roledescription="carousel" aria-label="The deck, one task at a time">
	<div class="track" bind:this={track} onscroll={syncFromScroll}>
		{#each tasks as task, position (task.id)}
			<!-- Off-screen slots are deliberately NOT aria-hidden. A card can become a
			     scroll container when its title is long, which would make it focusable
			     inside a hidden subtree; and the cards read end to end are a better
			     answer for a screen reader than one card plus a gesture. -->
			<div class="slot">
				<TaskCard {task} {scope} {onup} position={position + 1} total={tasks.length} />
			</div>
		{/each}
	</div>

	{#if showRail}
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

			{#if showTicks}
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
			{:else}
				<!-- Too many cards for a rail that can be hit. The position is stated
				     instead; the live readout in the heading says the same thing to a
				     screen reader, so this is not the only place it exists. -->
				<p class="counter">{index + 1} / {tasks.length}</p>
			{/if}

			<div bind:this={nextButton} class="arrow">
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
		</div>
	{/if}
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

	/* Button's icon size is a fixed 3rem square. Four pixels back off a screen
	   that is exactly full, without going under the touch minimum. */
	.rail :global(button) {
		min-height: var(--filter-control-height);
		min-width: var(--filter-control-height);
		height: var(--filter-control-height);
		width: var(--filter-control-height);
	}

	.arrow {
		display: flex;
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
		height: var(--filter-control-height);
		padding: 0;
		background: transparent;
		border: none;
		cursor: pointer;
		display: flex;
		align-items: center;
	}

	/* The ticks stay neutral. Status colour on this page belongs to the eight
	   statuses, and a tick is a position rather than a state. */
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

	.counter {
		margin: 0;
		flex: 1;
		text-align: center;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}
</style>
