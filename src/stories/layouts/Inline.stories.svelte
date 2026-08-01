<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Inline from '../../components/layouts/Inline.svelte';

	const { Story } = defineMeta({
		title: 'Layouts/Inline',
		component: Inline,
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
			},
			wrap: { control: { type: 'boolean' } }
		}
	});
</script>

<Story name="Default" asChild args={{ gap: 2, align: 'center', justify: 'start', wrap: true }}>
	<Inline gap={2} align="center" justify="start" wrap={true}>
		<div style="padding:0.5rem 1rem;background:var(--accent-bg);border-radius:var(--radius)">Svelte</div>
		<div style="padding:0.5rem 1rem;background:var(--accent-bg);border-radius:var(--radius)">TypeScript</div>
		<div style="padding:0.5rem 1rem;background:var(--accent-bg);border-radius:var(--radius)">Tailwind</div>
	</Inline>
</Story>

<Story name="Spaced Between" asChild>
	<Inline gap={2} align="center" justify="between" wrap={false}>
		<div style="padding:0.5rem 1rem;background:var(--accent-bg);border-radius:var(--radius)">Logo</div>
		<div style="padding:0.5rem 1rem;background:var(--accent-bg);border-radius:var(--radius)">Navigation</div>
		<div style="padding:0.5rem 1rem;background:var(--accent-bg);border-radius:var(--radius)">Actions</div>
	</Inline>
</Story>

<Story name="Centred" asChild>
	<Inline gap={3} align="center" justify="center" wrap={false}>
		<div style="padding:0.5rem 1rem;background:var(--accent-bg);border-radius:var(--radius)">One</div>
		<div style="padding:0.5rem 1rem;background:var(--accent-bg);border-radius:var(--radius)">Two</div>
		<div style="padding:0.5rem 1rem;background:var(--accent-bg);border-radius:var(--radius)">Three</div>
	</Inline>
</Story>

<Story name="Wrapping Tags" asChild>
	<div style="width:320px">
		<Inline gap={2} align="center" justify="start" wrap={true}>
			<div style="padding:0.375rem 0.75rem;background:var(--accent-bg);border-radius:var(--radius-pill);font-size:0.8125rem">Design</div>
			<div style="padding:0.375rem 0.75rem;background:var(--accent-bg);border-radius:var(--radius-pill);font-size:0.8125rem">Labour market</div>
			<div style="padding:0.375rem 0.75rem;background:var(--accent-bg);border-radius:var(--radius-pill);font-size:0.8125rem">Skills</div>
			<div style="padding:0.375rem 0.75rem;background:var(--accent-bg);border-radius:var(--radius-pill);font-size:0.8125rem">Svelte</div>
			<div style="padding:0.375rem 0.75rem;background:var(--accent-bg);border-radius:var(--radius-pill);font-size:0.8125rem">TypeScript</div>
		</Inline>
	</div>
</Story>

<Story name="Large Gap" asChild>
	<Inline gap="lg" align="start" justify="start" wrap={false}>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius)">Stat A</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius)">Stat B</div>
		<div style="padding:1rem;background:var(--accent-bg);border-radius:var(--radius)">Stat C</div>
	</Inline>
</Story>
