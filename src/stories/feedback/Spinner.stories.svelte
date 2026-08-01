<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Spinner from '../../components/feedback/Spinner.svelte';

	const { Story } = defineMeta({
		title: 'Feedback/Spinner',
		component: Spinner,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'select' },
				options: ['sm', 'default', 'lg']
			},
			colour: { control: { type: 'text' } }
		}
	});
</script>

<Story name="Default" asChild>
	<Spinner />
</Story>

<Story name="Small" asChild args={{ size: 'sm' }}>
	<Spinner size="sm" />
</Story>

<Story name="Large" asChild args={{ size: 'lg' }}>
	<Spinner size="lg" />
</Story>

<Story name="Custom Colour" asChild>
	<Spinner size="lg" colour="var(--sky-blue)" label="Fetching results" />
</Story>
