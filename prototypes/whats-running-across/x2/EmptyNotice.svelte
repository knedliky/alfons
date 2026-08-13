<script lang="ts">
	/**
	 * The usual state of this page, on a map.
	 *
	 * The settled empty state was a full card, because a deck with zero cards
	 * still had to be a deck. A map with zero runners is NOT an empty map —
	 * the whole corpus is still on it, dimmed, with nothing lit — so the
	 * statement shrinks from a card that owns the screen to a band above the
	 * map, and the map beneath it stays fully navigable. That is this
	 * approach's answer to the round's conceded edge: arriving when nothing
	 * runs, the reader is not at a dead end; they are at altitude over
	 * everything, and every project and release is one tap away.
	 *
	 * The three devices that make emptiness read as deliberate are kept from
	 * the settled design: a sentence stating the result rather than the
	 * absence, a clock time saying when it was true, and a beacon that keeps
	 * moving. EmptyState (the library atom) remains the wrong answer for the
	 * settled reasons: wrong icons, wants a call to action, centres in a box.
	 */
	import { clockTime } from './tasks.ts';

	let { checkedAt }: { checkedAt: Date } = $props();
</script>

<section class="empty" aria-label="Nothing running">
	<p class="statement">No agent is working on anything at this moment.</p>
	<p class="reassurance">
		The map below is the whole corpus, settled. It lights up the moment something starts.
	</p>
	<p class="pulse">
		<span class="beacon"></span>
		<span>live &middot; last checked {clockTime(checkedAt)}</span>
	</p>
</section>

<style>
	.empty {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
	}

	.statement {
		margin: 0;
		font-family: var(--font-display);
		/* The type scale stops at --text-lead; the primary statement of the page's
		   usual state deserves more than a caption size. Inherited finding. */
		font-size: clamp(var(--text-lead), 6vw, 1.75rem);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	.reassurance {
		margin: 0;
		font-size: var(--text-ui);
		line-height: 1.5;
		color: var(--text-secondary);
	}

	.pulse {
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

	/* Neutral, not status-coloured: nothing has a status, so nothing may take a
	   status colour. It moves because a still page is what a broken page looks
	   like. */
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
</style>
