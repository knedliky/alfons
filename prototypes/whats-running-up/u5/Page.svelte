<script lang="ts">
	/**
	 * What's running — going up — approach u5: The deck changes hands
	 *
	 * There is one screen. Going up does not take the reader anywhere; it changes
	 * what the deck contains. Tap `prototype-loop-v1` on a card and the deck is
	 * refilled with that release — all four of its tasks, running or not — at the
	 * same two scales, under the same heading, with the reader still on the card
	 * they were reading. No second screen, no stack, no sheet.
	 *
	 * ── The hardest problem, and the answer ────────────────────────────────────
	 *
	 * The page's question changes underneath the reader. The heading said "4
	 * running"; the deck now holds four tasks of which one is. It cannot still say
	 * "4 running" and it must not quietly become a different kind of sentence.
	 *
	 * The answer is that the heading NEVER stops answering the page's one
	 * question. The h1 is always a count of work in motion — that is the number
	 * the page exists to report, and it keeps its grammar, its position and its
	 * size in every scope. What changes is that it gains a denominator on the line
	 * beneath it:
	 *
	 *     4 running                      1 running
	 *     across every project           of 4 tasks in release prototype-loop-v1
	 *
	 * So the number is never wrong and never ambiguous: it is always "how many are
	 * running", and the line under it always says what that is out of. Going up
	 * narrows the population the question is asked about; it does not change the
	 * question. That is also why the empty case survives — "None running / of 4
	 * tasks in prototype-loop-v1" is a complete and useful sentence, and it is the
	 * state a reader who goes up while nothing is running actually lands in.
	 *
	 * Two other heading shapes were tried and rejected. Swapping the h1 to
	 * "prototype-loop-v1" made the page's answer disappear at exactly the moment
	 * the reader had gone looking for context, and they then had to come back home
	 * to re-ask the only question the page is for. Making the h1 a ratio — "1 of
	 * 4" — turned the answer into something that has to be decoded, and reading
	 * without decoding is the whole budget this page has.
	 *
	 * ── Which set am I looking at ──────────────────────────────────────────────
	 *
	 * Three signals, none of them optional and none of them repeating another.
	 * The denominator line names the count, the kind and the set in one sentence.
	 * The scope bar is a live beacon at home and the way back everywhere else, so
	 * the beacon's absence is itself an answer — see ScopeBar. And on the card the
	 * segment naming the current scope reads "release · showing" and is not a
	 * button, so the reader is told they are already there rather than shown a
	 * control that does nothing.
	 *
	 * ── The relaxation, and its price ──────────────────────────────────────────
	 *
	 * Every earlier round held that anything not building or verifying has no
	 * place on this page. This approach breaks that on purpose: a release deck is
	 * mostly `done`, and a project deck is mostly `done` and `pending`. What that
	 * bought is a page with no second level at all. What it cost is visible in
	 * three places in this directory — eight status colours instead of two, a grid
	 * that has to scroll, and a rail that stops being a rail — and all three are
	 * written up in the report.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import NothingRunning from './NothingRunning.svelte';
	import ScaleControl from './ScaleControl.svelte';
	import ScopeBar from './ScopeBar.svelte';
	import TaskDeck from './TaskDeck.svelte';
	import TaskGrid from './TaskGrid.svelte';
	import type { Scale } from './scale.ts';
	import { isRunning, tasks as corpusTasks, type Task } from './tasks.ts';
	import { contentsOf, denominatorLine, RUNNING_SCOPE, scopeId, type Scope } from './scope.ts';

	// The states this page lives in. ?empty renders the corpus's usual condition —
	// the four runners landed, so the releases they belong to are still there to be
	// asked about. ?live drives the finish-while-you-watch path. ?card lands at the
	// other scale. ?release and ?project land already refilled, so the two scopes
	// can be seen without a gesture.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');

	// Emptying the running set by deleting rows would empty the releases too, and
	// the interesting state for this approach is precisely "nothing is running AND
	// the reader can still ask about a release". So the four runners are landed
	// rather than removed.
	let corpus = $state<Task[]>(
		startEmpty
			? corpusTasks.map((task) =>
					isRunning(task.status)
						? { ...task, status: 'done' as const, latestVerdict: 'pass' as const }
						: task
				)
			: corpusTasks
	);

	const landingScope: Scope = query.includes('release')
		? { kind: 'release', key: 'prototype-loop-v1' }
		: query.includes('project')
			? { kind: 'project', key: 'alfons' }
			: RUNNING_SCOPE;

	let scope = $state<Scope>(landingScope);
	let scale = $state<Scale>(query.includes('card') ? 'card' : 'grid');
	let checkedAt = $state(new Date());

	// Nothing takes the focus on arrival; only a move the reader asked for does.
	let readerMoved = $state(false);

	/**
	 * The reader's place is a task id, not a position.
	 *
	 * This started as a position and the browser caught it: with the deck holding
	 * `prototype-loop-v1` and the reader on AL-014, the feed landed AL-014, the
	 * running-first ordering moved it from first to third, and the reader's mark
	 * silently became AL-012 — a task they had never looked at. A position is not
	 * an identity in a set that reorders, and this page reorders on two different
	 * events: a refill and a status change.
	 *
	 * Holding an id instead makes the upward move fall out for free: the anchor is
	 * in the new set by construction, because the new set is that task's own
	 * release or project, so `refill` changes the scope and does not touch the
	 * reader's place at all. It also gives the honest fallback when the anchor is
	 * genuinely gone — coming home after the task landed — which is the front of
	 * the deck, because there is no place left to keep.
	 */
	let anchorId = $state<string | null>(null);

	const contents = $derived(contentsOf(scope, corpus));
	const index = $derived.by(() => {
		const at = contents.tasks.findIndex((task) => task.id === anchorId);
		return at < 0 ? 0 : at;
	});
	const current = $derived(contents.tasks[index]);

	function select(position: number) {
		anchorId = contents.tasks[position]?.id ?? null;
	}

	// The SSE feed, mocked. What matters is not the transport but that a task
	// landing reconciles in place in whatever scope is on screen: in the running
	// deck the set shrinks and the count drops; in a release deck the set stays the
	// same size and only the count drops, which is a case only this approach has.
	$effect(() => {
		if (!simulateFeed) return;
		const timer = setTimeout(() => {
			corpus = corpus.map((task) =>
				task.id === 'AL-014'
					? { ...task, status: 'done' as const, latestVerdict: 'pass' as const }
					: task
			);
			checkedAt = new Date();
		}, 6000);
		return () => clearTimeout(timer);
	});

	function changeScale(next: Scale) {
		if (next === scale) return;
		readerMoved = true;
		scale = next;
	}

	function openCard(position: number) {
		select(position);
		readerMoved = true;
		scale = 'card';
	}

	/**
	 * The upward move, and the only thing on this page that changes the deck.
	 *
	 * Where the deck lands is not a detail — it is the contract. It lands on the
	 * task the reader was already reading, which is always in the new set, because
	 * the new set is that task's own release or project. Going up therefore widens
	 * what is around the reader without moving the reader, which is the sentence
	 * this whole approach is trying to make true. The anchor is a task id, so this
	 * function does not have to arrange that — it only changes the scope, and the
	 * position falls out.
	 */
	function refill(next: Scope) {
		if (scopeId(next) === scopeId(scope)) return;
		scope = next;
		readerMoved = true;
	}

	/**
	 * Home, in one move, from anywhere. If the task being read is still running it
	 * is still the reader's place and the deck keeps it; if it has landed — the
	 * common case on the way back from a release — the running deck starts at the
	 * front, because there is no place left to keep.
	 */
	function goHome() {
		refill(RUNNING_SCOPE);
	}

	const headline = $derived(
		contents.running > 0
			? `${contents.running} running`
			: scope.kind === 'running'
				? 'Nothing is running'
				: 'None running'
	);

	const denominator = $derived(denominatorLine(contents));

	const readout = $derived(
		scale === 'grid' ? `${contents.tasks.length} shown` : `${index + 1} / ${contents.tasks.length}`
	);

	// One announcement for the two things that change without the reader looking:
	// which set the deck holds, and where in it they are. A refill replaces the
	// entire region below, so it has to be said rather than shown, and it has to be
	// said in the same region as the position or the two talk over each other. It
	// also stands in for the aria-pressed ToggleGroup does not emit.
	const announcement = $derived(
		[
			scope.kind === 'running'
				? `Everything running: ${contents.tasks.length} tasks.`
				: `${scope.kind} ${contents.name}: ${contents.tasks.length} tasks, ${contents.running} running.`,
			scale === 'grid'
				? 'All at once.'
				: `Reading ${index + 1} of ${contents.tasks.length}${current ? `, ${current.id}` : ''}.`
		].join(' ')
	);
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	<!-- No footer. This page is exactly one screen tall by design, and a footer
	     below the fold would reintroduce the vertical scroll the deck must not
	     fight. Recorded as a deviation from the seeded shell. -->
	<div class="screen">
		<div class="topbar">
			<div class="answer">
				<h1 class="headline" aria-live="polite">{headline}</h1>
				{#if contents.tasks.length > 0}
					<p class="readout">{readout}</p>
				{/if}
			</div>
			<!-- Its own full-width row rather than sharing one with the position.
			     "of 16 tasks in project alfons" is the sentence that stops the count
			     above being a lie, and beside the readout at 370px it truncated to
			     "of 4 tasks in release prototype-l…". A denominator that has to be
			     guessed at is worse than none. -->
			<p class="denominator">{denominator}</p>
		</div>

		<ScopeBar {contents} {checkedAt} onhome={goHome} />

		<!-- Visually hidden. The library has no such utility, which is reported. -->
		<p class="announce" aria-live="polite">{announcement}</p>

		{#if contents.tasks.length === 0}
			<NothingRunning {checkedAt} onup={refill} />
		{:else}
			<!-- Keyed on the scope so a refill REMOUNTS rather than reconciles.
			     Refilling a snap container's children in place leaves scrollLeft
			     pointing at a card that no longer exists, and the deck's own
			     first-position-is-a-jump logic has to run again for the reader to
			     land on their own task rather than scroll past everything between. -->
			{#key scopeId(scope)}
				{#if scale === 'grid'}
					<TaskGrid
						tasks={contents.tasks}
						{index}
						{scope}
						onSelect={select}
						onOpen={openCard}
						autofocus={readerMoved}
					/>
				{:else}
					<TaskDeck
						tasks={contents.tasks}
						{index}
						{scope}
						onSelect={select}
						onup={refill}
						autofocus={readerMoved}
					/>
				{/if}
			{/key}

			<ScaleControl {scale} onchange={changeScale} />
		{/if}
	</div>
</PageFrame>

<style>
	.screen {
		/* Status colour, declared once for the page. Eight now rather than two,
		   because the deck can hold a release and a release is mostly finished
		   work. Nothing else on this page may use them: a project, a release, a
		   verdict and a position are not statuses and take none of these hues.
		   Three statuses share --text-muted deliberately — pending, wontfix and
		   duplicate are all "not a thing that is going to move", and inventing three
		   distinguishable hues for them would spend colour on a distinction the
		   reader of a glance page does not need. The word beside every mark is what
		   tells them apart. */
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);

		display: flex;
		flex-direction: column;
		/* Tighter than the winning approach's space-4. The scope bar is a whole new
		   row on a screen that was already exactly full, and the room for it comes
		   out of the gaps before it comes out of the card. */
		gap: var(--space-3);
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
		flex-direction: column;
		gap: var(--space-1);
		flex: none;
	}

	.answer {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		min-width: 0;
	}

	/* The answer to the page's one question, in the page's one heading — the same
	   sentence in every scope. */
	.headline {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(var(--text-lead), 5vw, 1.75rem);
		line-height: 1.1;
		color: var(--text-primary);
	}

	/* What the number above is measured over. Never the same size as the heading:
	   it qualifies the answer, it is not part of it. */
	.denominator {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.readout {
		margin: 0;
		flex: none;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
		white-space: nowrap;
	}

	/* No visually-hidden utility exists in the library, so this is the standard
	   clip-rect one, written out. Reported as a gap. */
	.announce {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	/* Above a phone the card stops growing in both axes — a single card stretched
	   across 1280px is a poster. The grid does not have that problem, so the two
	   scales do NOT collapse into one on a desktop: they stay two, in the same
	   column, and the grid simply becomes the one most readers stay at. */
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
