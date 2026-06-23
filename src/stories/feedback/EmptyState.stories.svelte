<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import EmptyState from '../../components/feedback/EmptyState.svelte';

	const { Story } = defineMeta({
		title: 'Feedback/EmptyState',
		component: EmptyState,
		tags: ['autodocs'],
		argTypes: {
			title: { control: { type: 'text' } },
			message: { control: { type: 'text' } },
			icon: {
				control: { type: 'select' },
				options: ['users', 'messages', 'posts', 'search', 'data']
			},
			variant: {
				control: { type: 'select' },
				options: ['public', 'admin']
			}
		}
	});
</script>

<Story
	name="Default"
	asChild
	args={{
		title: 'No results found',
		message: 'Try adjusting your search or filters to find what you are looking for.',
		icon: 'search',
		variant: 'admin'
	}}
>
	<EmptyState
		title="No results found"
		message="Try adjusting your search or filters to find what you are looking for."
		icon="search"
		variant="admin"
	/>
</Story>

<Story
	name="With Action"
	asChild
	args={{
		title: 'No posts yet',
		message: 'Get started by creating your first post.',
		icon: 'posts',
		variant: 'admin'
	}}
>
	<EmptyState
		title="No posts yet"
		message="Get started by creating your first post."
		icon="posts"
		variant="admin"
		action={{ label: 'Create Post', onclick: () => {} }}
	/>
</Story>

<Story
	name="Users Icon"
	asChild
	args={{
		title: 'No members found',
		message: 'There are no members matching your current filters.',
		icon: 'users',
		variant: 'admin'
	}}
>
	<EmptyState
		title="No members found"
		message="There are no members matching your current filters."
		icon="users"
		variant="admin"
	/>
</Story>

<Story
	name="Public Variant"
	asChild
	args={{
		title: 'Nothing here yet',
		message: 'Check back soon — new content is on its way.',
		icon: 'data',
		variant: 'public'
	}}
>
	<EmptyState
		title="Nothing here yet"
		message="Check back soon — new content is on its way."
		icon="data"
		variant="public"
	/>
</Story>

<Story
	name="With Link Action"
	asChild
	args={{
		title: 'No messages',
		message: 'Your inbox is empty. Start a conversation to see messages here.',
		icon: 'messages',
		variant: 'admin'
	}}
>
	<EmptyState
		title="No messages"
		message="Your inbox is empty. Start a conversation to see messages here."
		icon="messages"
		variant="admin"
		action={{ label: 'New Conversation', href: '/messages/new' }}
	/>
</Story>
