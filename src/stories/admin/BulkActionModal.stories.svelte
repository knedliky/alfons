<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BulkActionModal from '../../components/admin/BulkActionModal.svelte';

	const { Story } = defineMeta({
		title: 'Admin/Atoms/BulkActionModal',
		component: BulkActionModal,
		tags: ['autodocs'],
		argTypes: {
			visible: { control: { type: 'boolean' } },
			itemCount: { control: { type: 'number' } },
			itemType: {
				control: { type: 'select' },
				options: ['message', 'subscriber', 'post']
			},
			action: { control: { type: 'text' } },
			description: { control: { type: 'text' } },
			confirmLabel: { control: { type: 'text' } },
			confirmVariant: {
				control: { type: 'select' },
				options: ['danger', 'primary']
			}
		},
		parameters: {
			layout: 'fullscreen'
		}
	});

	// Placeholder callbacks — no motivka action handlers or PocketBase mutations
	const noOp = () => console.log('Action triggered');
</script>

<!-- Default delete action with multiple posts selected -->
<Story
	name="Default (Delete Posts)"
	asChild
	args={{ visible: true, itemCount: 3, itemType: 'post', action: 'delete' }}
>
	<BulkActionModal
		visible={true}
		itemCount={3}
		itemType="post"
		action="delete"
		onConfirm={noOp}
		onCancel={noOp}
	/>
</Story>

<!-- Single item selected — verifies singular label -->
<Story
	name="Single Item"
	asChild
	args={{ visible: true, itemCount: 1, itemType: 'message', action: 'delete' }}
>
	<BulkActionModal
		visible={true}
		itemCount={1}
		itemType="message"
		action="delete"
		onConfirm={noOp}
		onCancel={noOp}
	/>
</Story>

<!-- Archive action with primary variant button -->
<Story
	name="Archive Action"
	asChild
	args={{
		visible: true,
		itemCount: 5,
		itemType: 'subscriber',
		action: 'archive',
		confirmVariant: 'primary'
	}}
>
	<BulkActionModal
		visible={true}
		itemCount={5}
		itemType="subscriber"
		action="archive"
		confirmVariant="primary"
		onConfirm={noOp}
		onCancel={noOp}
	/>
</Story>

<!-- Custom description and confirm label -->
<Story
	name="Custom Description"
	asChild
	args={{ visible: true, itemCount: 12, itemType: 'post', action: 'publish' }}
>
	<BulkActionModal
		visible={true}
		itemCount={12}
		itemType="post"
		action="publish"
		description="Publishing these posts will make them visible to all visitors immediately."
		confirmLabel="Publish All"
		confirmVariant="primary"
		onConfirm={noOp}
		onCancel={noOp}
	/>
</Story>

<!-- Many items selected — verifies large counts display correctly -->
<Story
	name="Many Items Selected"
	asChild
	args={{ visible: true, itemCount: 247, itemType: 'message', action: 'delete' }}
>
	<BulkActionModal
		visible={true}
		itemCount={247}
		itemType="message"
		action="delete"
		onConfirm={noOp}
		onCancel={noOp}
	/>
</Story>

<!-- Closed state — modal not visible -->
<Story
	name="Closed"
	asChild
	args={{ visible: false, itemCount: 3, itemType: 'post', action: 'delete' }}
>
	<BulkActionModal
		visible={false}
		itemCount={3}
		itemType="post"
		action="delete"
		onConfirm={noOp}
		onCancel={noOp}
	/>
</Story>
