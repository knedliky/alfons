<script lang="ts">
	/**
	 * What's running — moving across — approach 2 of 5: The map, not the stack
	 *
	 * The corpus is a fixed spatial arrangement — projects contain releases
	 * contain tasks — and the reader moves a camera over it instead of pushing
	 * screens. Three decisions carry it, each a bet that could lose.
	 *
	 * 1. THE CAMERA HAS POSITION, NOT DEPTH. The hash carries one target —
	 *    `#at/release/auth-hardening` — never a stack of frames. A jump from a
	 *    task to a sibling release to that release's project is three camera
	 *    moves over ground that never rearranged, and every lateral move costs
	 *    one tap because nothing is ever behind anything else. The journey
	 *    still lives in the browser's history: every deliberate move is a
	 *    pushState, and the phone's edge-swipe, the hardware back and Escape
	 *    all move the camera back along where the reader has been.
	 *
	 * 2. ZOOM IS LEVEL OF DETAIL, NOT A TRANSFORM. A free pan-zoom canvas on a
	 *    phone eats the scroll gesture, renders distant text at unreadable
	 *    sizes and gives assistive technology nothing. So the pan is the
	 *    page's own vertical scroll, and zoom is magnification of detail: the
	 *    place under the camera expands in situ while everything off the
	 *    camera's path dims (opacity, never a status colour) and compresses.
	 *    Every camera stop — a project, a release, a runner — is a real
	 *    focusable element with a 48px target, and the camera glides to it
	 *    with a smooth scroll that becomes a cut under prefers-reduced-motion.
	 *
	 * 3. THE RUNNING VIEW'S TWO SCALES ARE TWO CAMERA DISTANCES. "All
	 *    running" is the high camera: the whole corpus in frame, quiet ground
	 *    thin and dim, the runners lit at full strength — the settled grid,
	 *    with the map as its gutter. "One at a time" drops onto one runner,
	 *    which expands into the full card where it stands, its release and
	 *    project visibly above it. Identity survives both directions because
	 *    the task never moves; only the camera does.
	 *
	 * The round's two conceded edges, answered: going up from the high camera
	 * costs ONE tap, because release and project headers are stops on the map
	 * itself; and the empty state is not a dead end, because a map with zero
	 * runners is still the whole corpus, dimmed, navigable, with nothing lit.
	 */
	import { Button, Header, Icon, PageFrame } from '@alfons/design';
	import { decodeTarget, encodeTarget, sameTarget, targetKey, type Target } from './camera.ts';
	import EmptyNotice from './EmptyNotice.svelte';
	import ScaleControl from './ScaleControl.svelte';
	import TheMap from './TheMap.svelte';
	import type { CameraDistance } from './scale.ts';
	import { runningTasks, type RunningTask } from './tasks.ts';

	// The two states this page lives in. ?empty renders the corpus's usual
	// condition; ?live drives the finish-while-you-watch path; ?card lands the
	// camera at the low distance so the landing question can be seen both ways.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');
	const startCard = query.includes('card');

	let tasks = $state<RunningTask[]>(startEmpty ? [] : runningTasks);
	let checkedAt = $state(new Date());

	// The camera, mirrored from history. History is the authority: every change
	// goes through pushState, replaceState or back(), and this only reads what
	// landed.
	let target = $state<Target | null>(
		typeof location === 'undefined' ? null : decodeTarget(location.hash)
	);

	// Which runner "One at a time" returns to after the camera has been
	// elsewhere. Identity across the scales, kept the settled way.
	let lastRunnerIndex = $state(0);

	// The camera stops: every named place on the map registers the element that
	// takes focus when the camera arrives. A plain Map, not $state — nothing
	// renders from it; it is read only inside event handlers.
	const stops = new Map<string, HTMLElement>();

	function place(node: HTMLElement, key: string) {
		stops.set(key, node);
		return {
			destroy() {
				if (stops.get(key) === node) stops.delete(key);
			}
		};
	}

	// Read once. The camera needs the answer at the moment it moves, and the
	// value changes only when the reader changes an operating system setting.
	const reducedMotion =
		typeof matchMedia === 'undefined'
			? false
			: matchMedia('(prefers-reduced-motion: reduce)').matches;

	function baseUrl(): string {
		return `${location.pathname}${location.search}`;
	}

	/**
	 * A camera position restored from the URL has no history entry beneath it,
	 * so back would leave the page entirely from a place the reader never
	 * navigated to. One rebuilt entry — the overview — is what makes a restored
	 * camera behave like one the reader flew in. Runs once; the guard is what
	 * keeps the feed simulation from re-priming history when a task finishes.
	 */
	let historyPrimed = false;
	$effect(() => {
		if (historyPrimed) return;
		historyPrimed = true;
		const restored = decodeTarget(location.hash);
		if (restored !== null) {
			history.replaceState({}, '', baseUrl());
			history.pushState({}, '', baseUrl() + encodeTarget(restored));
			return;
		}
		if (startCard && tasks.length > 0) {
			const first: Target = { kind: 'task', id: tasks[0].id };
			history.replaceState({}, '', baseUrl() + encodeTarget(first));
			target = first;
		}
	});

	/** The camera arriving somewhere: focus the stop, then glide (or cut) to it. */
	function settle(key: string) {
		requestAnimationFrame(() => {
			const stop = stops.get(key);
			if (!stop?.isConnected) return;
			stop.focus({ preventScroll: true });
			stop.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
		});
	}

	/** A deliberate jump: one history entry, so back retraces it. */
	function go(next: Target) {
		if (sameTarget(target, next)) return;
		history.pushState({}, '', baseUrl() + encodeTarget(next));
		target = next;
		settle(targetKey(next));
	}

	/**
	 * A sibling move at the low camera — previous or next runner. replaceState,
	 * not pushState, on the settled deck's precedent: paging between cards was
	 * never a history entry, and back from any runner should lift the camera in
	 * one step rather than replay every runner the reader paged past. The hash
	 * still updates so a reload restores the runner being read.
	 */
	function goSibling(next: Target) {
		if (sameTarget(target, next)) return;
		history.replaceState({}, '', baseUrl() + encodeTarget(next));
		target = next;
		settle(targetKey(next));
	}

	function home() {
		history.pushState({}, '', baseUrl());
		target = null;
		settle('map');
	}

	function onPopState() {
		target = decodeTarget(location.hash);
		settle(targetKey(target));
	}

	// The SSE feed, mocked. What matters is that a task finishing reconciles in
	// place: the lit nameplate goes out, the count drops, and a camera left
	// standing on the finished task lifts to the overview rather than framing
	// a place that no longer exists. replaceState, because the reader did not
	// navigate — the world changed under them, and back should not revisit it.
	$effect(() => {
		if (!simulateFeed) return;
		const timer = setTimeout(() => {
			tasks = tasks.slice(0, -1);
			checkedAt = new Date();
		}, 6000);
		return () => clearTimeout(timer);
	});

	$effect(() => {
		if (target?.kind === 'task' && !tasks.some((task) => task.id === target.id)) {
			history.replaceState({}, '', baseUrl());
			target = null;
		}
	});

	$effect(() => {
		if (target?.kind === 'task') {
			const at = tasks.findIndex((task) => task.id === target.id);
			if (at >= 0) lastRunnerIndex = at;
		}
	});

	const runnerAt = $derived(
		target?.kind === 'task' ? tasks.findIndex((task) => task.id === target.id) : -1
	);

	const distance = $derived<CameraDistance>(target?.kind === 'task' ? 'task' : 'map');

	function changeDistance(next: CameraDistance) {
		if (next === distance) return;
		if (next === 'map') {
			home();
			return;
		}
		const runner = tasks[Math.min(lastRunnerIndex, tasks.length - 1)];
		if (runner) go({ kind: 'task', id: runner.id });
	}

	function moveRunner(to: number) {
		const landed = Math.min(Math.max(to, 0), tasks.length - 1);
		if (landed === runnerAt) return;
		goSibling({ kind: 'task', id: tasks[landed].id });
	}

	function onRailKeydown(event: KeyboardEvent) {
		const jump =
			event.key === 'ArrowRight'
				? runnerAt + 1
				: event.key === 'ArrowLeft'
					? runnerAt - 1
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? tasks.length - 1
							: null;
		if (jump === null) return;
		event.preventDefault();
		moveRunner(jump);
	}

	const headline = $derived(tasks.length === 0 ? 'Nothing is running' : `${tasks.length} running`);

	// One live region for both jobs: it announces every camera move and stands
	// in for the aria-pressed ToggleGroup does not emit.
	const readout = $derived(
		target === null
			? 'Whole map'
			: target.kind === 'task'
				? `Reading ${runnerAt + 1} of ${tasks.length}`
				: target.kind === 'release'
					? `Release ${target.slug}`
					: `Project ${target.name}`
	);
