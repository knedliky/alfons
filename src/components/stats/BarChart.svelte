<script lang="ts" module>
	export interface BarChartItem {
		label: string;
		value: number;
		percentage?: number;
	}

	export interface BarChartProps {
		data: BarChartItem[];
		title?: string;
		valueLabel?: string;
		isLoading?: boolean;
		maxItems?: number;
	}
</script>

<script lang="ts">
	/**
	 * BarChart
	 * Usage: `<BarChart data={items} title="Top Pages" valueLabel="Views" />`
	 * Features: Horizontal bar chart for ranked data, loading skeleton, empty state, animated bar fill
	 */

	let {
		data,
		title = 'Top Items',
		valueLabel = 'Views',
		isLoading = false,
		maxItems = 10
	}: BarChartProps = $props();

	const maxValue = $derived.by(() => {
		if (data.length === 0) return 100;
		return Math.max(...data.map((d) => d.value));
	});

	const displayData = $derived(data.slice(0, maxItems));

	function getBarWidth(value: number): number {
		return maxValue > 0 ? (value / maxValue) * 100 : 0;
	}

	function formatValue(value: number): string {
		if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
		if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
		return value.toLocaleString('en-AU');
	}

	function truncateLabel(label: string, maxLength: number = 40): string {
		if (label.length <= maxLength) return label;
		return label.substring(0, maxLength - 3) + '...';
	}
</script>

<div class="bar-chart-container">
	{#if title}
		<div class="chart-header">
			<h3 class="chart-title">{title}</h3>
			{#if data.length > maxItems}
				<span class="chart-subtitle">Showing top {maxItems} of {data.length}</span>
			{/if}
		</div>
	{/if}

	{#if isLoading}
		<div class="chart-loading">
			{#each [0, 1, 2, 3, 4] as i (i)}
				<div class="loading-row">
					<div class="loading-label"></div>
					<div class="loading-bar" style="width: {100 - i * 15}%"></div>
				</div>
			{/each}
		</div>
	{:else if displayData.length === 0}
		<div class="chart-empty">
			<svg
				class="empty-icon"
				width="40"
				height="40"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
				aria-hidden="true"
			>
				<rect x="3" y="12" width="4" height="9" rx="1" />
				<rect x="10" y="8" width="4" height="13" rx="1" />
				<rect x="17" y="4" width="4" height="17" rx="1" />
			</svg>
			<span>No data available for this period</span>
		</div>
	{:else}
		<div class="bar-chart">
			<div class="chart-header-row">
				<span class="header-label">Name</span>
				<span class="header-value">{valueLabel}</span>
			</div>

			{#each displayData as item, index (item.label)}
				<div class="bar-row" style="animation-delay: {index * 50}ms">
					<div class="bar-label" title={item.label}>
						<span class="bar-rank">{index + 1}</span>
						<span class="bar-name">{truncateLabel(item.label)}</span>
					</div>
					<div class="bar-container">
						<div class="bar-fill" style="width: {getBarWidth(item.value)}%"></div>
					</div>
					<div class="bar-value">
						<span class="value-number">{formatValue(item.value)}</span>
						{#if item.percentage !== undefined}
							<span class="value-percentage">({item.percentage}%)</span>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.bar-chart-container {
		background-color: var(--chart-bg-admin);
		border: 1px solid var(--chart-border-admin);
		border-radius: 12px;
		padding: var(--chart-padding);
	}

	.chart-header {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		margin-bottom: 1rem;
		gap: 0.5rem;
	}

	.chart-title {
		font-size: var(--chart-title-size);
		font-weight: 600;
		color: var(--admin-text);
		margin: 0;
	}

	.chart-subtitle {
		font-size: var(--chart-label-size);
		color: var(--chart-axis-colour-admin);
	}

	.bar-chart {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.chart-header-row {
		display: grid;
		grid-template-columns: 1fr minmax(100px, 200px) auto;
		gap: 1rem;
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--chart-border-admin);
		font-size: var(--chart-label-size);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--chart-axis-colour-admin);
	}

	.header-label {
		padding-left: 2rem;
	}

	.header-value {
		text-align: right;
		min-width: 80px;
	}

	.bar-row {
		display: grid;
		grid-template-columns: 1fr minmax(100px, 200px) auto;
		gap: 1rem;
		align-items: center;
		padding: 0.5rem 0;
		animation: fadeInUp 0.3s ease forwards;
		opacity: 0;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.bar-label {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
	}

	.bar-rank {
		flex-shrink: 0;
		width: 1.5rem;
		height: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: var(--chart-label-size);
		font-weight: 600;
		color: var(--chart-axis-colour-admin);
		background-color: var(--chart-tooltip-bg-admin);
		border-radius: 4px;
	}

	.bar-name {
		font-size: var(--chart-value-size);
		color: var(--admin-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.bar-container {
		height: 8px;
		background-color: var(--chart-grid-colour-admin);
		border-radius: 4px;
		overflow: hidden;
	}

	.bar-fill {
		height: 100%;
		background: linear-gradient(
			90deg,
			var(--chart-admin-series-1) 0%,
			color-mix(in srgb, var(--chart-admin-series-1) 70%, transparent) 100%
		);
		border-radius: 4px;
		transition: width var(--chart-transition-duration) var(--chart-transition-easing);
	}

	.bar-value {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
		justify-content: flex-end;
		min-width: 80px;
	}

	.value-number {
		font-family: var(--font-mono);
		font-size: var(--chart-value-size);
		font-weight: 600;
		color: var(--admin-text);
	}

	.value-percentage {
		font-family: var(--font-mono);
		font-size: var(--chart-label-size);
		color: var(--chart-axis-colour-admin);
	}

	.chart-loading {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem 0;
	}

	.loading-row {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.loading-label {
		width: 120px;
		height: 16px;
		background: linear-gradient(
			90deg,
			var(--chart-border-admin) 0%,
			var(--chart-tooltip-bg-admin) 50%,
			var(--chart-border-admin) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 4px;
	}

	.loading-bar {
		height: 8px;
		background: linear-gradient(
			90deg,
			var(--chart-border-admin) 0%,
			var(--chart-tooltip-bg-admin) 50%,
			var(--chart-border-admin) 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.5s infinite;
		border-radius: 4px;
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}

		100% {
			background-position: -200% 0;
		}
	}

	.chart-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 3rem 1rem;
		color: var(--chart-axis-colour-admin);
		font-size: var(--chart-value-size);
	}

	.empty-icon {
		opacity: 0.5;
	}

	@media (max-width: 768px) {
		.bar-chart-container {
			padding: 1rem;
		}

		.chart-header-row {
			grid-template-columns: 1fr auto;
		}

		.bar-row {
			grid-template-columns: 1fr auto;
		}

		/* Hide bar track on narrow screens */
		.bar-container {
			display: none;
		}

		.bar-name {
			font-size: 0.8125rem;
		}
	}

	@media (max-width: 480px) {
		.bar-rank {
			display: none;
		}

		.bar-label {
			gap: 0;
		}

		.header-label {
			padding-left: 0;
		}
	}
</style>
