<script lang="ts" module>
	export interface TimeseriesDataPoint {
		timestamp: number;
		label: string;
		views: number;
		uniqueSessions: number;
	}

	export interface LineChartProps {
		data: TimeseriesDataPoint[];
		title?: string;
		metric?: 'views' | 'uniqueSessions';
		width?: number;
		height?: number;
		isLoading?: boolean;
	}
</script>

<script lang="ts">
	/**
	 * LineChart
	 * Usage: `<LineChart data={timeseries} metric="views" title="Page Views" />`
	 * Features: Pure SVG time series chart, interactive tooltips, area fill, loading state, responsive design
	 */

	let {
		data,
		title = 'Page Views Over Time',
		metric = 'views',
		width = 800,
		height = 300,
		isLoading = false
	}: LineChartProps = $props();

	const padding = { top: 20, right: 20, bottom: 40, left: 50 };

	const innerWidth = $derived(width - padding.left - padding.right);
	const innerHeight = $derived(height - padding.top - padding.bottom);

	let hoveredIndex = $state<number | null>(null);
	let mouseX = $state(0);
	let mouseY = $state(0);
	let tooltipWidth = $state(140);

	const maxValue = $derived.by(() => {
		if (data.length === 0) return 100;
		const values = data.map((d) => (metric === 'views' ? d.views : d.uniqueSessions));
		const max = Math.max(...values);
		return Math.ceil(max * 1.1) || 100;
	});

	const linePath = $derived.by(() => {
		if (data.length === 0) return '';

		const points = data.map((point, index) => {
			const x = padding.left + (index / (data.length - 1 || 1)) * innerWidth;
			const value = metric === 'views' ? point.views : point.uniqueSessions;
			const y = padding.top + (1 - value / maxValue) * innerHeight;
			return `${x},${y}`;
		});

		return `M ${points.join(' L ')}`;
	});

	const areaPath = $derived.by(() => {
		if (data.length === 0) return '';

		const points = data.map((point, index) => {
			const x = padding.left + (index / (data.length - 1 || 1)) * innerWidth;
			const value = metric === 'views' ? point.views : point.uniqueSessions;
			const y = padding.top + (1 - value / maxValue) * innerHeight;
			return `${x},${y}`;
		});

		const firstX = padding.left;
		const lastX = padding.left + innerWidth;
		const bottomY = padding.top + innerHeight;

		return `M ${firstX},${bottomY} L ${points.join(' L ')} L ${lastX},${bottomY} Z`;
	});

	const yAxisLabels = $derived.by(() => {
		const max = maxValue;
		const step = max / 4;
		return [0, step, step * 2, step * 3, max].map((v, i) => ({
			value: Math.round(v),
			top: ((4 - i) / 4) * 100
		}));
	});

	const visibleXLabels = $derived.by(() => {
		if (data.length === 0) return [];

		return data
			.map((point, index) => {
				const showLabel =
					data.length <= 7 || index % Math.ceil(data.length / 7) === 0 || index === data.length - 1;

				if (!showLabel) return null;

				return {
					label: point.label,
					left: (index / (data.length - 1 || 1)) * 100
				};
			})
			.filter((item) => item !== null) as { label: string; left: number }[];
	});

	function handleMouseMove(event: MouseEvent, index: number) {
		hoveredIndex = index;
		const rect = (event.currentTarget as SVGElement).ownerSVGElement?.getBoundingClientRect();
		if (rect) {
			const relativeX = event.clientX - rect.left;
			const relativeY = event.clientY - rect.top;

			const tooltipOffset = 10;
			const maxX = rect.width - tooltipWidth - tooltipOffset;
			mouseX = Math.min(relativeX + tooltipOffset, maxX);

			const tooltipHeight = 60;
			mouseY = relativeY > tooltipHeight ? relativeY - 40 : relativeY + 20;
		}
	}

	function handleMouseLeave() {
		hoveredIndex = null;
	}

	function formatValue(value: number): string {
		if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
		if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
		return value.toString();
	}
</script>

