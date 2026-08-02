<script lang="ts" module>
	export interface BulkActionModalProps {
		visible: boolean;
		itemCount: number;
		itemType: 'message' | 'subscriber' | 'post';
		action?: 'delete' | 'archive' | string;
		description?: string;
		confirmLabel?: string;
		confirmVariant?: 'danger' | 'primary';
		onConfirm: () => void;
		onCancel: () => void;
	}
</script>

<script lang="ts">
	/**
	 * BulkActionModal — confirmation dialog for bulk operations on multiple items.
	 *
	 * Usage:
	 *   <BulkActionModal
	 *     visible={isOpen}
	 *     itemCount={selectedIds.length}
	 *     itemType="post"
	 *     action="delete"
	 *     onConfirm={handleBulkDelete}
	 *     onCancel={() => isOpen = false}
	 *   />
	 *
	 * Features:
	 * - Composes on Modal for backdrop, keyboard, and ARIA handling
	 * - Danger and primary confirm button variants
	 * - Auto-generates title and description from action + itemType
	 * - Sidebar-offset centring on desktop via CSS
	 */
	import Modal from '../modals/Modal.svelte';

	let {
		visible,
		itemCount,
		itemType,
		action = 'delete',
		description,
		confirmLabel,
		confirmVariant = 'danger',
		onConfirm,
		onCancel
	}: BulkActionModalProps = $props();

	const itemPlural = $derived(itemCount === 1 ? itemType : `${itemType}s`);
	const actionTitle = $derived(action.charAt(0).toUpperCase() + action.slice(1));
	const buttonLabel = $derived(confirmLabel || actionTitle);

	const defaultDescription = $derived(
		action === 'delete'
			? itemType === 'message'
				? 'This will mark the selected messages as deleted. They can be restored later.'
				: 'This action cannot be undone.'
			: action === 'archive'
				? 'Archived items can be restored later.'
				: ''
	);

	const displayDescription = $derived(description || defaultDescription);
</script>

<div class="bulk-modal-wrapper">
	<Modal open={visible} onclose={onCancel} title="{actionTitle} {itemCount} {itemPlural}?">
		<div class="bulk-modal-content">
			<div class="icon-container" data-variant={confirmVariant}>
				{#if action === 'delete'}
					<svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
						/>
					</svg>
				{:else}
					<svg class="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
						/>
					</svg>
				{/if}
			</div>

			{#if displayDescription}
				<p class="bulk-description">{displayDescription}</p>
			{/if}

			<div class="bulk-actions">
				<button type="button" class="cancel-btn" onclick={onCancel}>Cancel</button>
				<button type="button" class="confirm-btn" data-variant={confirmVariant} onclick={onConfirm}>
					{buttonLabel}
				</button>
			</div>
		</div>
	</Modal>
</div>

<style>
	.bulk-modal-wrapper {
		/* Mobile: no offset */
		--modal-padding-left: 0;
	}

	/* Desktop: offset by sidebar width to centre in the content area */
	@media (min-width: 768px) {
		.bulk-modal-wrapper :global(.modal-backdrop) {
			padding-left: var(--layout-sidebar-width, 280px);
		}
	}

	.bulk-modal-content {
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
	}

	.icon-container[data-variant='danger'] {
		background-color: var(--colour-error-bg);
		color: var(--colour-error);
	}

	.icon-container[data-variant='primary'] {
		background-color: var(--colour-info-bg);
		color: var(--colour-info);
	}

	.action-icon {
		width: 1.5rem;
		height: 1.5rem;
		color: inherit;
	}

	.bulk-description {
		margin: 0;
		font-size: 0.875rem;
		text-align: center;
		color: var(--admin-text-secondary);
	}

	.bulk-actions {
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

	.confirm-btn {
		flex: 1;
		padding: var(--space-2) var(--space-4);
		font-size: 0.875rem;
		font-weight: 500;
		color: white; /* text on filled accent button — no inverse token */
		border: none;
		border-radius: var(--radius);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.confirm-btn[data-variant='danger'] {
		background: var(--colour-error);
	}

	.confirm-btn[data-variant='danger']:hover {
		filter: brightness(0.88);
	}

	.confirm-btn[data-variant='primary'] {
		background: var(--colour-info);
	}

	.confirm-btn[data-variant='primary']:hover {
		filter: brightness(0.88);
	}
</style>
