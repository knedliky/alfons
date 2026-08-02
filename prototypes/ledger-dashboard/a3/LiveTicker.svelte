<script lang="ts">
	/**
	 * The SSE feed, made visible.
	 *
	 * The corpus corrects statuses underneath the view, and a silent correction is
	 * indistinguishable from a stale page. The ticker states what moved and when,
	 * so a status changing under the cursor is explained rather than surprising.
	 */
	import StatusMark from './StatusMark.svelte';
	import type { TransitionEvent } from './corpus.ts';

	interface Props {
		events: TransitionEvent[];
		connected: boolean;
	}

	const { events, connected }: Props = $props();
</script>

<div class="ticker" aria-label="Live status transitions">
	<div class="state">
		<span class="pulse" data-connected={connected} aria-hidden="true"></span>
		<span class="state-label">{connected ? 'Live' : 'Reconnecting'}</span>
	</div>
	<ul class="events">
		{#each events.slice(0, 4) as event (event.taskId + event.at)}
			<li>
				<span class="at">{event.at}</span>
				<span class="event-id">{event.taskId}</span>
				<StatusMark status={event.from} showLabel={false} size="sm" />
				<span class="arrow" aria-hidden="true">→</span>
				<StatusMark status={event.to} size="sm" />
			</li>
		{/each}
	</ul>
</div>

<style>
	.ticker {
		display: flex;
		align-items: center;
		gap: var(--space-5);
		flex-wrap: wrap;
		padding: var(--space-3) var(--space-4);
		background: var(--surface-raised-bg);
		border: 1px solid var(--card-border);
		box-shadow: var(--elevation-1);
	}

	.state {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		flex: none;
	}

	/* Connection health is not a task status, so it wears the accent, not the map. */
	.pulse {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--text-muted);
	}

	.pulse[data-connected='true'] {
		background: var(--accent);
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

	.state-label {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-secondary);
	}

	.events {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.events li {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.at,
	.event-id {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.event-id {
		color: var(--text-secondary);
	}

	.arrow {
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.pulse[data-connected='true'] {
			animation: none;
		}
	}
</style>
