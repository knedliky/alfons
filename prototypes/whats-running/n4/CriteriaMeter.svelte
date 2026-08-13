<script lang="ts">
	/**
	 * One mark per acceptance criterion, in criterion order.
	 *
	 * The encoding is deliberately hue-free. Task status owns the only colour on
	 * this page, and a verification outcome is a different kind of fact, so the
	 * marks separate by fill and shape on the neutral ink ramp instead:
	 *
	 *   pass     solid, full ink
	 *   fail     hatched, mid ink
	 *   skip     hollow — judged, and deliberately not answered
	 *   unjudged no mark at all, only the recessive track
	 *
	 * That last one is the point of the whole component. A task that has never
	 * been verified renders as an empty frame rather than a bar filled to zero,
	 * because zero would read as failure when the fact is not-yet-attempted.
	 *
	 * The meter is aria-hidden: the tally sentence rendered beside it in the row
	 * is its text equivalent, and reading both would say the same thing twice.
	 */
	import type { CriterionOutcome } from './runners.ts';

	let { marks }: { marks: { id: string; outcome: CriterionOutcome }[] } = $props();
</script>

<div class="meter" aria-hidden="true">
	{#each marks as mark (mark.id)}
		<span class="mark" data-outcome={mark.outcome}></span>
	{/each}
</div>

<style>
	.meter {
		display: flex;
		/* 2px between segments, per the meter spec. */
		gap: 2px;
		width: 100%;
	}

	.mark {
		flex: 1 1 0;
		/* Thin marks anchored to the row baseline; local value, no height token. */
		height: 10px;
		/* The recessive grid, which is also the unjudged state: nothing measured. */
		background: var(--grid-colour-accent);
	}

	/* 4px rounded outer data-ends. No radius token matches 4px — the radius
	   doctrine is square — so this is a local value. */
	.mark:first-child {
		border-start-start-radius: 4px;
		border-end-start-radius: 4px;
	}

	.mark:last-child {
		border-start-end-radius: 4px;
		border-end-end-radius: 4px;
	}

	.mark[data-outcome='pass'] {
		background: var(--text-primary);
	}

	.mark[data-outcome='fail'] {
		background:
			repeating-linear-gradient(135deg, var(--text-secondary) 0 3px, transparent 3px 6px),
			var(--grid-colour-accent);
	}

	.mark[data-outcome='skip'] {
		background: transparent;
		box-shadow: inset 0 0 0 1px var(--text-muted);
	}
</style>
