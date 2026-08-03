<script lang="ts">
	/**
	 * What's running — going up — approach 3 of 5: Pushed
	 *
	 * The running view is the winning approach, kept: a grid of every runner as
	 * the landing state, one full-screen card as the second scale, one control
	 * between them, and identity surviving the move in both directions.
	 *
	 * What this approach adds is the phone's oldest idea. An ancestor is a
	 * destination, tapping it pushes a screen, and back pops it. Nothing is
	 * merged into the card and nothing is layered over it: the release is a
	 * place, and you go there.
	 *
	 * Three decisions carry it, and each is a bet that could lose.
	 *
	 * 1. THE STACK IS THE BROWSER'S. Every push is a `history.pushState`, every
	 *    back is `history.back()`. The phone's edge-swipe, the hardware back
	 *    button, the desktop back button and the control on screen are then the
	 *    same back, and the stack survives a reload because it is in the URL. An
	 *    in-page stack with a rendered control would have been less work and a
	 *    trap: a reader swipes from the edge of a phone screen without deciding
	 *    to, and if that gesture leaves the page while the page thinks it is
	 *    three screens deep, the design has lied.
	 *
	 *    It goes in the LOCATION HASH. The prototyping harness routes on
	 *    `location.pathname` and would unmount this page the moment the path
	 *    moved; the query already carries `?empty` and `?live`. The hash moves
	 *    neither and pops the same way. A production page would push a real path.
	 *
	 * 2. THE RUNNING VIEW IS NEVER UNMOUNTED. A pushed screen is fixed, opaque
	 *    and covers it; the view underneath stays laid out and is marked `inert`.
	 *    So back does not restore the reader's place — it never lost it. The deck
	 *    is a scroll container and `display: none` zeroes its width and its
	 *    offset, which would land a reader who left from card three back on card
	 *    one. Card three is where they were, so card three is where they return,
	 *    and focus goes back to the exact destination button they tapped.
	 *
	 * 3. THE DEPTH IS BOUNDED BY A RULE, NOT BY A NUMBER. A release names its
	 *    project and a project lists its releases, so the two point at each other
	 *    and the stack could grow forever. An ancestor already on the stack is
	 *    rendered as plain text rather than as a destination, which caps the
	 *    stack at two frames without a magic constant anywhere.
	 *
	 * And the honest cost, stated here rather than buried in the report: on the
	 * landing state there is nothing to tap. A grid cell is a nameplate with one
	 * action, so going up from the grid is two taps — open the card, then open
	 * the release. And when nothing is running, which is most of the time, there
	 * is no way up at all, because there is no task to go up from. The upward
	 * move exists only where a task is being read.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import { findProject, findRelease, releasesOf } from './corpus.ts';
	import NothingRunning from './NothingRunning.svelte';
	import ProjectScreen from './ProjectScreen.svelte';
	import PushedScreen from './PushedScreen.svelte';
	import ReleaseScreen from './ReleaseScreen.svelte';
	import ScaleControl from './ScaleControl.svelte';
	import TaskDeck from './TaskDeck.svelte';
	import TaskGrid from './TaskGrid.svelte';
	import type { Scale } from './scale.ts';
	import { alreadyOpen, decodeStack, encodeStack, type Frame } from './stack.ts';
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
	// goes through pushState or back(), and this only ever reads what landed.
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
	 * like one the reader walked into.
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
			// The opener can be gone, and it is this approach's own rule that
			// destroys it: a release screen renders its project as plain text while
			// that project is open above it, so pushing the project deletes the
			// button that did the pushing. Caught by driving the page, not by
			// reading it — focus landed on <body>, which is the browser's way of
			// saying the reader is now nowhere. The screen the reader has returned
			// to takes the focus instead, which also re-announces where they are.
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
	// "Back" alone on the second frame would leave the reader guessing whether
	// they land on the release beneath it or on the deck.
	function backLabelAt(depth: number): string {
		if (depth === 0) return 'Running';
		const beneath = stack[depth - 1];
		return beneath.kind === 'release' ? beneath.slug : beneath.name;
	}
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
     fixed screen rendered inside it can never rise above the Header, which sits
     at --z-widget. Measured, not reasoned: at 370px the site wordmark
     intercepted every click aimed at the back control, so the one control a
     pushed screen must have was unreachable. Rendered outside the shell, a
     --z-overlay screen clears the whole of it. Reported as a library finding —
     a full-screen push has nowhere legal to stand inside PageFrame. -->
<div class="page">
	<PageFrame>
		{#snippet header()}<Header />{/snippet}
		<!-- No footer. The running view is exactly one screen tall by design, and a
		     footer below the fold would reintroduce the vertical scroll the deck
		     must not fight. Recorded as a deviation from the seeded shell. -->
		<!-- Inert, not hidden. See the note on the stack above: hiding the running
		     view would cost the deck its scroll position, which is the one thing
		     this approach must not lose across a push. -->
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
			{:else}
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
			{/if}
		</div>
	{/each}
</div>

<style>
	.page {
		/* Status colour, declared once for every screen this page can show. The
		   two motion statuses keep the meanings the running view gave them; the
		   six that follow exist only because a release screen shows a whole
		   release, and a release is mostly not running. Nothing else here may use
		   any of them: a release is not a status and a project is not a status. */
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
	   across 1280px is a poster, and stretched down a 900px window it is a column
	   with a hole in it. The grid does not have that problem, so the two scales
	   do NOT collapse into one on a desktop: they stay two, in the same column,
	   and the grid simply becomes the one most readers stay at. */
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
