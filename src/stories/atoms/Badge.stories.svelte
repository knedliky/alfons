<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Badge from '../../components/atoms/Badge.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Badge',
		component: Badge,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'success', 'warning', 'error', 'info']
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'default']
			},
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			}
		}
	});
</script>

<Story name="Default" asChild args={{ variant: 'default', size: 'default', theme: 'public' }}>
	<Badge variant="default" size="default" theme="public">Default</Badge>
</Story>

<Story name="Success" asChild args={{ variant: 'success', size: 'default', theme: 'public' }}>
	<Badge variant="success" size="default" theme="public">Published</Badge>
</Story>

<Story name="Warning" asChild args={{ variant: 'warning', size: 'default', theme: 'public' }}>
	<Badge variant="warning" size="default" theme="public">In review</Badge>
</Story>

<Story name="Error" asChild args={{ variant: 'error', size: 'default', theme: 'public' }}>
	<Badge variant="error" size="default" theme="public">Failed</Badge>
</Story>

<Story name="Info" asChild args={{ variant: 'info', size: 'default', theme: 'public' }}>
	<Badge variant="info" size="default" theme="public">Beta</Badge>
</Story>

<Story name="Small" asChild args={{ variant: 'default', size: 'sm', theme: 'public' }}>
	<Badge variant="default" size="sm" theme="public">42</Badge>
</Story>

<Story name="Admin Success" asChild args={{ variant: 'success', size: 'default', theme: 'admin' }}>
	<Badge variant="success" size="default" theme="admin">Active</Badge>
</Story>

<Story name="Admin Default" asChild args={{ variant: 'default', size: 'sm', theme: 'admin' }}>
	<Badge variant="default" size="sm" theme="admin">Draft</Badge>
</Story>
