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
	 *
	 * Extended for this round from two statuses to eight, because a release
	 * screen shows a whole release and a release is mostly not running. The
	 * extension is deliberately flat: every status gets a colour and a word, and
	 * the two motion statuses are the only ones that breathe. Motion is the thing
	 * this page is about, so movement is reserved for it the same way amber and
	 * blush are — a done task that pulsed would be claiming to be alive.
	 */
	import type { TaskStatus } from './tasks.ts';

	let { status, size = 'default' }: { status: TaskStatus; size?: 'default' | 'lead' } = $props();

	const inMotion = $derived(status === 'building' || status === 'verifying');
</script>

<span
	class="mark"
	data-status={status}
	data-size={size}
	data-motion={inMotion ? 'true' : undefined}
>
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

	/* Declared once at the page root; resolved here per status. The two motion
	   statuses keep the colours the running view reserved for them, and the six
	   that are not motion take neutral, informational and terminal colours that
	   never appear on the running view at all. */
	.mark[data-status='building'] {
		--status-colour: var(--status-building);
	}

	.mark[data-status='verifying'] {
		--status-colour: var(--status-verifying);
	}

	.mark[data-status='pending'] {
		--status-colour: var(--status-pending);
	}

	.mark[data-status='triaged'] {
		--status-colour: var(--status-triaged);
	}

	.mark[data-status='done'] {
		--status-colour: var(--status-done);
	}

	.mark[data-status='blocked'] {
		--status-colour: var(--status-blocked);
	}

	.mark[data-status='wontfix'] {
		--status-colour: var(--status-wontfix);
	}

	.mark[data-status='duplicate'] {
		--status-colour: var(--status-duplicate);
	}

	.dot {
		width: var(--space-3);
		height: var(--space-3);
		background: var(--status-colour);
		flex: none;
	}

	/* Running work is in motion; the dot says so without any text moving. Only
	   the two motion statuses get it. */
	.mark[data-motion='true'] .dot {
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
		.mark[data-motion='true'] .dot {
			animation: none;
		}
	}
</style>
