<script lang="ts" module>
	/** The eight ledger task statuses, mirrored from the database enum. */
	export type TaskStatus =
		'pending' | 'triaged' | 'building' | 'verifying' | 'done' | 'blocked' | 'wontfix' | 'duplicate';

	export interface StatusMarkProps {
		status: TaskStatus;
		size?: 'default' | 'lead';
	}
</script>

<script lang="ts">
	/**
	 * StatusMark — a ledger task status as a dot and its word.
	 *
	 * Badge's five semantic variants do not map onto the ledger's statuses and
	 * StatusBadge is admin-only, so this exists. It always renders the status
	 * word: the dot carries the colour but never carries the meaning on its own.
	 *
	 * REQUIRED INPUTS, deliberately without defaults: the eight --status-*
	 * custom properties (--status-pending, --status-triaged, --status-building,
	 * --status-verifying, --status-done, --status-blocked, --status-wontfix,
	 * --status-duplicate) must be declared by the consuming page, which is where
	 * the decision of what each status means in colour belongs. A wrong default
	 * colour would be worse than the visible gap an undeclared one leaves.
	 *
	 * The colour comes from a data-status attribute selector rather than an
	 * interpolated var(--status-{status}) because interpolation inside var() is
	 * opaque to review_markup, and an unreadable token reference is worse than a
	 * slightly longer stylesheet.
	 *
	 * Only the two motion statuses (building, verifying) breathe. Movement is
	 * reserved for work in motion — a done task that pulsed would be claiming to
	 * be alive.
	 *
	 * Usage:
	 *   <StatusMark status="building" />
	 *   <StatusMark status="done" size="lead" />
	 */
	let { status, size = 'default' }: StatusMarkProps = $props();

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

	/* Each status resolves the page-declared palette into the one property the
	   mark reads. No fallbacks: see the contract in the component comment. */
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

	/* Running work is in motion; the dot says so without any text moving. */
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
