<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Stack from '../../components/layouts/Stack.svelte';

	const { Story } = defineMeta({
		title: 'Layouts/Stack',
		component: Stack,
		tags: ['autodocs'],
		argTypes: {
			direction: {
				control: { type: 'select' },
				options: ['vertical', 'horizontal']
			},
			gap: {
				control: { type: 'select' },
				options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
			},
			align: {
				control: { type: 'select' },
				options: ['start', 'center', 'end', 'stretch']
			},
			justify: {
				control: { type: 'select' },
				options: ['start', 'center', 'end', 'between', 'around']
			}
		}
	});
</script>

<Story
	name="Default"
	asChild
	args={{ direction: 'vertical', gap: 3, align: 'stretch', justify: 'start' }}
>
	<Stack direction="vertical" gap={3}>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius)">
			Block one
		</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius)">
			Block two
		</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius)">
			Block three
		</div>
	</Stack>
</Story>

<Story
	name="Horizontal"
	asChild
	args={{ direction: 'horizontal', gap: 3, align: 'center', justify: 'start' }}
>
	<Stack direction="horizontal" gap={3} align="center">
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius)">Item A</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius)">Item B</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius)">Item C</div>
	</Stack>
</Story>

<Story name="Large Gap" asChild>
	<Stack direction="vertical" gap="xl">
		<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
			Section one — xl gap
		</div>
		<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
			Section two
		</div>
		<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
			Section three
		</div>
	</Stack>
</Story>

<Story name="Centred Horizontal" asChild>
	<Stack direction="horizontal" gap="md" align="center" justify="center">
		<div style="padding:0.75rem 1.25rem;background:var(--accent-bg);border-radius:var(--radius)">
			Left
		</div>
		<div style="padding:0.75rem 1.25rem;background:var(--accent-bg);border-radius:var(--radius)">
			Centre
		</div>
		<div style="padding:0.75rem 1.25rem;background:var(--accent-bg);border-radius:var(--radius)">
			Right
		</div>
	</Stack>
</Story>

<Story name="Spaced Between" asChild>
	<Stack direction="horizontal" gap={2} align="center" justify="between">
		<div style="padding:0.75rem 1rem;background:var(--accent-bg);border-radius:var(--radius)">
			Logo
		</div>
		<div style="padding:0.75rem 1rem;background:var(--accent-bg);border-radius:var(--radius)">
			Actions
		</div>
	</Stack>
</Story>
