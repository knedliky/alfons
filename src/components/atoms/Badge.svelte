<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface BadgeProps {
		/** Visual variant controlling background and text colour */
		variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
		/** Size of the badge — sm for compact contexts, default for standard */
		size?: 'sm' | 'default';
		/** Theme context — admin uses admin tokens, public uses brand tokens */
		theme?: 'admin' | 'public';
		/** Additional CSS classes */
		class?: string;
		/** Badge content */
		children?: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * Badge — theme-aware pill indicator for status labels, counts, and tags.
	 *
	 * Usage:
	 *   <Badge variant="success">Published</Badge>
	 *   <Badge variant="warning" size="sm" theme="admin">In Review</Badge>
	 *
	 * Features:
	 * - Five semantic variants mapped to status colour tokens
	 * - Two sizes: sm (compact tables) and default (standard contexts)
	 * - Pill border-radius for all variants
	 * - Supports admin and public themes via data-theme attribute
	 * - Uses Snippet children for flexible content
	 */

	let {
		variant = 'default',
		size = 'default',
		theme = 'public',
		class: className = '',
		children
	}: BadgeProps = $props();
</script>

<span class="badge {className}" data-variant={variant} data-size={size} data-theme={theme}>
	{#if children}
		{@render children()}
	{/if}
</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		border-radius: var(--radius-pill);
		font-weight: 500;
		white-space: nowrap;
	}

	/* --- Size variants --- */

	.badge[data-size='sm'] {
		font-size: 0.75rem;
		padding: var(--space-1) var(--space-2);
	}

	.badge[data-size='default'] {
		font-size: 0.875rem;
		padding: var(--space-1) calc(var(--space-2) + 2px);
	}

	/* --- Colour variants (public theme) --- */

	.badge[data-variant='default'] {
		background-color: var(--accent-bg);
		color: var(--accent);
	}

	.badge[data-variant='success'] {
		background-color: var(--colour-success-bg);
		color: var(--colour-success);
	}

	.badge[data-variant='warning'] {
		background-color: var(--colour-warning-bg);
		color: var(--colour-warning);
	}

	.badge[data-variant='error'] {
		background-color: var(--colour-error-bg);
		color: var(--colour-error);
	}

	.badge[data-variant='info'] {
		background-color: var(--colour-info-bg);
		color: var(--colour-info);
	}

	/* --- Admin theme overrides — use status text tokens for readability --- */

	.badge[data-theme='admin'][data-variant='success'] {
		color: var(--status-success-text);
	}

	.badge[data-theme='admin'][data-variant='warning'] {
		color: var(--status-warning-text);
	}

	.badge[data-theme='admin'][data-variant='error'] {
		color: var(--status-error-text);
	}

	.badge[data-theme='admin'][data-variant='info'] {
		color: var(--status-info-text);
	}

	.badge[data-theme='admin'][data-variant='default'] {
		background-color: var(--admin-bg-elevated);
		color: var(--admin-text-muted);
	}
</style>
