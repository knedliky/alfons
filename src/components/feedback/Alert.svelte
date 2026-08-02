<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface AlertProps {
		type?: 'info' | 'success' | 'warning' | 'error';
		title?: string;
		/** Body content */
		children?: Snippet;
		/** Show the type icon */
		icon?: boolean;
		/** Shows a close button */
		onDismiss?: () => void;
		/** Inline action snippet (button/link) below the message */
		action?: Snippet;
		theme?: 'public' | 'admin';
		/** Additional CSS classes */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Alert — inline, in-flow status message (distinct from the transient
	 * Toast). Four types carry a tinted glass fill and a matching icon (the
	 * calm, uniform-bordered treatment of the tooltip / skill pill). Pass a
	 * title and/or body children; set onDismiss for a close button and an
	 * optional action snippet for an inline button/link.
	 *
	 * Usage:
	 *   <Alert type="success" title="Saved">Your changes are live.</Alert>
	 *   <Alert type="error" onDismiss={close}>Something went wrong.</Alert>
	 */
	import Icon from '../atoms/Icon.svelte';
	import type { IconName } from '../atoms/Icon.svelte';

	const ALERT_ICON: Record<string, IconName> = {
		info: 'info',
		success: 'check',
		warning: 'warning',
		error: 'error'
	};

	let {
		type = 'info',
		title,
		children,
		icon = true,
		onDismiss,
		action,
		theme = 'public',
		class: className = ''
	}: AlertProps = $props();
</script>

<div
	class="motif-alert type-{type} {className}"
	class:is-admin={theme === 'admin'}
	role={type === 'error' ? 'alert' : 'status'}
>
	{#if icon}
		<span class="motif-alert-icon" aria-hidden="true">
			<Icon name={ALERT_ICON[type]} size="sm" />
		</span>
	{/if}
	<div class="motif-alert-body">
		{#if title}<p class="motif-alert-title">{title}</p>{/if}
		{#if children}<div class="motif-alert-message">{@render children()}</div>{/if}
		{#if action}<div class="motif-alert-action">{@render action()}</div>{/if}
	</div>
	{#if onDismiss}
		<button
			type="button"
			class="motif-alert-close"
			onclick={() => onDismiss()}
			aria-label="Dismiss"
		>
			<Icon name="close" size="sm" />
		</button>
	{/if}
</div>

<style>
	.motif-alert {
		--alert-tint: var(--accent-tertiary);
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		padding: var(--space-4);
		border-radius: var(--radius-surface);
		background-color: color-mix(in srgb, var(--alert-tint) 14%, var(--bg-glass-solid));
		background-image: linear-gradient(
			115deg,
			color-mix(in srgb, var(--alert-tint) 5%, transparent) 0%,
			color-mix(in srgb, var(--alert-tint) 24%, transparent) 50%,
			color-mix(in srgb, var(--alert-tint) 5%, transparent) 100%
		);
		background-size: 220% 220%;
		border: 1px solid color-mix(in srgb, var(--alert-tint) 32%, transparent);
		backdrop-filter: blur(var(--surface-raised-frost));
		-webkit-backdrop-filter: blur(var(--surface-raised-frost));
		animation: motif-alert-shimmer 7s ease-in-out infinite alternate;
	}

	@keyframes motif-alert-shimmer {
		0% {
			background-position: 0% 0%;
			border-color: color-mix(in srgb, var(--alert-tint) 28%, transparent);
		}
		100% {
			background-position: 100% 100%;
			border-color: color-mix(in srgb, var(--alert-tint) 46%, transparent);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-alert {
			animation: none;
		}
	}

	.motif-alert.type-info {
		--alert-tint: var(--accent-tertiary);
	}

	.motif-alert.type-success {
		--alert-tint: var(--colour-success);
	}

	.motif-alert.type-warning {
		--alert-tint: var(--colour-warning);
	}

	.motif-alert.type-error {
		--alert-tint: var(--colour-error);
	}

	.motif-alert-icon {
		display: flex;
		align-items: center;
		flex-shrink: 0;
		height: 1.35rem;
		color: var(--alert-tint);
	}

	.motif-alert-body {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.motif-alert-title {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 600;
		line-height: 1.45;
		color: var(--text-primary);
	}

	.motif-alert-message {
		font-family: var(--font-body);
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--text-secondary);
	}

	.motif-alert-action {
		margin-top: var(--space-2);
	}

	.motif-alert-close {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 26px;
		height: 26px;
		margin: -2px -2px 0 0;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: var(--radius);
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.motif-alert-close:hover {
		background: var(--surface-hover-subtle);
		color: var(--text-primary);
	}

	.motif-alert.is-admin {
		background: color-mix(in srgb, var(--alert-tint) 10%, var(--admin-bg-elevated));
	}

	.motif-alert.is-admin .motif-alert-title {
		color: var(--admin-text);
	}

	.motif-alert.is-admin .motif-alert-message {
		color: var(--admin-text-secondary);
	}
</style>
