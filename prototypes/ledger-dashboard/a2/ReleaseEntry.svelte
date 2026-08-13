<script lang="ts">
	/**
	 * ReleaseEntry — one release, told rather than tiled.
	 *
	 * A grid of equal cards says every release matters equally, which is false:
	 * the reader arrived for one of them. So this is an editorial entry — an
	 * ordinal, a slug, a display-voice title, a standfirst that says what the
	 * release is for — and the lead entry is set larger than the rest.
	 *
	 * The phases are the spine. Each carries its own rule and its tally, and the
	 * sibling tasks sit under the phase they belong to, which is the question
	 * the reader actually came to answer.
	 */
	import StatusMark from './StatusMark.svelte';
	import TaskRow from './TaskRow.svelte';
	import { STATUS_ORDER } from './corpus.ts';
	import type { Release, Task, TaskStatus } from './corpus.ts';

	interface Props {
		release: Release;
		ordinal: number;
		tasks: Task[];
		lead?: boolean;
		selectedTaskId?: string | null;
		dependencies?: Task[];
		onSelectTask?: (id: string) => void;
	}

	let {
		release,
		ordinal,
		tasks,
		lead = false,
		selectedTaskId = null,
		dependencies = [],
		onSelectTask
	}: Props = $props();

	const phases = $derived(
		[...new Set(tasks.map((task) => task.phase))]
			.sort((a, b) => a - b)
			.map((phase) => ({
				phase,
				tasks: tasks.filter((task) => task.phase === phase)
			}))
	);

	function tally(group: Task[]): { status: TaskStatus; count: number }[] {
		const counts: Partial<Record<TaskStatus, number>> = {};
		for (const task of group) counts[task.status] = (counts[task.status] ?? 0) + 1;
		// Tallied in status order, so the same phase always reads the same way.
		return STATUS_ORDER.filter((status) => counts[status] !== undefined).map((status) => ({
			status,
			count: counts[status] ?? 0
		}));
	}

	const shipped = $derived(tasks.filter((task) => task.status === 'done').length);
	const ordinalLabel = $derived(String(ordinal).padStart(2, '0'));
</script>

<article class="entry" class:lead>
	<header class="entry-head">
		<span class="ordinal">{ordinalLabel}</span>
		<div class="headline-block">
			<span class="slug">{release.slug}</span>
			<h3 class="entry-title">{release.title}</h3>
			<p class="standfirst">{release.standfirst}</p>
			<p class="dateline">
				<span class="project">{release.project}</span>
				<span class="sep">·</span>
				<span>{release.taskCount} tasks, {shipped} of them shipped</span>
				<span class="sep">·</span>
				{#if release.documentedOn}
					<span>documented {release.documentedOn}</span>
				{:else}
					<span class="undocumented">no release document</span>
				{/if}
				<span class="sep">·</span>
				<span class="tags">{release.tags.join(', ')}</span>
			</p>
		</div>
	</header>

	<div class="phases">
		{#each phases as group (group.phase)}
			<section class="phase">
				<header class="phase-head">
					<h4 class="phase-name">Phase {group.phase}</h4>
					<div class="phase-tally">
						{#each tally(group.tasks) as entry (entry.status)}
							<span class="tally-item">
								<StatusMark status={entry.status} size="sm" showLabel={false} />
								<span class="tally-count">{entry.count} {entry.status}</span>
							</span>
						{/each}
					</div>
				</header>
				<div class="phase-tasks">
					{#each group.tasks as task (task.id)}
						<TaskRow
							{task}
							showRelease={false}
							selected={task.id === selectedTaskId}
							onSelect={onSelectTask}
						/>
						{#if task.id === selectedTaskId && dependencies.length > 0}
							<div class="dependencies">
								<span class="dependencies-label">{task.id} depends on</span>
								<ul class="dependency-list">
									{#each dependencies as dependency (dependency.id)}
										<li>
											<span class="dependency-id">{dependency.id}</span>
											<span class="dependency-title">{dependency.title}</span>
											<StatusMark status={dependency.status} size="sm" />
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					{/each}
				</div>
			</section>
		{/each}
	</div>
</article>

<style>
	.entry {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding-top: var(--space-6);
		border-top: 1px solid var(--card-border);
	}

	/* The lead entry carries a heavier rule, the way a spread's lead story does. */
	.entry.lead {
		border-top: 2px solid var(--text-secondary);
	}

	.entry-head {
		display: grid;
		grid-template-columns: 4rem minmax(0, 1fr);
		gap: var(--space-5);
		align-items: start;
	}

	.ordinal {
		font-family: var(--font-display);
		font-size: 2.5rem;
		line-height: 1;
		color: var(--text-muted);
		opacity: var(--opacity-tertiary);
	}

	.headline-block {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		min-width: 0;
	}

	.slug {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--text-muted);
	}

	.entry-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.875rem;
		line-height: 1.12;
		letter-spacing: -0.015em;
		color: var(--text-primary);
		max-width: 26ch;
	}

	.entry.lead .entry-title {
		font-size: 2.75rem;
		max-width: 20ch;
	}

	.standfirst {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-ui);
		line-height: 1.6;
		color: var(--text-secondary);
		max-width: 62ch;
	}

	.entry.lead .standfirst {
		font-size: var(--text-lead);
		line-height: 1.55;
		color: var(--text-primary);
		max-width: 56ch;
	}

	.dateline {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.project {
		color: var(--text-secondary);
	}

	.undocumented {
		color: var(--text-secondary);
		text-decoration: underline dotted;
		text-underline-offset: 3px;
	}

	.sep {
		padding: 0 var(--space-2);
		opacity: var(--opacity-tertiary);
	}

	.phases {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding-left: calc(4rem + var(--space-5));
	}

	.phase-head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--border-glass);
	}

	.phase-name {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-primary);
	}

	.phase-tally {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.tally-item {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.tally-count {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.phase-tasks {
		display: flex;
		flex-direction: column;
	}

	.dependencies {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4) var(--space-4) var(--space-4) var(--space-5);
		background: var(--surface-dark-subtle);
		border-bottom: 1px solid var(--card-border);
	}

	.dependencies-label {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-muted);
	}

	.dependency-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.dependency-list li {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-3);
	}

	.dependency-id {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.dependency-title {
		font-family: var(--font-body);
		font-size: var(--text-caption);
		color: var(--text-primary);
	}

	@media (max-width: 768px) {
		.entry-head {
			grid-template-columns: minmax(0, 1fr);
			gap: var(--space-3);
		}

		.phases {
			padding-left: 0;
		}

		.entry.lead .entry-title {
			font-size: 2rem;
		}
	}
</style>
