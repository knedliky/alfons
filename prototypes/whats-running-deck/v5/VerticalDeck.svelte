<script lang="ts">
	/**
	 * The deck, turned through ninety degrees.
	 *
	 * The cards are stacked down the page and the page itself is the scroller.
	 * That is the whole bet: a phone reader's first gesture is a vertical scroll,
	 * so the deck moves under the gesture nobody has to learn, and the browser
	 * hands over momentum, interruption, keyboard paging and a scrollbar without
	 * a line of code. n2 had to build a horizontal scroller and then defend the
	 * document against it; here there is only one scroller and it is the one the
	 * platform already gave us.
	 *
	 * The price is that the document scrolls, which n2 deliberately forbade. Two
	 * things fall out of that and both are handled in Page.svelte: the count
	 * heading has to stay put while the deck moves under it, and the fixed site
	 * Header has to be kept out of the snap position with scroll-padding.
	 *
	 * This component owns three things: the slots, the index the scroll position
	 * implies, and the programmatic scroll a button or an arrow key asks for.
	 */
	import type { RunningTask } from './tasks.ts';
	import TaskCard from './TaskCard.svelte';

	let {
		tasks,
		index,
		onMove
	}: {
		tasks: RunningTask[];
		index: number;
		/** Reports what the scroll position says: which card, and how far down. */
		onMove: (index: number, progress: number) => void;
	} = $props();

	let slots = $state<(HTMLElement | null)[]>([]);

	// A smooth scrollTo emits exactly the scroll events a swipe does, and here it
	// emits them on the axis the reader is also driving — so without this flag
	// the listener reads the animation's own intermediate positions back as
	// intent and the index chases the animation down the page. n2 hit this on the
	// horizontal axis; the mechanism is identical and the consequence is worse,
	// because a vertical mis-read also drags the sticky readout with it. It
	// clears when the animation arrives, with a timer as a backstop.
	let settling = false;
	let settleTimer: ReturnType<typeof setTimeout> | undefined;

	/** Where a snapped card's top lands: below the fixed Header and the count bar. */
	function snapLine(): number {
		const declared = getComputedStyle(document.documentElement).scrollPaddingTop;
		const parsed = Number.parseFloat(declared);
		return Number.isFinite(parsed) ? parsed : 0;
	}

	/**
	 * The card nearest the snap line, rather than scrollY divided by a card
	 * height. Measuring the slots directly means the answer stays correct when
	 * the viewport resizes mid-scroll, which on a phone happens every time the
	 * browser chrome collapses.
	 */
	function indexFromScroll(): number {
		const line = snapLine();
		let nearest = 0;
		let shortest = Number.POSITIVE_INFINITY;
		slots.forEach((element, position) => {
			if (!element) return;
			const distance = Math.abs(element.getBoundingClientRect().top - line);
			if (distance < shortest) {
				shortest = distance;
				nearest = position;
			}
		});
		return nearest;
	}

	function scrollProgress(): number {
		const travel = document.documentElement.scrollHeight - window.innerHeight;
		if (travel <= 0) return 0;
		return Math.min(1, Math.max(0, window.scrollY / travel));
	}

	function onScroll() {
		const settled = indexFromScroll();
		// Progress always updates, even mid-animation: the line under the heading
		// is a picture of the scroll position, so it should move with the scroll
		// whoever started it.
		onMove(settling ? index : settled, scrollProgress());
		if (!settling) return;
		if (settled === index && isAt(index)) {
			settling = false;
			clearTimeout(settleTimer);
		}
	}

	function isAt(position: number): boolean {
		const element = slots[position];
		return !!element && Math.abs(element.getBoundingClientRect().top - snapLine()) < 2;
	}

	/**
	 * Movement, one snap point at a time, waiting for each to land.
	 *
	 * This is the single most expensive thing this direction cost, and it is
	 * worth writing down. Under `scroll-snap-type: y mandatory` Chromium clamps
	 * a PROGRAMMATIC scroll to one snap step — measured, repeatedly: from the
	 * first card, End moved the page to the second and stopped, whether the
	 * scroll was smooth or instant, whether it was scrollTo or scrollIntoView.
	 * Suspending the snap around the jump does not rescue it either, because
	 * restoring scroll-snap-type re-snaps from where the jump started rather
	 * than where it ended and the card comes straight back.
	 *
	 * The reader's own gesture is not clamped — a long flick crosses three cards
	 * — so this is a rule about programmatic scrolling only. Which means it hits
	 * exactly the two movement routes n2 said had to work beside the swipe: the
	 * visible control and the keyboard.
	 *
	 * Single steps ARE honoured, so the deck walks. Previous and next are one
	 * step and arrive immediately; Home and End flip through the cards between,
	 * which is slower than a jump and reads better than one anyway.
	 */
	function walkTo(target: number, smooth: boolean) {
		// Bounded by frames, not by trust: a step that never lands must not spin.
		let guard = slots.length * 60;
		const step = () => {
			const current = indexFromScroll();
			if (current === target) return;
			const next = slots[current + Math.sign(target - current)];
			if (!next) return;
			next.scrollIntoView({ block: 'start', behavior: smooth ? 'smooth' : 'auto' });
			const settle = () => {
				if (guard-- <= 0) return;
				if (indexFromScroll() === current) requestAnimationFrame(settle);
				else step();
			};
			requestAnimationFrame(settle);
		};
		step();
	}

	// The index is the source of truth; the page scroll follows it. scrollIntoView
	// honours scroll-padding, so the card lands clear of the Header without this
	// component knowing how tall the Header is.
	$effect(() => {
		if (!slots[index] || isAt(index)) return;

		settling = true;
		clearTimeout(settleTimer);
		// Long enough to cover a walk the length of the deck, because the flag is
		// what stops the walk's own intermediate positions being read as intent.
		settleTimer = setTimeout(() => (settling = false), 400 + slots.length * 700);

		walkTo(index, !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
	});
</script>

<svelte:window onscroll={onScroll} onresize={onScroll} />

<section class="deck" aria-roledescription="carousel" aria-label="Running tasks">
	{#each tasks as task, position (task.id)}
		<!-- Off-screen cards are deliberately not aria-hidden. Four cards read end
		     to end is a better answer for a screen reader than one card plus a
		     gesture it cannot perform — and on a vertical deck the cards are a
		     document in reading order anyway, which is the one thing this axis
		     gives for free. -->
		<div class="slot" bind:this={slots[position]}>
			<div class="holder">
				<TaskCard {task} position={position + 1} total={tasks.length} />
			</div>
		</div>
	{/each}
</section>

<style>
	.deck {
		display: flex;
		flex-direction: column;
	}

	/* The snap unit is a full screen of deck, always — never the card. Capping
	   the card's height and snapping to the card would put two cards on a tall
	   desktop window, which is a list. The slot stays viewport-sized so one card
	   is one screen at every width; the card is capped inside it. */
	.slot {
		height: var(--slot-height);
		scroll-snap-align: start;
		/* `scroll-snap-stop: always` was here and was removed. It is meant to stop
		   a fast flick skipping cards, and in Chromium it did not: a 1400px wheel
		   flick still travelled three cards with it in place. It was at first
		   suspected of clamping programmatic scrolls to one snap step as well;
		   removing it proved that innocent — the clamp is `mandatory` itself, and
		   it is handled in the walk above. What is left is a declaration with no
		   measured effect, and those are better absent than kept on faith. */
		display: flex;
		justify-content: center;
		padding-inline: var(--space-4);
		/* A hairline of air under the sticky count bar, so the card reads as a
		   card sliding beneath a bar rather than as one continuous panel. It comes
		   out of the card's height, not the slot's: the slot is the snap step and
		   it must stay exactly one screen. */
		padding-block-start: var(--space-3);
	}

	.holder {
		width: 100%;
		max-width: var(--card-max-width);
		/* The gutter keeps the card's bottom edge clear of the prototyping
		   harness's floating pager. Same reasoning as the padding above: it is
		   spent from the card, never from the slot. */
		height: calc(100% - var(--harness-gutter));
		max-height: var(--card-max-height);
	}
</style>
