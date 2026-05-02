<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface ModalProps {
		open: boolean;
		onclose: () => void;
		title?: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * Modal — accessible dialog overlay with backdrop and keyboard support.
	 *
	 * Usage:
	 *   <Modal open={isOpen} onclose={() => isOpen = false} title="Confirm">
	 *     <p>Are you sure?</p>
	 *   </Modal>
	 *
	 * Features:
	 * - Backdrop click and Escape key to dismiss
	 * - Focus-trapping via aria-modal
	 * - Optional title with header bar
	 * - Glassmorphism backdrop with scale-in animation
	 */
	let { open, onclose, title, children }: ModalProps = $props();

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onclose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onclose();
		}
	}
</script>

<svelte:window onkeydown={open ? handleKeydown : undefined} />

{#if open}
	<div
		class="modal-backdrop"
		onclick={handleBackdropClick}
		onkeydown={(e) => e.key === 'Enter' && onclose()}
		role="button"
		tabindex="-1"
		aria-label="Close modal"
	>
		<div
			class="modal-content"
			role="dialog"
			aria-modal="true"
			aria-labelledby={title ? 'modal-title' : undefined}
		>
			{#if title}
				<div class="modal-header">
					<h2 id="modal-title" class="modal-title">{title}</h2>
					<button type="button" class="modal-close" onclick={onclose} aria-label="Close modal">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18"></line>
							<line x1="6" y1="6" x2="18" y2="18"></line>
						</svg>
					</button>
				</div>
			{:else}
				<button
					type="button"
					class="modal-close modal-close-standalone"
					onclick={onclose}
					aria-label="Close modal"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
					>
						<line x1="18" y1="6" x2="6" y2="18"></line>
						<line x1="6" y1="6" x2="18" y2="18"></line>
					</svg>
				</button>
			{/if}

			<div class="modal-body">
				{@render children()}
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--z-overlay);
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(0, 0, 0, 0.6); /* overlay — no token equivalent */
		backdrop-filter: blur(4px);
		-webkit-backdrop-filter: blur(4px);
		animation: fadeIn var(--transition-fast);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		position: relative;
		width: 100%;
		max-width: 480px;
		max-height: calc(100vh - var(--space-6));
		margin: var(--space-4);
		background: var(--admin-bg);
		border: 1px solid var(--admin-border);
		border-radius: var(--card-radius);
		box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); /* deep overlay shadow */
		overflow: hidden;
		animation: scaleIn var(--transition-fast);
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.modal-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) var(--space-5);
		border-bottom: 1px solid var(--admin-border);
	}

	.modal-title {
		margin: 0;
		font-size: 1.125rem;
		font-weight: 600;
		color: var(--admin-text);
	}

	.modal-close {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2);
		background: transparent;
		border: none;
		border-radius: var(--radius);
		color: var(--admin-text-secondary);
		cursor: pointer;
		transition: all var(--transition-normal);
	}

	.modal-close:hover {
		background: var(--admin-bg-elevated);
		color: var(--admin-text);
	}

	.modal-close-standalone {
		position: absolute;
		top: var(--space-4);
		right: var(--space-4);
	}

	.modal-body {
		padding: var(--space-5);
		overflow-y: auto;
		max-height: calc(100vh - 10rem);
	}
</style>
