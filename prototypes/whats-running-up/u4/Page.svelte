<script lang="ts">
	/**
	 * What's running — going up — approach 4 of 5: Consulted, not visited
	 *
	 * The winning approach, unchanged, plus one thing: the release and the project
	 * come to the reader as a sheet rising over the card, rather than the reader
	 * being sent to them. Two scales, the grid as the landing state, the nameplate
	 * cell, the count in the heading, identity surviving both transitions — all
	 * kept exactly as they were, because the round is testing what going up costs
	 * and a rebuilt page would not answer that.
	 *
	 * THE HONEST ANSWER TO "IS A SHEET A SECOND LEVEL IN DISGUISE".
	 *
	 * Partly yes. A modal is depth: focus goes somewhere else, the page behind
	 * stops taking input, and there is a state the reader has to get out of. This
	 * approach does not pretend otherwise, and the code says so — the background is
	 * `inert` while the sheet is up, which is the plainest possible admission that
	 * a second thing is in charge.
	 *
	 * What it is not is a DESTINATION, and that is the distinction worth the
	 * relaxation. Four things are true here that are not true of a push:
	 *
	 *   - The card is still on screen. The sheet stops at 68% and the scrim is 30%,
	 *     so the status mark, the id and the head of the title stay legible behind
	 *     it the whole time. The reader can see what they will come back to.
	 *   - Nothing is left behind on close. No route, no history entry, no scroll
	 *     position to restore, no back affordance to find. `scale` and `index` are
	 *     untouched by the whole interaction — grep this file: the sheet cannot
	 *     write to them.
	 *   - Focus returns to the exact control that summoned it, so the reader's
	 *     place is not approximately kept, it is kept.
	 *   - The task the reader came from is printed inside the release listing and
	 *     marked. Going up does not lose sight of where up was from.
	 *
	 * So the flatness survives in the sense that matters — there is nowhere to be
	 * lost — and it does not survive in the sense that a modal state now exists.
	 * That is the cost, and it is stated here rather than argued away.
	 *
	 * THE OTHER COSTS OF THE RELAXATION, PLAINLY.
	 *
	 *   - The page now has a state it did not have. There are two things a reader
	 *     can be doing instead of one, and the empty state is no longer the only
	 *     thing that has to be designed carefully.
	 *   - The page has to admit tasks that are not running. A release sheet showing
	 *     only building and verifying would report a four-task release as a
	 *     one-task release. Recorded as a breach in round.json.
	 *   - The upward move exists at card scale only. A second target inside a 158px
	 *     grid cell would fight the cell's one job, which is to open the card.
	 *     Going up is therefore something you do from the task you are reading,
	 *     which is also the plainest reading of the brief.
	 *
	 * WHY NOT THE LIBRARY'S Modal. Checked first, and it does not fit: it paints
	 * with --admin-bg, --admin-border and --admin-text on a public surface; it
	 * centres a 480px box and scales it in rather than rising from an edge; its
	 * "focus-trapping via aria-modal" is a comment, not a trap — nothing moves
	 * focus in, nothing cycles Tab, and nothing restores focus on close; and its
	 * title carries a hard-coded id="modal-title", so a second instance duplicates
	 * an id. Reported rather than fixed.
	 *
	 * The page does not scroll vertically. A horizontal pager inside a vertically
	 * scrolling document is the known misery, so the document is exactly one screen
	 * tall and the footer is dropped.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import AncestrySheet from './AncestrySheet.svelte';
	import NothingRunning from './NothingRunning.svelte';
	import ScaleControl from './ScaleControl.svelte';
	import TaskDeck from './TaskDeck.svelte';
	import TaskGrid from './TaskGrid.svelte';
	import { findProject, findRelease } from './hierarchy.ts';
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

	// The one piece of state the upward move adds to this page. Deliberately a
	// boolean beside the existing index rather than a route or a stack: there is
	// exactly one thing that can be consulted, and it is always the ancestry of
	// the card already on screen.
	let consulting = $state(false);

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

	// A task finishing under an open sheet closes it. The sheet is about the
	// ancestry of a card, and if that card has gone the sheet is about nothing.
	$effect(() => {
		if (tasks.length === 0 && consulting) consulting = false;
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

	// Summoning does NOT change the index or the scale — it only raises the sheet
	// over whatever is already there. That is the approach in one function.
	function consult(position: number) {
		if (position !== index) return;
		consulting = true;
	}

	const current = $derived(tasks[index] ?? null);
	const release = $derived(current ? findRelease(current.release) : null);
	const project = $derived(current ? findProject(current.project) : null);

	const headline = $derived(tasks.length === 0 ? 'Nothing is running' : `${tasks.length} running`);

	// One live region for all three jobs. The scale change has to be announced, the
	// position has to be readable, and now the sheet has to say it is up — and they
	// are the same sentence, so a separate announcement region would talk over this
	// one every time the reader moved. It also stands in for the aria-pressed
	// ToggleGroup does not emit.
	// "Consulting release" and not "Consulting prototype-loop-v1". Measured: the
	// slug is 28 characters of mono beside an h1, which at 370px wrapped the
	// heading onto two lines and at 1280px overran the column. The page's one
	// heading must not change shape because a sheet is up — and the slug is
	// printed twice inside the sheet already, so the caption was repeating it.
	const readout = $derived(
		consulting && release
			? 'Consulting release'
			: scale === 'grid'
				? 'All running'
				: `Reading ${index + 1} of ${tasks.length}`
	);
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	<!-- No footer. This page is exactly one screen tall by design, and a footer
	     below the fold would reintroduce the vertical scroll the deck must not
	     fight. Recorded as a deviation from the seeded shell. -->
	<div class="screen">
		<!-- `inert` is the trap. It is one attribute and it does what a hand-rolled
		     focus trap approximates: nothing behind the sheet can be focused,
		     clicked or reached by a screen reader's virtual cursor. The sheet's own
		     Tab handler adds the wrap-around that inert does not give. -->
		<div class="content" inert={consulting}>
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
				<TaskDeck
					{tasks}
					{index}
					onSelect={(next) => (index = next)}
					onConsult={consult}
					{consulting}
					autofocus={readerMovedScale}
				/>
			{/if}

			{#if tasks.length > 0}
				<ScaleControl {scale} onchange={changeScale} />
			{/if}
		</div>

		<AncestrySheet
			open={consulting}
			{release}
			{project}
			fromTaskId={current ? current.id : ''}
			onclose={() => (consulting = false)}
		/>
	</div>
</PageFrame>

<style>
	.screen {
		/* Status colour, declared once for the page.
		   The reserved pair — these two mean building and verifying, and nothing
		   else on this page is allowed to use them. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		/* The six the sheet needs, because a release contains tasks that are not
		   running. They exist only inside the sheet. Three of them share
		   --text-muted on purpose: pending, wontfix and duplicate are not states
		   worth spending a colour on, and giving each its own would turn a status
		   palette into decoration. */
		--status-triaged: var(--sky-blue);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		--status-pending: var(--text-muted);
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);

		/* The prototyping harness's floating pager sits fixed at the bottom of every
		   /dev page. The page clears it, and so must the sheet — an absolutely
		   positioned child resolves `bottom: 0` against the padding BOX, so a sheet
		   that simply sat at the bottom would run underneath the pager and lose its
		   last two rows. Named once and used twice. In production this is 0. */
		--harness-clearance: calc(var(--space-7) + var(--space-5));

		/* The sheet and its scrim position against this box rather than the
		   viewport, so on a desktop they stay inside the page's own column. */
		position: relative;
		display: flex;
		flex-direction: column;
		height: calc(100dvh - var(--header-height));
		padding: var(--space-4);
		/* Clears the harness pager, which would otherwise cover the scale control.
		   A production page would carry var(--space-4) here like every other edge. */
		padding-bottom: var(--harness-clearance);
		overflow: hidden;
	}

	.content {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.topbar {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		flex: none;
	}

	/* The answer to the page's one question, in the page's one heading — the same
	   line at both scales, and the same line with the sheet up. */
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
	   the grid simply becomes the one most readers stay at. The sheet inherits the
	   same column, which is why it reads as a sheet over the card at 1280px rather
	   than an overlay on the browser. */
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
