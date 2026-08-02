<script lang="ts" module>
	import type { Task } from './corpus';

	export interface TaskRowProps {
		task: Task;
		/** Keyboard highlight inside the command results — not a selection. */
		active?: boolean;
		/** The task the page is currently resolved to. */
		current?: boolean;
		/** Results need the release named; siblings already sit under it. */
		showRelease?: boolean;
		/** Stacks the row for the narrow aside, where four columns will not fit. */
		compact?: boolean;
		onSelect: (id: string) => void;
	}
</script>

<script lang="ts">
	/**
	 * One task as a row: mark, id, title, and enough context to be recognised
	 * on sight. The same row serves the command results, the phase spine and
	 * the dependency list, because a result that looked different from the
	 * thing it resolves to would make the reader check twice.
	 */
	import { Card } from '@alfons/design';
	import StatusMark from './StatusMark.svelte';

	let {
		task,
		active = false,
		current = false,
		showRelease = true,
		compact = false,
		onSelect
	}: TaskRowProps = $props();
</script>

<Card
	as="button"
	size="flush"
	variant="ghost"
	class="task-row"
	data-active={active}
	data-current={current}
	data-compact={compact}
	type="button"
	onclick={() => onSelect(task.id)}
>
	<span class="rail"></span>
	<span class="identity">
		<span class="id">{task.id}</span>
		<StatusMark status={task.status} />
	</span>
	<span class="title">{task.title}</span>
	<span class="context">
		<span class="project">{task.project}</span>
		{#if showRelease}
			<span class="divider" aria-hidden="true">/</span>
			<span class="release">{task.release}</span>
		{/if}
		<span class="divider" aria-hidden="true">/</span>
		<span class="phase">phase {task.phase}</span>
	</span>
</Card>

<style>
	/* The class is repeated only to outrank Card's own [data-size='flush']
	   padding reset, which a single class ties with and loses to on order. */
	:global(.task-row.task-row.task-row) {
		display: grid;
		grid-template-columns: calc(var(--stroke-normal) * 2px) minmax(0, 13rem) minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-4);
		width: 100%;
		/* Generous row height is the Linear/Height tell — a list you can aim at. */
		min-height: var(--space-7);
		padding-block: var(--space-3);
		padding-inline: var(--space-4) var(--space-5);
		text-align: left;
		background: transparent;
		border: none;
		border-bottom: 1px solid var(--card-border);
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			padding-inline-start var(--transition-fast);
	}

	:global(.task-row:hover),
	:global(.task-row[data-active='true']) {
		background: var(--surface-hover-subtle);
	}

	/* The accent appears once per list, on the row under the cursor. That is
	   the whole budget for it in this region. */
	.rail {
		align-self: stretch;
		background: transparent;
		transition: background-color var(--transition-fast);
	}

	:global(.task-row[data-active='true']) .rail {
		background: var(--accent);
	}

	:global(.task-row[data-current='true']) .rail {
		background: var(--text-secondary);
	}

	.identity {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		min-width: 0;
	}

	.id {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--chart-axis-letter-spacing);
		color: var(--text-muted);
	}

	.title {
		font-family: var(--font-body);
		font-size: var(--text-ui);
		line-height: 1.4;
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.task-row[data-current='true']) .title {
		color: var(--text-primary);
		font-weight: 600;
	}

	.context {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		white-space: nowrap;
	}

	.release {
		color: var(--text-secondary);
	}

	.divider {
		opacity: var(--opacity-tertiary);
	}

	/* Stacked layout, shared by the narrow aside and by narrow viewports —
	   the same row, folded, rather than a second component. */
	:global(.task-row.task-row.task-row[data-compact='true']) {
		grid-template-columns: calc(var(--stroke-normal) * 2px) minmax(0, 1fr);
		row-gap: var(--space-2);
	}

	:global(.task-row[data-compact='true']) .title,
	:global(.task-row[data-compact='true']) .context {
		grid-column: 2;
		white-space: normal;
	}

	@media (max-width: 900px) {
		:global(.task-row.task-row.task-row) {
			grid-template-columns: calc(var(--stroke-normal) * 2px) minmax(0, 1fr);
			row-gap: var(--space-2);
		}

		.title,
		.context {
			grid-column: 2;
			white-space: normal;
		}
	}
</style>
