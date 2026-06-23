<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Toast from '../../components/feedback/Toast.svelte';

	const { Story } = defineMeta({
		title: 'Feedback/Toast',
		component: Toast,
		tags: ['autodocs'],
		argTypes: {
			visible: { control: { type: 'boolean' } },
			type: {
				control: { type: 'select' },
				options: ['info', 'success', 'warning', 'error']
			},
			message: { control: { type: 'text' } },
			autoDismiss: { control: { type: 'boolean' } },
			dismissAfter: { control: { type: 'number' } },
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			}
		}
	});
</script>

<Story
	name="Info"
	asChild
	args={{
		visible: true,
		type: 'info',
		message: 'Your changes have been saved.',
		autoDismiss: false,
		theme: 'public'
	}}
>
	<Toast
		visible={true}
		type="info"
		message="Your changes have been saved."
		autoDismiss={false}
		theme="public"
		onDismiss={() => {}}
	/>
</Story>

<Story
	name="Success"
	asChild
	args={{
		visible: true,
		type: 'success',
		message: 'Post published successfully.',
		autoDismiss: false,
		theme: 'public'
	}}
>
	<Toast
		visible={true}
		type="success"
		message="Post published successfully."
		autoDismiss={false}
		theme="public"
		onDismiss={() => {}}
	/>
</Story>

<Story
	name="Warning"
	asChild
	args={{
		visible: true,
		type: 'warning',
		message: 'Your session will expire in 5 minutes.',
		autoDismiss: false,
		theme: 'public'
	}}
>
	<Toast
		visible={true}
		type="warning"
		message="Your session will expire in 5 minutes."
		autoDismiss={false}
		theme="public"
		onDismiss={() => {}}
	/>
</Story>

<Story
	name="Error"
	asChild
	args={{
		visible: true,
		type: 'error',
		message: 'Failed to save changes. Please try again.',
		autoDismiss: false,
		theme: 'public'
	}}
>
	<Toast
		visible={true}
		type="error"
		message="Failed to save changes. Please try again."
		autoDismiss={false}
		theme="public"
		onDismiss={() => {}}
	/>
</Story>

<Story
	name="Admin Theme"
	asChild
	args={{
		visible: true,
		type: 'success',
		message: 'User account updated.',
		autoDismiss: false,
		theme: 'admin'
	}}
>
	<Toast
		visible={true}
		type="success"
		message="User account updated."
		autoDismiss={false}
		theme="admin"
		onDismiss={() => {}}
	/>
</Story>

<Story
	name="Without Dismiss"
	asChild
	args={{
		visible: true,
		type: 'info',
		message: 'This notification cannot be manually dismissed.',
		autoDismiss: false,
		theme: 'public'
	}}
>
	<Toast
		visible={true}
		type="info"
		message="This notification cannot be manually dismissed."
		autoDismiss={false}
		theme="public"
	/>
</Story>
