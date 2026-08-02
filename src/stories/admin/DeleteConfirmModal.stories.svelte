<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Atoms/DeleteConfirmModal',
		component: DeleteConfirmModal,
		tags: ['autodocs'],
		argTypes: {
			visible: { control: { type: 'boolean' } },
			itemLabel: { control: { type: 'text' } }
		},
		parameters: {
			layout: 'fullscreen'
		}
	});

	// Placeholder callbacks — no motivka action handlers or PocketBase mutations
	const noOp = () => console.log('Action triggered');
</script>

<!-- Default state with the default "this item" label -->
<Story name="Default" asChild args={{ visible: true }}>
	<DeleteConfirmModal visible={true} onConfirm={noOp} onCancel={noOp} />
</Story>

<!-- With a specific item name shown in the confirmation message -->
<Story
	name="With Item Name"
	asChild
	args={{ visible: true, itemLabel: 'How to Build a SvelteKit App' }}
>
	<DeleteConfirmModal
		visible={true}
		itemLabel="How to Build a SvelteKit App"
		onConfirm={noOp}
		onCancel={noOp}
	/>
</Story>

<!-- Short item label for compact display -->
<Story name="Short Label" asChild args={{ visible: true, itemLabel: 'Draft Post' }}>
	<DeleteConfirmModal visible={true} itemLabel="Draft Post" onConfirm={noOp} onCancel={noOp} />
</Story>

<!-- Closed state — modal not visible -->
<Story name="Closed" asChild args={{ visible: false, itemLabel: 'this item' }}>
	<DeleteConfirmModal visible={false} itemLabel="this item" onConfirm={noOp} onCancel={noOp} />
</Story>
