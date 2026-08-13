<script lang="ts">
	/**
	 * The horizontal axis at a level above the tasks: a snap track of sibling
	 * panels with the same rail of ticks and arrows the deck has.
	 *
	 * This component is the grammar made literal. The deck's settled swipe
	 * between running tasks and the walk between releases or projects are the
	 * same mechanics — snap track, tick rail, arrow keys, index owned by the
	 * page — rebuilt here for panels whose CONTENT scrolls vertically, which a
	 * task card is forbidden to do. That one difference is why this is not the
	 * deck with different props: the deck's slots clip in both axes to protect
	 * the swipe, and a release is a list of a length the corpus decides, so its
	 * slot must scroll. The vertical scroll cannot eat the horizontal snap
	 * (browsers axis-lock a touch), and it is also why the vertical AXIS is
	 * buttons rather than a swipe: a vertical gesture over a panel that
	 * scrolls vertically would be two meanings on one motion.
	 *
	 * Scroll positions survive a level change because the page never unmounts a
	 * level — the pane slides off-screen with its track laid out, the same trick
	 * the winning approach used to keep the deck's place under a pushed screen.
	 */
	import { Button, Icon } from '@alfons/design';
	import type { Snippet } from 'svelte';

	let {
		items,
		index,
		kind,
		onSelect,
		panel,
		autofocus = false
	}: {
		/** One entry per sibling: a stable key and the word a tick announces. */
		items: { key: string; label: string }[];
		index: number;
		/** Names the axis for assistive technology: 'release' or 'project'. */
		kind: string;
		onSelect: (next: number) => void;
		panel: Snippet<[number, boolean]>;
		autofocus?: boolean;
	} = $props();

	let track = $state<HTMLDivElement | null>(null);

	function move(to: number) {
		const next = Math.min(Math.max(to, 0), items.length - 1);
		if (next === index) return;
		onSelect(next);
	}

	// Identical settling dance to the deck's, for the identical reason: a smooth
	// scrollTo emits the same events a swipe does, and without the flag the
	// listener reads the animation's intermediate positions back as intent.
	let settling = false;
	let settleTimer: ReturnType<typeof setTimeout> | undefined;
	let positioned = false;

	$effect(() => {
		const element = track;
		const target = index;
		if (!element) return;
		const left = element.clientWidth * target;
		if (Math.abs(element.scrollLeft - left) < 2) {
			positioned = true;
			return;
		}
		// First positioning is instant: arriving at a level anchored three
		// siblings in must not replay the siblings between.
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

	let ticks = $state<(HTMLButtonElement | null)[]>([]);

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
							? items.length - 1
							: null;
		if (jump === null) return;
		event.preventDefault();
		const landed = Math.min(Math.max(jump, 0), items.length - 1);
		move(landed);
		ticks[landed]?.focus();
	}
</script>

<section class="walker" aria-roledescription="carousel" aria-label="Every {kind}, one at a time">
	<div class="track" bind:this={track} onscroll={syncFromScroll}>
		{#each items as item, position (item.key)}
			<!-- Inert off-screen, unlike the deck's slots: a panel is full of
			     controls and vertically scrollable text, so seven off-screen
			     panels in the tab order would strand a keyboard reader. The deck
			     earns exposure by holding no controls; these do not. -->
			<div class="slot" inert={position !== index}>
				{@render panel(position, position === index)}
			</div>
		{/each}
	</div>

	<div class="rail">
		<Button
			variant="secondary"
			size="icon"
			type="button"
			aria-label="Previous {kind}"
			disabled={index === 0}
			onclick={() => move(index - 1)}
			onkeydown={onKeydown}
		>
			<Icon name="arrow-left" size="md" />
		</Button>

		<div class="ticks">
			{#each items as item, position (item.key)}
				<button
					type="button"
					class="tick"
					aria-label="{kind} {position + 1} of {items.length}, {item.label}"
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
			aria-label="Next {kind}"
			disabled={index === items.length - 1}
			onclick={() => move(index + 1)}
			onkeydown={onKeydown}
		>
			<Icon name="arrow-right" size="md" />
		</Button>
	</div>
</section>

<style>
	.walker {
		display: flex;
		flex-direction: column;
		min-height: 0;
		height: 100%;
		gap: var(--space-4);
	}

	.track {
		flex: 1;
		min-height: 0;
		display: flex;
		overflow-x: auto;
		overflow-y: hidden;
		scroll-snap-type: x mandatory;
		/* A swipe past the last sibling must not become a browser back gesture. */
		overscroll-behavior: contain;
		scrollbar-width: none;
	}

	.track::-webkit-scrollbar {
		display: none;
	}

	/* The one structural difference from the deck: a panel scrolls vertically.
	   Both axes stated, because an unstated overflow-x computes to a scrolling
	   value to match the one that is set. */
	.slot {
		flex: 0 0 100%;
		min-width: 0;
		height: 100%;
		scroll-snap-align: center;
		scroll-snap-stop: always;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
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

	/* A bare button, same reasoning as the deck's ticks: a 48px hit area wrapped
	   around a 4px bar is exactly what Button's padding, height and background
	   would have to be removed to build. */
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

	/* Neutral ticks: a sibling position is not a status. */
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
