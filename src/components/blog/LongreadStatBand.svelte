<script lang="ts" module>
	export interface LongreadStat {
		value: string;
		label: string;
	}
</script>

<script lang="ts">
	/**
	 * LongreadStatBand — a row of headline figures in display serif with a
	 * warm glow, labelled in mono microtype. For the two or three numbers a
	 * piece stakes its credibility on; anything more belongs in a table.
	 */
	interface Props {
		stats: LongreadStat[];
	}

	let { stats }: Props = $props();
</script>

<div class="longread-stat-band">
	{#each stats as stat (stat.label)}
		<div class="stat">
			<span class="stat-value">{stat.value}</span>
			<span class="stat-label">{stat.label}</span>
		</div>
	{/each}
</div>

<style>
	.longread-stat-band {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		gap: var(--space-5);
		margin: var(--space-6) 0;
		text-align: center;
	}

	.stat-value {
		display: block;
		font-family: var(--font-display);
		font-size: 2.5rem;
		color: var(--text-primary);
		text-shadow: 0 0 24px color-mix(in oklch, var(--amber) 30%, transparent);
	}

	.stat-label {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}
</style>
