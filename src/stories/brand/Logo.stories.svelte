<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Logo from '../../components/brand/Logo.svelte';

	const { Story } = defineMeta({
		title: 'Brand/Logo',
		component: Logo,
		tags: ['autodocs'],
		argTypes: {
			height: { control: { type: 'number' } },
			shape: {
				control: { type: 'select' },
				options: ['portrait', 'square']
			},
			blinking: { control: { type: 'boolean' } }
		}
	});
</script>

<Story name="Portrait" asChild args={{ height: 64, shape: 'portrait' }}>
	<Logo height={64} shape="portrait" />
</Story>

<Story name="Square" asChild args={{ height: 64, shape: 'square' }}>
	<Logo height={64} shape="square" />
</Story>

<Story name="Blinking" asChild args={{ height: 64, shape: 'portrait', blinking: true }}>
	<Logo height={64} blinking />
</Story>

<Story name="Header Size" asChild args={{ height: 32, shape: 'square' }}>
	<Logo height={32} shape="square" />
</Story>

<Story name="Mono Recolour" asChild>
	<div style="--logo-field: var(--text-primary); --logo-cursor: var(--bg-primary)">
		<Logo height={64} />
	</div>
</Story>
