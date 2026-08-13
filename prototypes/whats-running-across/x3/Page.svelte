<script lang="ts">
	/**
	 * What's running — moving across — approach 3 of 5: The trail is the interface
	 *
	 * The running view is the settled core, kept: a grid of every runner as the
	 * landing state, one full-screen card as the second scale, one control
	 * between them, identity surviving the move both ways, and never a
	 * non-running status on any of it.
	 *
	 * What this approach replaces is the stack. A release and a project are
	 * still real places reached by real navigations — but exactly ONE place is
	 * ever open, and a lateral jump replaces the screen instead of stacking a
	 * frame on it. The reader's journey is held instead by two things:
	 *
	 * 1. THE BROWSER'S HISTORY, which records every move including the loops.
	 *    Every trail tap and every destination tap is a pushState into the
	 *    LOCATION HASH (inherited: the harness routes on pathname, the query
	 *    carries ?empty and ?live), so the phone's edge-swipe, the hardware
	 *    back and the on-screen control are the same back — and back WALKS THE
	 *    TRAIL, place by place, in exactly the order the reader made it.
	 *
	 * 2. THE TRAIL STRIP, a persistent bottom band holding one chip per place
	 *    visited, deduped, most recent first. It renders above every screen, so
	 *    any place picked up is one tap away from anywhere — from the grid,
	 *    from a release, from the empty state. Jumping back is never a climb
	 *    because nothing is ever behind anything else.
	 *
	 * What the trail costs and buys, measured against the stack it replaces:
	 * the strip takes 64px of height from every screen including the card
	 * (136px total bottom reserve here against the winner's 72px of harness
	 * clearance); it buys one-tap return to any recent place — the stack
	 * priced that at pop-then-push and forbade some jumps outright — and it is
	 * the first approach in three rounds whose EMPTY state is navigable: the
	 * chips survive the corpus emptying, so a reader who arrives when nothing
	 * runs still has everywhere they recently were.
	 */
	import { untrack } from 'svelte';
	import { Header, PageFrame } from '@alfons/design';
	import { findProject, findRelease, releasesOf } from './corpus.ts';
	import NothingRunning from './NothingRunning.svelte';
	import PlaceScreen from './PlaceScreen.svelte';
	import ProjectScreen from './ProjectScreen.svelte';
	import ReleaseScreen from './ReleaseScreen.svelte';
	import ScaleControl from './ScaleControl.svelte';
	import TaskDeck from './TaskDeck.svelte';
	import TaskGrid from './TaskGrid.svelte';
	import TrailStrip from './TrailStrip.svelte';
	import type { Scale } from './scale.ts';
	import {
		decodePlace,
		encodePlace,
		loadTrail,
		placeKey,
		samePlace,
		saveTrail,
		visit,
		type Place,
		type ScreenPlace
	} from './trail.ts';
	import { runningTasks, type RunningStatus, type RunningTask } from './tasks.ts';

	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');

	let tasks = $state<RunningTask[]>(startEmpty ? [] : runningTasks);
	let index = $state(0);
	let scale = $state<Scale>(query.includes('card') ? 'card' : 'grid');
	let checkedAt = $state(new Date());
	let readerMovedScale = $state(false);

	/** A hash naming a place the corpus does not hold is the running view. */
	function knownPlace(decoded: ScreenPlace): ScreenPlace {
		if (decoded === null) return null;
		if (decoded.kind === 'release') return findRelease(decoded.slug) ? decoded : null;
		return findProject(decoded.name) ? decoded : null;
	}

	// The one open place, mirrored from history. History is the authority:
	// every change goes through pushState or back(), and this only reads what
	// landed.
	let current = $state<ScreenPlace>(
		typeof location === 'undefined' ? null : knownPlace(decodePlace(location.hash))
	);

	// A mirror of the history entries this page has made, bottom first, so the
	// back control can name where back GOES — "auth-hardening", not "Back". It
	// is a label cache, never an authority: a popstate it cannot explain
	// resynchronises it rather than arguing with the browser.
	let journey = $state<ScreenPlace[]>([null]);

	// Parallel to journey: the control that opened each entry, so back can hand
	// the focus straight back to it. Not persisted — a restored journey has no
	// opener, and inventing one would focus something the reader never touched.
	let openers: (HTMLElement | null)[] = [null];

	// The screen itself, for when the opener no longer exists (a lateral jump
	// unmounts the screen that held it).
	let placeScreen = $state<{ focus: () => void } | null>(null);

	// The hand of cards. Loaded per tab, so a reload keeps the journey and a
	// fresh tab honestly starts without one.
	let trail = $state<Place[]>(loadTrail());

	const reducedMotion =
		typeof matchMedia === 'undefined'
			? false
			: matchMedia('(prefers-reduced-motion: reduce)').matches;

	function baseUrl(): string {
		return `${location.pathname}${location.search}`;
	}

	/**
	 * A place restored from the URL has no history entry beneath it, so back
	 * would leave the page entirely from a screen the reader never navigated
	 * to. Rebuilding the entry beneath is what makes a restored place behave
	 * like one the reader walked into. (Inherited pattern, one frame deep.)
	 */
	$effect(() => {
		const restored = knownPlace(decodePlace(location.hash));
		if (restored === null) return;
		history.replaceState({}, '', baseUrl());
		history.pushState({}, '', baseUrl() + encodePlace(restored));
		journey = [null, restored];
		openers = [null, null];
		// Untracked: this effect must not depend on the trail, or the write here
		// re-runs it and pushes the restored place onto history twice.
		untrack(() => (trail = visit(trail, restored)));
	});

	function placesEqual(a: ScreenPlace, b: ScreenPlace): boolean {
		if (a === null || b === null) return a === b;
		return samePlace(a, b);
	}

	/** Every forward move funnels through here: one pushState, one journal entry. */
	function go(place: ScreenPlace, opener: HTMLElement | null) {
		if (placesEqual(current, place)) return;
		history.pushState({}, '', baseUrl() + encodePlace(place));
		journey = [...journey, place];
		openers = [...openers, opener];
		current = place;
		if (place !== null) trail = visit(trail, place);
	}

	function back() {
		history.back();
	}

	function onPopState() {
		const landed = knownPlace(decodePlace(location.hash));
		const wasBack = journey.length > 1 && placesEqual(journey[journey.length - 2], landed);
		if (wasBack) {
			const returningTo = openers[openers.length - 1];
			journey = journey.slice(0, -1);
			openers = openers.slice(0, -1);
			current = landed;
			// After the screen above is gone and this one is no longer inert; an
			// element in an inert subtree cannot take focus.
			requestAnimationFrame(() => {
				if (returningTo?.isConnected) {
					returningTo.focus();
					return;
				}
				// The opener is gone — a lateral jump destroyed the screen that held
				// it. The place the reader returned to takes the focus instead,
				// which also re-announces where they are.
				placeScreen?.focus();
			});
			return;
		}
		// A jump this journal cannot explain — a multi-step back, or forward.
		// The browser is right; resynchronise the labels.
		journey = landed === null ? [null] : [null, landed];
		openers = journey.map(() => null);
		current = landed;
	}

	// ── The trail's own entries ────────────────────────────────────────────

	// A task read at card scale joins the trail: each card the deck settles on
	// is a place picked up. `visit` returns the same array when the head
	// already matches, which is what keeps this effect from chasing itself.
	$effect(() => {
		if (scale !== 'card' || current !== null) return;
		const task = tasks[index];
		if (!task) return;
		// Untracked for the same reason as the restore effect: the effect is
		// about the card on screen, not about the trail it feeds.
		untrack(() => (trail = visit(trail, { kind: 'task', id: task.id, release: task.release })));
	});

	$effect(() => {
		saveTrail(trail);
	});

	function statusOf(id: string): RunningStatus | null {
		return tasks.find((task) => task.id === id)?.status ?? null;
	}

	/**
	 * A chip is one tap to its place. A task chip whose task still runs reopens
	 * the running view at card scale on it — that is a navigation home first if
	 * a place screen is open, so back still means something. A task chip whose
	 * task has ended leads to its release, and the chip's own face says so.
	 */
	function openFromTrail(place: Place, opener: HTMLElement) {
		if (place.kind !== 'task') {
			go(place, opener);
			return;
		}
		const at = tasks.findIndex((task) => task.id === place.id);
		if (at === -1) {
			go({ kind: 'release', slug: place.release }, opener);
			return;
		}
		if (current !== null) go(null, opener);
		index = at;
		readerMovedScale = true;
		scale = 'card';
	}

	// ── The running view, carried unchanged ────────────────────────────────

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

	const readout = $derived(
		scale === 'grid' ? 'All running' : `Reading ${index + 1} of ${tasks.length}`
	);

	// The word on the back control names where back GOES.
	const backLabel = $derived.by(() => {
		const beneath = journey.length > 1 ? journey[journey.length - 2] : null;
		if (beneath === null) return 'Running';
		return beneath.kind === 'release' ? beneath.slug : beneath.name;
	});

	const currentTaskId = $derived(
		current === null && scale === 'card' && tasks.length > 0 ? (tasks[index]?.id ?? null) : null
	);
