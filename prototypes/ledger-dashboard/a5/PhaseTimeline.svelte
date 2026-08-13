<script lang="ts">
	/**
	 * A release drawn as a phase timeline.
	 *
	 * The payoff of the page: once a task is found, this is the shape of the
	 * work around it — which phase it sits in, how far that phase has moved,
	 * and which siblings share it. Phases run down a heavy spine; each carries
	 * one thin stacked meter of its tasks by status.
	 *
	 * The meter is deliberately not the flat saturated rectangle the current
	 * page draws. It is a thin mark anchored to its own baseline rule, with a
	 * surface gap between segments so adjacent states never bleed into one
	 * band, rounded data-ends, a recessive grid, and a legend that is always
	 * present because more than one series is stacked.
	 */
	import {
		STATUS_ORDER,
		taskById,
		type Release,
		type Task,
		type TaskStatus
	} from './ledger-corpus';
	import StatusMark from './StatusMark.svelte';

	interface Props {
		release: Release;
		/** The task the reader arrived at, if it belongs to this release. */
		highlightTaskId?: string | null;
	}

	let { release, highlightTaskId = null }: Props = $props();

	interface Segment {
		status: TaskStatus;
		count: number;
	}

	interface PhaseRow {
		number: number;
		label: string;
		taskIds: string[];
		segments: Segment[];
		/** Share of the widest phase, so phases are comparable across a release. */
		width: number;
		holdsHighlight: boolean;
		span: string;
	}

	const rows = $derived.by((): PhaseRow[] => {
		const widest = Math.max(...release.phases.map((phase) => phase.taskIds.length), 1);

		return release.phases.map((phase) => {
			const tasks = phase.taskIds.map(taskById).filter((task): task is Task => task !== undefined);

			const counts: Partial<Record<TaskStatus, number>> = {};
			for (const task of tasks) counts[task.status] = (counts[task.status] ?? 0) + 1;

			const dates = tasks.map((task) => task.completedOn ?? task.createdOn).sort();
			const span = dates.length ? `${dates[0]} — ${dates[dates.length - 1]}` : 'not started';

			return {
				number: phase.number,
				label: phase.label,
				taskIds: phase.taskIds,
				segments: STATUS_ORDER.filter((status) => counts[status] !== undefined).map((status) => ({
					status,
					count: counts[status] ?? 0
				})),
				width: (phase.taskIds.length / widest) * 100,
				holdsHighlight: highlightTaskId !== null && phase.taskIds.includes(highlightTaskId),
				span
			};
		});
	});

	/** Every status present anywhere in the release — the legend, in order. */
	const legend = $derived(
		STATUS_ORDER.filter((status) =>
			rows.some((row) => row.segments.some((s) => s.status === status))
		)
	);
</script>

