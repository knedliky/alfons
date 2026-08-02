<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Container from '../../components/layouts/Container.svelte';

	const { Story } = defineMeta({
		title: 'Layouts/Container',
		component: Container,
		tags: ['autodocs'],
		argTypes: {
			maxWidth: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg', 'xl', 'full']
			},
			padding: { control: { type: 'boolean' } },
			centered: { control: { type: 'boolean' } }
		}
	});
</script>

<Story name="Default" asChild args={{ maxWidth: 'lg', padding: true, centered: true }}>
	<div style="background:var(--surface-rest-bg);padding:1rem 0">
		<Container maxWidth="lg" padding={true} centered={true}>
			<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
				Max-width lg (1024px) · padded · centred
			</div>
		</Container>
	</div>
</Story>

<Story name="Small" asChild args={{ maxWidth: 'sm', padding: true, centered: true }}>
	<div style="background:var(--surface-rest-bg);padding:1rem 0">
		<Container maxWidth="sm" padding={true} centered={true}>
			<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
				Max-width sm (640px) — narrow prose or form
			</div>
		</Container>
	</div>
</Story>

<Story name="Extra Large" asChild args={{ maxWidth: 'xl', padding: true, centered: true }}>
	<div style="background:var(--surface-rest-bg);padding:1rem 0">
		<Container maxWidth="xl" padding={true} centered={true}>
			<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
				Max-width xl (1280px) — wide dashboard
			</div>
		</Container>
	</div>
</Story>

<Story
	name="Full Width, No Padding"
	asChild
	args={{ maxWidth: 'full', padding: false, centered: false }}
>
	<div style="background:var(--surface-rest-bg);padding:1rem 0">
		<Container maxWidth="full" padding={false} centered={false}>
			<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
				Full width · no padding · not centred
			</div>
		</Container>
	</div>
</Story>
