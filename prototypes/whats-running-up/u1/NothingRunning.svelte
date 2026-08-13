<script lang="ts">
	/**
	 * A card stack with zero cards.
	 *
	 * The answer this approach settled on: it is still one card. The deck never
	 * empties — it holds a single card whose content is the answer itself. That
	 * keeps the page the same shape it has when four things are running, so
	 * nothing is missing and nothing has collapsed; only the rail is gone,
	 * because there is nowhere to move to and a disabled pager would be furniture
	 * pretending to be a control.
	 *
	 * The whole risk of this state is that it reads as a page that failed. Three
	 * things answer that, and they are the only three things here: a sentence
	 * that states the result rather than the absence, a clock time saying when
	 * that was true, and a live indicator that keeps moving. A broken page has
	 * none of those.
	 *
	 * EmptyState was the obvious library answer and is the wrong one: its icons
	 * are users/messages/posts/search/data, it centres a small block inside
	 * whatever box it is given, and it wants a call to action. There is no action
	 * to take when nothing is running.
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
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-5);
		padding: var(--space-5);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
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
