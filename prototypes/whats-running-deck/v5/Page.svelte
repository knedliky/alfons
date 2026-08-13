<script lang="ts">
	/**
	 * What's running — the deck — approach 5 of 5: The vertical deck
	 *
	 * The deck turned through ninety degrees. Full-height cards stacked down the
	 * page, snapping under the document's own scroll, so the reader's scroll
	 * position is the sense of where they are.
	 *
	 * The argument is ergonomic. A phone reader's default gesture is a vertical
	 * scroll; horizontal paging is a convention that has to be learnt and then
	 * signposted. Turning the deck upright means the gesture needs no code, no
	 * teaching and no affordance — and it brings a scrollbar, momentum, rubber
	 * banding, keyboard paging and Find-on-page with it, none of which a
	 * horizontal pager can have.
	 *
	 * Three decisions carry the approach, and each is a direct inversion of one
	 * of n2's.
	 *
	 * 1. THE DOCUMENT SCROLLS. n2 made the page exactly one screen tall so a
	 *    horizontal pager could not fight a vertical document. Here there is
	 *    nothing to fight, because the document IS the deck: one scroller, the
	 *    platform's own.
	 *
	 * 2. THE COUNT STICKS. This is the approach most at risk of losing the count,
	 *    and the risk is not theoretical — a heading in normal flow is gone the
	 *    moment the reader moves, and a sense check you lose by moving is not a
	 *    sense check. So the count bar is sticky under the fixed Header and never
	 *    leaves. It costs 64px of every card, permanently, and that is the price
	 *    of the direction rather than an oversight.
	 *
	 * 3. THE SNAP LINE IS BELOW BOTH BARS. A fixed Header plus a sticky count bar
	 *    means a snapped card's top would sit underneath 144px of chrome. The
	 *    scroll container therefore carries scroll-padding-block-start of exactly
	 *    that, and the slot height is exactly the viewport minus it — which makes
	 *    the last card's snap point land precisely at the end of the document,
	 *    with no dead scroll after it and no snap point out of reach.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import DeckControls from './DeckControls.svelte';
	import NothingRunning from './NothingRunning.svelte';
	import VerticalDeck from './VerticalDeck.svelte';
	import { runningTasks, type RunningTask } from './tasks.ts';

	// The two states this page lives in. ?empty renders the corpus's usual
	// condition; ?live drives the finish-while-you-watch path below.
	const query = typeof location === 'undefined' ? '' : location.search;
	const startEmpty = query.includes('empty');
	const simulateFeed = query.includes('live');

	let tasks = $state<RunningTask[]>(startEmpty ? [] : runningTasks);
	let index = $state(0);
	let progress = $state(0);
	let checkedAt = $state(new Date());

	// The SSE feed, mocked. What matters is not the transport but that a task
	// finishing reconciles in place: the deck shortens, the count changes, and
	// the index clamps so the reader is left looking at a card that still exists.
	// On a vertical deck the document also gets shorter under the reader, which
	// the browser absorbs by clamping the scroll — hence the index effect below,
	// which scrolls the reader deliberately rather than letting them be dropped
	// wherever the clamp landed.
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

	const headline = $derived(tasks.length === 0 ? 'Nothing is running' : `${tasks.length} running`);
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	<!-- No footer. A footer sits below the last card and is not a snap target, so
	     under mandatory snapping it is either unreachable or it fights every
	     flick at the end of the deck. Recorded as a deviation from the seeded
	     shell, on the same reasoning n2 used to drop it. -->
	<div class="page">
		<div class="countbar">
			<div class="bar-row">
				<!-- The h1 IS the count. Same line in both states, and it is the line
				     that must survive the scroll. -->
				<h1 class="headline" aria-live="polite">{headline}</h1>
				{#if tasks.length > 1}
					<DeckControls {index} total={tasks.length} onSelect={(next) => (index = next)} />
				{/if}
			</div>

			<!-- The scroll position, drawn. A native scrollbar is a real control on a
			     desktop and a hint that fades on a phone — and on macOS it is an
			     overlay that is not there at all until you move, which the measured
			     geometry confirmed: the document reports zero scrollbar width at
			     1280px. So the position is also kept somewhere that does not vanish
			     when the finger lifts. It is the raw scroll offset rather than the
			     card index, so it moves continuously with the gesture the way a
			     scrollbar does.

			     The track renders in both states, because unfilled it is the count
			     bar's bottom edge and the bar needs an edge whether or not there is
			     anywhere to scroll. -->
			<div class="trace" aria-hidden="true">
				{#if tasks.length > 1}
					<span class="trace-fill" style:transform="scaleX({progress})"></span>
				{/if}
			</div>
		</div>

		{#if tasks.length === 0}
			<div class="solo">
				<div class="solo-holder">
					<NothingRunning {checkedAt} />
				</div>
			</div>
		{:else}
			<VerticalDeck
				{tasks}
				{index}
				onMove={(next, scrolled) => {
					index = next;
					progress = scrolled;
				}}
			/>
		{/if}
	</div>
</PageFrame>

<style>
	/* The scroll container is the document, so the snap contract is declared on
	   the document. It is scoped to this component's lifetime: Svelte adds and
	   removes the rule with the page, so leaving the prototype leaves nothing
	   behind. */
	:global(html) {
		--deck-countbar-height: var(--space-8);

		/* MANDATORY, not proximity. On a deck of four, proximity leaves a card
		   half on screen whenever a flick ends near the middle, and a half-card is
		   exactly the ambiguity the full-screen card was chosen to remove. The
		   trap mandatory carries is a card taller than the viewport, which cannot
		   be reached because the snap keeps pulling it back — the card is
		   therefore built so that it cannot be taller than the viewport (see
		   TaskCard). */
		scroll-snap-type: y mandatory;

		/* Without this a snapped card's top sits under the fixed Header and the
		   sticky count bar, and the first line of every card is hidden by chrome.
		   The value is read back by the deck to work out which card is current, so
		   the two cannot disagree. */
		scroll-padding-block-start: calc(var(--header-height) + var(--deck-countbar-height));

		/* A flick past the last card must not become a pull-to-refresh. */
		overscroll-behavior-y: contain;
	}

	.page {
		/* Status colour, declared once for the page. Nothing else here may use
		   them: they mean building and verifying, and a third use would make them
		   decoration. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);

		/* The snap step. Exactly the viewport minus the chrome above it, which is
		   also exactly the scroll padding — that identity is what makes the last
		   card's snap point land on the document's last scrollable pixel. */
		--slot-height: calc(100dvh - var(--header-height) - var(--deck-countbar-height));
		--card-max-width: 34rem;
		--card-max-height: 44rem;
		/* Clears the prototyping harness's floating pager, which is fixed at the
		   bottom of every /dev page. A production page would not carry it. */
		--harness-gutter: calc(var(--space-7) + var(--space-5));
	}

	/* The one thing on this page that does not move. */
	.countbar {
		position: sticky;
		top: var(--header-height);
		z-index: var(--z-sticky);
		height: var(--deck-countbar-height);
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		/* Opaque on purpose: cards pass underneath it, and a translucent bar would
		   let a card's title read through the count. */
		background: var(--bg-primary);
	}

	.bar-row {
		flex: 1;
		min-height: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding-inline: var(--space-4);
		/* Held to the card's own width. Left to run the full page the count sat at
		   one edge of a 1280px window and the position readout at the other, a
		   metre apart with the card they describe in the middle — two halves of
		   one sentence that have to be read in a single glance. */
		width: 100%;
		max-width: calc(var(--card-max-width) + var(--space-4) * 2);
		margin-inline: auto;
	}

	/* The answer to the page's one question, in the page's one heading. */
	.headline {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(var(--text-lead), 5vw, 1.75rem);
		line-height: 1.1;
		color: var(--text-primary);
		white-space: nowrap;
	}

	/* Doubles as the bar's bottom edge: an unfilled track is the rule that would
	   otherwise be a border. */
	.trace {
		flex: none;
		height: var(--space-1);
		background: var(--border-glass);
		overflow: clip;
	}

	.trace-fill {
		display: block;
		height: 100%;
		background: var(--text-primary);
		transform-origin: left center;
		will-change: transform;
	}

	/* The empty state gets the slot a card gets, at the same measurements, because
	   it is a card. Mirrors .slot and .holder in VerticalDeck. */
	.solo {
		height: var(--slot-height);
		display: flex;
		justify-content: center;
		padding-inline: var(--space-4);
		padding-block-start: var(--space-3);
	}

	.solo-holder {
		width: 100%;
		max-width: var(--card-max-width);
		height: calc(100% - var(--harness-gutter));
		max-height: var(--card-max-height);
	}
</style>
