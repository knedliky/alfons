<script lang="ts">
	/**
	 * What's running — moving across — approach 1 of 5: The stack grows rails
	 *
	 * Direction: keep last round's winning push-stack exactly as it stands and
	 * add the smallest thing that could dissolve its lateral cost — a persistent
	 * standing rail naming task, release and project, present on every screen
	 * including the pushed ones, so any level is one tap from anywhere and back
	 * still means what the browser says it means. Tests whether jumping-around
	 * is solved by shortcuts over a stack rather than by replacing the stack,
	 * and what a permanent rail costs a 370px page.
	 *
	 * Everything from Pushed (whats-running-up/u3) is inherited unchanged: the
	 * two scales, the browser-owned stack in the location hash, screens that
	 * stay mounted and inert beneath the top frame, the relaxation that lets a
	 * release screen show every status, and the two-frame bound on depth. Its
	 * deviations are settled findings and are not re-litigated here.
	 *
	 * What the rail adds is decided by three history rules, because a shortcut
	 * over a stack is exactly where history goes dishonest if it is not thought
	 * through:
	 *
	 * 1. A JUMP DOWN IS history.go(delta), NEVER A SEQUENCE OF POPS. Tapping a
	 *    rail slot whose place is already beneath you on the stack moves there
	 *    in one popstate — no intermediate screen renders, because the browser
	 *    fires one event for the whole distance and this page renders the stack
	 *    it decodes, not the journey. The entries beneath the landing survive
	 *    untouched, so back afterwards means exactly what it meant before.
	 *
	 * 2. A JUMP TO SOMEWHERE NEW IS ONE PUSH, NEVER A SYNTHESISED PATH. From
	 *    the grid, tapping the rail's release slot pushes the release directly:
	 *    the stack records where the reader actually went, not the card screen
	 *    they skipped. Back from there returns to the grid, which is where they
	 *    actually were. Inventing intermediate entries so the stack "looks
	 *    hierarchical" would make back replay screens the reader never chose.
	 *
	 * 3. NOTHING TOUCHES HISTORY EXCEPT pushState AND go(). The rail has no
	 *    replaceState tricks and no touch handlers, so the phone's edge-swipe
	 *    is never intercepted and never lied to: every entry it pops is a place
	 *    the reader stood.
	 *
	 * The rail's naming is the current runner's lineage — the task under the
	 * reader's selection, its release, its project — not the lineage of the
	 * screen on top. The screen names itself in its own title; the rail is the
	 * thread home. A slot naming the place the reader is standing renders as
	 * text marked HERE, which is Pushed's own no-forward-to-where-you-stand
	 * rule wearing the rail's clothes.
	 *
	 * The two conceded edges, answered:
	 * - FROM THE GRID, going up is now one tap. The rail names the selected
	 *   cell's release and project at all times, so the cell keeps its single
	 *   action and the up moves live on the rail.
	 * - THE EMPTY STATE keeps the rail, honestly empty: no task and no release
	 *   exist, and those slots say so rather than vanishing. The project slot
	 *   becomes "all projects" — an index screen of every project, from which
	 *   releases open as usual — so the page's usual state is no longer a dead
	 *   end.
	 *
	 * Brief (in one line of the full text): phone-first from 370px, is anything
	 * running right now, building and verifying only in the running view, dark
	 * only, status colour reserved for state, the empty state is the usual
	 * state, real back always works, prefers-reduced-motion respected. The full
	 * brief is in round.json beside this file.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import { findProject, findRelease, projects, releasesOf } from './corpus.ts';
	import NothingRunning from './NothingRunning.svelte';
	import ProjectIndexScreen from './ProjectIndexScreen.svelte';
	import ProjectScreen from './ProjectScreen.svelte';
	import PushedScreen from './PushedScreen.svelte';
	import ReleaseScreen from './ReleaseScreen.svelte';
	import ScaleControl from './ScaleControl.svelte';
	import StandingRail, { type RailSlot } from './StandingRail.svelte';
	import TaskDeck from './TaskDeck.svelte';
	import TaskGrid from './TaskGrid.svelte';
	import type { Scale } from './scale.ts';
	import { alreadyOpen, decodeStack, encodeStack, sameFrame, type Frame } from './stack.ts';
	import { runningTasks, type RunningTask } from './tasks.ts';

	// The two states this page lives in. ?empty renders the corpus's usual
	// condition; ?live drives the finish-while-you-watch path below. ?card lands
	// at the other scale, so the choice of landing state can be seen both ways.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');

	let tasks = $state<RunningTask[]>(startEmpty ? [] : runningTasks);
	let index = $state(0);
	let scale = $state<Scale>(query.includes('card') ? 'card' : 'grid');
	let checkedAt = $state(new Date());

	// Nothing takes the focus on arrival; only a scale the reader asked for does.
	let readerMovedScale = $state(false);

	// The stack, mirrored from history. History is the authority: every change
	// goes through pushState or go(), and this only ever reads what landed.
	let stack = $state<Frame[]>(typeof location === 'undefined' ? [] : decodeStack(location.hash));

	// Parallel to the stack, and deliberately not part of it: the control that
	// opened each frame, so back can hand the focus straight back to it. It is
	// not encoded in the URL — a stack restored from a reload has no opener, and
	// inventing one would mean focusing something the reader never touched.
	let openers: (HTMLElement | null)[] = [];

	// The frames themselves, for the case below where the opener no longer exists.
	let frames = $state<({ focus: () => void } | null)[]>([]);

	// Read once. The transition needs the answer at the moment it starts, and a
	// media query listener would be a subscription for a value that changes only
	// when the reader changes an operating system setting.
	const reducedMotion =
		typeof matchMedia === 'undefined'
			? false
			: matchMedia('(prefers-reduced-motion: reduce)').matches;

	function baseUrl(): string {
		return `${location.pathname}${location.search}`;
	}

	/**
	 * A stack restored from the URL has no history entries beneath it, so back
	 * would leave the page entirely from a screen the reader never navigated to.
	 * Rebuilding those entries on arrival is what makes a restored stack behave
	 * like one the reader walked into — and it is also what keeps rule 1 true
	 * after a reload: a rail jump down needs real entries to go() across.
	 */
	$effect(() => {
		const restored = decodeStack(location.hash);
		if (restored.length === 0) return;
		history.replaceState({}, '', baseUrl());
		for (let depth = 1; depth <= restored.length; depth += 1) {
			history.pushState({}, '', baseUrl() + encodeStack(restored.slice(0, depth)));
		}
	});

	function push(frame: Frame, opener: HTMLElement | null) {
		if (alreadyOpen(stack, frame)) return;
		const next = [...stack, frame];
		openers = [...openers, opener];
		history.pushState({}, '', baseUrl() + encodeStack(next));
		stack = next;
	}

	function back() {
		history.back();
	}

	/**
	 * The rail's one verb. Where the target already lives on the stack, this is
	 * a move DOWN it — one go(), one popstate, no intermediate screens (rule 1).
	 * Where it does not, it is one push recording where the reader actually
	 * went (rule 2). A tap on the place the reader is standing never reaches
	 * here, because that slot is rendered as text.
	 */
	function jumpTo(target: Frame | null, opener: HTMLElement) {
		if (target === null) {
			// The running view is the root beneath every frame.
			if (stack.length > 0) history.go(-stack.length);
			return;
		}
		const at = stack.findIndex((frame) => sameFrame(frame, target));
		if (at === stack.length - 1 && at !== -1) return;
		if (at !== -1) {
			history.go(at + 1 - stack.length);
			return;
		}
		push(target, opener);
	}

	function onPopState() {
		const next = decodeStack(location.hash);
		const returningTo = openers[next.length] ?? null;
		openers = openers.slice(0, next.length);
		stack = next;
		// After the frame is gone and the screen beneath it is no longer inert: an
		// element inside an inert subtree cannot take the focus, and the pop that
		// removed the frame is what lifts the inertness.
		requestAnimationFrame(() => {
			if (returningTo?.isConnected) {
				returningTo.focus();
				return;
			}
			// The opener can be gone (a release screen renders its project as plain
			// text while that project is open above it, so pushing the project
			// deletes the button that did the pushing), and after a reload or a
			// multi-frame rail jump there was never an opener recorded for the
			// landing. The screen the reader has returned to takes the focus
			// instead, which also re-announces where they are.
			frames[next.length - 1]?.focus();
		});
	}

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

	// The word on the back control names where back GOES, not what it undoes.
	function backLabelAt(depth: number): string {
		if (depth === 0) return 'Running';
		const beneath = stack[depth - 1];
		if (beneath.kind === 'release') return beneath.slug;
		if (beneath.kind === 'project') return beneath.name;
		return 'All projects';
	}

	// The thread the rail names: the runner under the reader's selection. The
	// selection freezes while a screen is pushed (the running view is inert),
	// so the thread cannot change under the reader mid-journey.
	const anchor = $derived(tasks.length > 0 ? tasks[Math.min(index, tasks.length - 1)] : null);
	const top = $derived(stack.length > 0 ? stack[stack.length - 1] : null);

	const railSlots = $derived.by<RailSlot[]>(() => {
		if (!anchor) {
			// The empty thread. Task and release honestly do not exist — there is
			// no current task to name — and the project slot widens its meaning to
			// the index of all of them, so the page's usual state still goes
			// somewhere.
			const indexFrame: Frame = { kind: 'index' };
			const onIndex = top !== null && sameFrame(top, indexFrame);
			return [
				// With no task to name, the first slot names the level instead — the
				// running view is still a place, and from a pushed screen it must
				// still be one tap away or the rail's promise has an exception.
				stack.length === 0
					? { rank: 'Running', name: 'nothing yet', state: 'here' }
					: {
							rank: 'Running',
							name: 'nothing yet',
							state: 'go',
							onGo: (opener) => jumpTo(null, opener)
						},
				{ rank: 'Release', name: '—', state: 'none', note: 'no task' },
				onIndex
					? { rank: 'Projects', name: `all ${projects.length}`, state: 'here' }
					: {
							rank: 'Projects',
							name: `all ${projects.length}`,
							state: 'go',
							onGo: (opener) => jumpTo(indexFrame, opener)
						}
			];
		}
		const releaseFrame: Frame = { kind: 'release', slug: anchor.release };
		const projectFrame: Frame = { kind: 'project', name: anchor.project };
		const onRelease = top !== null && sameFrame(top, releaseFrame);
		const onProject = top !== null && sameFrame(top, projectFrame);
		return [
			stack.length === 0
				? { rank: 'Task', name: anchor.id, state: 'here' }
				: {
						rank: 'Task',
						name: anchor.id,
						state: 'go',
						onGo: (opener) => jumpTo(null, opener)
					},
			onRelease
				? { rank: 'Release', name: anchor.release, state: 'here' }
				: {
						rank: 'Release',
						name: anchor.release,
						state: 'go',
						onGo: (opener) => jumpTo(releaseFrame, opener)
					},
			onProject
				? { rank: 'Project', name: anchor.project, state: 'here' }
				: {
						rank: 'Project',
						name: anchor.project,
						state: 'go',
						onGo: (opener) => jumpTo(projectFrame, opener)
					}
		];
	});
