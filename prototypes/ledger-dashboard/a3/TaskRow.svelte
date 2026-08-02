<script lang="ts">
	/**
	 * One task, as a selectable row.
	 *
	 * The same row serves the phase list and the search results; `showContext`
	 * adds the release and project line that lets a result be recognised on sight
	 * when it arrives from a search rather than from a release already in view.
	 */
	import StatusMark from './StatusMark.svelte';
	import type { Task } from './corpus.ts';

	interface Props {
		task: Task;
		selected?: boolean;
		showContext?: boolean;
		onSelect: (id: string) => void;
	}

	const { task, selected = false, showContext = false, onSelect }: Props = $props();
</script>

<button
	type="button"
	class="row"
	data-selected={selected}
	aria-current={selected ? 'true' : undefined}
	onclick={() => onSelect(task.id)}
>
	<span class="rail" aria-hidden="true"></span>

	<span class="identity">
		<span class="id">{task.id}</span>
		<span class="title">{task.title}</span>
		{#if showContext}
			<span class="context">
				<span class="context-release">{task.release}</span>
				<span class="context-sep" aria-hidden="true">/</span>
				<span>{task.project}</span>
				<span class="context-sep" aria-hidden="true">/</span>
				<span>phase {task.phase}</span>
			</span>
		{/if}
	</span>

	<span class="meta">
		<span class="type">{task.type}</span>
		<span class="counts">
			{task.criterionCount}C · {task.stepCount}S · {task.fileChangeCount}F
		</span>
		<StatusMark status={task.status} size="sm" />
	</span>
</button>

<style>
	.row {
		display: flex;
		align-items: flex-start;
		gap: var(--space-4);
		width: 100%;
		/* Generous row height is the Linear/Height debt the current page never paid. */
		padding: var(--space-4) var(--space-4) var(--space-4) 0;
		background: transparent;
		border: 0;
		border-bottom: 1px solid var(--card-border);
		text-align: left;
		cursor: pointer;
		position: relative;
		transition: background var(--transition-fast);
	}

	.row:hover {
		background: var(--surface-hover-subtle);
	}

	.row[data-selected='true'] {
		background: var(--accent-bg-subtle);
	}

	.row:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: -2px;
	}

	/* The accent, used once: to say which row the detail pane is showing. */
	.rail {
		flex: none;
		align-self: stretch;
		width: 2px;
		background: transparent;
	}

	.row[data-selected='true'] .rail {
		background: var(--accent);
	}

	.identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
		flex: 1;
	}

	.id {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		letter-spacing: 0.06em;
	}

	.title {
		font-family: var(--font-body);
		font-size: var(--text-ui);
		line-height: 1.4;
		color: var(--text-primary);
	}

	.context {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.context-release {
		color: var(--text-secondary);
	}

	.context-sep {
		opacity: var(--opacity-tertiary);
	}

	.meta {
		display: flex;
		flex: none;
		align-items: center;
		gap: var(--space-4);
		padding-top: var(--space-1);
	}

	.type,
	.counts {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		letter-spacing: 0.04em;
	}

	.counts {
		font-variant-numeric: tabular-nums;
	}

	@media (max-width: 900px) {
		.counts,
		.type {
			display: none;
		}
	}
</style>
