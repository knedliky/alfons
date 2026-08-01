<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Surface from '../../components/atoms/Surface.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Surface',
		component: Surface,
		tags: ['autodocs'],
		argTypes: {
			as: {
				control: { type: 'select' },
				options: ['div', 'section', 'article', 'aside']
			},
			radius: { control: { type: 'text' } }
		}
	});
</script>

<Story name="Default" asChild args={{ as: 'div', radius: 'var(--radius-message)' }}>
	<Surface as="div" class="p-4">
		<p>Surface content — frosted glass panel.</p>
	</Surface>
</Story>

<Story name="With Padding and Text" asChild args={{ as: 'div' }}>
	<Surface as="div" class="p-6" style="max-width: 360px;">
		<p style="font-size: var(--text-body); margin-bottom: 0.5rem;">Message from agent</p>
		<p style="font-size: var(--text-caption); opacity: 0.6;">Received just now</p>
	</Surface>
</Story>

<Story name="Section Element" asChild args={{ as: 'section' }}>
	<Surface as="section" class="p-4" style="max-width: 360px;">
		<h2 style="font-size: var(--text-lead); margin-bottom: 0.5rem;">Panel heading</h2>
		<p style="font-size: var(--text-body);">Section content rendered inside a surface panel.</p>
	</Surface>
</Story>

<Story name="Article Element" asChild args={{ as: 'article' }}>
	<Surface as="article" class="p-5" style="max-width: 400px;">
		<h3 style="font-size: var(--text-body); margin-bottom: 0.5rem;">Article title</h3>
		<p style="font-size: var(--text-body);">Article body text inside a frosted surface container.</p>
	</Surface>
</Story>

<Story name="Custom Radius" asChild args={{ as: 'div', radius: '2rem' }}>
	<Surface as="div" class="p-4" radius="2rem" style="max-width: 320px;">
		<p>Surface with a custom corner radius of 2rem.</p>
	</Surface>
</Story>

<Story name="Tinted Edge" asChild args={{ as: 'div' }}>
	<Surface as="div" class="p-4" style="--surface-edge: var(--accent-border); max-width: 320px;">
		<p>Surface with a tinted edge set via the <code>--surface-edge</code> custom property.</p>
	</Surface>
</Story>

<Story name="Aside Element" asChild args={{ as: 'aside' }}>
	<Surface as="aside" class="p-4" style="max-width: 280px;">
		<p style="font-size: var(--text-caption);">Aside note — supplementary information in a surface panel.</p>
	</Surface>
</Story>
