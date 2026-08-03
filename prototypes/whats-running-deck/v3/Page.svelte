<script lang="ts">
	/**
	 * What's running — the deck — approach 3 of 5: Peek
	 *
	 * The overview and the deck coexist by letting the deck spill. The card being
	 * read keeps the full height and very nearly the full width of the phone, and
	 * the cards either side of it intrude 48px at each edge, so the shape of the
	 * screen alone tells the reader three things: there is something before, there
	 * is something after, and here is which. At the first card the left gutter is
	 * empty and at the last the right one is; that asymmetry is the end of the
	 * deck, stated by the layout rather than by a disabled control.
	 *
	 * What the peek cannot do, and does not try to: say four. A sliver tells you
	 * there is more, never how much more, so the count stays exactly where the
	 * winning approach put it — the h1 is the answer to the page's one question,
	 * in both states. The peek answers the second question, which is not "how
	 * many" but "what else", and that is a question a number cannot answer and a
	 * sliver can.
	 *
	 * Two things inherited without argument: the page does not scroll vertically,
	 * because a horizontal pager inside a vertical document is the known misery;
	 * and zero cards is still one card, in NothingRunning.svelte.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import NothingRunning from './NothingRunning.svelte';
	import TaskDeck from './TaskDeck.svelte';
	import { runningTasks, type RunningTask } from './tasks.ts';

	// The states this page lives in. ?empty renders the corpus's usual condition,
	// ?one the case where there is no neighbour to peek at, and ?live drives the
	// finish-while-you-watch path below.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const startSingle = query.includes('one');
	const simulateFeed = query.includes('live');

	let tasks = $state<RunningTask[]>(
		startEmpty ? [] : startSingle ? runningTasks.slice(0, 1) : runningTasks
	);
	let index = $state(0);
	let checkedAt = $state(new Date());

	// The SSE feed, mocked. What matters is not the transport but that a task
	// finishing reconciles in place: the list shrinks, the count changes, the peek
	// on one side disappears, and the index clamps so the reader is left looking
	// at a card that still exists.
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
			<div class="inset">
				<NothingRunning {checkedAt} />
			</div>
		{:else}
			<TaskDeck {tasks} {index} onSelect={(next) => (index = next)} />
		{/if}
	</div>
</PageFrame>

<style>
	.screen {
		/* Status colour, declared once for the page. Nothing else here may use
		   them: they mean building and verifying, and any third use would make
		   them decoration. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);

		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: calc(100dvh - var(--header-height));
		/* No inline padding on the screen. The deck's track has to run to the
		   screen edge, because the peek is a card leaving the screen and a margin
		   outside it would make the neighbour look parked rather than passing
		   through. Everything that is not the track puts its own gutter back. */
		padding-block: var(--space-4);
		/* Clears the prototyping harness's floating pager, which sits fixed at the
		   bottom of every /dev page and would otherwise cover the rail. A
		   production page would carry var(--space-4) here like every other edge. */
		padding-bottom: calc(var(--space-7) + var(--space-5));
		overflow: hidden;
	}

	.topbar,
	.inset {
		padding-inline: var(--space-4);
	}

	.topbar {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		flex: none;
	}

	.inset {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	/* The answer to the page's one question, in the page's one heading. The peek
	   says what else is running; only this says how many. */
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

	/* Above a phone the card stops growing in both axes, and the peek does not
	   grow at all — it stays 48px everywhere, so a wide window shows the same
	   sliver rather than turning into a row of three cards. */
	@media (min-width: 640px) {
		.screen {
			width: 100%;
			max-width: 34rem;
			height: min(calc(100dvh - var(--header-height)), 44rem);
			margin-inline: auto;
		}
	}
</style>
