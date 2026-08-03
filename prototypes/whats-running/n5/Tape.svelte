<script lang="ts">
	/**
	 * The trailing tape: the last three transitions, whatever they were.
	 *
	 * This is the one thing only a feed-first page can show. Every other reading
	 * of the brief renders current state, so a task that finishes simply stops
	 * being there; here it leaves a line saying it finished, which is the
	 * difference between "gone" and "done".
	 *
	 * Three deep and set in the smallest type on the page. It is a trailing log,
	 * not a history, and it must never compete with what is running now.
	 */
	import { clockTime, type Transition } from './feed.svelte.ts';

	let { entries, label = 'Just happened' }: { entries: Transition[]; label?: string } = $props();
</script>

{#if entries.length > 0}
	<section class="tape" aria-label="Recent transitions">
		<h2 class="label">{label}</h2>
		<ol>
			{#each entries as entry (entry.key)}
				<li>
					<span class="at">{clockTime(entry.at)}</span>
					<span class="id">{entry.taskId}</span>
					<span class="move" data-to={entry.to}>{entry.from} → {entry.to}</span>
				</li>
			{/each}
		</ol>
	</section>
{/if}

<style>
	.tape {
		padding-top: var(--space-4);
	}

	.label {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 400;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	ol {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	li {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		animation: land var(--duration-normal) ease both;
	}

	@keyframes land {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.at {
		font-variant-numeric: tabular-nums;
		opacity: var(--opacity-tertiary);
	}

	.id {
		color: var(--text-secondary);
		letter-spacing: 0.06em;
		/* A task id is a single token to the eye; wrapping it mid-identifier
		   costs more than the line it saves at 370px. */
		white-space: nowrap;
	}

	.move {
		margin-left: auto;
		white-space: nowrap;
	}

	/* Colour on the tape encodes where the task went, and only that. */
	.move[data-to='building'] {
		color: var(--status-building);
	}

	.move[data-to='verifying'] {
		color: var(--status-verifying);
	}

	.move[data-to='blocked'] {
		color: var(--colour-error);
	}

	@media (prefers-reduced-motion: reduce) {
		li {
			animation: none;
		}
	}
</style>