</script>

<svelte:window
	onpopstate={onPopState}
	onkeydown={(event) => {
		if (current === null) return;
		if (event.key !== 'Escape') return;
		event.preventDefault();
		back();
	}}
/>

<!-- Inherited finding: the place screen and the strip are siblings of
     PageFrame, never children. PageFrame's column is one stacking context, so
     a fixed screen inside it can never clear the Header — at 370px the
     wordmark intercepted the back control. -->
<div class="page">
	<PageFrame>
		{#snippet header()}<Header />{/snippet}
		<!-- No footer, inherited: the running view is exactly one screen tall. -->
		<!-- Inert, not hidden, inherited: the deck is a scroll container and
		     hiding it would lose the card the reader left from. -->
		<div class="screen" inert={current !== null}>
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
					onOpenRelease={(task, opener) => go({ kind: 'release', slug: task.release }, opener)}
					onOpenProject={(task, opener) => go({ kind: 'project', name: task.project }, opener)}
					autofocus={readerMovedScale}
				/>
			{/if}

			{#if tasks.length > 0}
				<ScaleControl {scale} onchange={changeScale} />
			{/if}
		</div>
	</PageFrame>

	{#if current !== null}
		<!-- Keyed on the place, so a lateral jump is one screen leaving and one
		     arriving rather than one screen's content swapping under the reader
		     — identity survives the transition because the transition is the
		     identity changing. -->
		{#key placeKey(current)}
			{#if current.kind === 'release'}
				{@const release = findRelease(current.slug)}
				{#if release}
					<PlaceScreen
						bind:this={placeScreen}
						rank="Release"
						name={release.slug}
						{backLabel}
						{reducedMotion}
						onBack={back}
					>
						<ReleaseScreen
							{release}
							onOpenProject={(opener) => go({ kind: 'project', name: release.project }, opener)}
							onOpenTask={(taskId, opener) =>
								openFromTrail({ kind: 'task', id: taskId, release: release.slug }, opener)}
						/>
					</PlaceScreen>
				{/if}
			{:else}
				{@const project = findProject(current.name)}
				{#if project}
					<PlaceScreen
						bind:this={placeScreen}
						rank="Project"
						name={project.name}
						{backLabel}
						{reducedMotion}
						onBack={back}
					>
						<ProjectScreen
							{project}
							releases={releasesOf(project.name)}
							onOpenRelease={(slug, opener) => go({ kind: 'release', slug }, opener)}
						/>
					</PlaceScreen>
				{/if}
			{/if}
		{/key}
	{/if}

	<TrailStrip
		{trail}
		{current}
		{currentTaskId}
		{statusOf}
		onOpen={openFromTrail}
		onHome={(opener) => go(null, opener)}
	/>
</div>

<style>
	.page {
		/* Status colour, declared once for every screen this page can show. The
		   two motion statuses keep the meanings the running view gave them; the
		   six that follow exist only because a release screen shows a whole
		   release. Nothing else here may use any of them. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);

		/* What the bottom of every screen must clear, measured from the strip:
		   its top padding (--space-2) + a 48px chip row (--space-7) + its own
		   pager clearance (--space-7 + --space-5), + --space-2 breathing room
		   above the strip. 136px, of which 72px is dev-harness cost the winner
		   also paid and 64px is what the trail itself takes from the card. */
		--trail-clearance: calc(
			var(--space-2) + var(--space-7) + var(--space-7) + var(--space-5) + var(--space-2)
		);
	}

	.screen {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: calc(100dvh - var(--header-height));
		padding: var(--space-4);
		padding-bottom: var(--trail-clearance);
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

	/* Inherited: above a phone the column stops growing; the two scales stay
	   two, and the grid becomes the one most readers stay at. */
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
