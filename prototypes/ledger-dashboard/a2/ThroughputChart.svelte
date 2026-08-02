<script lang="ts">
	/**
	 * ThroughputChart — weekly shipped tasks, annotated.
	 *
	 * The library ships BarChart and LineChart, and neither could do this job:
	 * both draw from the --chart-*-admin token namespace, which is illegal on a
	 * public surface, and neither has an annotation layer. The annotation is the
	 * whole point of this chart — the reader is told what to notice — so it is
	 * drawn here rather than bent out of an admin widget.
	 *
	 * Form before colour: the measure is a count per discrete week, so it is
	 * columns anchored to a zero baseline, not a line. One series, so no legend
	 * is owed; the colour is a series token that is deliberately not one of the
	 * eight status colours, because nothing in this chart encodes state.
	 */
	import type { ChartAnnotation, ThroughputWeek } from './corpus.ts';

	interface Props {
		data: ThroughputWeek[];
		annotations: ChartAnnotation[];
		title: string;
		deck: string;
		note: string;
	}

	let { data, annotations, title, deck, note }: Props = $props();

	const VIEW_WIDTH = 1000;
	const VIEW_HEIGHT = 460;
	// The top margin is an annotation band, one row per note, sized so no two
	// notes can ever share a line and collide.
	const MARGIN = { top: 148, right: 32, bottom: 56, left: 52 };
	const ANNOTATION_ROW_HEIGHT = 38;
	const PLOT_WIDTH = VIEW_WIDTH - MARGIN.left - MARGIN.right;
	const PLOT_HEIGHT = VIEW_HEIGHT - MARGIN.top - MARGIN.bottom;
	const BASELINE = MARGIN.top + PLOT_HEIGHT;
	const Y_MAX = 90;
	const Y_TICKS = [0, 20, 40, 60, 80];
	const CORNER = 4;

	const band = $derived(PLOT_WIDTH / data.length);
	const barWidth = $derived(Math.min(44, band - 24));

	function bandCentre(index: number): number {
		return MARGIN.left + band * (index + 0.5);
	}

	function yFor(value: number): number {
		return BASELINE - (value / Y_MAX) * PLOT_HEIGHT;
	}

	/**
	 * Rounded only at the data end. A rectangle rounded at all four corners
	 * lifts the mark off its baseline and makes the zero ambiguous.
	 */
	function columnPath(index: number, value: number): string {
		const centre = bandCentre(index);
		const left = centre - barWidth / 2;
		const right = centre + barWidth / 2;
		const top = yFor(value);
		const radius = Math.min(CORNER, (BASELINE - top) / 2, barWidth / 2);
		return [
			`M ${left} ${BASELINE}`,
			`L ${left} ${top + radius}`,
			`Q ${left} ${top} ${left + radius} ${top}`,
			`L ${right - radius} ${top}`,
			`Q ${right} ${top} ${right} ${top + radius}`,
			`L ${right} ${BASELINE}`,
			'Z'
		].join(' ');
	}

	const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

	function shortDate(iso: string): string {
		const [, month, day] = iso.split('-');
		return `${Number(day)} ${MONTHS[Number(month) - 1]}`;
	}

	/**
	 * Annotation placement is decided here rather than eyeballed. Each note owns
	 * a row of its own, and a note past the midline reads right-to-left, so
	 * neither a collision nor an overflow of the right margin is possible.
	 */
	const placedAnnotations = $derived(
		annotations.map((annotation, row) => {
			const index = data.findIndex((week) => week.weekStarting === annotation.weekStarting);
			const centre = bandCentre(index);
			const pastMidline = centre > MARGIN.left + PLOT_WIDTH / 2;
			const labelY = 26 + row * ANNOTATION_ROW_HEIGHT;
			// Every leader starts below the last row of notes, so no line is ever
			// drawn through another note's text.
			const leaderTop = 26 + (annotations.length - 1) * ANNOTATION_ROW_HEIGHT + 27;
			return {
				...annotation,
				index,
				centre,
				anchor: pastMidline ? ('end' as const) : ('start' as const),
				textX: pastMidline ? centre + barWidth / 2 : centre - barWidth / 2,
				labelY,
				detailY: labelY + 17,
				leaderTop,
				leaderBottom: yFor(data[index]?.shipped ?? 0) - 8
			};
		})
	);

	let hovered = $state<number | null>(null);
	let plot = $state<SVGSVGElement>();

	function trackPointer(event: PointerEvent) {
		if (!plot) return;
		const box = plot.getBoundingClientRect();
		const x = ((event.clientX - box.left) / box.width) * VIEW_WIDTH;
		const index = Math.floor((x - MARGIN.left) / band);
		hovered = index >= 0 && index < data.length ? index : null;
	}

	const hoveredWeek = $derived(hovered === null ? null : data[hovered]);
	const previousWeek = $derived(hovered === null || hovered === 0 ? null : data[hovered - 1]);
	const tooltipLeft = $derived(hovered === null ? 0 : (bandCentre(hovered) / VIEW_WIDTH) * 100);
	const total = $derived(data.reduce((sum, week) => sum + week.shipped, 0));
