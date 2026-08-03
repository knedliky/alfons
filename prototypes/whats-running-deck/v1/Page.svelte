<script lang="ts">
	/**
	 * What's running — the deck — approach 1 of 5: Deck and spine
	 *
	 * A permanent second register. Every runner is listed in a compact strip that
	 * never leaves the screen, so the overview and the card are read at the same
	 * moment and the reader never trades one for the other.
	 *
	 * The round exists because the winning approach could show one task in full
	 * or state a count, never both: "the count is not something the deck can
	 * express". This approach answers that by giving the count a body. The
	 * heading still states the number, because a stated number beats one counted
	 * off marks, but the spine below says which four and in what state — the part
	 * a number cannot carry and a pager never carried.
	 *
	 * The trade, stated plainly, because it is what this approach is for
	 * measuring. Every pixel the spine takes is a pixel the card loses, and the
	 * card owning the screen without compression was the whole argument of the
	 * approach underneath. The spine is affordable only because it replaces
	 * something: the tick rail and the previous/next buttons are gone and the
	 * spine occupies the row they used to.
	 *
	 * Measured in a browser at 370x800, this page against the one it is built on:
	 *
	 *   card    526.6px (n2)  ->  505.4px (here)   -21.2px, 4.0%
	 *   strip    48.0px rail  ->   73.2px spine    +25.2px
	 *   gap      16px         ->   12px             -4px
	 *
	 * So the spine costs the card twenty-one pixels, not seventy-three. It is
	 * paid for almost entirely by the pager it replaces, and the card still
	 * renders without compression: nothing scrolls, nothing truncates, the title
	 * sets at its full clamp and all four counts stand. On the empty state the
	 * card is 594px, because the spine is not there to take anything.
	 *
	 * Three things are inherited and not relitigated: the count is the h1 and sits
	 * in the same position in both states, movement works by swipe and by visible
	 * control and by keyboard, and the deck never empties.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import NothingRunning from './NothingRunning.svelte';
	import TaskDeck from './TaskDeck.svelte';
	import { runningTasks, type RunningTask } from './tasks.ts';

	// The two states this page lives in. ?empty renders the corpus's usual
	// condition; ?live drives the finish-while-you-watch path below.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');

	let tasks = $state<RunningTask[]>(startEmpty ? [] : runningTasks);
	let index = $state(0);
	let checkedAt = $state(new Date());

	// The SSE feed, mocked. What matters is not the transport but that a task
	// finishing reconciles in place, and the spine is where that is visible
	// without paging: the strip loses an entry while the reader is looking at a
	// different card, which is the sense check doing its job.
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

	const headline = $derived(tasks.length === 0 ? 'Nothing is running' : `${tasks.length} running`);
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	<!-- No footer. This page is exactly one screen tall by design, and a footer
	     below the fold would reintroduce the vertical scroll the deck must not
	     fight. Recorded as a deviation from the seeded shell. -->
	<div class="screen">
		<div class="topbar">
			<h1 class="headline" aria-live="polite">{headline}</h1>
			{#if tasks.length > 1}
				<p class="readout" aria-live="polite">{index + 1} of {tasks.length}</p>
			{/if}
		</div>

		{#if tasks.length === 0}
			<!-- The spine goes with the runners. A strip of every runner with no
			     runners in it is not an empty state, it is furniture — the same
			     argument that retired the disabled pager. The card takes the room
			     back, which is worth saying out loud: the state this page spends
			     most of its life in is the state where the spine costs nothing. -->
			<NothingRunning {checkedAt} />
		{:else}
			<TaskDeck {tasks} {index} onSelect={(next) => (index = next)} />
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
		   bottom of every /dev page and would otherwise cover the spine. A
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

	/* The answer to the page's one question, in the page's one heading. */
	.headline {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(var(--text-lead), 5vw, 1.75rem);
		line-height: 1.1;
		color: var(--text-primary);
	}

	/* Kept, and demoted. With the spine present the reader's position is visible
	   in the strip, so this line is here for the reader who cannot see the strip:
	   it is the aria-live announcement that says the deck moved. */
	.readout {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
		white-space: nowrap;
	}

	/* Above a phone the card stops growing in both axes. A single card stretched
	   across 1280px would be a poster, and stretched down a 900px window it would
	   be a column with a hole in it — the approach is a bet about a phone, so on
	   a desktop it stays phone-shaped rather than inventing content to fill space
	   it never asked for. The spine keeps the same width, which is the honest
	   reading: it is a phone component and it does not become a sidebar because
	   the window grew. */
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
