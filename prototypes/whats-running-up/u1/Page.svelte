<script lang="ts">
	/**
	 * What's running — going up — approach 1 of 5: The third scale
	 *
	 * The winning approach gave one set of content two scales and one control to
	 * move between them. This one asks whether that control can simply keep
	 * going: four rungs, closest to widest — one task filling the screen, every
	 * runner at once, the release the task sits in, the project the release sits
	 * in. No new gesture, no second control, no second mental model. If it holds,
	 * it is the cheapest hierarchy this page could have.
	 *
	 * WHERE THE GRID SITS, AND WHY IT IS ON THE LADDER RATHER THAN BESIDE IT
	 *
	 * The grid holds runners from four different projects, so it is not inside
	 * any one release, and going up from it is ambiguous in a way going up from a
	 * card is not. The alternative was a ladder of card → release → project with
	 * the grid hanging off to one side. That was rejected for three reasons.
	 * First, the grid already has a current cell — the winning approach put it
	 * there and marks it aria-current — so "wider, from here" always has exactly
	 * one answer, and the reader can change that answer with an arrow key or a
	 * tap before moving. Second, a ladder the reader descends through the grid
	 * but ascends around it is two different routes wearing one control, which
	 * costs more than the ambiguity it avoids. Third and decisively, a T-shaped
	 * arrangement is not the thing this approach was asked to test: the
	 * hypothesis is that one axis keeps going, and an axis with a branch in it
	 * has already answered no.
	 *
	 * TWO RUNNERS HAVE DIFFERENT LADDERS
	 *
	 * Zooming out of AL-014 reaches prototype-loop-v1 and alfons; out of ATL-118
	 * it reaches dev-surface-v2 and atlas. The control never says "release". Both
	 * halves of it print the actual destination — the kind above, the slug below
	 * — so the ladder above the reader is legible before the tap, and it visibly
	 * changes when they move the current cell in the grid.
	 *
	 * COMING BACK DOWN
	 *
	 * One index owns the whole ladder. Going up never touches it, and nothing at
	 * release or project scale can change it, because nothing up there is
	 * interactive — see ReleaseScale.svelte. So descending is arithmetic rather
	 * than memory: the release on screen is the release of task `index`, and
	 * coming down lands on task `index` in the grid and then on task `index` in
	 * the deck, which positions instantly rather than scrolling past its
	 * neighbours.
	 *
	 * The page does not scroll vertically and drops the footer, both carried over
	 * from the winning approach: a horizontal pager inside a vertically scrolling
	 * document is the known misery.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import NothingRunning from './NothingRunning.svelte';
	import ProjectScale from './ProjectScale.svelte';
	import ReleaseScale from './ReleaseScale.svelte';
	import ScaleLadder from './ScaleLadder.svelte';
	import TaskDeck from './TaskDeck.svelte';
	import TaskGrid from './TaskGrid.svelte';
	import { closer, rungOf, wider, type Destination, type Rung, type Scale } from './scale.ts';
	import { projects, releases } from './hierarchy.ts';
	import { runningTasks, type RunningTask } from './tasks.ts';

	// The states this page lives in. ?empty renders the corpus's usual condition;
	// ?live drives the finish-while-you-watch path; ?card, ?release and ?project
	// land at a rung other than the default so every scale can be seen directly.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');

	function startingScale(): Scale {
		if (query.includes('project')) return 'project';
		if (query.includes('release')) return 'release';
		if (query.includes('card')) return 'card';
		return 'grid';
	}

	let tasks = $state<RunningTask[]>(startEmpty ? [] : runningTasks);
	let index = $state(0);
	let scale = $state<Scale>(startingScale());
	let checkedAt = $state(new Date());

	// Nothing takes the focus on arrival; only a scale the reader asked for does.
	let readerMovedScale = $state(false);

	let releasePanel = $state<{ focus: () => void } | null>(null);
	let projectPanel = $state<{ focus: () => void } | null>(null);

	// The SSE feed, mocked. What matters is not the transport but that a task
	// finishing reconciles in place at whichever rung is on screen. Up the ladder
	// that has a consequence the two-scale version could not have: the release
	// and the project are derived from the current task, so a runner finishing
	// while the reader is reading its project can move them to a different
	// project entirely. It is the honest behaviour — the ladder is the ancestry
	// of a running task, and that task stopped running — but it is a real cost of
	// hanging a hierarchy off a list that changes underneath it.
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

	const currentTask = $derived<RunningTask | undefined>(tasks[index]);
	const currentRelease = $derived(currentTask ? releases[currentTask.release] : undefined);
	const currentProject = $derived(currentTask ? projects[currentTask.project] : undefined);

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

	// The release and project panels have no roving focus of their own the way
	// the grid and the deck do, so the page moves focus onto them itself. Same
	// contract as everywhere else: only when the reader asked for the scale.
	$effect(() => {
		if (!readerMovedScale) return;
		if (scale === 'release') releasePanel?.focus();
		if (scale === 'project') projectPanel?.focus();
	});

	const headline = $derived(tasks.length === 0 ? 'Nothing is running' : `${tasks.length} running`);

	/**
	 * What each rung is called. This is the answer to two runners having
	 * different ladders: every label is read off the task the reader stands on.
	 */
	function rungLabel(step: Scale): Rung {
		if (step === 'card') return { kind: 'task', name: currentTask?.id ?? '' };
		if (step === 'grid') return { kind: 'all', name: `${tasks.length} running` };
		if (step === 'release') return { kind: 'release', name: currentTask?.release ?? '' };
		return { kind: 'project', name: currentTask?.project ?? '' };
	}

	function destination(step: Scale | null): Destination | null {
		return step ? { scale: step, rung: rungLabel(step) } : null;
	}

	// One live region for every job: which rung, what it holds, and the position
	// within it. They are the same sentence, and a second region would talk over
	// this one every time the reader moved. It also stands in for the
	// aria-pressed no segmented control in the library emits.
	// It names the rung but not the release's slug. Measured at 370px: the slug
	// pushed this line to three lines and wrapped the heading with it, and the
	// name is not lost — the panel's own aria-label carries it to a screen
	// reader on arrival, and its heading carries it to everyone else.
	const readout = $derived.by(() => {
		const where = rungOf(scale) + 1;
		if (scale === 'card') return `Scale ${where} of 4 · task ${index + 1} of ${tasks.length}`;
		if (scale === 'grid') return `Scale ${where} of 4 · all running`;
		if (scale === 'release') return `Scale ${where} of 4 · release`;
		return `Scale ${where} of 4 · project`;
	});
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
			<!-- Zero running has no ladder, because the ladder is the ancestry of a
			     task and there is no task. Nothing is rendered disabled: a control
			     that cannot move is furniture pretending to be a control, the same
			     reason the deck drops its pager when it holds one card. What that
			     costs is the finding in the report, not a gap in the build. -->
			<NothingRunning {checkedAt} />
		{:else if scale === 'grid'}
			<TaskGrid
				{tasks}
				{index}
				onSelect={(next) => (index = next)}
				onOpen={openCard}
				autofocus={readerMovedScale}
			/>
		{:else if scale === 'card'}
			<TaskDeck {tasks} {index} onSelect={(next) => (index = next)} autofocus={readerMovedScale} />
		{:else if scale === 'release' && currentRelease && currentTask}
			<ReleaseScale
				bind:this={releasePanel}
				release={currentRelease}
				currentTaskId={currentTask.id}
			/>
		{:else if scale === 'project' && currentProject && currentTask}
			<ProjectScale
				bind:this={projectPanel}
				project={currentProject}
				currentReleaseSlug={currentTask.release}
			/>
		{/if}

		{#if tasks.length > 0}
			<ScaleLadder
				rung={rungOf(scale)}
				closerTo={destination(closer(scale))}
				widerTo={destination(wider(scale))}
				onchange={changeScale}
			/>
		{/if}
	</div>
</PageFrame>

<style>
	.screen {
		/* Status colour, declared once for the page. Nothing else here is allowed
		   to use them: they mean building and verifying, and any third use would
		   make them decoration. The two new rungs deliberately take none of it —
		   a release is not a status. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);

		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: calc(100dvh - var(--header-height));
		padding: var(--space-4);
		/* Clears the prototyping harness's floating pager, which sits fixed at the
		   bottom of every /dev page and would otherwise cover the ladder. A
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
	   line at all four rungs. The ladder changes what is on screen; it does not
	   change what the page is for. */
	/* Never wraps. The readout beside it grew a rung number this round, and left
	   to itself flex would take the width out of the page's one answer first. */
	.headline {
		margin: 0;
		flex: none;
		white-space: nowrap;
		font-family: var(--font-display);
		font-size: clamp(var(--text-lead), 5vw, 1.75rem);
		line-height: 1.1;
		color: var(--text-primary);
	}

	/* Smaller than the winning approach's readout, which said "Reading 3 of 4".
	   This one has to carry the rung as well, and a longer line at caption size
	   pushed the heading onto two lines at 370px. */
	.readout {
		margin: 0;
		min-width: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		text-align: right;
	}

	/* Above a phone the column stops growing, so the rungs stay four in one
	   column rather than collapsing into a wider layout. Collapsing them would
	   remove the only thing this approach is testing at the width where it is
	   easiest to test it. */
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