</script>

<svelte:window
	onpopstate={onPopState}
	onkeydown={(event) => {
		if (target === null) return;
		if (event.key !== 'Escape') return;
		event.preventDefault();
		history.back();
	}}
/>

<div class="root">
	<PageFrame>
		{#snippet header()}<Header />{/snippet}
		<!-- No footer, inherited from the winning approach's shell: the map is the
		     document, and the only thing below it should be more map. -->
		<main class="page">
			<div class="topbar">
				{#if target === null}
					<h1 class="headline">{headline}</h1>
				{:else}
					<!-- The page's own answer doubles as the way home: tapping the
					     headline lifts the camera to the whole map. A bare <button>,
					     because Button's centred pill cannot wear an h1. -->
					<h1 class="headline">
						<button type="button" class="lift" onclick={home} aria-label="{headline}. Lift the camera to the whole map.">
							{headline}
						</button>
					</h1>
				{/if}
				<p class="readout" aria-live="polite">{readout}</p>
			</div>

			{#if tasks.length === 0}
				<EmptyNotice {checkedAt} />
			{/if}

			<div class="mapwrap" tabindex="-1" use:place={'map'} aria-label="Whole map">
				<TheMap {target} {tasks} onGo={go} {place} />
			</div>
		</main>
	</PageFrame>

	{#if tasks.length > 0}
		<!-- Fixed to the bottom edge, outside PageFrame for the settled stacking
		     reason: PageFrame makes the whole shell one stacking context. The bar
		     is the one piece of chrome that must not move while the camera does. -->
		<div class="controls">
			{#if target?.kind === 'task' && tasks.length > 1}
				<div class="rail">
					<Button
						variant="secondary"
						size="icon"
						type="button"
						aria-label="Previous running task"
						disabled={runnerAt <= 0}
						onclick={() => moveRunner(runnerAt - 1)}
						onkeydown={onRailKeydown}
					>
						<Icon name="arrow-left" size="md" />
					</Button>
					<span class="position">{runnerAt + 1} of {tasks.length}</span>
					<Button
						variant="secondary"
						size="icon"
						type="button"
						aria-label="Next running task"
						disabled={runnerAt >= tasks.length - 1}
						onclick={() => moveRunner(runnerAt + 1)}
						onkeydown={onRailKeydown}
					>
						<Icon name="arrow-right" size="md" />
					</Button>
				</div>
			{/if}
			<ScaleControl {distance} onchange={changeDistance} />
		</div>
	{/if}
</div>

<style>
	.root {
		/* Status colour, declared once for every place the map can show. The two
		   motion statuses keep the meanings the running view gave them; the six
		   that follow exist only inside a release the camera has opened honestly.
		   Nothing else here may use any of them. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);
	}

	.page {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-4);
		/* Room for the fixed control bar plus the prototyping harness's floating
		   pager beneath it. A production page would lose the pager's share. */
		padding-bottom: calc(var(--space-7) * 3 + var(--space-5) * 2);
	}

	/* The map is a scrolling document, so the one line that answers the page's
	   question rides the top edge instead of scrolling away. */
	.topbar {
		position: sticky;
		top: 0;
		z-index: var(--z-raised);
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		margin-inline: calc(var(--space-4) * -1);
		padding: var(--space-3) var(--space-4);
		background: var(--bg-primary);
		border-bottom: 1px solid var(--border-glass);
	}

	.headline {
		margin: 0;
		font-family: var(--font-display);
		/* The type scale stops at --text-lead. Inherited finding, re-reported. */
		font-size: clamp(var(--text-lead), 5vw, 1.75rem);
		line-height: 1.1;
		color: var(--text-primary);
	}

	.lift {
		appearance: none;
		margin: 0;
		padding: 0;
		min-height: var(--space-7);
		background: transparent;
		border: none;
		font: inherit;
		color: inherit;
		cursor: pointer;
		text-decoration: underline;
		text-decoration-color: var(--text-muted);
		text-underline-offset: 0.2em;
	}

	.lift:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	.readout {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.mapwrap:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	/* Every camera stop clears the sticky topbar when the camera glides to it. */
	.mapwrap,
	.mapwrap :global([tabindex='-1']) {
		scroll-margin-top: calc(var(--space-7) * 2);
	}

	.controls {
		position: fixed;
		/* Above the prototyping harness's floating pager, which sits fixed at the
		   bottom of every /dev page. A production page would sit at
		   var(--space-4) from the edge. */
		bottom: calc(var(--space-7) + var(--space-5));
		left: 50%;
		transform: translateX(-50%);
		z-index: var(--z-overlay);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		width: calc(100% - var(--space-4) * 2);
		max-width: 34rem;
		padding: var(--space-2);
		background: var(--bg-primary);
		border: 1px solid var(--card-border);
	}

	.rail {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.position {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}

	@media (min-width: 640px) {
		.page {
			width: 100%;
			max-width: 34rem;
			margin-inline: auto;
			padding-inline: 0;
		}

		.topbar {
			margin-inline: 0;
			padding-inline: 0;
		}
	}
</style>
