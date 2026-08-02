<script lang="ts" module>
	import type { ThemeVariant } from '../../contexts/theme.js';

	export interface ToastProps {
		visible: boolean;
		type?: 'warning' | 'error' | 'success' | 'info';
		message: string;
		autoDismiss?: boolean;
		dismissAfter?: number;
		onDismiss?: () => void;
		theme?: ThemeVariant;
	}
</script>

<script lang="ts">
	/**
	 * Toast — fixed-position notification at the bottom of the viewport.
	 *
	 * Usage:
	 *   <Toast visible={showToast} type="error" message="Save failed" onDismiss={() => showToast = false} />
	 *
	 * Features:
	 * - Slides in from bottom with CSS transform transition
	 * - Four type variants: warning, error, success, info
	 * - Adapts to admin and public theme contexts
	 * - Auto-dismisses after configurable delay
	 * - Render guard prevents mount flicker
	 */

	import { onMount } from 'svelte';
	import { getThemeVariant } from '../../contexts/theme.js';

	let {
		visible = false,
		type = 'info',
		message,
		autoDismiss = true,
		dismissAfter = 5000,
		onDismiss,
		theme
	}: ToastProps = $props();

	let isReady = $state(false);

	onMount(() => {
		requestAnimationFrame(() => {
			isReady = true;
		});
	});

	const activeTheme = $derived(theme ?? getThemeVariant());

	$effect(() => {
		if (visible && autoDismiss) {
			const timer = setTimeout(() => {
				onDismiss?.();
			}, dismissAfter);
			return () => clearTimeout(timer);
		}
	});
</script>

{#if isReady}
	<div
		class="toast-container"
		class:visible
		class:theme-admin={activeTheme === 'admin'}
		class:type-warning={type === 'warning'}
		class:type-error={type === 'error'}
		class:type-success={type === 'success'}
		class:type-info={type === 'info'}
	>
		<div class="toast-content">
			<span class="toast-icon">
				{#if type === 'warning'}
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
						<path d="M12 9v4" />
						<path d="M12 17h.01" />
					</svg>
				{:else if type === 'error'}
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="10" />
						<line x1="12" x2="12" y1="8" y2="12" />
						<line x1="12" x2="12.01" y1="16" y2="16" />
					</svg>
				{:else if type === 'success'}
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="m9 12 2 2 4-4" />
					</svg>
				{:else}
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="10" />
						<path d="M12 16v-4" />
						<path d="M12 8h.01" />
					</svg>
				{/if}
			</span>
			<span class="toast-message">{message}</span>
			{#if onDismiss}
				<button
					type="button"
					class="toast-close"
					onclick={() => onDismiss?.()}
					aria-label="Dismiss notification"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M18 6 6 18" />
						<path d="m6 6 12 12" />
					</svg>
				</button>
			{/if}
		</div>
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		bottom: 1.5rem;
		left: 0;
		right: 0;
		margin-left: auto;
		margin-right: auto;
		transform: translateY(150%);
		z-index: var(--z-toast);
		max-width: 600px;
		width: calc(100% - var(--space-4) * 2);
		padding: var(--space-4) var(--space-5);
		/* Square — toasts are non-agentic surfaces per the radius doctrine. */
		border-radius: var(--radius-surface);
		border: 1px solid transparent;
		backdrop-filter: blur(var(--surface-raised-frost));
		box-shadow: var(--shadow-toast);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		pointer-events: none;
	}

	.toast-container.visible {
		transform: translateY(0);
		pointer-events: auto;
	}

	/* Type-specific colours — brand-aligned status variants with left accent border */
	.toast-container.type-warning {
		background: var(--colour-warning-bg);
		border-color: color-mix(in srgb, var(--colour-warning) 40%, transparent);
		border-left: 3px solid var(--colour-warning);
	}
	.toast-container.type-warning .toast-icon {
		color: var(--colour-warning);
	}

	.toast-container.type-error {
		background: var(--colour-error-bg);
		border-color: color-mix(in srgb, var(--colour-error) 40%, transparent);
		border-left: 3px solid var(--colour-error);
	}
	.toast-container.type-error .toast-icon {
		color: var(--colour-error);
	}

	.toast-container.type-success {
		background: var(--colour-success-bg);
		border-color: color-mix(in srgb, var(--colour-success) 40%, transparent);
		border-left: 3px solid var(--colour-success);
	}
	.toast-container.type-success .toast-icon {
		color: var(--colour-success);
	}

	.toast-container.type-info {
		background: var(--colour-info-bg);
		border-color: color-mix(in srgb, var(--colour-info) 40%, transparent);
		border-left: 3px solid var(--colour-info);
	}
	.toast-container.type-info .toast-icon {
		color: var(--colour-info);
	}

	.toast-content {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.toast-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.toast-message {
		color: var(--text-primary);
		font-size: 0.875rem;
		font-weight: 500;
		line-height: 1.5;
		flex: 1;
	}

	/* Admin theme overrides message colour */
	.toast-container.theme-admin .toast-message {
		color: var(--admin-text);
	}

	.toast-close {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		width: 28px;
		height: 28px;
		padding: 0;
		margin-left: auto;
		background: transparent;
		border: none;
		border-radius: var(--radius);
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.toast-close:hover {
		background-color: color-mix(in srgb, currentColor 10%, transparent);
		color: var(--text-primary);
	}

	.toast-container.theme-admin .toast-close {
		color: var(--admin-text-secondary);
	}

	.toast-container.theme-admin .toast-close:hover {
		color: var(--admin-text);
	}

	.toast-close:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	@media (max-width: 640px) {
		.toast-container {
			bottom: var(--space-4);
			width: calc(100% - var(--space-4));
			padding: var(--space-2) var(--space-4);
		}

		.toast-message {
			font-size: 0.8125rem;
		}
	}
</style>
