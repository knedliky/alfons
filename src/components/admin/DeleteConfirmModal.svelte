<script lang="ts" module>
	export interface DeleteConfirmModalProps {
		visible: boolean;
		itemLabel?: string;
		onConfirm: () => void;
		onCancel: () => void;
	}
</script>

<script lang="ts">
	/**
	 * DeleteConfirmModal — confirmation dialog for deleting a single item.
	 *
	 * Usage:
	 *   <DeleteConfirmModal
	 *     visible={isOpen}
	 *     itemLabel="this post"
	 *     onConfirm={handleDelete}
	 *     onCancel={() => isOpen = false}
	 *   />
	 *
	 * Features:
	 * - Composes on Modal for backdrop, keyboard, and ARIA handling
	 * - Warning icon styled with error state tokens
	 * - Emphasises the item label within the message
	 * - Sidebar-offset centring on desktop via CSS
	 */
	import Modal from '../modals/Modal.svelte';

	let { visible, itemLabel = 'this item', onConfirm, onCancel }: DeleteConfirmModalProps = $props();
</script>

<div class="delete-modal-wrapper">
	<Modal open={visible} onclose={onCancel} title="Confirm Deletion">
		<div class="delete-modal-content">
			<div class="icon-container">
				<svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
					/>
				</svg>
			</div>

			<p class="delete-message">
				Are you sure you want to delete <span class="item-label">{itemLabel}</span>? This action
				cannot be undone.
			</p>

			<div class="delete-actions">
				<button type="button" class="cancel-btn" onclick={onCancel}>Cancel</button>
				<button type="button" class="delete-btn" onclick={onConfirm}>Delete</button>
			</div>
		</div>
	</Modal>
</div>

<style>
	/* Desktop: offset by sidebar width to centre in the content area */
	@media (min-width: 768px) {
		.delete-modal-wrapper :global(.modal-backdrop) {
			padding-left: var(--layout-sidebar-width, 280px);
		}
	}

	.delete-modal-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}

	.icon-container {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background-color: var(--colour-error-bg);
		color: var(--colour-error);
	}

	.warning-icon {
		width: 1.5rem;
		height: 1.5rem;
		color: inherit;
	}

	.delete-message {
		margin: 0;
		font-size: 0.875rem;
		text-align: center;
		color: var(--admin-text-secondary);
	}

	.item-label {
		font-weight: 500;
		color: var(--admin-text);
	}

	.delete-actions {
		display: flex;
		gap: var(--space-2);
		width: 100%;
		margin-top: var(--space-2);
	}

	.cancel-btn {
		flex: 1;
		padding: var(--space-2) var(--space-4);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--admin-text-secondary);
		background: transparent;
		border: 1px solid var(--admin-border);
		border-radius: var(--radius);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.cancel-btn:hover {
		background: var(--admin-bg);
		color: var(--admin-text);
	}

	.delete-btn {
		flex: 1;
		padding: var(--space-2) var(--space-4);
		font-size: 0.875rem;
		font-weight: 500;
		color: white; /* text on filled accent button — no inverse token */
		background: var(--colour-error);
		border: none;
		border-radius: var(--radius);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.delete-btn:hover {
		filter: brightness(0.88);
	}
</style>
