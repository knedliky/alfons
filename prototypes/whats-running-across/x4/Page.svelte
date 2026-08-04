<script lang="ts">
	/**
	 * What's running — moving across — approach 4 of 5: Peek, then commit
	 *
	 * PROMOTED. Every component this page composed locally now lives in the
	 * library, and this page imports only '@alfons/design' plus its own data and
	 * navigation modules (corpus.ts, tasks.ts, journey.ts, scale.ts — which are
	 * the page's job, not the library's).
	 *
	 * The running view is u3's, kept whole: grid landing, one full-screen card,
	 * one control between them, identity surviving both directions. The pushed
	 * screens are u3's too — a committed release or project is still a real
	 * place with the browser's own back.
	 *
	 * What changes is the price of a jump. Every destination tap on this page
	 * now raises the target as a partial sheet over where the reader stands —
	 * enough to read the whole release honestly, dismissed by scrim tap,
	 * swipe-down, Escape or the phone's back — and a plainly labelled control
	 * on the sheet commits it to a full navigation. The bet: most jumps in a
	 * jumping-around session are glances, so glances cost one tap and one back,
	 * and only chosen moves become history the reader must later walk out of.
	 *
	 * The decisions that carry it, each argued where it lives:
	 *
	 * 1. A PEEK IS ONE HISTORY ENTRY, HOWEVER FAR IT WANDERS. In history so the
	 *    phone's edge-swipe made under a sheet dismisses the sheet instead of
	 *    leaving the page; one entry (swaps are replaceState) so a chain of
	 *    glances never becomes places back has to replay. See journey.ts.
	 * 2. COMMIT REWRITES THE PEEK ENTRY, NEVER STACKS ON IT. After committing,
	 *    history reads [running, release] — as if the reader had gone directly —
	 *    so back from a committed place never revisits the glance that led there.
	 * 3. AN ANCESTOR ALREADY OPEN CAN STILL BE PEEKED, AND COMMITTING TO IT IS
	 *    A RETURN. u3 rendered it as inert text and the round brief names that
	 *    concession; here the sheet's commit control becomes "Return to …" and
	 *    travels backwards through history to it. The stack stays bounded
	 *    without the model forbidding a jump.
	 * 4. THE GRID AND THE EMPTY STATE CAN PEEK. The two conceded edges are
	 *    answered the same way: a cell's where-block glances at its release in
	 *    one tap, and the empty state offers the corpus's releases as peeks, so
	 *    the page's usual state is no longer its only dead end.
	 */
	import {
		Header,
		NothingRunning,
		PageFrame,
		PeekSheet,
		ProjectBody,
		PushedScreen,
		ReleaseBody,
		ScaleControl,
		TaskDeck,
		TaskGrid
	} from '@alfons/design';
	import { findProject, findRelease, releases, releasesOf } from './corpus.ts';
	import type { Scale } from './scale.ts';
	import { decodeJourney, encodeJourney, indexOnStack, sameFrame, type Frame } from './journey.ts';
	import { runningTasks, type RunningTask } from './tasks.ts';

	// The two states this page lives in. ?empty renders the corpus's usual
	// condition; ?live drives the finish-while-you-watch path below. ?card lands
	// at the other scale.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');

	let tasks = $state<RunningTask[]>(startEmpty ? [] : runningTasks);
	let index = $state(0);
	let scale = $state<Scale>(query.includes('card') ? 'card' : 'grid');
	let checkedAt = $state(new Date());
	let readerMovedScale = $state(false);

	// The journey, mirrored from history. History is the authority: every change
	// goes through pushState, replaceState or back(), and this only reads what
	// landed.
	let stack = $state<Frame[]>([]);
	let peek = $state<Frame | null>(null);

	// Parallel to the stack and deliberately not in the URL: the control that
	// opened each frame, and the one that raised the current peek, so dismissal
	// can hand focus straight back. A journey restored from a reload has no
	// openers, and inventing one would mean focusing something never touched.
	let openers: (HTMLElement | null)[] = [];
	let peekOpener: HTMLElement | null = null;

	// The frames themselves, for the case where an opener no longer exists.
	let frames = $state<({ focus: () => void } | null)[]>([]);

	const reducedMotion =
		typeof matchMedia === 'undefined'
			? false
			: matchMedia('(prefers-reduced-motion: reduce)').matches;

	function baseUrl(): string {
		return `${location.pathname}${location.search}`;
	}

	/**
	 * Restoration, u3's rule extended by one: a reloaded PEEK is dropped. A
	 * glance is ephemeral by definition — it has no opener to return focus to
	 * and no standing worth rebuilding — so a URL that arrives carrying one is
	 * rewritten to its committed stack, and the committed stack is then given
	 * real history entries beneath it so back behaves as if walked into.
	 */
	$effect(() => {
		const restored = decodeJourney(location.hash);
		stack = restored.stack;
		if (restored.stack.length === 0 && !restored.peek) return;
		history.replaceState({}, '', baseUrl());
		for (let depth = 1; depth <= restored.stack.length; depth += 1) {
			history.pushState(
				{},
				'',
				baseUrl() + encodeJourney({ stack: restored.stack.slice(0, depth), peek: null })
			);
		}
	});

	function raisePeek(frame: Frame, opener: HTMLElement | null) {
		if (peek) {
			// A glance that changes subject is still one glance: swap in place, no
			// new history entry, so one back still puts the whole thing down.
			if (sameFrame(peek, frame)) return;
			history.replaceState({}, '', baseUrl() + encodeJourney({ stack, peek: frame }));
			peek = frame;
			return;
		}
		peekOpener = opener;
		history.pushState({}, '', baseUrl() + encodeJourney({ stack, peek: frame }));
		peek = frame;
	}

	function back() {
		history.back();
	}

	function commitPeek() {
		const frame = peek;
		if (!frame) return;
		const at = indexOnStack(stack, frame);
		if (at >= 0) {
			// Already a place beneath the reader: committing means returning to it.
			// Positions in history: base 0, frames 1..k, peek k+1; the target sits
			// at at+1, so the delta walks backwards and popstate does the rest.
			history.go(at - stack.length);
			return;
		}
		// A new place: the peek entry BECOMES the committed frame, so history
		// never records the glance as somewhere back must revisit.
		const next = [...stack, frame];
		history.replaceState({}, '', baseUrl() + encodeJourney({ stack: next, peek: null }));
		openers = [...openers, peekOpener];
		peekOpener = null;
		stack = next;
		peek = null;
		// Focus: the new PushedScreen takes it on mount, announcing the place.
	}

	function onPopState() {
		const landed = decodeJourney(location.hash);
		const hadPeek = peek !== null;
		const framesPopped = landed.stack.length < stack.length;
		const returningTo = framesPopped ? (openers[landed.stack.length] ?? null) : null;
		if (framesPopped) openers = openers.slice(0, landed.stack.length);
		stack = landed.stack;
		peek = landed.peek;
		const dismissedPeek = hadPeek && !landed.peek;
		const peekReturn = peekOpener;
		if (dismissedPeek && !framesPopped) peekOpener = null;
		// After the layer is gone and what is beneath is no longer inert: an
		// element inside an inert subtree cannot take the focus, and the pop that
		// removed the layer is what lifts the inertness.
		requestAnimationFrame(() => {
			if (dismissedPeek && !framesPopped) {
				if (peekReturn?.isConnected) {
					peekReturn.focus();
					return;
				}
				// The opener can be gone — a deck card unmounted by the feed, say.
				// The screen the reader is standing on takes the focus instead.
				if (stack.length > 0) frames[stack.length - 1]?.focus();
				return;
			}
			if (returningTo?.isConnected) {
				returningTo.focus();
				return;
			}
			frames[stack.length - 1]?.focus();
		});
	}

	// The SSE feed, mocked, as in u3: a task finishing reconciles in place.
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

	// The word on the back control names where back GOES, not what it undoes.
	function backLabelAt(depth: number): string {
		if (depth === 0) return 'Running';
		const beneath = stack[depth - 1];
		return beneath.kind === 'release' ? beneath.slug : beneath.name;
	}

	// The peeked frame resolved, and what committing to it means. "Go to" for a
	// new place, "Return to" for one already beneath the reader — the label is
	// where the loop-bounding rule surfaces, instead of u3's inert text.
	const peekedRelease = $derived(peek?.kind === 'release' ? findRelease(peek.slug) : null);
	const peekedProject = $derived(peek?.kind === 'project' ? findProject(peek.name) : null);
	const peekIsOpenBeneath = $derived(peek ? indexOnStack(stack, peek) >= 0 : false);
	const commitLabel = $derived(
		peek === null
			? ''
			: `${peekIsOpenBeneath ? 'Return to' : 'Go to'} ${peek.kind} ${
					peek.kind === 'release' ? peek.slug : peek.name
				}`
	);
