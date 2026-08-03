<script lang="ts" module>
	import type { TaskStatus } from './corpus.ts';

	export interface MeterSegment {
		status: TaskStatus;
		count: number;
	}

	export interface CompletionMeterProps {
		/** Counts per status. Zero-count entries are dropped before drawing. */
		segments: MeterSegment[];
		/** Denominator. Larger than the sum when a release has tasks outside the current filter. */
		total: number;
		/** Names what the meter measures, for the accessible description. */
		label: string;
	}
</script>

<script lang="ts">
	/**
	 * CompletionMeter — the one meter on the page.
	 *
	 * There is one of these per release band and there are sixteen bands, so it
	 * exists to make them consistent by construction rather than by sixteen
	 * repetitions of the same CSS. Nothing about a band's colouring, gap, radius
	 * or legend is decided anywhere else.
	 *
	 * The series is status, which is state, so the segments are allowed the
	 * status colours; the legend's words and numbers stay in text tokens so no
	 * text on the page is coloured by its series.
	 */
	let { segments, total, label }: CompletionMeterProps = $props();

	const drawn = $derived(segments.filter((segment) => segment.count > 0));
	const counted = $derived(drawn.reduce((sum, segment) => sum + segment.count, 0));
	const donePercent = $derived.by(() => {
		const done = segments.find((segment) => segment.status === 'done')?.count ?? 0;
		return total === 0 ? 0 : Math.round((done / total) * 100);
	});

	/** Width as a share of the denominator, so a filtered band draws a short bar rather than a full one. */
	function share(count: number): string {
		return total === 0 ? '0%' : `${(count / total) * 100}%`;
	}
</script>

<div class="meter">
	<div
		class="track"
		role="img"
		aria-label="{label}: {counted} of {total} tasks, {donePercent} percent done"
	>
		<!-- Quarter gridlines sit behind the data and are drawn at the faintest
		     rule the system has, so they orient without competing. -->
		<div class="grid" aria-hidden="true"></div>
		<div class="segments">
			{#each drawn as segment (segment.status)}
				<span
					class="segment"
					data-status={segment.status}
					style:width={share(segment.count)}
				></span>
			{/each}
		</div>
	</div>

	<!-- The legend is never optional: a stacked bar with no key is a decoration. -->
	<ul class="legend">
		{#each drawn as segment (segment.status)}
			<li>
				<span class="swatch" data-status={segment.status} aria-hidden="true"></span>
				<span class="legend-word">{segment.status}</span>
				<span class="legend-count">{segment.count}</span>
			</li>
		{/each}
		<li class="legend-total">
			<span class="legend-word">of</span>
			<span class="legend-count">{total}</span>
		</li>
	</ul>
</div>

<style>
	.meter {
		/* No radius token matches a chart data-end — every radius token in the
		   system resolves to 0 — and there is no named 2px token for the gap the
		   chart rules mandate. Both are declared once here rather than sixteen
		   times down the page. */
		--meter-end-radius: 4px;
		--meter-gap: 2px;

		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
		min-width: 11rem;
	}

	.track {
		position: relative;
		height: var(--space-2);
		background: var(--surface-dark-subtle);
	}

	.grid {
		position: absolute;
		inset: 0;
		background-image: repeating-linear-gradient(
			to right,
			var(--grid-colour) 0,
			var(--grid-colour) 1px,
			transparent 1px,
			transparent 25%
		);
	}

	/* Segments are anchored to the start of the track, share its baseline, and
	   are separated by a gap of page surface rather than by a border. */
	.segments {
		position: absolute;
		inset: 0;
		display: flex;
		gap: var(--meter-gap);
	}

	.segment {
		height: 100%;
		min-width: var(--meter-gap);
	}

	/* Only the outer ends of the whole series are rounded; interior joins stay
	   square so the stack reads as one bar. */
	.segment:first-child {
		border-start-start-radius: var(--meter-end-radius);
		border-end-start-radius: var(--meter-end-radius);
	}

	.segment:last-child {
		border-start-end-radius: var(--meter-end-radius);
		border-end-end-radius: var(--meter-end-radius);
	}

	.segment[data-status='pending'],
	.swatch[data-status='pending'] {
		background: var(--status-pending);
	}
	.segment[data-status='triaged'],
	.swatch[data-status='triaged'] {
		background: var(--status-triaged);
	}
	.segment[data-status='building'],
	.swatch[data-status='building'] {
		background: var(--status-building);
	}
	.segment[data-status='verifying'],
	.swatch[data-status='verifying'] {
		background: var(--status-verifying);
	}
	.segment[data-status='done'],
	.swatch[data-status='done'] {
		background: var(--status-done);
	}
	.segment[data-status='blocked'],
	.swatch[data-status='blocked'] {
		background: var(--status-blocked);
	}
	.segment[data-status='wontfix'],
	.swatch[data-status='wontfix'] {
		background: var(--status-wontfix);
	}
	.segment[data-status='duplicate'],
	.swatch[data-status='duplicate'] {
		background: var(--status-duplicate);
	}

	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0 var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		line-height: 1.4;
	}

	.legend li {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.swatch {
		width: var(--space-2);
		height: var(--meter-gap);
		border-radius: var(--meter-end-radius);
		flex: none;
	}

	/* Legend text answers to the text scale, never to the series colour. */
	.legend-word {
		color: var(--text-muted);
	}

	.legend-count {
		font-variant-numeric: tabular-nums;
		color: var(--text-secondary);
	}

	.legend-total .legend-word {
		opacity: var(--opacity-tertiary);
	}
</style>
