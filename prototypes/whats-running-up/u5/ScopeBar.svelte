<script lang="ts">
	/**
	 * One row, always in the same place, always the same height — and it is either
	 * the live beacon or the way back to it.
	 *
	 * With no second level there is no title bar saying where the reader is, so
	 * this row is half the answer to "what am I looking at". The other half is the
	 * denominator line above it, which names the count, the kind and the set in
	 * one sentence; this row deliberately repeats none of that.
	 *
	 * The design argument, and the reason it is one component rather than two:
	 * the live beacon belongs to the running set and to nothing else. Home, this
	 * row is a beacon and a clock — the deck is the running question, and it is
	 * being kept up to date. Anywhere else the beacon is gone and its place is
	 * taken by the way back to it. That is a single, unmissable difference between
	 * "you are looking at what is running" and "you are looking at a release",
	 * carried by a signal that has meaning rather than by decoration, and it costs
	 * nothing to read because the reader is already looking there.
	 *
	 * The two variants are the same height on purpose. A bar that grew when the
	 * reader went up would resize the deck underneath at the exact moment its
	 * contents changed, which is two things moving where one should.
	 *
	 * Getting back is one tap on a full-width control in the same place every
	 * time. It is at the top rather than in the thumb's reach at the bottom,
	 * because the bottom belongs to the scale control and that control must not
	 * move when the scope does. Reported as the cost it is.
	 */
	import { Button, Icon } from '@alfons/design';
	import { clockTime } from './tasks.ts';
	import type { ScopeContents } from './scope.ts';

	let {
		contents,
		checkedAt,
		onhome
	}: { contents: ScopeContents; checkedAt: Date; onhome: () => void } = $props();

	const home = $derived(contents.scope.kind === 'running');
</script>

<div class="bar">
	{#if home}
		<!-- Not a control. There is nowhere to go back to from home, and a disabled
		     button would be furniture pretending to be one. -->
		<p class="live">
			<span class="beacon"></span>
			<span>live &middot; everything running &middot; {clockTime(checkedAt)}</span>
		</p>
	{:else}
		<Button variant="secondary" type="button" onclick={onhome}>
			<Icon name="arrow-left" size="sm" />
			<span>Back to everything running</span>
		</Button>
	{/if}
</div>

<style>
	.bar {
		flex: none;
		display: flex;
		align-items: center;
		/* The touch minimum, held in both variants so the deck below never resizes
		   when the reader goes up. */
		min-height: var(--filter-control-height);
	}

	.live {
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* Neutral. Being live is not a status, and a status hue here would put a ninth
	   meaning on eight colours that already mean eight things. */
	.beacon {
		width: var(--space-2);
		height: var(--space-2);
		flex: none;
		background: var(--text-muted);
		animation: breathe var(--widget-pulse-duration) ease-in-out infinite;
	}

	@keyframes breathe {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: var(--opacity-tertiary);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.beacon {
			animation: none;
		}
	}

	/* Full width and the full touch height. Button's default is a centred pill
	   sized to its label; the way home is the most important control on the page
	   while it exists, so it takes the whole row. */
	.bar :global(button) {
		flex: 1;
		gap: var(--space-2);
		min-height: var(--filter-control-height);
		font-size: var(--text-caption);
	}
</style>
