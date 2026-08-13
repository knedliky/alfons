<script lang="ts" module>
	export interface ReleaseBodyProps {
		release: ReleaseSummary;
		/** 'peek' inside a PeekSheet, 'place' on a PushedScreen. */
		context: 'peek' | 'place';
		onPeekProject: (opener: HTMLElement) => void;
	}
</script>

<script lang="ts">
	/**
	 * ReleaseBody — a release's substance, rendered the same in a peek and in
	 * the place.
	 *
	 * One component for both on purpose: the honesty test is that a glance shows
	 * the release truthfully — every task, every status — not a teaser of it.
	 * What the committed screen adds is not information, it is standing: real
	 * back, a URL, the full height, and the release's tags. The tags are the one
	 * thing withheld from the peek, because at 60% of a phone's height they
	 * pushed the first task rows below the fold, and the tasks are what a glance
	 * is for.
	 *
	 * Tasks are grouped by phase — the release's own structure, what it says
	 * about the order of its work. Grouping by status would make the screen a
	 * board, which this is not. Task rows are text, not controls: there is no
	 * downward move.
	 *
	 * Requires the full --status-* palette declared by the page; see StatusMark.
	 *
	 * Usage:
	 *   <ReleaseBody {release} context="peek" onPeekProject={raise} />
	 */
	import DestinationRow from '../atoms/DestinationRow.svelte';
	import Pill from '../atoms/Pill.svelte';
	import StatusMark from '../atoms/StatusMark.svelte';
	import type { ReleaseSummary, ReleaseTaskSummary } from './types.js';

	let { release, context, onPeekProject }: ReleaseBodyProps = $props();

	// Tasks grouped by integer phase, phases ascending.
	const phases = $derived.by((): { phase: number; tasks: ReleaseTaskSummary[] }[] => {
		const tasks = release.tasks ?? [];
		const order = [...new Set(tasks.map((task) => task.phase))].sort((a, b) => a - b);
		return order.map((phase) => ({
			phase,
			tasks: tasks.filter((task) => task.phase === phase)
		}));
	});

	// The two statuses this family calls motion, counted inside the release.
	const running = $derived(
		(release.tasks ?? []).filter(
			(task) => task.status === 'building' || task.status === 'verifying'
		).length
	);

	const listed = $derived((release.tasks ?? []).length);
</script>

<p class="title">{release.title}</p>

<nav class="up" aria-label="Onward from this release">
	<DestinationRow
		rank="Project"
		name={release.project}
		cue="peek"
		fill="subtle"
		onactivate={onPeekProject}
	/>
</nav>

<dl class="facts">
	<div class="fact">
		<dt>Documented</dt>
		<dd>{release.documentedOn ?? 'not yet'}</dd>
	</div>
	<div class="fact">
		<dt>Tasks</dt>
		<dd>{release.taskCount}</dd>
	</div>
	<div class="fact">
		<dt>Running</dt>
		<dd>{running}</dd>
	</div>
</dl>

{#if context === 'place'}
	<ul class="tags">
		{#each release.tags as tag (tag)}
			<li>
				<!-- Neutral tint on purpose. A tag is not a status, and the only
				     colours with meaning here are the status colours. -->
				<Pill label={tag} size="sm" fill="soft" tint="var(--text-muted)" />
			</li>
		{/each}
	</ul>
{/if}

{#if listed === 0}
	<p class="unlisted">
		This release's {release.taskCount} tasks are not loaded on this screen. Only a release a runner belongs
		to is fetched in full.
	</p>
{:else}
	{#each phases as group (group.phase)}
		<section class="phase" aria-labelledby="phase-{context}-{release.slug}-{group.phase}">
			<h3 class="phase-heading" id="phase-{context}-{release.slug}-{group.phase}">
				Phase {group.phase}
			</h3>
			<ul class="tasks">
				{#each group.tasks as task (task.id)}
					<li class="task">
						<span class="task-top">
							<StatusMark status={task.status} />
							<span class="task-id">{task.id}</span>
						</span>
						<span class="task-title">{task.title}</span>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
{/if}

<style>
	.title {
		margin: 0 0 var(--space-4);
		font-size: var(--text-ui);
		line-height: 1.45;
		color: var(--text-secondary);
	}

	.up {
		margin: 0 0 var(--space-4);
	}

	.facts {
		margin: 0 0 var(--space-4);
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-3);
	}

	.fact {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.fact dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.fact dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-primary);
	}

	.tags {
		margin: 0 0 var(--space-5);
		padding: 0;
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.unlisted {
		margin: 0;
		font-size: var(--text-caption);
		line-height: 1.5;
		color: var(--text-muted);
	}

	.phase {
		margin-bottom: var(--space-5);
	}

	.phase-heading {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--card-border);
	}

	.tasks {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	/* Text, not a control: there is still no downward move. */
	.task {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.task-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.task-id {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}

	.task-title {
		font-size: var(--text-caption);
		line-height: 1.45;
		color: var(--text-primary);
	}
</style>