</script>

<figure class="chart">
	<figcaption class="chart-head">
		<h3 class="chart-title">{title}</h3>
		<p class="chart-deck">{deck}</p>
	</figcaption>

	<div class="plot-wrap">
		<svg
			bind:this={plot}
			viewBox="0 0 {VIEW_WIDTH} {VIEW_HEIGHT}"
			role="img"
			aria-label="{title}. {deck} Thirteen weeks to 27 July 2026, {total} tasks shipped in total."
			onpointermove={trackPointer}
			onpointerleave={() => (hovered = null)}
		>
			<!-- Grid first, so every mark and every rule sits on top of it. -->
			{#each Y_TICKS as tick (tick)}
				<line
					class="grid"
					x1={MARGIN.left}
					x2={MARGIN.left + PLOT_WIDTH}
					y1={yFor(tick)}
					y2={yFor(tick)}
				/>
				<text class="axis-text" x={MARGIN.left - 12} y={yFor(tick) + 4} text-anchor="end">
					{tick}
				</text>
			{/each}

			<line
				class="axis"
				x1={MARGIN.left}
				x2={MARGIN.left + PLOT_WIDTH}
				y1={BASELINE}
				y2={BASELINE}
			/>

			{#each data as week, index (week.weekStarting)}
				<path
					class="column"
					class:muted={hovered !== null && hovered !== index}
					d={columnPath(index, week.shipped)}
				/>
			{/each}

			<!-- After the columns, or the column it points at hides it. -->
			{#if hovered !== null}
				<line
					class="crosshair"
					x1={bandCentre(hovered)}
					x2={bandCentre(hovered)}
					y1={MARGIN.top - 8}
					y2={BASELINE}
				/>
			{/if}

			{#each data as week, index (week.weekStarting)}
				{#if index % 2 === 0 || index === data.length - 1}
					<text class="axis-text" x={bandCentre(index)} y={BASELINE + 22} text-anchor="middle">
						{shortDate(week.weekStarting)}
					</text>
				{/if}
			{/each}

			<text class="axis-title" x={MARGIN.left} y={BASELINE + 44}>
				week commencing, Mondays
			</text>

			{#each placedAnnotations as annotation (annotation.weekStarting)}
				<line
					class="leader"
					x1={annotation.centre}
					x2={annotation.centre}
					y1={annotation.leaderTop}
					y2={annotation.leaderBottom}
				/>
				<circle class="leader-node" cx={annotation.centre} cy={annotation.leaderBottom} r="4" />
				<text
					class="annotation-label"
					x={annotation.textX}
					y={annotation.labelY}
					text-anchor={annotation.anchor}
				>
					{annotation.label}
				</text>
				<text
					class="annotation-detail"
					x={annotation.textX}
					y={annotation.detailY}
					text-anchor={annotation.anchor}
				>
					{annotation.detail}
				</text>
			{/each}
		</svg>

		{#if hoveredWeek}
			<div
				class="tooltip"
				class:flipped={tooltipLeft > 70}
				style:left="{tooltipLeft}%"
				aria-hidden="true"
			>
				<span class="tooltip-week">week of {shortDate(hoveredWeek.weekStarting)}</span>
				<span class="tooltip-value">{hoveredWeek.shipped}</span>
				<span class="tooltip-unit">tasks sealed done</span>
				{#if previousWeek}
					<span class="tooltip-delta">
						{hoveredWeek.shipped - previousWeek.shipped >= 0 ? '+' : ''}{hoveredWeek.shipped -
							previousWeek.shipped} on the week before
					</span>
				{/if}
			</div>
		{/if}
	</div>

	<p class="chart-note">{note}</p>
	<p class="chart-source">
		Source: ledger.task_events, transitions into done. Thirteen weeks to 27 July 2026; {total} tasks.
	</p>
</figure>

<style>
	.chart {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.chart-head {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		max-width: 44rem;
	}

	.chart-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.75rem;
		line-height: 1.15;
		letter-spacing: -0.01em;
		color: var(--text-primary);
	}

	.chart-deck {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-ui);
		line-height: 1.5;
		color: var(--text-secondary);
	}

	.plot-wrap {
		position: relative;
		width: 100%;
	}

	svg {
		display: block;
		width: 100%;
		height: auto;
		overflow: visible;
		touch-action: none;
	}

	/* Grid and axis stay recessive: they orient the reader and nothing more. */
	.grid {
		stroke: var(--grid-colour);
		stroke-width: 1;
	}

	.axis {
		stroke: var(--border-glass);
		stroke-width: 1;
	}

	.axis-text {
		font-family: var(--font-mono);
		font-size: var(--chart-axis-font-size);
		font-weight: var(--chart-axis-font-weight);
		letter-spacing: var(--chart-axis-letter-spacing);
		fill: var(--text-muted);
	}

	.axis-title {
		font-family: var(--font-mono);
		font-size: var(--chart-axis-font-size);
		letter-spacing: var(--chart-axis-letter-spacing);
		text-transform: uppercase;
		fill: var(--text-muted);
		opacity: var(--opacity-tertiary);
	}

	.column {
		fill: var(--chart-series-2);
		transition: opacity var(--chart-transition-duration) var(--chart-transition-easing);
	}

	/* Hover dims the rest rather than recolouring one: the series has one
	   identity and it does not change under the pointer. */
	.column.muted {
		opacity: 0.45;
	}

	.crosshair {
		stroke: var(--text-muted);
		stroke-width: 1;
		stroke-dasharray: 2 4;
	}

	.leader {
		stroke: var(--text-muted);
		stroke-width: 1;
	}

	.leader-node {
		fill: none;
		stroke: var(--text-primary);
		stroke-width: 1.5;
	}

	/* Annotation text wears text tokens. The coloured mark beside it is the
	   column itself, which the leader line points at. */
	.annotation-label {
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 600;
		fill: var(--text-primary);
	}

	.annotation-detail {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		fill: var(--text-muted);
	}

	.tooltip {
		position: absolute;
		/* Below the annotation band, so a transient reading never covers the
		   permanent one. */
		top: 32%;
		transform: translateX(var(--space-3));
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-3) var(--space-4);
		background: var(--bg-glass-solid);
		border-top: 1px solid var(--el-edge-light);
		border-left: 1px solid var(--el-edge-light);
		border-right: 1px solid var(--el-edge-shade);
		border-bottom: 1px solid var(--el-edge-shade);
		box-shadow: var(--elevation-3);
		pointer-events: none;
		min-width: 12rem;
		z-index: var(--z-dropdown);
	}

	.tooltip.flipped {
		transform: translateX(calc(-100% - var(--space-3)));
	}

	.tooltip-week {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.tooltip-value {
		font-family: var(--font-display);
		font-size: 2rem;
		line-height: 1;
		color: var(--text-primary);
	}

	.tooltip-unit,
	.tooltip-delta {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.tooltip-delta {
		color: var(--text-muted);
	}

	.chart-note {
		margin: 0;
		max-width: 46rem;
		font-family: var(--font-body);
		font-size: var(--text-ui);
		line-height: 1.55;
		color: var(--text-secondary);
		border-left: 2px solid var(--card-border);
		padding-left: var(--space-4);
	}

	.chart-source {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		color: var(--text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.column {
			transition: none;
		}
	}
</style>
