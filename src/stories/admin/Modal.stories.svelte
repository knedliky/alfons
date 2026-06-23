<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Modal from '../../components/admin/Modal.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Modal',
		component: Modal,
		tags: ['autodocs'],
		argTypes: {
			open: {
				control: { type: 'boolean' }
			},
			title: {
				control: { type: 'text' }
			},
			onclose: {
				action: 'onclose'
			}
		}
	});
</script>

<Story name="With Title" asChild args={{ open: true, title: 'Confirm Action', onclose: () => {} }}>
	<Modal open={true} title="Confirm Action" onclose={() => {}}>
		<p style="margin: 0 0 1rem;">
			Are you sure you want to delete this organisation? This action cannot be undone.
		</p>
		<div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
			<button
				type="button"
				style="padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid var(--admin-border); background: transparent; color: var(--admin-text); cursor: pointer;"
			>
				Cancel
			</button>
			<button
				type="button"
				style="padding: 0.5rem 1rem; border-radius: 6px; border: none; background: var(--accent); color: white; cursor: pointer;"
			>
				Delete
			</button>
		</div>
	</Modal>
</Story>

<Story name="Without Title" asChild args={{ open: true, onclose: () => {} }}>
	<Modal open={true} onclose={() => {}}>
		<h3 style="margin: 0 0 0.75rem; font-size: 1.125rem; color: var(--admin-text);">
			Session Expired
		</h3>
		<p style="margin: 0 0 1.25rem; color: var(--admin-text-secondary);">
			Your session has expired. Please log in again to continue.
		</p>
		<div style="display: flex; justify-content: flex-end;">
			<button
				type="button"
				style="padding: 0.5rem 1.25rem; border-radius: 6px; border: none; background: var(--accent); color: white; cursor: pointer;"
			>
				Log In
			</button>
		</div>
	</Modal>
</Story>
