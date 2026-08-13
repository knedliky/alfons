<script lang="ts">
	/**
	 * What's running — the deck — approach 2 of 5: The contents card
	 *
	 * The round's question is how the overview and the deck coexist. This answer
	 * is the cheapest one structurally: they do not coexist, they alternate, and
	 * the overview is simply the deck's first card. No second register, no new
	 * geometry, one more card.
	 *
	 * Four decisions hold it together.
	 *
	 * 1. The reader lands on the contents card, every time, and that is the
	 *    default rather than an obstacle. The page's question is "is anything
	 *    running", not "what is AL-014 doing" — the contents card is the answer
	 *    to the question asked, and the task cards are the follow-up. It only
	 *    becomes an obstacle if it is slow to leave, and it is not: every row on
	 *    it goes straight to that task's card, so any task is one tap from the
	 *    landing card. Without it, the fourth task was three swipes.
	 *
	 * 2. The count is not confused by the extra card. The heading counts tasks
	 *    and only tasks — "4 running" — and the contents card is never given a
	 *    number. The readout below says "Contents" on card one and "2 of 4" on
	 *    the rest, so five cards still describe four runners with no arithmetic
	 *    on the reader's part.
	 *
	 * 3. Getting back is one press from anywhere. The rail's leading control is
	 *    the contents, not a previous arrow; Home does the same on a keyboard.
	 *    See TaskDeck.svelte for why that swap is a gain rather than a loss.
	 *
	 * 4. With nothing running the contents card BECOMES the empty state, and the
	 *    deck is that one card. The alternative — a contents card reading "no
	 *    runners" ahead of a separate nothing-is-running card — is two cards
	 *    saying one thing, and a table of contents for an empty book. The role of
	 *    card one is "the whole"; when the whole is nothing, that sentence is its
	 *    content. The rail goes with the tasks, because a pager with one
	 *    destination is furniture pretending to be a control.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import TaskDeck from './TaskDeck.svelte';
	import { runningTasks, type RunningTask } from './tasks.ts';

	// The two states this page lives in. ?empty renders the corpus's usual
	// condition; ?live drives the finish-while-you-watch path below.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');

	let tasks = $state<RunningTask[]>(startEmpty ? [] : runningTasks);
	// Index 0 is the contents card, so the deck opens on the overview.
	let index = $state(0);
	let checkedAt = $state(new Date());

	// The SSE feed, mocked. What matters is not the transport but that a task
	// finishing reconciles in place: the list shrinks, the count and the summary
	// sentence change, and the index clamps so the reader is left looking at a
	// card that still exists. When the last task goes, the clamp lands them on
	// the contents card, which by then is the empty state — the deck arrives at
	// the right answer without a reload.
	$effect(() => {
		// Reading the length inside the effect body, not only inside the timeout,
		// is what re-arms it after each finish. Without that the mock fires once
		// and the interesting case — the deck walking all the way down to the
		// empty contents card — never happens.
		const remaining = tasks.length;
		if (!simulateFeed || remaining === 0) return;
		const timer = setTimeout(() => {
			tasks = tasks.slice(0, -1);
			checkedAt = new Date();
		}, 6000);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		if (index > tasks.length) index = tasks.length;
	});

	const headline = $derived(tasks.length === 0 ? 'Nothing is running' : `${tasks.length} running`);
	// Tasks are numbered one to four; the contents card is not numbered at all.
	// Numbering it would make the deck five things when four are running.
	const readout = $derived(index === 0 ? 'Contents' : `${index} of ${tasks.length}`);
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

		<TaskDeck {tasks} {index} {checkedAt} onSelect={(next) => (index = next)} />
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

	/* The answer to the page's one question, in the page's one heading. It counts
	   tasks, never cards. */
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