</script>

<svelte:window
	onpopstate={onPopState}
	onkeydown={(event) => {
		if (stack.length === 0) return;
		if (event.key !== 'Escape') return;
		event.preventDefault();
		back();
	}}
/>

<!-- The frames are siblings of PageFrame, not children of it, and that is not a
     style preference. PageFrame's column sets `position: relative; z-index: 1`,
     which makes the whole shell — Header included — one stacking context; a
     fixed screen rendered inside it can never rise above the Header at
     --z-widget. Inherited finding from Pushed, measured there at 370px. The
     rail is a sibling too, above the frames at --z-toast, and rendered ONCE:
     it belongs to the page, not to any screen, which is what keeps it out of
     every inert subtree and identical across a push. -->
<div class="page">
	<PageFrame>
		{#snippet header()}<Header />{/snippet}
		<!-- No footer. The running view is exactly one screen tall by design, and a
		     footer below the fold would reintroduce the vertical scroll the deck
		     must not fight. Inherited deviation from the seeded shell. -->
		<!-- Inert, not hidden: hiding the running view would cost the deck its
		     scroll position, which is the one thing this approach must not lose
		     across a push. Inherited from Pushed. -->
		<div class="screen" inert={stack.length > 0}>
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
					onOpenRelease={(task, opener) => push({ kind: 'release', slug: task.release }, opener)}
					onOpenProject={(task, opener) => push({ kind: 'project', name: task.project }, opener)}
					autofocus={readerMovedScale}
				/>
			{/if}

			{#if tasks.length > 0}
				<ScaleControl {scale} onchange={changeScale} />
			{/if}
		</div>
	</PageFrame>

	{#each stack as frame, depth (encodeStack(stack.slice(0, depth + 1)))}
		<!-- Every frame stays mounted and every frame but the top is inert, for the
		     same reason the running view is: a frame that unmounts loses its scroll
		     position, and returning to a release screen scrolled back to the top is
		     the page losing your place one level further in. -->
		<div class="frame" inert={depth < stack.length - 1}>
			{#if frame.kind === 'release'}
				{@const release = findRelease(frame.slug)}
				{#if release}
					<PushedScreen
						bind:this={frames[depth]}
						rank="Release"
						name={release.slug}
						backLabel={backLabelAt(depth)}
						{reducedMotion}
						onBack={back}
					>
						<ReleaseScreen
							{release}
							projectIsOpen={alreadyOpen(stack, { kind: 'project', name: release.project })}
							onOpenProject={(opener) => push({ kind: 'project', name: release.project }, opener)}
						/>
					</PushedScreen>
				{/if}
			{:else if frame.kind === 'project'}
				{@const project = findProject(frame.name)}
				{#if project}
					<PushedScreen
						bind:this={frames[depth]}
						rank="Project"
						name={project.name}
						backLabel={backLabelAt(depth)}
						{reducedMotion}
						onBack={back}
					>
						<ProjectScreen
							{project}
							releases={releasesOf(project.name)}
							isOpen={(slug) => alreadyOpen(stack, { kind: 'release', slug })}
							onOpenRelease={(slug, opener) => push({ kind: 'release', slug }, opener)}
						/>
					</PushedScreen>
				{/if}
			{:else}
				<PushedScreen
					bind:this={frames[depth]}
					rank="Projects"
					name="Everything with a home"
					backLabel={backLabelAt(depth)}
					{reducedMotion}
					onBack={back}
				>
					<ProjectIndexScreen
						{projects}
						releaseCount={(name) => releasesOf(name).length}
						onOpenProject={(name, opener) => push({ kind: 'project', name }, opener)}
					/>
				</PushedScreen>
			{/if}
		</div>
	{/each}

	<StandingRail slots={railSlots} />
</div>

<style>
	.page {
		/* Status colour, declared once for every screen this page can show. The
		   two motion statuses keep the meanings the running view gave them; the
		   six that follow exist only because a release screen shows a whole
		   release, and a release is mostly not running. Nothing else here may use
		   any of them: a release is not a status and a project is not a status,
		   and the rail takes none of them. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);

		/* What the rail costs, stated as one number: the slots (48px targets plus
		   the 4px HERE rule and 8px of breathing room) on top of the harness
		   clearance Pushed already paid. Every screen clears this instead of the
		   old pager clearance, so the price is paid once and identically
		   everywhere. */
		--rail-clearance: calc(var(--space-8) + var(--space-7) + var(--space-5));
	}

	.screen {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: calc(100dvh - var(--header-height));
		padding: var(--space-4);
		/* Clears the standing rail, which carries the harness's pager clearance
		   inside it. A production page would clear only the rail's slots. */
		padding-bottom: var(--rail-clearance);
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
	   across 1280px is a poster. The two scales stay two, in the same column, and
	   the grid becomes the one most readers stay at. Inherited from the winner. */
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
