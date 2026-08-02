<script lang="ts" module>
	export interface ErrorPageAction {
		label: string;
		onclick: () => void;
	}

	export interface ErrorPageProps {
		/** HTTP status code to display prominently */
		status: number;
		/** Human-readable error message */
		message: string;
		/** Primary call-to-action (e.g. "Go Back") */
		primaryAction?: ErrorPageAction;
		/** Secondary call-to-action (e.g. "Go Home") */
		secondaryAction?: ErrorPageAction;
	}
</script>

<script lang="ts">
	/**
	 * ErrorPage — generic error display shell for SvelteKit error pages.
	 *
	 * Usage:
	 *   <ErrorPage
	 *     status={404}
	 *     message="Page Not Found"
	 *     primaryAction={{ label: 'Go Back', onclick: () => history.back() }}
	 *     secondaryAction={{ label: 'Go Home', onclick: () => goto('/') }}
	 *   />
	 *
	 * Features:
	 * - Displays status code as the prominent heading
	 * - Derives a title from the status code (404, 500, or generic)
	 * - Optional primary and secondary action buttons
	 * - No external dependencies — consumer provides all navigation callbacks
	 * - Responsive, centred layout with design token styling
	 */

	import Button from '../atoms/Button.svelte';

	let { status, message, primaryAction, secondaryAction }: ErrorPageProps = $props();

	const title = $derived(
		status === 404 ? 'Page Not Found' : status === 500 ? 'Server Error' : 'Something Went Wrong'
	);
</script>

<div class="error-page">
	<div class="error-content">
		<p class="error-title">{title}</p>
		<h1 class="error-status">{status}</h1>
		<p class="error-message">{message}</p>

		{#if primaryAction || secondaryAction}
			<div class="error-actions">
				{#if primaryAction}
					<Button variant="default" onclick={primaryAction.onclick}>
						{primaryAction.label}
					</Button>
				{/if}
				{#if secondaryAction}
					<Button variant="secondary" onclick={secondaryAction.onclick}>
						{secondaryAction.label}
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.error-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 60vh;
		padding: var(--space-8);
	}

	.error-content {
		text-align: center;
		max-width: 480px;
	}

	.error-title {
		color: var(--text-secondary);
		font-size: 1rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin: 0 0 var(--space-2) 0;
	}

	.error-status {
		color: var(--text-primary);
		font-size: 6rem;
		font-weight: 700;
		line-height: 1;
		margin: 0 0 var(--space-4) 0;
	}

	.error-message {
		color: var(--text-secondary);
		font-size: 1.125rem;
		line-height: 1.6;
		margin: 0 0 var(--space-8) 0;
	}

	.error-actions {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	@media (max-width: 640px) {
		.error-status {
			font-size: 4rem;
		}

		.error-message {
			font-size: 1rem;
		}

		.error-actions {
			flex-direction: column;
		}
	}
</style>
