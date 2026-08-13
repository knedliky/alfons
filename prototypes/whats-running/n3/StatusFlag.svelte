<script lang="ts">
	/**
	 * The status indicator this page needs and the library does not have.
	 *
	 * Badge's five variants are semantic (success, warning, …) and do not map
	 * onto ledger statuses; StatusBadge is admin-only and its --admin-* tokens
	 * are illegal on a public surface. So: a local one, deliberately minimal.
	 *
	 * The mark is never the whole message. Colour comes from --status-colour,
	 * which the page root maps from the data-status attribute, and the word is
	 * always rendered beside it — nothing here is legible by hue alone.
	 */
	import type { RunningStatus } from './runners.ts';

	let { status, size = 'row' }: { status: RunningStatus; size?: 'lead' | 'row' } = $props();
</script>

<span class="flag" data-status={status} data-size={size}>
	<span class="mark" aria-hidden="true"></span>
	{status}
</span>

<style>
	.flag {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 500;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--status-colour);
		white-space: nowrap;
	}

	.flag[data-size='lead'] {
		font-size: var(--text-caption);
	}

	.mark {
		width: var(--space-2);
		height: var(--space-2);
		background: var(--status-colour);
		flex: none;
	}

	/* The lead's mark breathes, because the lead is the thing claimed to be
	   happening now. Motion is the claim; the word still carries the meaning. */
	.flag[data-size='lead'] .mark {
		animation: alive var(--widget-pulse-duration) ease-in-out infinite;
	}

	@keyframes alive {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: var(--opacity-tertiary);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.flag[data-size='lead'] .mark {
			animation: none;
		}
	}
</style>
