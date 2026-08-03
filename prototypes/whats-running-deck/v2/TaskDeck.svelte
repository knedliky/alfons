<script lang="ts">
	/**
	 * The deck, with the contents card at the head of it.
	 *
	 * Card 0 is the contents; cards 1..n are the tasks. That numbering is the
	 * whole approach in one line — the overview is not a second register beside
	 * the deck, it is the deck's first card, and it moves by exactly the same
	 * three routes as everything else: swipe, visible control, keyboard.
	 *
	 * Movement is a native horizontal scroller with scroll snapping, so a swipe
	 * is the browser's own gesture rather than a pointer-event reimplementation.
	 * The index is owned by the page, so the count and the readout above stay in
	 * step with it.
	 *
	 * The rail carries a contents button where the previous arrow used to sit.
	 * That is a deliberate swap, not an omission. On a deck whose first card is
	 * the overview, the destination behind you that matters is almost never the
	 * card immediately behind you — it is the contents, and from card four the
	 * previous arrow costs three presses to reach it while this costs one. Every
	 * tick is directly tappable, so a single step backwards is still one tap; and
	 * ArrowLeft, Home and the swipe all still walk the deck the other way.
	 */
	import { Button, Icon } from '@alfons/design';
	import ContentsCard from './ContentsCard.svelte';
	import TaskCard from './TaskCard.svelte';
	import type { RunningTask } from './tasks.ts';

	let {
		tasks,
		index,
		checkedAt,
		onSelect
	}: {
		tasks: RunningTask[];
		index: number;
		checkedAt: Date;
		onSelect: (next: number) => void;
	} = $props();

	// One more card than there are tasks, always. With zero tasks the deck is the
	// contents card alone, which is how it never empties.
	const lastIndex = $derived(tasks.length);

	let track = $state<HTMLDivElement | null>(null);

	function move(to: number) {
		const next = Math.min(Math.max(to, 0), lastIndex);
		if (next === index) return;
		onSelect(next);
	}

	// A smooth scrollTo emits the same scroll events a swipe does, so without
	// this flag the listener reads the animation's own intermediate positions
	// back as reader intent and chases them. Every route except the swipe is a
	// programmatic scroll — including a tap on a contents row, which is the
	// longest animation on the page and so the one most exposed to it.
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

	// Roving focus across the rail's controls. Slot 0 is the contents button and
	// slots 1..n are the ticks, so the array is indexed exactly like the deck.
	let controls = $state<(HTMLButtonElement | null)[]>([]);

	function onKeydown(event: KeyboardEvent) {
		const jump =
			event.key === 'ArrowRight'
				? index + 1
				: event.key === 'ArrowLeft'
					? index - 1
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? lastIndex
							: null;
		if (jump === null) return;
		event.preventDefault();
		const landed = Math.min(Math.max(jump, 0), lastIndex);
		move(landed);
		// The arrow that moved the deck moves the focus with it, so a second
		// arrow keeps working instead of stranding focus on a control that is no
		// longer current.
		controls[landed]?.focus();
	}
</script>

<section class="deck" aria-roledescription="carousel" aria-label="Running tasks">
	<div class="track" bind:this={track} onscroll={syncFromScroll}>
		<!-- Off-screen slots are deliberately NOT aria-hidden. The contents card is
		     full of controls, and hiding them behind a gesture a screen reader
		     cannot perform would make the deck's only shortcut unreachable. -->
		<div class="slot">
			<ContentsCard {tasks} {checkedAt} onOpen={(position) => move(position)} />
		</div>
		{#each tasks as task, position (task.id)}
			<div class="slot">
				<TaskCard {task} position={position + 1} total={tasks.length} />
			</div>
		{/each}
	</div>

	{#if tasks.length > 0}
		<div class="rail">
			<!-- The way back, from anywhere, in one press. Also a bare button: it has
			     to sit at the same 48px height as the ticks and carry the same
			     current-state bar, which Button's icon size and background would
			     both fight. -->
			<button
				type="button"
				class="contents"
				aria-label="Contents"
				aria-current={index === 0 ? 'true' : undefined}
				tabindex={index === 0 ? 0 : -1}
				bind:this={controls[0]}
				onclick={() => move(0)}
				onkeydown={onKeydown}
			>
				<Icon name="menu" size="md" />
			</button>

			<div class="ticks">
				{#each tasks as task, position (task.id)}
					<button
						type="button"
						class="tick"
						aria-label="Task {position + 1} of {tasks.length}, {task.id}"
						aria-current={position + 1 === index ? 'true' : undefined}
						tabindex={position + 1 === index ? 0 : -1}
						bind:this={controls[position + 1]}
						onclick={() => move(position + 1)}
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
				disabled={index === lastIndex}
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

	.contents {
		appearance: none;
		flex: none;
		width: var(--space-7);
		height: var(--space-7);
		padding: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--text-muted);
		transition: color var(--transition-normal);
	}

	.contents[aria-current='true'] {
		color: var(--text-primary);
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

	.contents:focus-visible,
	.tick:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}
</style>
