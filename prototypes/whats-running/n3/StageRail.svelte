<script lang="ts">
	/**
	 * How far along the lead has got, without inventing a denominator.
	 *
	 * The corpus does not say how many of a task's steps are finished, so a
	 * percentage bar would be a fabrication. What it does say is which of the two
	 * in-motion stages the task is standing in, and whether it has been through
	 * verification before — `latest_attempt` above zero means it has. That is
	 * real progress and it is all that is drawn here.
	 *
	 * A task back in `building` with an attempt behind it is further along than
	 * one that has never been verified, and the rail says so.
	 */
	import type { RunningStatus } from './runners.ts';

	let {
		status,
		latestAttempt,
		latestVerdict
	}: {
		status: RunningStatus;
		latestAttempt: number;
		latestVerdict: 'pass' | 'partial' | 'fail' | null;
	} = $props();

	const stages = $derived([
		{
			name: 'building',
			state: status === 'building' ? 'current' : 'behind'
		},
		{
			name: 'verifying',
			state: status === 'verifying' ? 'current' : latestAttempt > 0 ? 'behind' : 'ahead'
		}
	]);
</script>

<div class="rail" data-status={status}>
	<ol>
		{#each stages as stage (stage.name)}
			<li data-state={stage.state}>
				<span class="tick"></span>
				<span class="name">{stage.name}</span>
			</li>
		{/each}
	</ol>
	<p class="attempts">
		{#if latestAttempt === 0}
			not yet verified
		{:else}
			attempt {latestAttempt} came back {latestVerdict ?? 'unrecorded'}
		{/if}
	</p>
</div>

<style>
	ol {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.tick {
		height: var(--space-1);
		background: var(--border-glass);
	}

	.name {
		color: var(--text-muted);
	}

	/* Only the stage the task is standing in carries status colour. A stage it
	   has already been through is stated in text, not tinted — colour on this
	   page means "this is the state right now". */
	li[data-state='current'] .tick {
		background: var(--status-colour);
	}

	li[data-state='current'] .name {
		color: var(--status-colour);
	}

	li[data-state='behind'] .tick {
		background: var(--border-glass-hover);
	}

	li[data-state='behind'] .name {
		color: var(--text-secondary);
	}

	.attempts {
		margin: var(--space-3) 0 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
