<script lang="ts" module>
	import type { Transition } from './corpus';

	export interface TransitionTapeProps {
		seed: Transition[];
		/** The page patches its own task statuses from this, as the SSE feed does. */
		onTransition: (transition: Transition) => void;
	}
</script>

<script lang="ts">
	/**
	 * The status feed, rendered as a tape rather than a list of cards.
	 *
	 * It is deliberately quiet: the corpus moves while you read it, and a feed
	 * that announced itself would compete with the command bar for the one
	 * thing the page is for. New lines arrive at the top and fade in; nothing
	 * flashes and nothing reflows the regions above.
	 */
	import { STATUS_ORDER, tasks as corpusTasks } from './corpus';
	import StatusMark from './StatusMark.svelte';

	let { seed, onTransition }: TransitionTapeProps = $props();

	/* Only what the feed has delivered since load is held here; the seed stays
	   a prop so the page can replace it without the tape losing its history. */
	let arrivals = $state<Transition[]>([]);
	let connected = $state(true);

	const lines = $derived([...arrivals, ...seed].slice(0, 12));

	/* Stands in for the SSE feed: the same shape of event on the same cadence,
	   so the page has to cope with statuses changing underneath it. */
	$effect(() => {
		const movable = corpusTasks.filter(
			(task) => task.status === 'triaged' || task.status === 'building'
		);
		let step = 0;

		const timer = setInterval(() => {
			const task = movable[step % movable.length];
			step += 1;
			const nextIndex = Math.min(
				STATUS_ORDER.indexOf(task.status) + 1,
				STATUS_ORDER.indexOf('done')
			);
			const transition: Transition = {
				at: new Date().toLocaleTimeString('en-AU', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				}),
				taskId: task.id,
				title: task.title,
				from: task.status,
				to: STATUS_ORDER[nextIndex]
			};
			arrivals = [transition, ...arrivals].slice(0, 8);
			onTransition(transition);
		}, 6000);

		return () => clearInterval(timer);
	});
</script>

<section class="tape" aria-live="polite" aria-label="Status transitions">
	<h3 class="heading">
		<span>Transitions</span>
		<span class="feed" data-connected={connected}>{connected ? 'live' : 'reconnecting'}</span>
	</h3>
	<ol class="lines">
		{#each lines as line (line.at + line.taskId)}
			<li class="line">
				<span class="at">{line.at}</span>
				<span class="title">{line.title}</span>
				<span class="move">
					<StatusMark status={line.from} />
					<span class="arrow" aria-hidden="true">&rarr;</span>
					<StatusMark status={line.to} />
				</span>
			</li>
		{/each}
	</ol>
</section>

<style>
	.tape {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 500;
		letter-spacing: var(--chart-axis-letter-spacing);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.feed {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--text-secondary);
	}

	/* The single pulsing dot is the page's only ambient motion. */
	.feed[data-connected='true']::before {
		content: '';
		width: var(--space-1);
		height: var(--space-1);
		background: var(--status-done);
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

	.lines {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	.line {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		align-items: baseline;
		gap: var(--space-2) var(--space-4);
		padding-block: var(--space-3);
		border-bottom: 1px solid var(--card-border);
		animation: arrive var(--duration-normal) ease-out both;
	}

	@keyframes arrive {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.at {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}

	.title {
		font-family: var(--font-body);
		font-size: var(--text-caption);
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.move {
		grid-column: 2;
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.arrow {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.feed[data-connected='true']::before,
		.line {
			animation: none;
		}
	}
</style>
