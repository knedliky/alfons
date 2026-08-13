<script lang="ts">
	/**
	 * The status indicator, now carrying all eight ledger statuses.
	 *
	 * The winning approach needed two. This deck can be handed a whole release,
	 * and a release is mostly finished work, so the mark has to say `done`,
	 * `blocked`, `wontfix` and the rest without letting them compete with the two
	 * that mean motion. Two devices keep that from happening, and they are the
	 * reason eight colours do not turn the page into a chart:
	 *
	 * 1. Only building and verifying breathe. The animation is the encoding of
	 *    motion; the six settled statuses are still, so a running task is legible
	 *    across a grid of finished ones without reading a single word.
	 * 2. Everything except the two running statuses renders at reduced strength.
	 *    The hue still says which state it is when looked at; it does not shout
	 *    when scanned past. Colour still encodes state only — nothing here is
	 *    decoration, and a release or project never takes a status hue.
	 *
	 * The word is always rendered. The dot carries the colour and never carries
	 * the meaning on its own.
	 *
	 * The colours come from a data-status attribute selector rather than
	 * var(--status-{status}), because interpolation inside var() is opaque to
	 * review_markup and an unreadable token reference is worse than a longer
	 * stylesheet.
	 */
	import { isRunning, type Status } from './tasks.ts';

	let { status, size = 'default' }: { status: Status; size?: 'default' | 'lead' } = $props();

	const running = $derived(isRunning(status));
</script>

<span class="mark" data-status={status} data-size={size} data-motion={running ? 'yes' : 'no'}>
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

	/* Settled work states its colour quietly. Running work states it fully. */
	.mark[data-motion='no'] {
		opacity: var(--opacity-tertiary);
	}

	/* Declared once at the page root; resolved here per status. */
	.mark[data-status='pending'] {
		--status-colour: var(--status-pending);
	}

	.mark[data-status='triaged'] {
		--status-colour: var(--status-triaged);
	}

	.mark[data-status='building'] {
		--status-colour: var(--status-building);
	}

	.mark[data-status='verifying'] {
		--status-colour: var(--status-verifying);
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

	/* Running work is in motion; the dot says so without any text moving. A
	   settled status must never breathe — the animation is the encoding. */
	.mark[data-motion='yes'] .dot {
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
		.mark[data-motion='yes'] .dot {
			animation: none;
		}
	}
</style>
