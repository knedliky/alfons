<script lang="ts">
	/**
	 * The middle pane: either the selected release broken into its phases, or the
	 * search results when a query is live.
	 *
	 * Results replace this pane rather than floating over it, so the release index
	 * on one side and the task dossier on the other both stay put while you look.
	 */
	import { Pill } from '@alfons/design';
	import PhaseMeter from './PhaseMeter.svelte';
	import TaskRow from './TaskRow.svelte';
	import type { Release, Task, TaskStatus } from './corpus.ts';

	interface Props {
		release: Release | null;
		phases: { phase: number; tasks: Task[] }[];
		statusCounts: Partial<Record<TaskStatus, number>>;
		releaseTaskTotal: number;
		query: string;
		results: Task[];
		selectedTaskId: string | null;
		onSelectTask: (id: string) => void;
		onClearQuery: () => void;
	}

	const {
		release,
		phases,
		statusCounts,
		releaseTaskTotal,
		query,
		results,
		selectedTaskId,
		onSelectTask,
		onClearQuery
	}: Props = $props();
</script>

<div class="body">
	{#if query}
		<header class="results-head">
			<h2 class="results-heading">
				Results for <span class="query">{query}</span>
			</h2>
			<button type="button" class="clear" onclick={onClearQuery}>Clear and return to release</button
			>
		</header>
		{#if results.length === 0}
			<p class="none">
				Nothing in the corpus matches that fragment. Titles are searched across every release and
				project.
			</p>
		{:else}
			<div class="rows">
				{#each results as task (task.id)}
					<TaskRow
						{task}
						showContext
						selected={task.id === selectedTaskId}
						onSelect={onSelectTask}
					/>
				{/each}
			</div>
		{/if}
	{:else if release}
		<header class="release-head">
			<p class="eyebrow">
				<span>{release.project}</span>
				<span class="eyebrow-sep" aria-hidden="true">/</span>
				<span>{release.slug}</span>
			</p>
			<h2 class="release-title">{release.title}</h2>
			<div class="release-tags">
				{#each release.tags as tag (tag)}
					<Pill label={tag} size="sm" fill="soft" tint="var(--text-secondary)" />
				{/each}
				{#if release.isBucket}
					<Pill label="bucket" size="sm" fill="outline" tint="var(--text-muted)" />
				{/if}
			</div>
			<p class="documented">
				{#if release.documentedOn}
					Documented {release.documentedOn}
				{:else}
					Not yet documented
				{/if}
				<span class="documented-sep" aria-hidden="true">·</span>
				{release.taskCount} tasks
			</p>
			<div class="meter-wrap">
				<PhaseMeter counts={statusCounts} total={releaseTaskTotal} />
			</div>
		</header>

		{#each phases as group (group.phase)}
			<section class="phase">
				<h3 class="phase-heading">
					<span class="phase-number">Phase {group.phase}</span>
					<span class="phase-count">{group.tasks.length} tasks</span>
				</h3>
				<div class="rows">
					{#each group.tasks as task (task.id)}
						<TaskRow {task} selected={task.id === selectedTaskId} onSelect={onSelectTask} />
					{/each}
				</div>
			</section>
		{/each}

		{#if phases.length === 0}
			<p class="none">
				This release has {release.taskCount} tasks in the corpus; none are loaded into this fixture.
			</p>
		{/if}
	{/if}
</div>

<style>
	.body {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.release-head {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.eyebrow {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-muted);
	}

	.eyebrow-sep {
		opacity: var(--opacity-tertiary);
	}

	/* The editorial voice: the release name is the headline of this pane. */
	.release-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 2rem;
		line-height: 1.15;
		color: var(--text-primary);
		max-width: 34ch;
	}

	.release-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.documented {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.documented-sep {
		opacity: var(--opacity-tertiary);
	}

	.meter-wrap {
		padding-top: var(--space-3);
	}

	.phase {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.phase-heading {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		margin: 0;
		padding-bottom: var(--space-2);
		border-bottom: 2px solid var(--card-border);
	}

	.phase-number {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--text-primary);
	}

	.phase-count {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.rows {
		display: flex;
		flex-direction: column;
	}

	.results-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		padding-bottom: var(--space-3);
		border-bottom: 2px solid var(--card-border);
	}

	.results-heading {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.5rem;
		color: var(--text-primary);
	}

	.query {
		color: var(--text-secondary);
		font-style: italic;
	}

	.clear {
		background: transparent;
		border: 0;
		padding: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}

	.clear:hover {
		color: var(--text-primary);
	}

	.none {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-caption);
		line-height: 1.6;
		color: var(--text-muted);
		max-width: 52ch;
	}
</style>
