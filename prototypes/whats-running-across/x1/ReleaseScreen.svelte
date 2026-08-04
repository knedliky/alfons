<script lang="ts">
	/**
	 * A release, as a destination.
	 *
	 * The hard decision on this screen is what a release is allowed to contain,
	 * and it is a breach of the running view's rule: it shows tasks that are not
	 * running. `done`, `blocked`, `pending`, `triaged`, `wontfix` and `duplicate`
	 * all appear here. A release rendered as only its one building task would be
	 * a lie about the release — the reader tapped through to see the release, and
	 * a six-task release that renders as one task has answered a question nobody
	 * asked. The rule "building and verifying only" is a rule about the running
	 * view, and this is not the running view; it is the place the reader arrives
	 * at after deciding to leave it. Recorded as a deviation all the same,
	 * because it is the first screen in three rounds to render a `done` task.
	 *
	 * Grouped by integer phase, because phase is the release's own account of the
	 * order of its work. Grouping by status instead would have made this a board,
	 * and a board is the thing the brief has forbidden throughout.
	 *
	 * The tasks are text, not links. Going up was relaxed; going down was not, so
	 * there is no task screen and a task row is not tappable. That is where this
	 * approach's depth stops downward.
	 */
	import { Icon, Pill } from '@alfons/design';
	import type { Release } from './corpus.ts';
	import { runningCount, tasksByPhase } from './corpus.ts';
	import StatusMark from './StatusMark.svelte';

	let {
		release,
		projectIsOpen,
		onOpenProject
	}: {
		release: Release;
		/** True when the project is already a frame on the stack beneath this one. */
		projectIsOpen: boolean;
		onOpenProject: (opener: HTMLElement) => void;
	} = $props();

	const phases = $derived(tasksByPhase(release));
	const running = $derived(runningCount(release));
	const listed = $derived((release.tasks ?? []).length);
</script>

<p class="title">{release.title}</p>

<!-- The one way further up, in the same shape the card used, so a destination
     looks the same wherever the reader meets it. -->
<nav class="up" aria-label="Go up from this release">
	{#if projectIsOpen}
		<!-- Already a frame beneath this one. Offering it as a destination would be
		     a forward move to somewhere the reader is standing, and that is the
		     loop that lets a stack grow without end. -->
		<p class="here">
			<span class="rank">Project</span>
			<span class="name">{release.project}</span>
			<span class="note">open below</span>
		</p>
	{:else}
		<button type="button" class="dest" onclick={(event) => onOpenProject(event.currentTarget)}>
			<span class="rank">Project</span>
			<span class="name">{release.project}</span>
			<Icon name="chevron-right" size="sm" />
		</button>
	{/if}
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
			<!-- Neutral tint on purpose. A tag is not a status, and the only colours
			     with meaning on this page are the eight status colours. -->
			<Pill label={tag} size="sm" fill="soft" tint="var(--text-muted)" />
		</li>
	{/each}
</ul>

{#if listed === 0}
	<p class="unlisted">
		This release's {release.taskCount} tasks are not loaded on this screen. Only a release a runner
		belongs to is fetched in full.
	</p>
{:else}
	{#each phases as group (group.phase)}
		<section class="phase" aria-labelledby="phase-{release.slug}-{group.phase}">
			<h3 class="phase-heading" id="phase-{release.slug}-{group.phase}">Phase {group.phase}</h3>
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

	/* A bare <button>, and a <p> wearing the same clothes for the case where the
	   destination is already open beneath this screen. It is a full-width
	   three-column row — rank, name, chevron — and Button is a centred pill with
	   a fixed height and its own padding. Named in the report as a component the
	   library does not have; it is the same one the card needs. */
	.dest,
	.here {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		margin: 0;
		/* Not --filter-control-height: that token drops to 2.25rem from 640px up
		   and lands under the 44px touch minimum. --space-7 is 48px everywhere. */
		min-height: var(--space-7);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		border: 1px solid var(--card-border);
	}

	.dest {
		appearance: none;
		background: var(--surface-hover-subtle);
		color: var(--text-primary);
		cursor: pointer;
	}

	.here {
		background: transparent;
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

	.here .name {
		color: var(--text-muted);
	}

	.note {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
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
		gap: var(--space-4);
	}

	/* Text, not a control: there is no downward move. Nothing here is a target,
	   so nothing here needs a 44px height. */
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
