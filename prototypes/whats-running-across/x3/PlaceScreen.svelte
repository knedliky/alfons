<script lang="ts">
	/**
	 * The chrome one open place shares: a way back, a title, the focus rules.
	 *
	 * Adapted from the winner's PushedScreen with the stack removed. In the
	 * trail model exactly one place is ever open — a lateral jump replaces the
	 * screen rather than stacking a frame on it — so there is no depth, no
	 * inert frames beneath, and no rule needed to stop release → project →
	 * release growing forever: history records the loop honestly as the journey
	 * it was, and the trail dedupes it into one chip each.
	 *
	 * Still fixed, opaque and full-bleed, still rendered as a sibling of
	 * PageFrame — inherited finding: PageFrame's column is one stacking context
	 * and a fixed screen inside it can never clear the Header, which at 370px
	 * intercepted the back control. Still leaves the running view mounted and
	 * inert underneath, because the deck is a scroll container and unmounting
	 * it loses the card the reader left from.
	 *
	 * Back is the browser's, so the edge-swipe, the hardware button and this
	 * control are one back — and because every trail tap is a pushState, back
	 * walks the reader's own journey, place by place, which is the trail's
	 * ordering promise kept by the browser itself.
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

	/** For the page, when the control that opened this screen no longer exists. */
	export function focus() {
		region?.focus();
	}

	/**
	 * A transition rather than a CSS animation, because the screen has to leave
	 * as well as arrive. Duration collapses to zero under
	 * prefers-reduced-motion; the position still changes, only instantly.
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
		/* Opaque and full-bleed: a place, not a sheet. */
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
		/* Clears the trail strip, which is fixed along the bottom above this
		   screen, and inside the strip's own padding the harness pager. Set on
		   the page root so every screen and the running view clear the same
		   band. */
		padding-bottom: var(--trail-clearance);
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
		/* The type scale stops at --text-lead, a caption size for the name of
		   the screen you are standing on. Inherited literal ceiling; the floor
		   is the token. */
		font-size: clamp(var(--text-lead), 6vw, 1.75rem);
		line-height: 1.15;
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}

	/* A place screen DOES scroll vertically; the running view does not. Both
	   axes stated, because an unstated overflow-x computes to a scrolling value
	   to match the one that is set. */
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
