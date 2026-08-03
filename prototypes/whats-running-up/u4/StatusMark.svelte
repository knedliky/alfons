<script lang="ts">
	/**
	 * The status indicator this page needs and the library does not have.
	 *
	 * Badge's five semantic variants do not map onto the ledger's statuses and
	 * StatusBadge is admin-only, so this is local by necessity rather than by
	 * preference. It always renders the status word: the dot carries the colour
	 * but never carries the meaning on its own.
	 *
	 * Extended from the winning approach's two statuses to all eight, because the
	 * sheet lists a release's tasks and a release contains finished, blocked and
	 * unstarted work. The extension is honest rather than convenient: pending,
	 * wontfix and duplicate share --text-muted because none of them is a state
	 * worth a colour, and giving each its own would spend the page's whole colour
	 * budget on the statuses that mean least.
	 *
	 * The dot only breathes for the two statuses that mean an agent is at the
	 * keyboard. A done task with a pulsing dot would be a lie told in motion.
	 *
	 * The colour comes from a data-status attribute selector rather than
	 * var(--status-{status}) because interpolation inside var() is opaque to
	 * review_markup, and an unreadable token reference is worse than a slightly
	 * longer stylesheet.
	 */
	import { isInMotion, type TaskStatus } from './tasks.ts';

	let {
		status,
		size = 'default'
	}: { status: TaskStatus; size?: 'micro' | 'default' | 'lead' } = $props();
</script>

<span class="mark" data-status={status} data-size={size} data-motion={isInMotion(status) ? 'live' : 'still'}>
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

	.mark[data-size='micro'] {
		font-size: var(--text-micro);
		gap: var(--space-1);
	}

	/* Declared once at the page root; resolved here per status. The two in motion
	   are the page's reserved pair; the other six exist only so a release can be
	   listed truthfully. */
	.mark[data-status='building'] {
		--status-colour: var(--status-building);
	}

	.mark[data-status='verifying'] {
		--status-colour: var(--status-verifying);
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

	.mark[data-status='pending'] {
		--status-colour: var(--status-pending);
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

	.mark[data-size='micro'] .dot {
		width: var(--space-2);
		height: var(--space-2);
	}

	/* Running work is in motion; the dot says so without any text moving. Only
	   for the two statuses that are actually in motion. */
	.mark[data-motion='live'] .dot {
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
