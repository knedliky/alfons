<script lang="ts">
	/**
	 * The chrome every pushed screen shares: a way back, a title, and the rules
	 * about focus.
	 *
	 * It is `position: fixed; inset: 0` and opaque. A pushed screen covers the
	 * whole phone including the site header, because a screen that pushes but
	 * leaves the chrome of the place you left behind is not a push — it is a
	 * panel, and this approach exists to test the push.
	 *
	 * The screen underneath is NOT unmounted and NOT hidden. It stays laid out
	 * exactly where it was and is marked `inert` by the page. That is not
	 * tidiness: the deck is a horizontal scroll container, and `display: none`
	 * zeroes its client width and loses its scroll offset, so the reader would
	 * come back to card one having left from card three. Leaving it laid out
	 * under an opaque cover is what makes "back returns you to exactly where you
	 * stood" true by construction rather than by restoration code.
	 *
	 * Back is the browser's. The control here calls the same `history.back()`
	 * the phone's edge-swipe and the hardware button call, so there is one back
	 * and not two that can disagree. Escape is wired to the same call by the
	 * page, for a keyboard.
	 *
	 * Focus: the screen takes it on arrival, on the labelled region rather than
	 * on the back button, so a screen reader hears what it arrived at before it
	 * hears how to leave. Returning focus to whatever opened the screen is the
	 * page's job, because only the page knows what that was.
	 */
	import { Button, Icon } from '@alfons/design';
	import type { Snippet } from 'svelte';

	let {
		rank,
		name,
		backLabel,
		reducedMotion,
		onBack,
		children
	}: {
		rank: string;
		name: string;
		backLabel: string;
		reducedMotion: boolean;
		onBack: () => void;
		children: Snippet;
	} = $props();

	let region = $state<HTMLElement | null>(null);

	$effect(() => {
		region?.focus();
	});

	/**
	 * Handed out so the page can put the focus back here when the control that
	 * opened the screen above no longer exists. An exported function is the
	 * Svelte 5 way to offer that without leaking the node.
	 */
	export function focus() {
		region?.focus();
	}

	/**
	 * A transition rather than a CSS animation, because the screen has to leave
	 * as well as arrive — a stack whose frames appear by sliding and vanish by
	 * blinking out reads as two different mechanisms. Duration collapses to zero
	 * under prefers-reduced-motion; the position still changes, only instantly.
	 */
	function slide(node: HTMLElement, { reduced }: { reduced: boolean }) {
		void node;
		return {
			duration: reduced ? 0 : 220,
			css: (t: number) => `transform: translateX(${(1 - t) * 100}%)`
		};
	}
</script>

<section
	class="screen"
	bind:this={region}
	tabindex="-1"
	aria-label="{rank} {name}"
	in:slide={{ reduced: reducedMotion }}
	out:slide={{ reduced: reducedMotion }}
>
	<div class="column">
		<div class="bar">
			<Button variant="secondary" onclick={onBack}>
				<span class="back">
					<Icon name="arrow-left" size="md" />
					{backLabel}
				</span>
			</Button>
		</div>

		<header class="titling">
			<p class="rank">{rank}</p>
			<h2 class="name">{name}</h2>
		</header>

		<div class="body">
			{@render children()}
		</div>
	</div>
</section>

<style>
	.screen {
		position: fixed;
		inset: 0;
		z-index: var(--z-overlay);
		display: flex;
		justify-content: center;
		/* Opaque and full-bleed, not glass and not a centred panel. A pushed
		   screen the previous one shows through is a sheet, and a sheet is a
		   different answer to this brief. */
		background: var(--bg-primary);
	}

	.screen:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: calc(var(--space-1) * -1);
	}

	.column {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: 100%;
		min-height: 0;
		padding: var(--space-4);
		/* Clears the prototyping harness's floating pager, which sits fixed at the
		   bottom of every /dev page. A production screen would carry
		   var(--space-4) here like every other edge. */
		padding-bottom: calc(var(--space-7) + var(--space-5));
	}

	.bar {
		display: flex;
		flex: none;
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.titling {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: none;
	}

	.rank {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.name {
		margin: 0;
		font-family: var(--font-display);
		/* The type scale stops at --text-lead, which is a caption size for the
		   name of the screen you are standing on. The floor is the token; the
		   ceiling is a literal and no token would have prevented it. */
		font-size: clamp(var(--text-lead), 6vw, 1.75rem);
		line-height: 1.15;
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}

	/* A pushed screen DOES scroll vertically, and the running view does not. That
	   is the honest difference between them: the running view is one answer sized
	   to the phone, and a release is a list of a length the corpus decides. There
	   is no horizontal gesture on this screen, so a vertical scroller costs
	   nothing here — but both axes are still stated, because an unstated
	   overflow-x computes to a scrolling value to match the one that is set. */
	.body {
		flex: 1;
		min-height: 0;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	@media (min-width: 640px) {
		.column {
			max-width: 34rem;
		}
	}
</style>
