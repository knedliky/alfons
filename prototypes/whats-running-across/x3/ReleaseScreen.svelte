<script lang="ts">
	/**
	 * A release, as a destination.
	 *
	 * Inherited from the winner: a release shows its whole contents honestly —
	 * done, blocked, pending, triaged, wontfix and duplicate all appear here,
	 * grouped by integer phase, because a six-task release rendered as its one
	 * building task is a lie about the release. The running view's admission
	 * rule is a rule about the running view.
	 *
	 * Two changes the trail model forces, both loosenings of the stack's rules:
	 *
	 * 1. The project is ALWAYS a destination. The stack rendered an ancestor
	 *    already on the stack as inert text, because tapping it would push a
	 *    place the reader was standing on. Here nothing is behind anything —
	 *    opening the project replaces this screen — so the "open below" state
	 *    has no referent and the model forbids no jump.
	 *
	 * 2. A RUNNING task row is a destination: it reopens the running view at
	 *    card scale on that task. This is the jump the round watched readers
	 *    want — from a task in a release to a different task — and the release
	 *    screen is where the corpus offers it. Only the two motion statuses are
	 *    tappable: there is no task screen, so a done task has nowhere to go,
	 *    and a control that goes nowhere is furniture. Going down was not
	 *    relaxed — a running task's card is a place that already exists.
	 */
	import { Icon, Pill } from '@alfons/design';
	import type { Release } from './corpus.ts';
	import { runningCount, tasksByPhase } from './corpus.ts';
	import StatusMark from './StatusMark.svelte';

	let {
		release,
		onOpenProject,
		onOpenTask
	}: {
		release: Release;
		onOpenProject: (opener: HTMLElement) => void;
		/** Only ever called with a task the running view can honestly show. */
		onOpenTask: (taskId: string, opener: HTMLElement) => void;
	} = $props();

	const phases = $derived(tasksByPhase(release));
	const running = $derived(runningCount(release));
	const listed = $derived((release.tasks ?? []).length);
</script>

<p class="title">{release.title}</p>

<nav class="up" aria-label="Go up from this release">
	<button type="button" class="dest" onclick={(event) => onOpenProject(event.currentTarget)}>
		<span class="rank">Project</span>
		<span class="name">{release.project}</span>
		<Icon name="chevron-right" size="sm" />
	</button>
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

<ul class="tags">
	{#each release.tags as tag (tag)}
		<li>
			<!-- Neutral tint on purpose. A tag is not a status. -->
			<Pill label={tag} size="sm" fill="soft" tint="var(--text-muted)" />
		</li>
	{/each}
</ul>

{#if listed === 0}
	<p class="unlisted">
		This release's {release.taskCount} tasks are not loaded on this screen. Only a release a runner belongs
		to is fetched in full.
	</p>
{:else}
	{#each phases as group (group.phase)}
		<section class="phase" aria-labelledby="phase-{release.slug}-{group.phase}">
			<h3 class="phase-heading" id="phase-{release.slug}-{group.phase}">Phase {group.phase}</h3>
			<ul class="tasks">
				{#each group.tasks as task (task.id)}
					<li>
						{#if task.status === 'building' || task.status === 'verifying'}
							<!-- A bare <button>, same reported gap as every destination row:
							     a full-width multi-line block is not a centred pill. -->
							<button
								type="button"
								class="task is-dest"
								onclick={(event) => onOpenTask(task.id, event.currentTarget)}
							>
								<span class="task-top">
									<StatusMark status={task.status} />
									<span class="task-end">
										<span class="task-id">{task.id}</span>
										<Icon name="chevron-right" size="sm" />
									</span>
								</span>
								<span class="task-title">{task.title}</span>
							</button>
						{:else}
							<div class="task">
								<span class="task-top">
									<StatusMark status={task.status} />
									<span class="task-id">{task.id}</span>
								</span>
								<span class="task-title">{task.title}</span>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/each}
{/if}

<style>
	.title {
		margin: 0 0 var(--space-5);
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

	/* A bare <button>: a full-width three-column row — rank, name, chevron —
	   and Button is a centred pill with a fixed height. Same component gap the
	   winner reported. --space-7, not --filter-control-height: that token drops
	   under the 44px touch minimum from 640px up. */
	.dest {
		appearance: none;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		margin: 0;
		min-height: var(--space-7);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		border: 1px solid var(--card-border);
		background: var(--surface-hover-subtle);
		color: var(--text-primary);
		cursor: pointer;
	}

	.rank {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.name {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dest:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
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

	/* Non-running: text, not a control. Nothing here is a target, so nothing
	   here needs a 44px height. */
	.task {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
	}

	/* Running: a destination, and dressed as one — the same plate treatment as
	   every other destination on the page, with a 48px floor. */
	.task.is-dest {
		appearance: none;
		min-height: var(--space-7);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		background: var(--surface-hover-subtle);
		border: 1px solid var(--card-border);
		color: inherit;
		cursor: pointer;
	}

	.task.is-dest:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	.task-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.task-end {
		display: flex;
		align-items: center;
		gap: var(--space-2);
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
