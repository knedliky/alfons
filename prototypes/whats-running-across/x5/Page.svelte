<script lang="ts">
	/**
	 * What's running — moving across — approach 5 of 5: One surface, two axes
	 *
	 * The hierarchy is collapsed into one continuous surface. Three panes are
	 * stacked vertically — project over release over task — and the reader is
	 * always standing on exactly one position: a level, and a sibling index at
	 * that level. Vertical moves change level; horizontal moves walk siblings.
	 * There are no pushed screens and no overlays, so there is no stack to
	 * price a lateral jump as a pop-then-push: from anywhere, any of the
	 * dozens of possible jumps is at most one horizontal walk and two vertical
	 * steps, all on the same instrument.
	 *
	 * The decisions that carry it, each a bet that could lose:
	 *
	 * 1. THE DECK'S SWIPE IS THE HORIZONTAL AXIS AT TASK LEVEL. The collision
	 *    the direction names — axis navigation versus the settled swipe — is
	 *    resolved by adoption, not arbitration: the settled behaviour becomes
	 *    one case of the grammar. At release level horizontal walks releases,
	 *    at project level projects, with the same snap track and the same rail.
	 *    The grid stays as the zoomed-out reading of the task level, unchanged.
	 *
	 * 2. VERTICAL IS BUTTONS, NEVER A SWIPE. The page is one screen tall so
	 *    there is no page scroll to fight — but the release and project panels
	 *    scroll vertically inside themselves, so a vertical gesture already
	 *    means something on two of three levels. The axis bar's up/down pair is
	 *    the whole vertical affordance, 48px each, present in every state
	 *    including the empty one.
	 *
	 * 3. THE AXIS IS ANCHORED, WITH PER-LEVEL MEMORY. Up from a task lands on
	 *    the release that CONTAINS it; up again on that release's project.
	 *    Down re-anchors only when the level above points at something real:
	 *    descending into a release that holds a runner lands on that runner,
	 *    descending from a release with no runner returns the task level
	 *    exactly as the reader left it. Identity survives every move that has
	 *    an identity to preserve.
	 *
	 * 4. HISTORY: VERTICAL MOVES PUSH, HORIZONTAL MOVES REPLACE. See axis.ts
	 *    for the defence. Back is the browser's — edge-swipe, hardware button
	 *    and Escape are the same back — and it retraces level changes, landing
	 *    each time on the sibling the reader was reading when they left.
	 *
	 * 5. NO PANE IS EVER UNMOUNTED. Off-level panes slide away by transform and
	 *    go inert; their scroll positions and the deck's offset survive, which
	 *    is what makes "coming back down lands where you left" true by
	 *    construction. Reduced motion turns the slide into a cut.
	 *
	 * And the honest costs, stated here rather than buried: the axis bar
	 * spends 48px of a 370px-wide phone's height on every state of the page,
	 * which the stack model only spent once a screen was pushed; and a
	 * horizontal walk at release level moves through EVERY release in the
	 * corpus in ledger order, not just the interesting ones, so reaching a far
	 * release can be seven swipes (the ticks jump straight there, but a tick
	 * is a target, not a name).
	 */
	import { Header, PageFrame } from '@alfons/design';
	import AxisBar from './AxisBar.svelte';
	import NothingRunning from './NothingRunning.svelte';
	import PanelTrack from './PanelTrack.svelte';
	import ProjectPanel from './ProjectPanel.svelte';
	import ReleasePanel from './ReleasePanel.svelte';
	import ScaleControl from './ScaleControl.svelte';
	import TaskDeck from './TaskDeck.svelte';
	import TaskGrid from './TaskGrid.svelte';
	import type { Scale } from './scale.ts';
	import { decodePosition, encodePosition, paneOffset, type Level, type Position } from './axis.ts';
	import { projects, projectIndexOf, releases, releaseIndexOf, releasesOf } from './corpus.ts';
	import { runningTasks, type RunningTask } from './tasks.ts';

	// The two states this page lives in. ?empty renders the corpus's usual
	// condition; ?live drives the finish-while-you-watch path below. ?card lands
	// at the other scale, so the choice of landing state can be seen both ways.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');

	let tasks = $state<RunningTask[]>(startEmpty ? [] : runningTasks);
	let checkedAt = $state(new Date());
	let scale = $state<Scale>(query.includes('card') ? 'card' : 'grid');

	// The position: one level, one sibling index per level. The indices that are
	// not the current level's are the per-level memory — where the reader last
	// stood there, or where the axis last anchored.
	let level = $state<Level>('task');
	let taskIndex = $state(0);
	let releaseIndex = $state(0);
	let projectIndex = $state(0);

	// Nothing takes the focus on arrival; only a move the reader asked for does.
	let readerMovedScale = $state(false);

	// How many entries this session has pushed and not yet popped, so Escape
	// only calls history.back() when back stays on this page. Approximate — the
	// forward button confuses it — and failing safe: at zero, Escape does
	// nothing rather than throwing the reader out of the page.
	let pushesAlive = 0;

	function anchorAboveTask(index: number) {
		const task = tasks[index];
		if (!task) return;
		const r = releaseIndexOf(task.release);
		if (r >= 0) releaseIndex = r;
		const p = projectIndexOf(task.project);
		if (p >= 0) projectIndex = p;
	}

	function anchorAroundRelease(index: number) {
		const release = releases[index];
		if (!release) return;
		const p = projectIndexOf(release.project);
		if (p >= 0) projectIndex = p;
		const runner = tasks.findIndex((task) => task.release === release.slug);
		if (runner >= 0) taskIndex = runner;
	}

	// Arrival: the hash is a position, applied once, with the other levels
	// anchored from it so the first vertical move already knows where it lands.
	if (typeof location !== 'undefined') {
		const arrived = decodePosition(location.hash);
		if (arrived.level === 'task') {
			if (arrived.id !== null) {
				const i = tasks.findIndex((task) => task.id === arrived.id);
				if (i >= 0) taskIndex = i;
			}
			anchorAboveTask(taskIndex);
		} else if (arrived.level === 'release') {
			const i = releaseIndexOf(arrived.slug);
			if (i >= 0) {
				releaseIndex = i;
				level = 'release';
				anchorAroundRelease(i);
			} else {
				anchorAboveTask(taskIndex);
			}
		} else {
			const i = projectIndexOf(arrived.name);
			if (i >= 0) {
				projectIndex = i;
				level = 'project';
				const below = releasesOf(projects[i].name)[0];
				if (below) {
					const r = releaseIndexOf(below.slug);
					if (r >= 0) releaseIndex = r;
				}
			} else {
				anchorAboveTask(taskIndex);
			}
		}
	}

	function baseUrl(): string {
		return `${location.pathname}${location.search}`;
	}

	function position(): Position {
		if (level === 'task') return { level: 'task', id: tasks[taskIndex]?.id ?? null };
		if (level === 'release') return { level: 'release', slug: releases[releaseIndex].slug };
		return { level: 'project', name: projects[projectIndex].name };
	}

	function replacePosition() {
		history.replaceState({}, '', baseUrl() + encodePosition(position()));
	}

	// The three panes, so a vertical move can hand the focus to where it landed.
	let taskPane = $state<HTMLElement | null>(null);
	let releasePane = $state<HTMLElement | null>(null);
	let projectPane = $state<HTMLElement | null>(null);

	function focusPane() {
		// After the pane beneath the reader has stopped being inert: an element
		// inside an inert subtree cannot take the focus.
		requestAnimationFrame(() => {
			const pane = level === 'task' ? taskPane : level === 'release' ? releasePane : projectPane;
			pane?.focus();
		});
	}

	function pushPosition() {
		history.pushState({}, '', baseUrl() + encodePosition(position()));
		pushesAlive += 1;
		focusPane();
	}

	// One replaceState on arrival, so a hashless load still carries its position
	// and a typo'd hash is corrected to the position it resolved to.
	$effect(() => {
		replacePosition();
	});

	// ---- The vertical axis ----

	function goUp() {
		if (level === 'task') {
			// Anchored when a task is under the reader; the memory of the release
			// level when nothing is — which is the empty state's way up.
			if (tasks.length > 0) anchorAboveTask(taskIndex);
			level = 'release';
		} else if (level === 'release') {
			const p = projectIndexOf(releases[releaseIndex].project);
			if (p >= 0) projectIndex = p;
			level = 'project';
		} else {
			return;
		}
		pushPosition();
	}

	/** The release the down control leaves a project toward: the remembered one
	 *  when it belongs to this project, else the project's first, else nothing. */
	const releaseBelowProject = $derived.by(() => {
		const own = releasesOf(projects[projectIndex].name);
		if (own.length === 0) return null;
		const remembered = releases[releaseIndex];
		return remembered && remembered.project === projects[projectIndex].name
			? remembered
			: own[0];
	});

	/** The runner the down control leaves a release toward, when it has one. */
	const runnerBelowRelease = $derived(
		tasks.find((task) => task.release === releases[releaseIndex].slug) ?? null
	);

	function goDown() {
		if (level === 'project') {
			const below = releaseBelowProject;
			if (!below) return;
			const r = releaseIndexOf(below.slug);
			if (r >= 0) releaseIndex = r;
			level = 'release';
		} else if (level === 'release') {
			const runner = runnerBelowRelease;
			if (runner) {
				const i = tasks.findIndex((task) => task.id === runner.id);
				if (i >= 0) taskIndex = i;
			}
			level = 'task';
		} else {
			return;
		}
		pushPosition();
	}

	// Diagonal jumps offered by the panels themselves: a named row is a vertical
	// move with the anchor set first, so it is still the same grammar.
	function diveToRelease(slug: string) {
		const i = releaseIndexOf(slug);
		if (i < 0) return;
		releaseIndex = i;
		level = 'release';
		pushPosition();
	}

	function diveToTask(id: string) {
		const i = tasks.findIndex((task) => task.id === id);
		if (i < 0) return;
		taskIndex = i;
		readerMovedScale = true;
		scale = 'card';
		level = 'task';
		pushPosition();
	}

	// ---- The horizontal axis: replace, never push ----

	function selectTask(next: number) {
		taskIndex = next;
		replacePosition();
	}

	function selectRelease(next: number) {
		releaseIndex = next;
		replacePosition();
	}

	function selectProject(next: number) {
		projectIndex = next;
		replacePosition();
	}

	function onPopState() {
		pushesAlive = Math.max(0, pushesAlive - 1);
		const landed = decodePosition(location.hash);
		if (landed.level === 'task') {
			if (landed.id !== null) {
				const i = tasks.findIndex((task) => task.id === landed.id);
				if (i >= 0) taskIndex = i;
			}
			level = 'task';
		} else if (landed.level === 'release') {
			const i = releaseIndexOf(landed.slug);
			if (i >= 0) releaseIndex = i;
			level = 'release';
		} else {
			const i = projectIndexOf(landed.name);
			if (i >= 0) projectIndex = i;
			level = 'project';
		}
		focusPane();
	}

	// The SSE feed, mocked. What matters is that a task finishing reconciles in
	// place at whichever level and scale is on screen: the task level shrinks,
	// the release panels' running counts change, and the index clamps so the
	// reader is left looking at something that still exists.
	$effect(() => {
		if (!simulateFeed) return;
		const timer = setTimeout(() => {
			tasks = tasks.slice(0, -1);
			checkedAt = new Date();
		}, 6000);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		if (taskIndex > tasks.length - 1) taskIndex = Math.max(0, tasks.length - 1);
	});

	function changeScale(next: Scale) {
		if (next === scale) return;
		readerMovedScale = true;
		scale = next;
	}

	function openCard(at: number) {
		taskIndex = at;
		readerMovedScale = true;
		scale = 'card';
		replacePosition();
	}

	// The page's one question, answered in the page's one heading FROM EVERY
	// LEVEL. The heading does not change when the reader climbs: "is anything
	// running" stays readable in about a second while they stand three projects
	// away, and the panel under them names the place. That is the point of one
	// surface — position and answer are two different facts, held apart.
	const headline = $derived(tasks.length === 0 ? 'Nothing is running' : `${tasks.length} running`);

	// One live region for position. Level word, sibling index, place name — the
	// same fact the aria-hidden indicator draws. It also stands in for the
	// aria-pressed ToggleGroup does not emit.
	const readout = $derived.by(() => {
		if (level === 'release')
			return `Release level, ${releaseIndex + 1} of ${releases.length}: ${releases[releaseIndex].slug}`;
		if (level === 'project')
			return `Project level, ${projectIndex + 1} of ${projects.length}: ${projects[projectIndex].name}`;
		if (tasks.length === 0) return 'Task level, empty';
		return scale === 'grid'
			? `Task level, all ${tasks.length} running`
			: `Task level, reading ${taskIndex + 1} of ${tasks.length}`;
	});

	const siblingIndex = $derived(
		level === 'task' ? taskIndex : level === 'release' ? releaseIndex : projectIndex
	);
	const siblingCount = $derived(
		level === 'task' ? tasks.length : level === 'release' ? releases.length : projects.length
	);

	// The axis bar names destinations, not directions (the back-control finding,
	// kept): what up lands on and what down lands on, by name.
	const upName = $derived.by(() => {
		if (level === 'project') return null;
		if (level === 'release') return releases[releaseIndex].project;
		return tasks.length > 0 ? tasks[taskIndex]?.release ?? null : releases[releaseIndex].slug;
	});

	const downName = $derived.by(() => {
		if (level === 'task') return null;
		if (level === 'release') {
			if (runnerBelowRelease) return runnerBelowRelease.id;
			return tasks.length > 0 ? 'the running view' : 'nothing running';
		}
		return releaseBelowProject?.slug ?? null;
	});

	const projectItems = $derived(
		projects.map((project) => ({ key: project.name, label: project.name }))
	);
	const releaseItems = $derived(
		releases.map((release) => ({ key: release.slug, label: release.slug }))
	);
