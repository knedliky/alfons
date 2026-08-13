<script lang="ts">
	/**
	 * The task level with zero tasks — which on this corpus is the usual state.
	 *
	 * Carried from the winning approach with one sentence changed, and the
	 * change is this approach's whole answer to the round's conceded dead end.
	 * In the stack model, no task meant no way up, because the upward move
	 * lived on a task card. Here the vertical axis exists independently of what
	 * the task level contains: the axis bar stands above this card and the up
	 * control still climbs to the release level, so the empty state is a floor
	 * of a navigable building rather than a locked room. The reassurance line
	 * now says so, because an affordance the empty state never mentions is one
	 * the reader who most needs it will not find.
	 *
	 * EmptyState was the obvious library answer and is the wrong one: its icons
	 * are users/messages/posts/search/data, it centres a small block inside
	 * whatever box it is given, and it wants a call to action. The action here
	 * lives on the axis bar, not in the card.
	 */
	import { clockTime } from './tasks.ts';

	let { checkedAt }: { checkedAt: Date } = $props();
</script>

<section class="empty" aria-label="Nothing running">
	<p class="statement">No agent is working on anything at this moment.</p>
	<p class="reassurance">
		This is the whole answer at this level. The releases and projects above it are still there — go
		up — and the page will fill itself the moment something starts.
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
