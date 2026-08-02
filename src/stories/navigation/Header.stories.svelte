<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Header from '../../components/navigation/Header.svelte';

	const { Story } = defineMeta({
		title: 'Navigation/Header',
		component: Header,
		tags: ['autodocs'],
		parameters: { layout: 'fullscreen' },
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'compact']
			},
			blinkingLogo: { control: { type: 'boolean' } }
		}
	});

	const nav = [
		{ href: '#blog', label: 'Blog' },
		{ href: '#experiments', label: 'Experiments' },
		{ href: '#about', label: 'About' }
	];
</script>

<Story name="Default" asChild>
	<div style="min-height: 240px">
		<Header navItems={nav} activePath="#experiments" />
		<p style="padding: var(--space-5); color: var(--text-secondary)">
			Page content clears the fixed bar via the built-in spacer.
		</p>
	</div>
</Story>

<Story name="Compact" asChild>
	<div style="min-height: 200px">
		<Header navItems={nav} activePath="#blog" variant="compact" />
		<p style="padding: var(--space-5); color: var(--text-secondary)">Article/admin chrome.</p>
	</div>
</Story>

<Story name="Blinking Logo" asChild>
	<div style="min-height: 200px">
		<Header navItems={nav} activePath="#about" blinkingLogo />
	</div>
</Story>