</script>

<svelte:window
	onpopstate={onPopState}
	onkeydown={(event) => {
		// Escape is back, and back is the browser's — but only while back stays
		// on this page. The harness's approach pager owns [ and ]; arrows are
		// claimed by the rails' own controls, never globally.
		if (event.key !== 'Escape') return;
		if (pushesAlive === 0) return;
		event.preventDefault();
		history.back();
	}}
/>

<div class="page">
	<PageFrame>
		{#snippet header()}<Header />{/snippet}
		<!-- No footer, carried from two rounds of the same finding: the page is
		     exactly one screen tall by design, and a footer below the fold would
		     reintroduce the vertical scroll the surface must not fight. -->
		<div class="screen">
			<div class="topbar">
				<h1 class="headline" aria-live="polite">{headline}</h1>
				<p class="readout" aria-live="polite">{readout}</p>
			</div>

			<AxisBar
				{level}
				{siblingIndex}
				{siblingCount}
				{upName}
				{downName}
				onUp={goUp}
				onDown={goDown}
			/>

			<div class="viewport">
				<!-- The three panes of the one surface, stacked in level order and
				     slid by transform. Never unmounted: an off-level pane keeps its
				     tracks laid out and its scroll offsets alive, and is inert so
				     none of its controls exist for keyboard or screen reader. -->
				<section
					class="pane"
					bind:this={projectPane}
					tabindex="-1"
					aria-label="Project level"
					inert={level !== 'project'}
					style="--offset: {paneOffset('project', level)}"
				>
					<PanelTrack
						items={projectItems}
						index={projectIndex}
						kind="project"
						onSelect={selectProject}
					>
						{#snippet panel(at: number)}
							<ProjectPanel
								project={projects[at]}
								releases={releasesOf(projects[at].name)}
								onDiveToRelease={diveToRelease}
							/>
						{/snippet}
					</PanelTrack>
				</section>

				<section
					class="pane"
					bind:this={releasePane}
					tabindex="-1"
					aria-label="Release level"
					inert={level !== 'release'}
					style="--offset: {paneOffset('release', level)}"
				>
					<PanelTrack
						items={releaseItems}
						index={releaseIndex}
						kind="release"
						onSelect={selectRelease}
					>
						{#snippet panel(at: number)}
							<ReleasePanel release={releases[at]} onDiveToTask={diveToTask} />
						{/snippet}
					</PanelTrack>
				</section>

				<section
					class="pane"
					bind:this={taskPane}
					tabindex="-1"
					aria-label="Task level"
					inert={level !== 'task'}
					style="--offset: {paneOffset('task', level)}"
				>
					{#if tasks.length === 0}
						<NothingRunning {checkedAt} />
					{:else if scale === 'grid'}
						<TaskGrid
							{tasks}
							index={taskIndex}
							onSelect={selectTask}
							onOpen={openCard}
							autofocus={readerMovedScale}
						/>
					{:else}
						<TaskDeck
							{tasks}
							index={taskIndex}
							onSelect={selectTask}
							autofocus={readerMovedScale}
						/>
					{/if}

					{#if tasks.length > 0}
						<ScaleControl {scale} onchange={changeScale} />
					{/if}
				</section>
			</div>
		</div>
	</PageFrame>
</div>

<style>
	.page {
		/* Status colour, declared once for every level this surface holds. The
		   two motion statuses keep the meanings the task level gave them; the six
		   that follow exist only because the levels above show whole releases
		   honestly. Nothing else here may use any of them: a level is not a
		   status and a sibling position is not a status. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);
	}

	.screen {
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

	.headline {
		margin: 0;
		font-family: var(--font-display);
		/* The type scale stops at --text-lead; the ceiling is a literal no token
		   would have prevented. Carried from the winning approach. */
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
		overflow: hidden;
		text-overflow: ellipsis;
		min-width: 0;
	}

	/* The window onto the surface. `clip`, not `hidden`: focusing a pane must
	   not let the browser scroll this box to "reveal" it — clip forbids even
	   programmatic scrolling, hidden does not. */
	.viewport {
		position: relative;
		flex: 1;
		min-height: 0;
		overflow: clip;
	}

	/* Each pane positions itself relative to the current level and slides there.
	   Transform, not top: the panes never re-lay-out, so their scroll offsets
	   and the deck's position survive every move. */
	.pane {
		/* Set per-pane from markup; declared here so the fallback is the current
		   level rather than an unresolved var (and so unknown-token can see it). */
		--offset: 0;
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		transform: translateY(calc(var(--offset) * 100%));
		transition: transform var(--transition-slow);
	}

	.pane:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: calc(var(--space-1) * -1);
	}

	/* Position cuts instead of slides. The position still changes; only the
	   travel is removed, so no intermediate level is replayed. */
	@media (prefers-reduced-motion: reduce) {
		.pane {
			transition: none;
		}
	}

	/* Above a phone the surface stops growing in both axes, carried from the
	   winning approach: a single card stretched across 1280px is a poster. The
	   two scales stay two, and the levels stay three, in the same column. */
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
