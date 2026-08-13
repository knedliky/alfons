<script lang="ts" module>
	import type { TaskStatus } from './corpus';

	export interface StatusMarkProps {
		status: TaskStatus;
		/** Hide the word when the surrounding row already names the status. */
		labelled?: boolean;
	}
</script>

<script lang="ts">
	/**
	 * The one status indicator on the page.
	 *
	 * Colour comes from the --status-* custom properties declared once at the
	 * page root, so the encoding cannot drift between the command results, the
	 * phase spine and the transition tape. Every mark carries a distinct shape
	 * as well as a colour, and by default a word too, so the state survives a
	 * reader who cannot separate amber from olive.
	 */
	let { status, labelled = true }: StatusMarkProps = $props();
</script>

<span class="mark-set" data-status={status}>
	<span class="mark" aria-hidden="true"></span>
	{#if labelled}<span class="word">{status}</span>{/if}
</span>

<style>
	.mark-set {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: var(--chart-axis-letter-spacing);
		white-space: nowrap;
		/* The word stays neutral; only the mark carries the state colour, so a
		   row of statuses reads as one column of text rather than a rainbow. */
		color: var(--text-secondary);
	}

	.mark {
		position: relative;
		flex: none;
		width: var(--space-2);
		height: var(--space-2);
		background: var(--mark-colour);
	}

	/* Every status resolves its colour from the page root, never from a literal. */
	[data-status='pending'] {
		--mark-colour: var(--status-pending);
	}
	[data-status='triaged'] {
		--mark-colour: var(--status-triaged);
	}
	[data-status='building'] {
		--mark-colour: var(--status-building);
	}
	[data-status='verifying'] {
		--mark-colour: var(--status-verifying);
	}
	[data-status='done'] {
		--mark-colour: var(--status-done);
	}
	[data-status='blocked'] {
		--mark-colour: var(--status-blocked);
	}
	[data-status='wontfix'],
	[data-status='duplicate'] {
		--mark-colour: var(--status-pending);
	}

	/* Shape carries the same information as colour: hollow for not-yet-started,
	   part-filled for in flight, solid for settled, struck for abandoned. */
	[data-status='pending'] .mark {
		background: transparent;
		box-shadow: inset 0 0 0 calc(var(--stroke-normal) * 1px) var(--mark-colour);
	}

	[data-status='triaged'] .mark {
		background: radial-gradient(circle at 50% 50%, var(--mark-colour) 0 30%, transparent 30% 100%);
		box-shadow: inset 0 0 0 calc(var(--stroke-normal) * 1px) var(--mark-colour);
	}

	[data-status='building'] .mark {
		background: linear-gradient(to top, var(--mark-colour) 0 50%, transparent 50% 100%);
		box-shadow: inset 0 0 0 calc(var(--stroke-normal) * 1px) var(--mark-colour);
	}

	[data-status='verifying'] .mark {
		background: linear-gradient(135deg, var(--mark-colour) 0 50%, transparent 50% 100%);
		box-shadow: inset 0 0 0 calc(var(--stroke-normal) * 1px) var(--mark-colour);
	}

	[data-status='blocked'] .mark::after {
		content: '';
		position: absolute;
		inset: calc(var(--space-1) * -0.5);
		box-shadow: inset 0 0 0 calc(var(--stroke-normal) * 1px) var(--mark-colour);
		opacity: var(--opacity-tertiary);
	}

	[data-status='wontfix'] .mark,
	[data-status='duplicate'] .mark {
		background: transparent;
		box-shadow: inset 0 0 0 calc(var(--stroke-normal) * 1px) var(--mark-colour);
	}

	[data-status='wontfix'] .mark::after,
	[data-status='duplicate'] .mark::after {
		content: '';
		position: absolute;
		inset-inline: 0;
		top: 50%;
		height: calc(var(--stroke-normal) * 1px);
		background: var(--mark-colour);
	}

	[data-status='duplicate'] .mark::after {
		transform: rotate(-45deg);
	}
</style>
