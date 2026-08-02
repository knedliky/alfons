<script lang="ts">
	/**
	 * A release's task count broken down by status, as one thin stacked mark.
	 *
	 * Deliberately not ProgressBar: that shows one value against a track, and the
	 * question here is a composition across up to eight states. Thin, with a 2px
	 * surface gap between segments and 4px rounded ends on the outermost fills,
	 * so it reads as data rather than as a saturated decorative rectangle.
	 */
	import { STATUS_ORDER, type TaskStatus } from './corpus.ts';

	interface Props {
		counts: Partial<Record<TaskStatus, number>>;
		total: number;
		/** Legend is mandatory for two or more series; suppress only when one shows. */
		showLegend?: boolean;
	}

	const { counts, total, showLegend = true }: Props = $props();

	const segments = $derived(
		STATUS_ORDER.filter((status) => (counts[status] ?? 0) > 0).map((status) => ({
			status,
			count: counts[status] ?? 0,
			share: total > 0 ? ((counts[status] ?? 0) / total) * 100 : 0
		}))
	);
</script>

<div class="meter">
	<div
		class="track"
		role="img"
		aria-label={segments.map((s) => `${s.count} ${s.status}`).join(', ')}
	>
		{#each segments as segment, index (segment.status)}
			<span
				class="fill"
				data-first={index === 0}
				data-last={index === segments.length - 1}
				style="--share: {segment.share}%; --fill-colour: var(--status-{segment.status});"
			></span>
		{/each}
	</div>

	{#if showLegend && segments.length > 1}
		<ul class="legend">
			{#each segments as segment (segment.status)}
				<li>
					<span class="swatch" style="--fill-colour: var(--status-{segment.status});"></span>
					<span class="legend-label">{segment.status}</span>
					<span class="legend-value">{segment.count}</span>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.meter {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.track {
		display: flex;
		/* The 2px surface gap between adjacent fills, cut from the ground itself. */
		gap: 2px;
		height: 6px;
		width: 100%;
	}

	.fill {
		width: var(--share);
		background: var(--fill-colour);
		min-width: 3px;
	}

	/* Rounded data-ends belong to the outermost fills only; interior joins stay square. */
	.fill[data-first='true'] {
		border-start-start-radius: 4px;
		border-end-start-radius: 4px;
	}

	.fill[data-last='true'] {
		border-start-end-radius: 4px;
		border-end-end-radius: 4px;
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1) var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.legend li {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
	}

	.swatch {
		width: 8px;
		height: 3px;
		border-radius: 2px;
		background: var(--fill-colour);
	}

	/* Legend text wears text tokens, never the series colour. */
	.legend-label {
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.legend-value {
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}
</style>
