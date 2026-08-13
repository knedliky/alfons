<script lang="ts">
	/**
	 * The task's status: a dot in the status hue and the status word beside it.
	 *
	 * Local because Alfons has no public-surface status indicator — Badge's five
	 * variants do not map onto ledger statuses and StatusBadge is admin-only.
	 *
	 * The hue itself is declared once on the page root; this picks it up through
	 * a data-status attribute selector rather than interpolating a var() name,
	 * so the styling stays inspectable in the stylesheet.
	 */
	import type { RunningStatus } from './runners.ts';

	let { status }: { status: RunningStatus } = $props();
</script>

<span class="status" data-status={status}>
	<span class="dot" aria-hidden="true"></span>
	{status}
</span>

<style>
	.status {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		color: var(--text-primary);
	}

	.dot {
		/* A dot diameter, not a spacing step — --space-2 happens to be 8px too,
		   which is what review_markup's value-matching offers here. */
		width: 8px;
		height: 8px;
		border-radius: 50%;
	}

	.status[data-status='building'] .dot {
		background: var(--running-building);
	}

	.status[data-status='verifying'] .dot {
		background: var(--running-verifying);
	}
</style>
