<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface TooltipProps {
		text: string;
		position?: 'top' | 'bottom' | 'left' | 'right';
		variant?: 'default' | 'admin';
		children: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * Tooltip — hover-triggered label with configurable placement.
	 *
	 * Usage:
	 *   <Tooltip text="Save changes">
	 *     <Button>Save</Button>
	 *   </Tooltip>
	 *
	 * Features:
	 * - Four placement options: top (default), bottom, left, right
	 * - Default variant uses glass tokens (adapts light/dark)
	 * - Admin variant uses admin tokens (dark theme only)
	 * - Scale + opacity transition on show/hide
	 */

	let { text, position = 'top', variant = 'default', children }: TooltipProps = $props();
</script>

<div class="tooltip-wrapper" data-position={position} data-variant={variant}>
	{@render children()}
	<div class="tooltip-content" role="tooltip">
		{text}
	</div>
</div>

<style>
	.tooltip-wrapper {
		position: relative;
		display: inline-flex;
	}

	.tooltip-content {
		position: absolute;
		z-index: var(--z-toast);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius);
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
		pointer-events: none;
		opacity: 0;
		transform: scale(0.95);
		transition:
			opacity var(--transition-fast),
			transform var(--transition-fast);
	}

	/* Glass tokens adapt to light/dark mode automatically */
	.tooltip-wrapper[data-variant='default'] .tooltip-content {
		background: var(--bg-glass-solid);
		border: 1px solid var(--border-glass);
		color: var(--text-primary);
		box-shadow: var(--tooltip-shadow);
	}

	/* Admin variant — dark theme only */
	.tooltip-wrapper[data-variant='admin'] .tooltip-content {
		background: var(--admin-bg-elevated);
		border: 1px solid var(--admin-border);
		color: var(--admin-text);
		box-shadow: var(--tooltip-shadow);
	}

	.tooltip-wrapper:hover .tooltip-content {
		opacity: 1;
		transform: scale(1);
	}

	.tooltip-wrapper[data-position='top'] .tooltip-content {
		bottom: calc(100% + var(--space-2));
		left: 50%;
		transform: translateX(-50%) scale(0.95);
	}

	.tooltip-wrapper[data-position='top']:hover .tooltip-content {
		transform: translateX(-50%) scale(1);
	}

	.tooltip-wrapper[data-position='bottom'] .tooltip-content {
		top: calc(100% + var(--space-2));
		left: 50%;
		transform: translateX(-50%) scale(0.95);
	}

	.tooltip-wrapper[data-position='bottom']:hover .tooltip-content {
		transform: translateX(-50%) scale(1);
	}

	.tooltip-wrapper[data-position='left'] .tooltip-content {
		right: calc(100% + var(--space-2));
		top: 50%;
		transform: translateY(-50%) scale(0.95);
	}

	.tooltip-wrapper[data-position='left']:hover .tooltip-content {
		transform: translateY(-50%) scale(1);
	}

	.tooltip-wrapper[data-position='right'] .tooltip-content {
		left: calc(100% + var(--space-2));
		top: 50%;
		transform: translateY(-50%) scale(0.95);
	}

	.tooltip-wrapper[data-position='right']:hover .tooltip-content {
		transform: translateY(-50%) scale(1);
	}
</style>
