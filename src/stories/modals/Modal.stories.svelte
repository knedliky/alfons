<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Modal from '../../components/modals/Modal.svelte';

	const { Story } = defineMeta({
		title: 'Modals/Modal',
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

<Story name="With Title" asChild args={{ open: true, title: 'Invite Team Member', onclose: () => {} }}>
	<Modal open={true} title="Invite Team Member" onclose={() => {}}>
		<p style="margin: 0 0 1rem; color: var(--text-secondary);">
			Send an invitation to a new team member. They will receive an email with instructions to
			complete their registration.
		</p>
		<input
			type="email"
			placeholder="colleague@example.com.au"
			style="display: block; width: 100%; box-sizing: border-box; padding: 0.5rem 0.75rem; border-radius: 0; border: 1px solid var(--card-border); background: transparent; color: var(--text-primary); margin-bottom: 1rem;"
		/>
		<div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
			<button
				type="button"
				style="padding: 0.5rem 1rem; border-radius: 0; border: 1px solid var(--card-border); background: transparent; color: var(--text-primary); cursor: pointer;"
			>
				Cancel
			</button>
			<button
				type="button"
				style="padding: 0.5rem 1.25rem; border-radius: 0; border: none; background: var(--accent); color: white; cursor: pointer;"
			>
				Send Invitation
			</button>
		</div>
	</Modal>
</Story>

<Story name="Without Title" asChild args={{ open: true, onclose: () => {} }}>
	<Modal open={true} onclose={() => {}}>
		<h3 style="margin: 0 0 0.75rem; font-size: 1.125rem; color: var(--text-primary);">
			Update Published
		</h3>
		<p style="margin: 0 0 1.25rem; color: var(--text-secondary);">
			Your skills analysis report has been published and is now visible to subscribers.
		</p>
		<div style="display: flex; justify-content: flex-end;">
			<button
				type="button"
				style="padding: 0.5rem 1.25rem; border-radius: 0; border: none; background: var(--accent); color: white; cursor: pointer;"
			>
				Done
			</button>
		</div>
	</Modal>
</Story>

<Story name="Destructive Action" asChild args={{ open: true, title: 'Remove Organisation', onclose: () => {} }}>
	<Modal open={true} title="Remove Organisation" onclose={() => {}}>
		<p style="margin: 0 0 1rem; color: var(--text-secondary);">
			You are about to permanently remove <strong>Acme Pty Ltd</strong> from the platform. All
			associated data will be deleted and cannot be recovered.
		</p>
		<div style="display: flex; gap: 0.75rem; justify-content: flex-end;">
			<button
				type="button"
				style="padding: 0.5rem 1rem; border-radius: 0; border: 1px solid var(--card-border); background: transparent; color: var(--text-primary); cursor: pointer;"
			>
				Cancel
			</button>
			<button
				type="button"
				style="padding: 0.5rem 1rem; border-radius: 0; border: none; background: oklch(52% 0.22 25); color: white; cursor: pointer;"
			>
				Remove Organisation
			</button>
		</div>
	</Modal>
</Story>
