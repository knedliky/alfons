<script lang="ts">
	/**
	 * A deck with zero cards is still one card.
	 *
	 * Carried over from n2 unchanged in substance, and it matters more here than
	 * it did there. A vertical deck's whole position sense is the scroll bar, and
	 * an empty page has no scroll bar at all — so the empty state must be legible
	 * as a deliberate answer without any of the machinery that carries the
	 * multi-card case. It gets the one full-height card, the count heading above
	 * it says "Nothing is running", and there is nothing to scroll to because
	 * there is nothing else.
	 *
	 * The risk is that it reads as a page that failed. Three things answer that
	 * and they are the only three things here: a sentence that states the result
	 * rather than the absence, a clock time saying when that was true, and a live
	 * indicator that keeps moving. A broken page has none of those.
	 *
	 * EmptyState was declined in n2 and is declined again: it wants a call to
	 * action, and there is no action to take when nothing is running.
	 */
	import { clockTime } from './tasks.ts';

	let { checkedAt }: { checkedAt: Date } = $props();
</script>

<section class="empty" aria-label="Nothing running">
	<p class="statement">No agent is working on anything at this moment.</p>
	<p class="reassurance">
		This is the whole answer. The page is listening, and it will fill itself the moment something
		starts.
	</p>
	<p class="pulse">
		<span class="beacon"></span>
		<span>live &middot; last checked {clockTime(checkedAt)}</span>
	</p>
</section>

<style>
	.empty {
		height: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-5);
		padding: var(--space-5);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		/* Both axes, for the same reason as the task card: `clip` is the only
		   value that does not make a scroll container, and a nested scroll
		   container on the deck's own axis would swallow the page scroll. */
		overflow: clip;
	}

	.statement {
		margin: 0;
		font-family: var(--font-display);
		/* Matches the card title. The empty state is the primary design, so it
		   gets the primary typographic weight rather than a muted apology. */
		font-size: clamp(var(--text-lead), 7.5vw, 2.125rem);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	.reassurance {
		margin: 0;
		font-size: var(--text-ui);
		line-height: 1.5;
		color: var(--text-secondary);
		max-width: var(--section-header-max-width);
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
