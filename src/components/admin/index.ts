/**
 * Admin-specific Atomic UI Components
 *
 * Status badges and confirmation modals used exclusively in admin contexts.
 * They read the general text, border and surface roles; what makes a page
 * admin is the admin overlay theme (tokens/themes/admin.css, D-238).
 */

export { default as StatusBadge } from './StatusBadge.svelte';
export type { StatusBadgeProps, StatusConfig } from './StatusBadge.svelte';

export { default as BulkActionModal } from './BulkActionModal.svelte';
export type { BulkActionModalProps } from './BulkActionModal.svelte';

export { default as DeleteConfirmModal } from './DeleteConfirmModal.svelte';
export type { DeleteConfirmModalProps } from './DeleteConfirmModal.svelte';
