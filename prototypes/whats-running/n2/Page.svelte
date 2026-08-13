<script lang="ts">
	/**
	 * What's running — approach 2 of 5: One per screen
	 *
	 * Each running task gets the full width and height of the phone as a single
	 * card the reader moves between. The depth is the card: there is no tap
	 * between seeing a task and reading it, because the task is already fully
	 * rendered the moment it is on screen.
	 *
	 * Three decisions hold the approach together.
	 *
	 * 1. The count survives above the deck, as the h1. Paging costs you the
	 *    overview, so the overview is not left to the pager to imply — the first
	 *    line of the page is the number, in words, and it is the same line in
	 *    both states. Looking at card one you read "4 running"; the rail below
	 *    then says which of the four you are on.
	 *
	 * 2. The page does not scroll vertically. A horizontal pager inside a
	 *    vertically scrolling document is the known misery, so the document is
	 *    made exactly one screen tall and the footer is dropped. The only
	 *    vertical scroller left is inside a card, and only when a title needs it.
	 *
	 * 3. Zero cards is still one card. See NothingRunning.svelte.
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
	// finishing reconciles in place: the list shrinks, the count changes, and the
	// index clamps so the reader is left looking at a card that still exists
	// rather than at a blank slot or a reload.
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
			<NothingRunning {checkedAt} />
		{:else}
			<TaskDeck {tasks} {index} onSelect={(next) => (index = next)} />
		{/if}
	</div>
</PageFrame>

<style>
	.screen {
		/* Status colour, declared once for the page. Nothing else on this page is
		   allowed to use them: they mean building and verifying, and any third
		   use would make them decoration. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);

		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: calc(100dvh - var(--header-height));
		padding: var(--space-4);
		/* Clears the prototyping harness's floating pager, which sits fixed at the
		   bottom of every /dev page and would otherwise cover the rail. A
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

	.readout {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
		white-space: nowrap;
	}

	/* Above a phone the card stops growing in both axes. A single card stretched
	   across 1280px would be a poster, and stretched down a 900px window it
	   would be a column with a hole in it — the approach is a bet about a phone,
	   so on a desktop it stays phone-shaped rather than inventing content to
	   fill space it never asked for. */
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