<div class="line-chart-container">
	{#if title}
		<h3 class="chart-title">{title}</h3>
	{/if}

	{#if isLoading}
		<div class="chart-loading" style="height: {height}px">
			<div class="loading-spinner"></div>
			<span>Loading chart data...</span>
		</div>
	{:else if data.length === 0}
		<div class="chart-empty" style="height: {height}px">
			<svg
				class="empty-icon"
				width="48"
				height="48"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"
			>
				<path d="M3 3v18h18" stroke-linecap="round" stroke-linejoin="round" />
				<path d="M7 16l4-4 4 4 5-6" stroke-linecap="round" stroke-linejoin="round" />
			</svg>
			<span>No data available for this period</span>
		</div>
	{:else}
		<div class="line-chart-wrapper" style="height: {height}px">
			<svg class="line-chart-svg" viewBox="0 0 {width} {height}" preserveAspectRatio="none">
				{#each yAxisLabels as label (label.value)}
					{@const y = padding.top + (label.top / 100) * innerHeight}
					<line class="grid-line" x1={padding.left} y1={y} x2={width - padding.right} y2={y} />
				{/each}

				<path class="area-fill" d={areaPath} />

				<path class="chart-line" d={linePath} />

				{#each data as point, index (point.timestamp)}
					{@const x = padding.left + (index / (data.length - 1 || 1)) * innerWidth}
					{@const value = metric === 'views' ? point.views : point.uniqueSessions}
					{@const y = padding.top + (1 - value / maxValue) * innerHeight}

					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<rect
						class="hover-area"
						x={x - 10}
						y={padding.top}
						width={20}
						height={innerHeight}
						onmousemove={(e) => handleMouseMove(e, index)}
						onmouseleave={handleMouseLeave}
					/>

					<circle
						class="data-point"
						class:hovered={hoveredIndex === index}
						cx={x}
						cy={y}
						r={hoveredIndex === index ? 6 : 4}
					/>
				{/each}
			</svg>

			<div class="y-axis-labels">
				{#each yAxisLabels as label (label.value)}
					<span class="y-axis-label" style="top: {label.top}%">
						{formatValue(label.value)}
					</span>
				{/each}
			</div>

			<div class="x-axis-labels">
				{#each visibleXLabels as label (label.label)}
					<span class="x-axis-label" style="left: {label.left}%">
						{label.label}
					</span>
				{/each}
			</div>
		</div>

		{#if hoveredIndex !== null && data[hoveredIndex]}
			<div class="chart-tooltip" style="left: {mouseX}px; top: {mouseY}px">
				<div class="tooltip-label">{data[hoveredIndex].label}</div>
				<div class="tooltip-value">
					{metric === 'views' ? 'Views' : 'Sessions'}:
					<strong
						>{data[hoveredIndex][metric === 'views' ? 'views' : 'uniqueSessions'].toLocaleString(
							'en-AU'
						)}</strong
					>
				</div>
			</div>
		{/if}
	{/if}
</div>

<style>
	.line-chart-container {
		position: relative;
		background-color: var(--chart-bg-admin);
		border: 1px solid var(--chart-border-admin);
		border-radius: 12px;
		padding: var(--chart-padding);
	}

	.chart-title {
		font-size: var(--chart-title-size);
		font-weight: 600;
		color: var(--admin-text);
		margin: 0 0 1rem 0;
	}

	.line-chart-wrapper {
		position: relative;
		width: 100%;
	}

	.line-chart-svg {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		overflow: visible;
	}

	.grid-line {
		stroke: var(--chart-grid-subtle-admin);
		stroke-width: 1;
	}

	.area-fill {
		/* rgba overlay for series colour; no token for raw alpha fill */
		fill: rgba(var(--accent-rgb), 0.1);
	}

	.chart-line {
		fill: none;
		stroke: var(--chart-admin-series-1);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	.hover-area {
		fill: transparent;
		cursor: pointer;
	}

	.data-point {
		fill: var(--chart-admin-series-1);
		stroke: var(--chart-bg-admin);
		stroke-width: 2;
		transition:
			r var(--chart-transition-duration) var(--chart-transition-easing),
			stroke-width var(--chart-transition-duration) var(--chart-transition-easing),
			stroke var(--chart-transition-duration) var(--chart-transition-easing);
		/* Keeps circles circular regardless of parent aspect ratio */
		vector-effect: non-scaling-stroke;
	}

	.data-point.hovered {
		fill: var(--chart-admin-series-1);
		stroke: var(--admin-text);
		stroke-width: 2.5;
	}

	.y-axis-labels {
		position: absolute;
		top: 20px;
		left: 0;
		width: 45px;
		height: calc(100% - 60px);
		pointer-events: none;
	}

	.y-axis-label {
		position: absolute;
		right: 5px;
		transform: translateY(-50%);
		font-family: var(--font-mono);
		font-size: var(--chart-axis-font-size);
		font-weight: var(--chart-axis-font-weight);
		letter-spacing: var(--chart-axis-letter-spacing);
		color: var(--chart-axis-colour-admin);
		text-align: right;
		text-transform: uppercase;
	}

	.x-axis-labels {
		position: absolute;
		bottom: 0;
		left: 50px;
		width: calc(100% - 70px);
		height: 40px;
		pointer-events: none;
	}

	.x-axis-label {
		position: absolute;
		top: 10px;
		transform: translateX(-50%);
		font-family: var(--font-mono);
		font-size: var(--chart-axis-font-size);
		font-weight: var(--chart-axis-font-weight);
		letter-spacing: var(--chart-axis-letter-spacing);
		color: var(--chart-axis-colour-admin);
		text-align: center;
		white-space: nowrap;
		text-transform: uppercase;
	}

	.chart-tooltip {
		position: absolute;
		background-color: var(--chart-tooltip-bg-admin);
		border: 1px solid var(--chart-tooltip-border-admin);
		border-radius: 8px;
		padding: 0.75rem;
		pointer-events: none;
		z-index: var(--z-dropdown);
		/* rgba shadow; no semantic token for drop shadow colour */
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		min-width: 140px;
		opacity: 0;
		animation: fadeIn 0.2s ease-in-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.tooltip-label {
		font-size: var(--chart-label-size);
		color: var(--chart-axis-colour-admin);
		margin-bottom: 0.25rem;
	}

	.tooltip-value {
		font-size: var(--chart-value-size);
		color: var(--chart-tooltip-text-admin);
	}

	.tooltip-value strong {
		font-family: var(--font-mono);
		color: var(--chart-admin-series-1);
	}

	.chart-loading,
	.chart-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		color: var(--chart-axis-colour-admin);
		font-size: var(--chart-value-size);
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--chart-border-admin);
		border-top-color: var(--chart-admin-series-1);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.empty-icon {
		color: var(--chart-axis-colour-admin);
		opacity: 0.5;
	}

	@media (max-width: 640px) {
		.line-chart-container {
			padding: 1rem;
		}

		.chart-title {
			font-size: 0.875rem;
		}

		.y-axis-label,
		.x-axis-label {
			font-size: 9px;
		}

		/* Larger touch targets on mobile */
		.hover-area {
			width: 30px;
		}

		/* Slightly larger data points for mobile visibility */
		.data-point {
			r: 5;
		}

		.data-point.hovered {
			r: 7;
		}

		.chart-tooltip {
			max-width: calc(100vw - 2rem);
			font-size: 0.875rem;
		}
	}
</style>
