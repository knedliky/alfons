<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Grid from '../../components/layouts/Grid.svelte';

	const { Story } = defineMeta({
		title: 'Layouts/Grid',
		component: Grid,
		tags: ['autodocs'],
		argTypes: {
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

<Story name="Two Columns" asChild>
	<Grid columns={2} gap={4}>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Column A</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Column B</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Column C</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Column D</div>
	</Grid>
</Story>

<Story name="Three Columns" asChild>
	<Grid columns={3} gap={4}>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">One</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Two</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Three</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Four</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Five</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Six</div>
	</Grid>
</Story>

<Story name="Responsive Columns" asChild>
	<Grid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md)">Card one — 1 col on mobile, 2 on md, 3 on lg</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md)">Card two</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md)">Card three</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md)">Card four</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md)">Card five</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius-md)">Card six</div>
	</Grid>
</Story>

<Story name="Large Gap" asChild>
	<Grid columns={2} gap="xl">
		<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius-md)">Left panel — xl gap</div>
		<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius-md)">Right panel — xl gap</div>
	</Grid>
</Story>

<Story name="Four Columns Small Gap" asChild>
	<Grid columns={4} gap={2}>
		<div style="padding:0.75rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Q1</div>
		<div style="padding:0.75rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Q2</div>
		<div style="padding:0.75rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Q3</div>
		<div style="padding:0.75rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">Q4</div>
	</Grid>
</Story>