<article class="timeline">
	<header class="masthead">
		<p class="slug">{release.slug}</p>
		<h3 class="title">{release.title}</h3>
		<dl class="meta">
			<div class="pair">
				<dt>Project</dt>
				<dd>{release.project}</dd>
			</div>
			<div class="pair">
				<dt>Tasks</dt>
				<dd>{release.taskCount}</dd>
			</div>
			<div class="pair">
				<dt>Phases</dt>
				<dd>{release.phases.length}</dd>
			</div>
			<div class="pair">
				<dt>Documented</dt>
				<dd>{release.documentedOn ?? 'not yet'}</dd>
			</div>
		</dl>
	</header>

	<ol class="phases">
		{#each rows as row (row.number)}
			<li class="phase" class:holds-highlight={row.holdsHighlight}>
				<p class="ordinal" aria-hidden="true">{String(row.number).padStart(2, '0')}</p>
				<div class="phase-body">
					<h4 class="phase-label">Phase {row.number} — {row.label}</h4>
					<p class="phase-span">{row.span}</p>
					<div class="meter" style="--meter-width: {row.width}%">
						<div class="meter-grid" aria-hidden="true"></div>
						<div class="meter-track">
							{#each row.segments as segment (segment.status)}
								<span
									class="segment"
									style="--segment-colour: var(--status-{segment.status}); --segment-grow: {segment.count}"
									title="{segment.count} {segment.status}"
								></span>
							{/each}
						</div>
						<div class="meter-axis" aria-hidden="true"></div>
					</div>
					<ul class="siblings">
						{#each row.taskIds as taskId (taskId)}
							{@const task = taskById(taskId)}
							{#if task}
								<li class="sibling" class:is-highlight={taskId === highlightTaskId}>
									<span class="sibling-id">{task.id}</span>
									<span class="sibling-title">{task.title}</span>
									<StatusMark status={task.status} />
								</li>
							{/if}
						{/each}
					</ul>
				</div>
			</li>
		{/each}
	</ol>

	<footer class="legend">
		<p class="legend-label">Series</p>
		<ul class="legend-items">
			{#each legend as status (status)}
				<li><StatusMark {status} /></li>
			{/each}
		</ul>
	</footer>
</article>

<style>
	.timeline {
		display: block;
	}

	/* Grounding is by rule and fill, never by a card: the heaviest rule on the
	   page opens a release, and nothing here has a border on four sides. */
	.masthead {
		border-block-start: var(--space-1) solid var(--text-primary);
		padding-block-start: var(--space-4);
	}

	.slug {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.title {
		margin: var(--space-2) 0 0;
		font-family: var(--font-body);
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.02em;
		color: var(--text-primary);
	}

	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--space-5);
		margin: var(--space-4) 0 0;
	}

	.pair {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		padding-inline-end: var(--space-5);
		border-inline-end: 1px solid var(--border-glass);
	}

	.pair:last-child {
		border-inline-end: none;
	}

	dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.phases {
		margin: var(--space-6) 0 0;
		padding: 0;
		list-style: none;
	}

	.phase {
		display: grid;
		grid-template-columns: 4rem 1fr;
		gap: var(--space-5);
		padding-block: var(--space-5);
		border-block-start: 1px solid var(--border-glass);
	}

	/* Fill, not a card, marks the phase the reader arrived at. */
	.phase.holds-highlight {
		background: var(--surface-hover-subtle);
		box-shadow: inset var(--space-1) 0 0 0 var(--text-primary);
	}

	.ordinal {
		margin: 0;
		font-family: var(--font-body);
		font-size: 2.4rem;
		font-weight: 800;
		line-height: 0.9;
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.04em;
		color: var(--text-primary);
		padding-inline-start: var(--space-4);
	}

	.phase.holds-highlight .ordinal {
		padding-inline-start: var(--space-3);
	}

	.phase-body {
		min-inline-size: 0;
		padding-inline-end: var(--space-4);
	}

	.phase-label {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-ui);
		font-weight: 700;
		letter-spacing: 0.01em;
		color: var(--text-primary);
	}

	.phase-span {
		margin: var(--space-1) 0 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}

	.meter {
		position: relative;
		inline-size: var(--meter-width);
		margin-block-start: var(--space-4);
	}

	/* Quarter ticks, recessive by design: they orient the eye without
	   competing with the data mark sitting on top of them. */
	.meter-grid {
		position: absolute;
		inset-block: 0 0;
		inset-inline: 0;
		background-image: repeating-linear-gradient(
			to right,
			var(--grid-colour) 0 1px,
			transparent 1px 25%
		);
	}

	.meter-track {
		position: relative;
		display: flex;
		gap: 2px; /* the surface gap that keeps adjacent states from reading as one band */
		block-size: var(--space-2);
	}

	.segment {
		flex: var(--segment-grow) 1 0;
		background: var(--segment-colour);
	}

	/* Only the outer ends of the mark are rounded — an interior segment end is
	   a boundary between states, not the end of the datum. */
	.segment:first-child {
		border-start-start-radius: var(--space-1);
		border-end-start-radius: var(--space-1);
	}

	.segment:last-child {
		border-start-end-radius: var(--space-1);
		border-end-end-radius: var(--space-1);
	}

	.meter-axis {
		block-size: 1px;
		background: var(--border-glass);
	}

	.siblings {
		margin: var(--space-4) 0 0;
		padding: 0;
		list-style: none;
	}

	.sibling {
		display: grid;
		grid-template-columns: 5.5rem 1fr auto;
		align-items: baseline;
		gap: var(--space-4);
		padding-block: var(--space-2);
		border-block-start: 1px solid var(--border-glass);
	}

	.sibling.is-highlight .sibling-title {
		font-weight: 700;
		color: var(--text-primary);
	}

	.sibling-id {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.sibling-title {
		font-family: var(--font-body);
		font-size: var(--text-ui);
		font-weight: 400;
		color: var(--text-secondary);
		overflow-wrap: anywhere;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-4);
		margin-block-start: var(--space-5);
		padding-block-start: var(--space-3);
		border-block-start: 1px solid var(--border-glass);
	}

	.legend-label {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.legend-items {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	@media (max-width: 767px) {
		.phase {
			grid-template-columns: 2.5rem 1fr;
			gap: var(--space-3);
		}

		.ordinal {
			font-size: 1.5rem;
		}

		.sibling {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
