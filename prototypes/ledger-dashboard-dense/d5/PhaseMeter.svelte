<script lang="ts" module>
	import type { TaskStatus } from './corpus.ts';

	export interface PhaseMeterProps {
		/** How many tasks sit in each status. Zero-count statuses draw nothing. */
		counts: Record<TaskStatus, number>;
		/** What the meter is about, used to build the accessible sentence. */
		label: string;
	}
</script>

<script lang="ts">
	/**
	 * PhaseMeter — a release's whole shape as one thin stacked bar.
	 *
	 * Written locally because the library has no stacked categorical meter at
	 * all: ProgressBar is single-value and accent-filled, and BarChart draws from
	 * --chart-*-admin, which is illegal on a public surface. This is the central
	 * library gap this approach ran into.
	 *
	 * Form before colour. The datum is a part-to-whole breakdown of one release,
	 * so the form is a stacked bar of fixed total width; every meter on the page
	 * therefore shares an origin and a full-scale, and their lengths are
	 * comparable by eye. The segments carry status colour because a status meter
	 * is state — that is the one thing status colour is reserved for — and every
	 * segment is also named and counted in the accessible sentence, so the meter
	 * survives being read without colour.
	 *
	 * Zero-count statuses are omitted rather than drawn at a minimum width: a
	 * visible segment for a status with no tasks in it would be the meter lying.
	 */
	import { STATUS_ORDER } from './corpus.ts';

	let { counts, label }: PhaseMeterProps = $props();

	const total = $derived(STATUS_ORDER.reduce((sum, status) => sum + (counts[status] ?? 0), 0));

	const segments = $derived(
		STATUS_ORDER.filter((status) => (counts[status] ?? 0) > 0).map((status) => ({
			status,
			count: counts[status] ?? 0
		}))
	);

	const sentence = $derived(
		total === 0
			? `${label}: no tasks`
			: `${label}: ${segments.map((s) => `${s.count} ${s.status}`).join(', ')}, of ${total}`
	);
</script>

<span class="meter" role="img" aria-label={sentence}>
	{#each segments as segment, index (segment.status)}
		<span
			class="segment"
			data-status={segment.status}
			class:first={index === 0}
			class:last={index === segments.length - 1}
			style:flex-grow={segment.count}
		></span>
	{/each}
	{#if total === 0}
		<span class="segment empty first last"></span>
	{/if}
</span>

<style>
	/* The track is the full scale. Segments grow into it in proportion, so a
	   release with three tasks and one with twelve are read by shape, not by
	   how much ink they happen to have earned. */
	.meter {
		display: flex;
		align-items: stretch;
		gap: var(--data-gap);
		width: 100%;
		height: var(--space-2);
	}

	.segment {
		flex-basis: 0;
		min-width: 0;
		background: currentColor;
	}

	/* Rounded only at the two ends of the whole bar: the data ends. Every
	   internal join stays square, because a rounded join would read as a gap
	   the data does not have. */
	.segment.first {
		border-start-start-radius: var(--data-end-radius);
		border-end-start-radius: var(--data-end-radius);
	}

	.segment.last {
		border-start-end-radius: var(--data-end-radius);
		border-end-end-radius: var(--data-end-radius);
	}

	.segment.empty {
		flex-grow: 1;
		background: var(--border-glass);
	}

	.segment[data-status='pending'] {
		color: var(--status-pending);
	}
	.segment[data-status='triaged'] {
		color: var(--status-triaged);
	}
	.segment[data-status='building'] {
		color: var(--status-building);
	}
	.segment[data-status='verifying'] {
		color: var(--status-verifying);
	}
	.segment[data-status='done'] {
		color: var(--status-done);
	}
	.segment[data-status='blocked'] {
		color: var(--status-blocked);
	}
	.segment[data-status='wontfix'] {
		color: var(--status-wontfix);
	}
	.segment[data-status='duplicate'] {
		color: var(--status-duplicate);
	}

	/* pending, wontfix and duplicate all resolve to the muted tone, so the two
	   closed-without-finishing states are hatched to stay distinguishable from
	   work that has not started. Pattern, not a second colour. */
	.segment[data-status='wontfix'],
	.segment[data-status='duplicate'] {
		background: repeating-linear-gradient(45deg, currentColor 0 2px, var(--bg-glass-solid) 2px 4px);
	}
</style>
