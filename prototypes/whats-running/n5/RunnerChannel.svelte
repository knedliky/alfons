<script lang="ts">
	/**
	 * One running task, drawn as a channel on the instrument rather than a row
	 * in a list. The channel carries the whole level of depth the brief allows:
	 * what the task is, which release it belongs to, and how far along it is.
	 *
	 * Nothing here is interactive. There is no second level to reach, so a tap
	 * target would promise one that does not exist.
	 */
	import LifecycleTrack from './LifecycleTrack.svelte';
	import StatusMark from './StatusMark.svelte';
	import { departureWord, elapsed, type RunningTask } from './feed.svelte.ts';

	let { task, now }: { task: RunningTask; now: number } = $props();

	const reading = $derived(elapsed(task.enteredAt, now));
</script>

<article
	class="channel"
	data-status={task.status}
	data-departing={task.departing ?? 'no'}
	aria-label="{task.id}, {task.departing ? departureWord(task.departing) : task.status}"
>
	<div class="line">
		<span class="id">{task.id}</span>
		{#if task.departing}
			<span class="departure">{departureWord(task.departing)}</span>
		{:else}
			<StatusMark status={task.status} />
			<span class="reading">{reading}</span>
		{/if}
	</div>

	<h2 class="title">{task.title}</h2>

	<p class="origin">
		<span>{task.project}</span> · <span>{task.release}</span> ·
		<span class="phase">phase {task.phase}</span>
	</p>

	<LifecycleTrack status={task.status} departing={task.departing} />
</article>

<style>
	.channel[data-status='building'] {
		--channel-colour: var(--status-building);
	}

	.channel[data-status='verifying'] {
		--channel-colour: var(--status-verifying);
	}

	.channel {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4) 0 var(--space-4) var(--space-4);
		border-left: var(--space-1) solid var(--channel-colour);
		border-bottom: 1px solid var(--border-glass);
		/* A channel arriving is an event, so it is drawn arriving. */
		animation: arrive var(--duration-slow) var(--ease-spring) both;
	}

	@keyframes arrive {
		from {
			opacity: 0;
			transform: translateY(calc(var(--space-3) * -1));
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* A finish settles: the channel goes quiet and neutral, and the eye is
	   allowed to leave it. */
	.channel[data-departing='done'] {
		border-left-color: var(--text-muted);
		color: var(--text-muted);
		animation: settle var(--duration-slow) ease both;
	}

	@keyframes settle {
		to {
			opacity: var(--state-hover-opacity);
		}
	}

	/* A block does the opposite: it holds contrast and refuses to fade, because
	   nobody is coming back to it without being told. */
	.channel[data-departing='blocked'] {
		border-left-color: var(--colour-error);
		animation: none;
	}

	.line {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.id {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		color: var(--text-secondary);
	}

	.reading {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.departure {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.channel[data-departing='blocked'] .departure {
		color: var(--colour-error);
	}

	.title {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-body);
		font-weight: 500;
		line-height: 1.3;
		color: var(--text-primary);
	}

	.channel[data-departing='done'] .title {
		color: var(--text-muted);
	}

	.origin {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	/* The phase reading is two words that mean one thing; splitting it across a
	   line break at 370px reads as a stray numeral. */
	.origin .phase {
		white-space: nowrap;
	}

	/* Reduced motion: the channel appears and departs without travelling. It is
	   still legible as new, because its own elapsed reading starts at zero and
	   counts up — a number that changes rather than a shape that moves. */
	@media (prefers-reduced-motion: reduce) {
		.channel,
		.channel[data-departing='done'] {
			animation: none;
		}

		.channel[data-departing='done'] {
			opacity: var(--state-hover-opacity);
		}
	}
</style>
