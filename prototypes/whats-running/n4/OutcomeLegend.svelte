<script lang="ts">
	/**
	 * The key to the marks, rendered once for the page rather than once per row.
	 *
	 * More than one category is shown, so a legend is owed. It repeats the mark
	 * styling rather than importing it: the meter's marks are flexible segments
	 * and these are fixed swatches, so sharing the rule would mean parameterising
	 * a component for one caller.
	 */
</script>

<dl class="legend">
	{#each [['pass', 'passed'], ['fail', 'failed'], ['skip', 'skipped'], ['unjudged', 'not yet judged']] as [outcome, word] (outcome)}
		<div class="entry">
			<dt class="swatch" data-outcome={outcome}></dt>
			<dd class="word">{word}</dd>
		</div>
	{/each}
</dl>

<style>
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		margin: 0;
	}

	.entry {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.swatch {
		/* Local values, matching the meter's marks. No token holds a mark height,
		   and no radius token matches the 4px data-end — the radius doctrine is
		   square, so the meter's rounded ends are a local exception. */
		width: 18px;
		height: 10px;
		border-radius: 4px;
		background: var(--grid-colour-accent);
	}

	.swatch[data-outcome='pass'] {
		background: var(--text-primary);
	}

	.swatch[data-outcome='fail'] {
		background:
			repeating-linear-gradient(
				135deg,
				var(--text-secondary) 0 3px,
				transparent 3px 6px
			),
			var(--grid-colour-accent);
	}

	.swatch[data-outcome='skip'] {
		background: transparent;
		box-shadow: inset 0 0 0 1px var(--text-muted);
	}

	.word {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
