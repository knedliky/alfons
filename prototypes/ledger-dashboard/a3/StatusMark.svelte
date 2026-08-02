<script lang="ts">
	/**
	 * A status indicator for a public surface.
	 *
	 * Alfons has StatusBadge, but it is admin-scoped, and Badge offers five
	 * semantic variants against the ledger's eight statuses — neither can carry
	 * this encoding. Colour comes from the --status-* custom properties set once
	 * at the page root, and every mark carries a distinct shape and a label, so
	 * the state survives being read without colour.
	 */
	import type { TaskStatus } from './corpus.ts';

	interface Props {
		status: TaskStatus;
		/** Suppress the word for dense rows where the column header already says it. */
		showLabel?: boolean;
		size?: 'sm' | 'default';
	}

	const { status, showLabel = true, size = 'default' }: Props = $props();

	// Shape is the redundant channel: each status is distinguishable in greyscale.
	const shapes: Record<TaskStatus, string> = {
		pending: 'ring',
		triaged: 'ring-dot',
		building: 'square',
		verifying: 'diamond',
		done: 'disc',
		blocked: 'bar',
		wontfix: 'dash',
		duplicate: 'stack'
	};

	const shape = $derived(shapes[status]);
</script>

<span class="mark" data-size={size} style="--mark-colour: var(--status-{status});">
	<span class="glyph" data-shape={shape} aria-hidden="true"></span>
	{#if showLabel}<span class="label">{status}</span>{:else}<span class="sr-only">{status}</span>{/if}
</span>

<style>
	.mark {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.mark[data-size='sm'] {
		gap: var(--space-1);
	}

	.label {
		text-transform: uppercase;
	}

	.glyph {
		flex: none;
		width: 9px;
		height: 9px;
		background: var(--mark-colour);
	}

	/* Hollow: work not yet begun reads as an outline, filled reads as underway. */
	.glyph[data-shape='ring'] {
		background: transparent;
		border: 1.5px solid var(--mark-colour);
		border-radius: 50%;
	}

	.glyph[data-shape='ring-dot'] {
		background: transparent;
		border: 1.5px solid var(--mark-colour);
		border-radius: 50%;
		box-shadow: inset 0 0 0 1.5px var(--mark-colour);
	}

	.glyph[data-shape='square'] {
		border-radius: 1px;
	}

	.glyph[data-shape='diamond'] {
		rotate: 45deg;
		scale: 0.86;
	}

	.glyph[data-shape='disc'] {
		border-radius: 50%;
	}

	.glyph[data-shape='bar'] {
		height: 3px;
		align-self: center;
	}

	.glyph[data-shape='dash'] {
		height: 1.5px;
		background: var(--mark-colour);
		align-self: center;
		opacity: var(--opacity-tertiary);
	}

	.glyph[data-shape='stack'] {
		background: transparent;
		border: 1.5px solid var(--mark-colour);
		box-shadow: 2px -2px 0 -0.5px var(--mark-colour);
		opacity: var(--opacity-tertiary);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
