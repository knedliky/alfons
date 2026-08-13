<script lang="ts">
	/**
	 * The status indicator this page needs and the library does not have.
	 *
	 * Badge's five semantic variants do not map onto the ledger's statuses and
	 * StatusBadge is admin-only, so this is local by necessity rather than by
	 * preference. It always renders the status word: the dot carries the colour
	 * but never carries the meaning on its own.
	 *
	 * The colour comes from a data-status attribute selector rather than
	 * var(--status-{status}) because interpolation inside var() is opaque to
	 * review_markup, and an unreadable token reference is worse than a slightly
	 * longer stylesheet.
	 */
	import type { RunningStatus } from './tasks.ts';

	let { status, size = 'default' }: { status: RunningStatus; size?: 'default' | 'lead' } = $props();
</script>

<span class="mark" data-status={status} data-size={size}>
	<span class="dot"></span>
	<span class="word">{status}</span>
</span>

<style>
	.mark {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--status-colour);
	}

	.mark[data-size='lead'] {
		font-size: var(--text-ui);
	}

	/* Declared once at the page root; resolved here per status. */
	.mark[data-status='building'] {
		--status-colour: var(--status-building);
	}

	.mark[data-status='verifying'] {
		--status-colour: var(--status-verifying);
	}

	.dot {
		width: var(--space-3);
		height: var(--space-3);
		background: var(--status-colour);
		flex: none;
		/* Running work is in motion; the dot says so without any text moving. */
		animation: breathe var(--widget-pulse-duration) ease-in-out infinite;
	}

	@keyframes breathe {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: var(--opacity-tertiary);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dot {
			animation: none;
		}
	}
</style>
