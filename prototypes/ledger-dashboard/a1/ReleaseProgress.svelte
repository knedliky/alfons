<script lang="ts" module>
	import type { Task, TaskStatus } from './corpus';

	export interface ReleaseProgressProps {
		tasks: Task[];
		/** Names what the bar is counting, so the mark carries its own annotation. */
		caption: string;
	}

	interface Segment {
		status: TaskStatus;
		count: number;
		share: number;
	}
</script>

<script lang="ts">
	/**
	 * The release's tasks stacked by status.
	 *
	 * The only chart on the page, and it is a single stacked mark rather than a
	 * plot: the question it answers is "how much of this release has settled",
	 * which needs one row, a legend and an annotation, not an axis. Colour here
	 * is status encoding, which is the one job status colour has.
	 */
	import { STATUS_ORDER } from './corpus';
	import StatusMark from './StatusMark.svelte';

	let { tasks, caption }: ReleaseProgressProps = $props();

	const segments = $derived.by((): Segment[] => {
		const total = tasks.length || 1;
		return STATUS_ORDER.map((status) => {
			const count = tasks.filter((task) => task.status === status).length;
			return { status, count, share: (count / total) * 100 };
		}).filter((segment) => segment.count > 0);
	});

	const settled = $derived(tasks.filter((task) => task.status === 'done').length);
</script>

<figure class="progress">
	<div class="track" role="img" aria-label={caption}>
		{#each segments as segment (segment.status)}
			<span
				class="segment"
				data-status={segment.status}
				style:flex-basis="{segment.share}%"
			></span>
		{/each}
	</div>

	<ul class="legend">
		{#each segments as segment (segment.status)}
			<li>
				<StatusMark status={segment.status} />
				<span class="count">{segment.count}</span>
			</li>
		{/each}
	</ul>

	<figcaption class="annotation">
		{settled} of {tasks.length} tasks settled — {caption}
	</figcaption>
</figure>

<style>
	.progress {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.track {
		display: flex;
		/* A 2px surface gap keeps adjacent fills from reading as one block. */
		gap: calc(var(--space-1) / 2);
		height: var(--space-2);
		background: var(--surface-dark-subtle);
	}

	.segment {
		flex-grow: 0;
		flex-shrink: 1;
		min-width: var(--space-1);
		background: var(--segment-colour);
	}

	/* Only the outer ends of the stack round; the joins stay square so the
	   segment boundaries read as data rather than as styling. */
	.segment:first-child {
		border-start-start-radius: var(--space-1);
		border-end-start-radius: var(--space-1);
	}

	.segment:last-child {
		border-start-end-radius: var(--space-1);
		border-end-end-radius: var(--space-1);
	}

	[data-status='pending'],
	[data-status='wontfix'],
	[data-status='duplicate'] {
		--segment-colour: var(--status-pending);
	}
	[data-status='triaged'] {
		--segment-colour: var(--status-triaged);
	}
	[data-status='building'] {
		--segment-colour: var(--status-building);
	}
	[data-status='verifying'] {
		--segment-colour: var(--status-verifying);
	}
	[data-status='done'] {
		--segment-colour: var(--status-done);
	}
	[data-status='blocked'] {
		--segment-colour: var(--status-blocked);
	}

	/* Text wears text tokens, never the colour of the mark beside it. */
	.annotation {
		font-family: var(--font-body);
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-5);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.legend li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.count {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}
</style>
