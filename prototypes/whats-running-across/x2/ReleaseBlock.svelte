<script lang="ts">
	/**
	 * One release, as a fixed place on the map, at three camera distances.
	 *
	 * THIN — nothing in it is running and the camera is elsewhere: one 48px
	 * row naming the place, with its settled work as a strip of muted dots.
	 * The dots are mass, not status: at map distance settled work renders as
	 * opacity, never as status colour, so the corpus reads as dim ground with
	 * the lit work standing out of it.
	 *
	 * LIT — it contains a runner: the same row, plus the runner's nameplate
	 * standing inside it at full strength. This is the running view's map
	 * scale honouring its rule — only building and verifying are lit.
	 *
	 * OPEN — the camera is on it: the block expands in place into the honest
	 * release, every task at every status with its word and colour, grouped by
	 * phase, exactly as the winning approach's release screen settled. The
	 * relaxation is spent here and only here: a release the reader has
	 * deliberately put the camera on shows all eight statuses; everywhere else
	 * on the map they are muted mass.
	 *
	 * The header row is a bare <button> (raw-element in review_markup): a
	 * camera stop is a full-width left-aligned row of slug, meta and dots, and
	 * Button is a centred pill. Same missing destination-row component the
	 * last two rounds reported.
	 */
	import { Pill } from '@alfons/design';
	import type { Release } from './corpus.ts';
	import { runningCount, tasksByPhase } from './corpus.ts';
	import type { RunningTask } from './tasks.ts';
	import RunnerPlace from './RunnerPlace.svelte';
	import StatusMark from './StatusMark.svelte';

	let {
		release,
		runners,
		form,
		openTaskId,
		positionOf,
		runnersTotal,
		onGoRelease,
		onGoTask,
		place
	}: {
		release: Release;
		runners: RunningTask[];
		form: 'thin' | 'lit' | 'open';
		openTaskId: string | null;
		positionOf: (id: string) => number;
		runnersTotal: number;
		onGoRelease: () => void;
		onGoTask: (id: string) => void;
		place: (node: HTMLElement, key: string) => { destroy(): void };
	} = $props();

	const settledCount = $derived(Math.max(0, release.taskCount - runners.length));
	const phases = $derived(tasksByPhase(release));
	const running = $derived(runningCount(release));
	const listed = $derived((release.tasks ?? []).length);
	const isRunning = (status: string) => status === 'building' || status === 'verifying';
</script>

{#if form === 'open'}
	<section
		class="block open"
		tabindex="-1"
		use:place={`release/${release.slug}`}
		aria-label="Release {release.slug}, opened"
	>
		<header class="opened-head">
			<p class="rank">Release</p>
			<h3 class="name">{release.slug}</h3>
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
					<!-- Neutral tint on purpose: a tag is not a status, and the only
					     colours with meaning on this page are the eight status colours. -->
					<Pill label={tag} size="sm" fill="soft" tint="var(--text-muted)" />
				</li>
			{/each}
		</ul>

		{#if listed === 0}
			<p class="unlisted">
				This release's {release.taskCount} tasks are not loaded on the map. Only a release a runner belongs
				to is fetched in full.
			</p>
		{:else}
			{#each phases as group (group.phase)}
				<section class="phase" aria-labelledby="phase-{release.slug}-{group.phase}">
					<h4 class="phase-heading" id="phase-{release.slug}-{group.phase}">
						Phase {group.phase}
					</h4>
					<ul class="tasks">
						{#each group.tasks as task (task.id)}
							<li>
								{#if isRunning(task.status)}
									<!-- A running task is a camera stop even inside the honest
									     release: the reader jumps from a release to a task in it
									     with one tap, which is exactly the lateral move the round
									     is about. Settled tasks stay text — going down was never
									     relaxed, and a done task is not a place the camera goes. -->
									<button type="button" class="task go" onclick={() => onGoTask(task.id)}>
										<span class="task-top">
											<StatusMark status={task.status} />
											<span class="task-id">{task.id}</span>
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
	</section>
{:else}
	<div class="block" data-lit={form === 'lit' ? 'true' : undefined}>
		<button
			type="button"
			class="head"
			onclick={onGoRelease}
			aria-label="Release {release.slug}, {release.taskCount} tasks, {runners.length} running. Move the camera to it."
		>
			<span class="slug">{release.slug}</span>
			<span class="meta">
				{release.taskCount} tasks
				{#if release.documentedOn}&middot; documented {release.documentedOn}{/if}
			</span>
			{#if settledCount > 0}
				<!-- Settled work as mass. Muted by opacity, never by a status colour:
				     at map distance the page may not express a non-running status. -->
				<span class="dots" aria-hidden="true">
					{#each { length: Math.min(settledCount, 24) } as _, dot (dot)}
						<span class="dot"></span>
					{/each}
				</span>
			{/if}
		</button>

		{#if runners.length > 0}
			<div class="runners">
				{#each runners as task (task.id)}
					<RunnerPlace
						{task}
						open={task.id === openTaskId}
						position={positionOf(task.id)}
						total={runnersTotal}
						onOpen={() => onGoTask(task.id)}
						{place}
					/>
				{/each}
			</div>
		{/if}
	</div>
{/if}

<style>
	.block {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.head {
		appearance: none;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		column-gap: var(--space-3);
		row-gap: var(--space-1);
		width: 100%;
		/* Not --filter-control-height: that token drops to 2.25rem from 640px up
		   and lands under the 44px touch minimum. --space-7 is 48px everywhere.
		   Inherited finding, re-reported. */
		min-height: var(--space-7);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		background: transparent;
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
	}

	.block[data-lit='true'] .head {
		background: var(--surface-hover-subtle);
	}

	.head:focus-visible,
	.task.go:focus-visible,
	.open:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	.slug {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}

	.meta {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		white-space: nowrap;
	}

	.dots {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		align-items: center;
		margin-left: auto;
	}

	.dot {
		width: var(--space-2);
		height: var(--space-2);
		background: var(--text-muted);
		opacity: var(--opacity-tertiary);
	}

	.runners {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-left: var(--space-3);
		border-left: 1px solid var(--card-border);
	}

	/* ---- the honest release, camera on it ---- */

	.open {
		gap: var(--space-4);
		padding: var(--space-4);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
	}

	.opened-head {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
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
		   place the camera is standing on. Inherited finding, re-reported. */
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
		margin: 0;
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
		margin: 0;
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
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.phase-heading {
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

	.task.go {
		appearance: none;
		min-height: var(--space-7);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		background: var(--surface-hover-subtle);
		border: 1px solid var(--card-border);
		color: inherit;
		cursor: pointer;
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
