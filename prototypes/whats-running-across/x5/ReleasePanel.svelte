<script lang="ts">
	/**
	 * One release, as a panel on the release level of the surface.
	 *
	 * Not a screen and not a destination: the reader walks onto it sideways, so
	 * it carries its own name at the top — the page's persistent headline names
	 * only the panel currently under the reader, and mid-swipe both neighbours
	 * are on screen at once.
	 *
	 * It shows the whole release, every status, per the round's standing
	 * relaxation: a six-task release rendered as its one building task is a lie
	 * about the release. Two devices keep it from becoming a chart, both
	 * inherited from u5's measurements: only the two motion statuses animate,
	 * and every settled task renders at --opacity-tertiary, so the one running
	 * task in a release of six is the only thing at full strength.
	 *
	 * A RUNNING task row is a control: tapping it goes down the vertical axis
	 * with the anchor moved to that task, which is the grammar's version of
	 * "open this runner". A settled task row stays text — the task level cannot
	 * express a non-running status, so offering a settled task as a way down
	 * would be a door painted on a wall.
	 */
	import { Icon, Pill } from '@alfons/design';
	import type { Release } from './corpus.ts';
	import { isSettled, runningCount, tasksByPhase } from './corpus.ts';
	import StatusMark from './StatusMark.svelte';

	let {
		release,
		onDiveToTask
	}: {
		release: Release;
		/** Down the vertical axis, anchored to this runner. */
		onDiveToTask: (id: string) => void;
	} = $props();

	const phases = $derived(tasksByPhase(release));
	const running = $derived(runningCount(release));
	const listed = $derived((release.tasks ?? []).length);
</script>

<article class="panel" aria-label="Release {release.slug}">
	<header class="naming">
		<p class="rank">Release</p>
		<h2 class="name">{release.slug}</h2>
		<p class="title">{release.title}</p>
	</header>

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

	<ul class="tags">
		{#each release.tags as tag (tag)}
			<li>
				<!-- Neutral tint on purpose. A tag is not a status, and the only
				     colours with meaning on this page are the eight status colours. -->
				<Pill label={tag} size="sm" fill="soft" tint="var(--text-muted)" />
			</li>
		{/each}
	</ul>

	{#if listed === 0}
		<p class="unlisted">
			This release's {release.taskCount} tasks are not loaded on this panel. Only a release a
			runner belongs to is fetched in full.
		</p>
	{:else}
		{#each phases as group (group.phase)}
			<section class="phase" aria-labelledby="phase-{release.slug}-{group.phase}">
				<h3 class="phase-heading" id="phase-{release.slug}-{group.phase}">Phase {group.phase}</h3>
				<ul class="tasks">
					{#each group.tasks as task (task.id)}
						<li>
							{#if isSettled(task.status)}
								<div class="task" data-settled="true">
									<span class="task-top">
										<StatusMark status={task.status} />
										<span class="task-id">{task.id}</span>
									</span>
									<span class="task-title">{task.title}</span>
								</div>
							{:else}
								<!-- A bare <button>: a two-line full-width row with a chevron
								     is not Button's centred pill. Same component gap the last
								     two rounds reported. -->
								<button type="button" class="task runner" onclick={() => onDiveToTask(task.id)}>
									<span class="task-top">
										<StatusMark status={task.status} />
										<span class="task-id">{task.id}</span>
									</span>
									<span class="task-title">{task.title}</span>
									<span class="descend">
										<Icon name="chevron-down" size="sm" />
										read this task below
									</span>
								</button>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
</article>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		height: max-content;
		min-height: 100%;
		padding: var(--space-4);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
	}

	.naming {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
	}

	.rank {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.name {
		margin: 0;
		font-family: var(--font-display);
		/* The type scale stops at --text-lead, a caption size for the name of the
		   place you are standing. The floor is the token; the ceiling is a
		   literal no token would have prevented. */
		font-size: clamp(var(--text-lead), 6vw, 1.75rem);
		line-height: 1.15;
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}

	.title {
		margin: 0;
		font-size: var(--text-ui);
		line-height: 1.45;
		color: var(--text-secondary);
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
		gap: var(--space-3);
	}

	.task {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
	}

	/* Settled work at reduced strength — u5's device, carried. The status word
	   and colour are still there; they just do not compete with the runner. */
	.task[data-settled='true'] {
		opacity: var(--opacity-tertiary);
	}

	/* The runner row is the one control in the list, and it holds the touch
	   floor. --space-7 rather than --filter-control-height, which drops to
	   2.25rem above 640px — under 44px exactly where a touchscreen laptop
	   reads this page. Measured last round; carried. */
	.runner {
		appearance: none;
		min-height: var(--space-7);
		padding: var(--space-3);
		text-align: left;
		background: var(--surface-hover-subtle);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
		gap: var(--space-2);
	}

	.runner:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	.descend {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
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
