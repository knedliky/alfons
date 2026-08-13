<script lang="ts">
	/**
	 * The headline figures, set on the column grid.
	 *
	 * LongreadStatBand already does a row of figures, but it centres them,
	 * sets them in the display serif and lights them with a warm glow — an
	 * editorial device that reads as decoration on a lookup tool. Here the
	 * figures are flush left on their columns, divided by rules, and the whole
	 * hierarchy is carried by weight and size.
	 */
	import type { Figure } from './ledger-corpus';

	interface Props {
		figures: Figure[];
	}

	let { figures }: Props = $props();
</script>

<dl class="band">
	{#each figures as figure (figure.label)}
		<!-- The term precedes its definitions in the markup, as a list expects;
		     the figure is lifted above its label visually by order alone. -->
		<div class="figure">
			<dt class="label">{figure.label}</dt>
			<dd class="value">{figure.value}</dd>
			<dd class="note">{figure.note}</dd>
		</div>
	{/each}
</dl>

<style>
	.band {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: 0;
		margin: 0;
		border-block-start: var(--space-1) solid var(--text-primary);
	}

	.figure {
		display: flex;
		flex-direction: column;
		padding: var(--space-5) var(--space-5) var(--space-5) 0;
		border-inline-start: 1px solid var(--border-glass);
		padding-inline-start: var(--space-4);
	}

	.value {
		order: 1;
	}

	.label {
		order: 2;
	}

	.note {
		order: 3;
	}

	.figure:first-child {
		border-inline-start: none;
		padding-inline-start: 0;
	}

	.value {
		margin: 0;
		font-family: var(--font-body);
		font-size: 3rem;
		font-weight: 800;
		line-height: 0.95;
		letter-spacing: -0.045em;
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.label {
		margin-block-start: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-primary);
	}

	.note {
		margin: var(--space-1) 0 0;
		font-family: var(--font-body);
		font-size: var(--text-caption);
		font-weight: 400;
		line-height: 1.4;
		color: var(--text-muted);
	}

	@media (max-width: 767px) {
		.value {
			font-size: 2rem;
		}
	}
</style>
