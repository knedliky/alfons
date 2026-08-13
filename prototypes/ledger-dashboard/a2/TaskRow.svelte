<script lang="ts">
	/**
	 * TaskRow — one task, carrying enough context to be recognised on sight.
	 *
	 * The same row serves the search results and the sibling lists inside a
	 * release, because a task recognised in one place must look identical in
	 * the other; the only difference is whether the release is worth restating.
	 *
	 * Card supplies the button semantics and the interactive surface (as="button",
	 * ghost, flush) so no bare <button> is introduced. The row's own rule and
	 * fill live on the inner element, which is where the grounding belongs.
	 */
	import { Card } from '@alfons/design';
	import StatusMark from './StatusMark.svelte';
	import type { Task } from './corpus.ts';

	interface Props {
		task: Task;
		selected?: boolean;
		showRelease?: boolean;
		onSelect?: (id: string) => void;
	}

	let { task, selected = false, showRelease = true, onSelect }: Props = $props();

	const verdictLine = $derived(
		task.latestVerdict
			? `attempt ${task.latestAttempt} · ${task.latestVerdict}`
			: task.latestAttempt > 0
				? `attempt ${task.latestAttempt} · unsealed`
				: 'no attempt'
	);
</script>

<Card
	as="button"
	variant="ghost"
	size="flush"
	class="a2-task-row"
	type="button"
	aria-pressed={selected}
	onclick={() => onSelect?.(task.id)}
>
	<span class="row" class:selected>
		<span class="rail" style:background="var(--status-{task.status})"></span>
		<span class="identity">
			<span class="id">{task.id}</span>
			<span class="title">{task.title}</span>
			<span class="context">
				{#if showRelease}<span class="release">{task.release}</span><span class="sep">·</span
					>{/if}<span class="project">{task.project}</span><span class="sep">·</span><span
					class="phase">phase {task.phase}</span
				><span class="sep">·</span><span class="type">{task.type}</span>
			</span>
		</span>
		<span class="state">
			<StatusMark status={task.status} />
			<span class="verdict">{verdictLine}</span>
		</span>
	</span>
</Card>

<style>
	.row {
		display: grid;
		grid-template-columns: 3px minmax(0, 1fr) auto;
		gap: var(--space-4);
		align-items: start;
		width: 100%;
		text-align: left;
		padding: var(--space-4) var(--space-4) var(--space-4) 0;
		border-bottom: 1px solid var(--card-border);
		transition: background-color var(--transition-fast);
	}

	.row:hover {
		background: var(--surface-hover-subtle);
	}

	/* Selection is grounding, not colour: the row gains a fill and its rail
	   widens. The rail's colour is the task's status, which it already was. */
	.row.selected {
		background: var(--elevation-1-bg);
		box-shadow: var(--elevation-1);
	}

	.rail {
		align-self: stretch;
		min-height: var(--space-6);
	}

	.identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.id {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.title {
		font-family: var(--font-body);
		font-size: var(--text-ui);
		line-height: 1.45;
		color: var(--text-primary);
	}

	.context {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.release {
		color: var(--text-secondary);
	}

	.sep {
		padding: 0 var(--space-2);
		opacity: var(--opacity-tertiary);
	}

	.state {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: var(--space-2);
		padding-top: var(--space-1);
	}

	.verdict {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	@media (max-width: 768px) {
		.row {
			grid-template-columns: 3px minmax(0, 1fr);
		}

		.state {
			grid-column: 2;
			align-items: flex-start;
			flex-direction: row;
			gap: var(--space-4);
		}
	}
</style>
