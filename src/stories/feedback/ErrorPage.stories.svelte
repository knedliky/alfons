<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ErrorPage from '../../components/feedback/ErrorPage.svelte';

	const { Story } = defineMeta({
		title: 'Feedback/ErrorPage',
		component: ErrorPage,
		tags: ['autodocs'],
		argTypes: {
			status: { control: { type: 'number' } },
			message: { control: { type: 'text' } }
		}
	});
</script>

<Story
	name="Not Found (404)"
	asChild
	args={{
		status: 404,
		message: 'The page you requested could not be found. It may have been moved or deleted.'
	}}
>
	<ErrorPage
		status={404}
		message="The page you requested could not be found. It may have been moved or deleted."
		primaryAction={{ label: 'Go Back', onclick: () => {} }}
		secondaryAction={{ label: 'Go Home', onclick: () => {} }}
	/>
</Story>

<Story
	name="Server Error (500)"
	asChild
	args={{
		status: 500,
		message: 'Something went wrong on our end. Please try again in a moment.'
	}}
>
	<ErrorPage
		status={500}
		message="Something went wrong on our end. Please try again in a moment."
		primaryAction={{ label: 'Try Again', onclick: () => {} }}
		secondaryAction={{ label: 'Go Home', onclick: () => {} }}
	/>
</Story>

<Story
	name="No Actions"
	asChild
	args={{
		status: 403,
		message: 'You do not have permission to access this resource.'
	}}
>
	<ErrorPage
		status={403}
		message="You do not have permission to access this resource."
	/>
</Story>

<Story
	name="Primary Action Only"
	asChild
	args={{
		status: 404,
		message: 'This post no longer exists or has been removed.'
	}}
>
	<ErrorPage
		status={404}
		message="This post no longer exists or has been removed."
		primaryAction={{ label: 'Browse Posts', onclick: () => {} }}
	/>
</Story>
