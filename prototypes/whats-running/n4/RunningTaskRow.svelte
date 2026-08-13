<script lang="ts">
	/**
	 * One running task, with its progress in the primary position.
	 *
	 * The row is read top to bottom as: how far along, then what state, then what
	 * it is, then where it belongs, then the single criterion standing in the way.
	 *
	 * The rationing decision lives here. Four criteria of prose per task, four
	 * tasks, on a 370px screen is a page of reading, not a glance — so the marks
	 * carry all four criteria and only ONE body is set in prose: the frontier,
	 * meaning the first failure or, failing that, the first thing nobody has
	 * judged. Everything the reader loses by that is recoverable from the marks
	 * and the tally, except the wording of criteria that are already settled,
	 * which is the part a glance was never going to spend attention on.
	 */
	import { Card } from '@alfons/design';
	import CriteriaMeter from './CriteriaMeter.svelte';
	import StatusMark from './StatusMark.svelte';
	import {
		frontier,
		latestAttempt,
		outcomes,
		tally,
		tallySentence,
		type RunningTask
	} from './runners.ts';

	let { task }: { task: RunningTask } = $props();

	const marks = $derived(outcomes(task));
	const counted = $derived(tally(task));
	const latest = $derived(latestAttempt(task));
	const ahead = $derived(frontier(task));

	/**
	 * A `building` task can still carry a seal: it was verified, it failed, and it
	 * went back to building. Saying so is what keeps its marks from reading as
	 * current judgement on work that has moved since.
	 */
	const sealLine = $derived.by(() => {
		if (!latest) return 'not yet verified';
		if (task.status === 'building') {
			return `back to building after attempt ${latest.attempt} — ${latest.verdict}, ${latest.sealedOn}`;
		}
		return `attempt ${latest.attempt} — ${latest.verdict}, sealed ${latest.sealedOn}`;
	});

	const frontierLabel = $derived.by(() => {
		if (!ahead) return '';
		if (ahead.outcome === 'fail') return 'Outstanding';
		return counted.neverJudged ? 'First to prove' : 'Still unjudged';
	});
</script>

<Card as="article" size="compact">
	<CriteriaMeter {marks} />

	<!-- The meter's text equivalent, and the row's headline. Never a bare "0 of
	     4": a task with no attempt says so in words instead of scoring itself. -->
	<p class="tally">{tallySentence(task)}</p>

	<p class="state">
		<StatusMark status={task.status} />
		<span class="seal">{sealLine}</span>
	</p>

	<h2 class="title">
		<span class="task-id">{task.id}</span>
		{task.title}
	</h2>

	<p class="belongs">{task.project} · {task.release} · phase {task.phase}</p>

	<!-- No frontier means nothing stands in the way, and the tally has already
	     said so. A block reading "nothing outstanding" would be an element that
	     merely could be there. -->
	{#if ahead}
		<div class="frontier">
			<p class="frontier-label">{frontierLabel} · {ahead.criterion.id}</p>
			<p class="frontier-body">{ahead.criterion.body}</p>
		</div>
	{/if}
</Card>

<style>
	.tally {
		margin: var(--space-3) 0 0;
		font-size: var(--text-lead);
		line-height: 1.3;
		color: var(--text-primary);
	}

	.state {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2) var(--space-3);
		margin: var(--space-2) 0 0;
	}

	.seal {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.title {
		margin: var(--space-4) 0 0;
		font-family: var(--font-body);
		font-size: var(--text-ui);
		/* Literal: the type scale stops at --text-lead and exports no weight tokens. */
		font-weight: 400;
		line-height: 1.45;
		color: var(--text-secondary);
	}

	.task-id {
		font-family: var(--font-mono);
		color: var(--text-primary);
	}

	.belongs {
		margin: var(--space-1) 0 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.frontier {
		margin-top: var(--space-4);
		padding-top: var(--space-3);
		border-top: 1px solid var(--card-border);
	}

	.frontier-label {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		color: var(--text-muted);
	}

	.frontier-body {
		margin: var(--space-1) 0 0;
		font-size: var(--text-caption);
		line-height: 1.5;
		color: var(--text-secondary);
		/* Prose is the one thing here that can run long. Three lines is the most a
		   glance will spend; the marks carry the rest of the criteria anyway. */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		overflow: hidden;
	}
</style>
