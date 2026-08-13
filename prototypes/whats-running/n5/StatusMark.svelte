<script lang="ts">
	/**
	 * The status indicator this page needs and the library does not have:
	 * Badge's five variants do not map onto ledger statuses, and StatusBadge is
	 * admin-only. Local by necessity, not by preference.
	 *
	 * The mark always carries the word. Colour narrows which state it is; the
	 * word says it outright, so nothing here depends on seeing the hue.
	 *
	 * The pulse is the instrument's only ambient motion on a running channel,
	 * and it encodes liveness rather than decorating the row: a channel that is
	 * not pulsing is a channel that has stopped.
	 */
	import type { RunningStatus } from './feed.svelte.ts';

	let { status, muted = false }: { status: RunningStatus; muted?: boolean } = $props();
</script>

<span class="mark" data-status={status} class:muted>
	<span class="dot" aria-hidden="true"></span>
	<span class="word">{status}</span>
</span>

<style>
	/* Attribute selectors rather than interpolated classes: the review rule
	   cannot see through interpolation, and the colours are still tokens. */
	.mark[data-status='building'] {
		--mark-colour: var(--status-building);
	}

	.mark[data-status='verifying'] {
		--mark-colour: var(--status-verifying);
	}

	.mark {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--mark-colour);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		white-space: nowrap;
	}

	.mark.muted {
		color: var(--text-muted);
	}

	.dot {
		width: var(--space-3);
		height: var(--space-3);
		background: var(--mark-colour);
		animation: breathe var(--widget-pulse-duration) ease-in-out infinite;
	}

	.mark.muted .dot {
		background: var(--text-muted);
		animation: none;
	}

	@keyframes breathe {
		0%,
		100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: var(--state-hover-opacity);
			transform: scale(0.72);
		}
	}

	/* Reduced motion keeps the mark and drops the breath. Liveness is carried
	   elsewhere on the channel by a counter that changes, not by pixels moving. */
	@media (prefers-reduced-motion: reduce) {
		.dot {
			animation: none;
		}
	}
</style>