</script>

<svelte:window
	onpopstate={onPopState}
	onkeydown={(event) => {
		if (event.key !== 'Escape') return;
		if (!peek && stack.length === 0) return;
		event.preventDefault();
		// The peek and the top frame are both one history entry deep, so Escape
		// is the same back everywhere: it dismisses the sheet if one is up,
		// otherwise it pops the screen.
		back();
	}}
/>

<!-- Frames and the sheet are siblings of PageFrame, not children — u3 measured
     the wordmark intercepting clicks when a fixed screen rendered inside the
     shell's stacking context. Frames sit at --z-overlay (clear of the shell);
     the sheet sits at --z-widget, u4's measured floor for a layer that must
     also beat the Header, and incidentally what keeps a peek raised FROM a
     committed screen above that screen. Both are baked into the components. -->
<div class="page">
	<PageFrame>
		{#snippet header()}<Header />{/snippet}
		<!-- No footer, inherited: the running view is exactly one screen tall.
		     Inert under any layer — a sheet is modal to the keyboard even though
		     it does not feel modal, and inert on everything beneath is the whole
		     of the focus trap. -->
		<div class="screen" inert={stack.length > 0 || peek !== null}>
			<div class="topbar">
				<h1 class="headline" aria-live="polite">{headline}</h1>
				{#if tasks.length > 0}
					<p class="readout" aria-live="polite">{readout}</p>
				{/if}
			</div>

			{#if tasks.length === 0}
				<NothingRunning
					{checkedAt}
					{releases}
					onPeekRelease={(slug, opener) => raisePeek({ kind: 'release', slug }, opener)}
				/>
			{:else if scale === 'grid'}
				<TaskGrid
					{tasks}
					{index}
					onSelect={(next) => (index = next)}
					onOpen={openCard}
					onPeekRelease={(task, opener) =>
						raisePeek({ kind: 'release', slug: task.release }, opener)}
					autofocus={readerMovedScale}
				/>
			{:else}
				<TaskDeck
					{tasks}
					{index}
					onSelect={(next) => (index = next)}
					onPeekRelease={(task, opener) =>
						raisePeek({ kind: 'release', slug: task.release }, opener)}
					onPeekProject={(task, opener) =>
						raisePeek({ kind: 'project', name: task.project }, opener)}
					autofocus={readerMovedScale}
				/>
			{/if}

			{#if tasks.length > 0}
				<ScaleControl {scale} onchange={changeScale} />
			{/if}
		</div>
	</PageFrame>

	{#each stack as frame, depth (encodeJourney({ stack: stack.slice(0, depth + 1), peek: null }))}
		<!-- Every frame stays mounted; every frame but the top is inert, and the
		     top is inert too while a sheet is up. Unmounting would cost scroll
		     position, which is the reader's place one level in. -->
		<div class="frame" inert={depth < stack.length - 1 || peek !== null}>
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
						<ReleaseBody
							{release}
							context="place"
							onPeekProject={(opener) =>
								raisePeek({ kind: 'project', name: release.project }, opener)}
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
						<ProjectBody
							{project}
							releases={releasesOf(project.name)}
							onPeekRelease={(slug, opener) => raisePeek({ kind: 'release', slug }, opener)}
						/>
					</PushedScreen>
				{/if}
			{/if}
		</div>
	{/each}

	{#if peekedRelease}
		<PeekSheet
			rank="Release"
			name={peekedRelease.slug}
			{commitLabel}
			{reducedMotion}
			onCommit={commitPeek}
			onDismiss={back}
		>
			<ReleaseBody
				release={peekedRelease}
				context="peek"
				onPeekProject={() => raisePeek({ kind: 'project', name: peekedRelease.project }, null)}
			/>
		</PeekSheet>
	{:else if peekedProject}
		<PeekSheet
			rank="Project"
			name={peekedProject.name}
			{commitLabel}
			{reducedMotion}
			onCommit={commitPeek}
			onDismiss={back}
		>
			<ProjectBody
				project={peekedProject}
				releases={releasesOf(peekedProject.name)}
				onPeekRelease={(slug) => raisePeek({ kind: 'release', slug }, null)}
			/>
		</PeekSheet>
	{/if}
</div>

<style>
	.page {
		/* Status colour, declared once for every screen this page can show. This
		   is the palette contract StatusMark, TaskCell, TaskCard, TaskDeck,
		   TaskGrid and ReleaseBody document as their required input — the
		   components carry no defaults, so the page is the single place these
		   eight meanings are decided. The two motion statuses keep the meanings
		   the running view gave them; the six that follow exist only because a
		   release is shown whole, and a release is mostly not running. Nothing
		   else here may use any of them. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);

		/* The prototyping harness's floating pager sits fixed at the bottom of
		   every /dev page. PushedScreen and PeekSheet read this documented input
		   to clear fixed chrome; the .screen below adds it too. A production
		   page would not set it. */
		--screen-bottom-inset: calc(var(--space-7) + var(--space-2));
	}

	.screen {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: calc(100dvh - var(--header-height));
		padding: var(--space-4);
		/* Clears the harness pager; see --screen-bottom-inset above. */
		padding-bottom: calc(var(--space-4) + var(--screen-bottom-inset, 0px));
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

	/* Above a phone the column stops growing, as in u3: two scales, one column,
	   the grid simply the one most readers stay at. */
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
