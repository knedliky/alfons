<script lang="ts">
	/**
	 * What a release segment opens.
	 *
	 * A breadcrumb segment promises a destination, so the destination has to
	 * exist, and this is the honest one: a release is a title, a slug, its tags,
	 * whether it has been written up, and its tasks grouped into the integer
	 * phases it declares. Nothing is invented — every field here is one the ledger
	 * actually carries.
	 *
	 * This is where the relaxation of "no second level" is paid for, and the bill
	 * is legible: the running view shows two statuses and this shows seven,
	 * because a release contains everything and most of it is not running. The
	 * page's whole argument was that it never showed you anything that was not in
	 * motion. That argument now holds for the running view only.
	 *
	 * Status colour still means motion and nothing else. A `done` task is a word
	 * in the muted text colour; only `building` and `verifying` get a StatusMark,
	 * so the two tasks in flight are still findable in a list of six at a glance.
	 *
	 * A running task's row is tappable and goes back to its card. That is not
	 * going downward into a backlog — it is the return leg of the same move, and
	 * without it the reader who tapped `prototype-loop-v1` has no way home except
	 * the root segment.
	 */
	import StandingLine, { type Segment } from './StandingLine.svelte';
	import StatusMark from './StatusMark.svelte';
	import { isRunning, phasesOf, runningCount, type Release } from './hierarchy.ts';
	import type { RunningStatus } from './tasks.ts';

	let {
		release,
		onOpenRunning,
		onOpenProject,
		onOpenTask
	}: {
		release: Release;
		onOpenRunning: () => void;
		onOpenProject: (name: string) => void;
		/** Only ever called for a task that is running, so only ever lands on a card. */
		onOpenTask: (id: string) => void;
	} = $props();

	// Four segments would not fit, so there are three: the root replaces the task,
	// which is the segment you left behind by coming here.
	const segments = $derived<Segment[]>([
		{ label: 'running', kind: 'running', onSelect: onOpenRunning },
		{ label: release.project, kind: 'project', onSelect: () => onOpenProject(release.project) },
		{ label: release.slug, kind: 'release' }
	]);

	const phases = $derived(phasesOf(release));
	const inFlight = $derived(runningCount(release));

	const documentation = $derived(
		release.documentedOn ? `Documented ${release.documentedOn}` : 'Not documented'
	);
</script>

<section class="release" aria-label="Release {release.slug}">
	<StandingLine {segments} label="Where {release.slug} sits" />

	<div class="scroller">
		<header class="head">
			<h2 class="title">{release.title}</h2>
			<p class="facts">
				{release.tasks.length} tasks &middot; {inFlight} running &middot; {documentation}
			</p>
			<ul class="tags">
				{#each release.tags as tag (tag)}
					<!-- Tags are not statuses, so they take the neutral border and no hue.
					     Chip and Pill both tint from a brand token by default, which on this
					     page would read as a fifth meaning for colour. -->
					<li class="tag">{tag}</li>
				{/each}
			</ul>
		</header>

		{#each phases as group (group.phase)}
			<div class="phase">
				<h3 class="phase-name">Phase {group.phase}</h3>
				<ul class="tasks">
					{#each group.tasks as task (task.id)}
						<li class="task" data-running={isRunning(task.status)}>
							{#if isRunning(task.status)}
								<button
									type="button"
									class="row open"
									aria-label="{task.id}, {task.status}. Open its card."
									onclick={() => onOpenTask(task.id)}
								>
									<span class="line-one">
										<span class="id">{task.id}</span>
										<StatusMark status={task.status as RunningStatus} />
									</span>
									<span class="task-title">{task.title}</span>
								</button>
							{:else}
								<div class="row">
									<span class="line-one">
										<span class="id">{task.id}</span>
										<span class="state">{task.status}</span>
									</span>
									<span class="task-title">{task.title}</span>
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>

<style>
	/* The panel carries the border and the padding, so the line sits inside it at
	   the same inset as everything else — exactly where it sits on the card. It is
	   a sibling of the scroller rather than inside it: the whole point of the line
	   is that it is always there, and a line that scrolls away with the task list
	   is not persistent. */
	.release {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
	}

	/* The upward views are lists and lists scroll. There is no horizontal gesture
	   up here — the deck is not on screen — so a scroll container costs nothing,
	   which is exactly the reason the card may not have one. */
	.scroller {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.title {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(var(--text-lead), 5.5vw, 1.75rem);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	.facts {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.tag {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		padding: var(--space-1) var(--space-2);
		border: 1px solid var(--card-border);
	}

	.phase {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.phase-name {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--card-border);
	}

	.tasks {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	/* A bare <button> again. Button is a pill with a centred label; this is a
	   two-line row that fills its width. Named in the report. */
	.row {
		appearance: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
		/* 44px is the floor; two lines of text usually exceed it. */
		min-height: var(--filter-control-height);
		justify-content: center;
		text-align: left;
		padding: var(--space-2) 0;
		background: none;
		border: none;
	}

	button.row {
		cursor: pointer;
	}

	.line-one {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.id {
		font-family: var(--font-mono);
		font-size: var(--text-ui);
		color: var(--text-primary);
		letter-spacing: 0.02em;
	}

	/* Not running, so no colour at all. The word alone. */
	.state {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.task-title {
		font-size: var(--text-caption);
		line-height: 1.4;
		color: var(--text-secondary);
	}

	/* A task that is not running is greyer than one that is. This is the release's
	   own contrast between what is moving and what is not, made without borrowing
	   a status hue. */
	.task[data-running='false'] .task-title {
		color: var(--text-muted);
	}

	.task[data-running='false'] .id {
		color: var(--text-secondary);
	}

	button.row:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: -2px;
	}
</style>
