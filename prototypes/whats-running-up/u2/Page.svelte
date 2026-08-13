<script lang="ts">
	/**
	 * What's running — going up — approach 2 of 5: The standing line
	 *
	 * The round's control. Every other approach invents a mechanism for going up;
	 * this one uses the mechanism every reader already knows, printed on the card
	 * and never taken away: `alfons > prototype-loop-v1 > AL-014`, with the two
	 * ancestors tappable and the task stated because you are standing on it.
	 *
	 * The argument for it is that the reader does not have to learn anything, and
	 * that the position is visible whether or not they ever tap it — the line
	 * answers "where is this?" for free and "take me there" on demand, and those
	 * are two different questions that every other mechanism answers only one of.
	 *
	 * The argument against it, which is the honest one and is the whole reason
	 * this approach is worth building: a breadcrumb is chrome, and this page has
	 * spent three rounds removing chrome. PageHeader, PageSection and Footer were
	 * all stripped out; the header is a bare h1 that is also the answer. The line
	 * is the first furniture the page has carried, it sits above the status and
	 * the title, and it is there on every card whether or not anyone is going up
	 * today. It has to earn 44px of a screen that is one screen tall, and it does
	 * that by absorbing the two things it duplicates rather than by being small.
	 *
	 * The grid does not get one. Four cells span four projects, so there is no
	 * single ancestry to state, and four breadcrumbs is four lines of chrome
	 * answering a question nobody asked at that scale. This is the interesting
	 * asymmetry and it is a real limit of the conventional pattern: a breadcrumb
	 * describes one position, and the landing state of this page is deliberately
	 * plural. See the note above the grid below.
	 *
	 * Three views, one page. The running view is what v4 was, unchanged in every
	 * detail: two scales, the count in the heading, identity surviving the
	 * transition both ways. Above it sit a release view and a project view,
	 * because a breadcrumb segment promises a destination and a promise without a
	 * destination is a line of text.
	 *
	 * Where the reader was in the running view is not lost by going up. `index`
	 * and `scale` are page state and the upward views do not touch them, so coming
	 * back lands on exactly the card that was open — the same contract v4 wrote
	 * for the grid/card move, extended one level.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import NothingRunning from './NothingRunning.svelte';
	import ProjectView from './ProjectView.svelte';
	import ReleaseView from './ReleaseView.svelte';
	import ScaleControl from './ScaleControl.svelte';
	import TaskDeck from './TaskDeck.svelte';
	import TaskGrid from './TaskGrid.svelte';
	import type { Scale } from './scale.ts';
	import { findProject, findRelease } from './hierarchy.ts';
	import { runningTasks, type RunningTask } from './tasks.ts';

	// The two states this page lives in. ?empty renders the corpus's usual
	// condition; ?live drives the finish-while-you-watch path. ?card lands at the
	// other scale, so the choice of landing state can be seen both ways.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');

	let tasks = $state<RunningTask[]>(startEmpty ? [] : runningTasks);
	let index = $state(0);
	let scale = $state<Scale>(query.includes('card') ? 'card' : 'grid');
	let checkedAt = $state(new Date());

	// Where the reader is in the hierarchy. A tagged union rather than a stack:
	// this is not a history, it is a position, and every view states its own
	// position in full. A stack is approach 3's answer, not this one's.
	type View =
		{ level: 'running' } | { level: 'release'; slug: string } | { level: 'project'; name: string };

	let view = $state<View>({ level: 'running' });

	// Nothing takes the focus on arrival; only a move the reader asked for does.
	let readerMovedScale = $state(false);

	// The SSE feed, mocked. A task finishing reconciles in place at whichever
	// scale is on screen. It keeps running while the reader is up a level, which
	// is deliberate: the count in the heading is still true when they come back.
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

	function openRelease(slug: string) {
		view = { level: 'release', slug };
	}

	function openProject(name: string) {
		view = { level: 'project', name };
	}

	function openRunning() {
		view = { level: 'running' };
		readerMovedScale = true;
	}

	// Coming back from a release onto a running task. The deck positions instantly
	// on mount, so the reader lands on that card rather than watching the deck
	// travel to it — the same reason v4 jumps rather than scrolls.
	function openTask(id: string) {
		const position = tasks.findIndex((task) => task.id === id);
		if (position === -1) return;
		index = position;
		scale = 'card';
		view = { level: 'running' };
		readerMovedScale = true;
	}

	const release = $derived(view.level === 'release' ? findRelease(view.slug) : undefined);
	const project = $derived(view.level === 'project' ? findProject(view.name) : undefined);

	// The heading is still the answer to the page's one question, and it is still
	// the count — including while the reader is a level up, because the running
	// view has not stopped being true just because they looked away from it. The
	// h1 is the page's; the upward views carry an h2.
	const headline = $derived(tasks.length === 0 ? 'Nothing is running' : `${tasks.length} running`);

	const readout = $derived(
		view.level === 'release'
			? 'Release'
			: view.level === 'project'
				? 'Project'
				: scale === 'grid'
					? 'All running'
					: `Reading ${index + 1} of ${tasks.length}`
	);
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	<!-- No footer. This page is exactly one screen tall by design, and a footer
	     below the fold would reintroduce the vertical scroll the deck must not
	     fight. Carried over from v4 and recorded again as a deviation. -->
	<div class="screen">
		<div class="topbar">
			<h1 class="headline" aria-live="polite">{headline}</h1>
			{#if tasks.length > 0}
				<p class="readout" aria-live="polite">{readout}</p>
			{/if}
		</div>

		{#if release}
			<ReleaseView
				{release}
				onOpenRunning={openRunning}
				onOpenProject={openProject}
				onOpenTask={openTask}
			/>
		{:else if project}
			<ProjectView {project} onOpenRunning={openRunning} onOpenRelease={openRelease} />
		{:else if tasks.length === 0}
			<NothingRunning {checkedAt} />
		{:else if scale === 'grid'}
			<!-- No standing line here, on purpose. The grid holds four tasks from four
			     projects, so it has no single position to state, and a line that said
			     something true of all four would have to say "everything", which is not
			     a place. Each cell keeps the project and the release as text, exactly as
			     v4 left them: readable, not tappable, because a 158px cell cannot hold
			     two more 44px targets and because the upward move belongs where the
			     reader has one position. That costs the grid the whole mechanism —
			     going up is only available one tap in. -->
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
				onOpenProject={openProject}
				onOpenRelease={openRelease}
				autofocus={readerMovedScale}
			/>
		{/if}

		<!-- The scale control belongs to the running view. Up a level there is no
		     second scale to move to, so it is not rendered rather than rendered
		     disabled — the same rule v4 applied at zero runners. -->
		{#if view.level === 'running' && tasks.length > 0}
			<ScaleControl {scale} onchange={changeScale} />
		{/if}
	</div>
</PageFrame>

<style>
	.screen {
		/* Status colour, declared once for the page. Nothing else here is allowed
		   to use them: they mean building and verifying, and any third use would
		   make them decoration. A release is not a status and a project is not a
		   status, so neither of the upward views touches these. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);

		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: calc(100dvh - var(--header-height));
		padding: var(--space-4);
		/* Clears the prototyping harness's floating pager, which sits fixed at the
		   bottom of every /dev page. A production page would carry var(--space-4). */
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
