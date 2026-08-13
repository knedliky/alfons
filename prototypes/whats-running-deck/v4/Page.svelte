<script lang="ts">
	/**
	 * What's running — the deck — approach 4 of 5: Two scales
	 *
	 * The same content at two sizes: every runner at once in a grid, and one runner
	 * at the full width and height of the phone. A single control moves between
	 * them, and the index survives the move in both directions.
	 *
	 * The grid is the landing state. The request this round exists to answer —
	 * "the current tasks being worked on so that I can quickly get a sense check of
	 * where I am" — is a plural question, and a deck answers plural questions one
	 * card at a time. Four cells is that answer in one frame with no gesture at
	 * all. The full-size card is not lost: it is one deliberate tap away and still
	 * renders everything, which is a straight re-pricing of the previous approach's
	 * bargain rather than a retreat from it. Card-first would have kept that
	 * bargain intact and put the sense check behind a control, and on a page that
	 * is glanced at and is usually empty, an opt-in overview is one most readers
	 * would never open — the round would then have tested how discoverable a
	 * control is, not whether two scales work.
	 *
	 * Three things hold the approach together.
	 *
	 * 1. The count is the h1 at both scales, exactly as the winning approach left
	 *    it. The grid shows the count as well, but showing is not saying, and a
	 *    heading that changed shape with the scale would make the page's one answer
	 *    depend on which scale you happened to be at.
	 *
	 * 2. Identity survives the transition both ways. Zooming out marks the cell you
	 *    were reading as current and puts the focus on it; zooming back in lands on
	 *    that same card, instantly rather than by scrolling past its neighbours.
	 *
	 * 3. Zero runners has no second scale. There is nothing to zoom out from, so
	 *    the control is not rendered rather than rendered disabled — a disabled
	 *    switch is furniture pretending to be a control, the same reason the deck
	 *    drops its pager when it holds one card.
	 *
	 * The page does not scroll vertically. A horizontal pager inside a vertically
	 * scrolling document is the known misery, so the document is exactly one screen
	 * tall and the footer is dropped.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import NothingRunning from './NothingRunning.svelte';
	import ScaleControl from './ScaleControl.svelte';
	import TaskDeck from './TaskDeck.svelte';
	import TaskGrid from './TaskGrid.svelte';
	import type { Scale } from './scale.ts';
	import { runningTasks, type RunningTask } from './tasks.ts';

	// The two states this page lives in. ?empty renders the corpus's usual
	// condition; ?live drives the finish-while-you-watch path below. ?card lands at
	// the other scale, so the choice of landing state can be seen both ways.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');

	let tasks = $state<RunningTask[]>(startEmpty ? [] : runningTasks);
	let index = $state(0);
	let scale = $state<Scale>(query.includes('card') ? 'card' : 'grid');
	let checkedAt = $state(new Date());

	// Nothing takes the focus on arrival; only a scale the reader asked for does.
	let readerMovedScale = $state(false);

	// The SSE feed, mocked. What matters is not the transport but that a task
	// finishing reconciles in place at whichever scale is on screen: the list
	// shrinks, the count changes, the grid loses a cell, and the index clamps so
	// the reader is left looking at something that still exists.
	$effect(() => {
		if (!simulateFeed) return;
		const timer = setTimeout(() => {
			tasks = tasks.slice(0, -1);
			checkedAt = new Date();
		}, 6000);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		if (index > tasks.length - 1) index = Math.max(0, tasks.length - 1);
	});

	function changeScale(next: Scale) {
		if (next === scale) return;
		readerMovedScale = true;
		scale = next;
	}

	function openCard(position: number) {
		index = position;
		readerMovedScale = true;
		scale = 'card';
	}

	const headline = $derived(tasks.length === 0 ? 'Nothing is running' : `${tasks.length} running`);

	// One live region for both jobs. The scale change has to be announced and the
	// position has to be readable, and they are the same sentence — a separate
	// announcement region would talk over this one every time the reader moved.
	// It also stands in for the aria-pressed ToggleGroup does not emit.
	const readout = $derived(
		scale === 'grid' ? 'All running' : `Reading ${index + 1} of ${tasks.length}`
	);
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	<!-- No footer. This page is exactly one screen tall by design, and a footer
	     below the fold would reintroduce the vertical scroll the deck must not
	     fight. Recorded as a deviation from the seeded shell. -->
	<div class="screen">
		<div class="topbar">
			<h1 class="headline" aria-live="polite">{headline}</h1>
			{#if tasks.length > 0}
				<p class="readout" aria-live="polite">{readout}</p>
			{/if}
		</div>

		{#if tasks.length === 0}
			<NothingRunning {checkedAt} />
		{:else if scale === 'grid'}
			<TaskGrid
				{tasks}
				{index}
				onSelect={(next) => (index = next)}
				onOpen={openCard}
				autofocus={readerMovedScale}
			/>
		{:else}
			<TaskDeck {tasks} {index} onSelect={(next) => (index = next)} autofocus={readerMovedScale} />
		{/if}

		{#if tasks.length > 0}
			<ScaleControl {scale} onchange={changeScale} />
		{/if}
	</div>
</PageFrame>

<style>
	.screen {
		/* Status colour, declared once for the page. Nothing else here is allowed
		   to use them: they mean building and verifying, and any third use would
		   make them decoration. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);

		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: calc(100dvh - var(--header-height));
		padding: var(--space-4);
		/* Clears the prototyping harness's floating pager, which sits fixed at the
		   bottom of every /dev page and would otherwise cover the scale control. A
		   production page would carry var(--space-4) here like every other edge. */
		padding-bottom: calc(var(--space-7) + var(--space-5));
		overflow: hidden;
	}

	.topbar {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		flex: none;
	}

	/* The answer to the page's one question, in the page's one heading — the same
	   line at both scales. */
	.headline {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(var(--text-lead), 5vw, 1.75rem);
		line-height: 1.1;
		color: var(--text-primary);
	}

	.readout {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
		white-space: nowrap;
	}

	/* Above a phone the card stops growing in both axes — a single card stretched
	   across 1280px is a poster, and stretched down a 900px window it is a column
	   with a hole in it. The grid does not have that problem, so the two scales do
	   NOT collapse into one on a desktop: they stay two, in the same column, and
	   the grid simply becomes the one most readers stay at. Collapsing them would
	   have removed the only thing this approach is testing at the width where it
	   is easiest to test it. */
	@media (min-width: 640px) {
		.screen {
			width: 100%;
			max-width: 34rem;
			height: min(calc(100dvh - var(--header-height)), 44rem);
			margin-inline: auto;
			padding-inline: 0;
		}
	}
</style>
