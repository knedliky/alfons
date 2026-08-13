<script lang="ts">
	/**
	 * The SSE feed, as a ledger of corrections.
	 *
	 * Statuses change underneath the reader; a page that only repaints them is
	 * a page that lies quietly. The strip records each transition as a line —
	 * time, task, from, to — so anything that moved while the page was open can
	 * be accounted for rather than guessed at.
	 *
	 * The newest line is marked by weight and a fill, never by colour: the
	 * status marks in the line are already carrying colour for state, and a
	 * second colour meaning "new" would collide with the first.
	 */
	import type { Transition } from './ledger-corpus';
	import StatusMark from './StatusMark.svelte';

	interface Props {
		transitions: Transition[];
		/** Index of the row that arrived most recently. */
		newestIndex: number;
	}

	let { transitions, newestIndex }: Props = $props();
</script>

<section class="strip" aria-label="Live status transitions">
	<header>
		<span class="pulse" aria-hidden="true"></span>
		<h3 class="heading">Live</h3>
		<p class="note">Status transitions, applied to this page as they arrive</p>
	</header>

	<ol>
		{#each transitions as transition, index (transition.taskId + transition.at)}
			<li class:is-newest={index === newestIndex}>
				<span class="at">{transition.at}</span>
				<span class="task">{transition.taskId}</span>
				<span class="move">
					<StatusMark status={transition.from} />
					<span class="arrow" aria-hidden="true">&rarr;</span>
					<StatusMark status={transition.to} />
				</span>
			</li>
		{/each}
	</ol>
</section>

<style>
	.strip {
		border-block-start: var(--space-1) solid var(--text-primary);
		padding-block-start: var(--space-4);
	}

	header {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.pulse {
		inline-size: var(--space-2);
		block-size: var(--space-2);
		background: var(--text-primary);
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
		.pulse {
			animation: none;
		}
	}

	.heading {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--text-primary);
	}

	.note {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}

	ol {
		margin: var(--space-4) 0 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		grid-template-columns: 3.5rem 5.5rem minmax(0, 1fr);
		align-items: center;
		gap: var(--space-4);
		padding-block: var(--space-3);
		border-block-start: 1px solid var(--border-glass);
	}

	li.is-newest {
		background: var(--surface-hover-subtle);
		box-shadow: inset var(--space-1) 0 0 0 var(--text-primary);
		padding-inline-start: var(--space-3);
	}

	.at,
	.task {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-variant-numeric: tabular-nums;
		color: var(--text-secondary);
	}

	li.is-newest .task {
		font-weight: 700;
		color: var(--text-primary);
	}

	.move {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.arrow {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}
</style>
