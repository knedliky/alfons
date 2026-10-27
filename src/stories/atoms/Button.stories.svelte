<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Button from '../../components/atoms/Button.svelte';

	// Admin stories run under the admin overlay through `parameters.theme`,
	// which .storybook/preview.js writes to data-theme on <html> (D-238).
	const ADMIN = { theme: 'admin' };

	const { Story } = defineMeta({
		title: 'Atoms/Button',
		component: Button,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'secondary', 'outline', 'ghost', 'link']
			},
			size: {
				control: { type: 'select' },
				options: ['default', 'sm', 'lg', 'icon']
			},
			disabled: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story name="Default" asChild args={{ variant: 'default', size: 'default' }}>
	<Button variant="default" size="default">Button</Button>
</Story>

<Story name="Secondary" asChild args={{ variant: 'secondary', size: 'default' }}>
	<Button variant="secondary" size="default">Button</Button>
</Story>

<Story name="Outline" asChild args={{ variant: 'outline', size: 'default' }}>
	<Button variant="outline" size="default">Button</Button>
</Story>

<Story name="Ghost" asChild args={{ variant: 'ghost', size: 'default' }}>
	<Button variant="ghost" size="default">Button</Button>
</Story>

<Story name="Link" asChild args={{ variant: 'link', size: 'default' }}>
	<Button variant="link" size="default">Button</Button>
</Story>

<Story name="Small" asChild args={{ variant: 'default', size: 'sm' }}>
	<Button variant="default" size="sm">Small Button</Button>
</Story>

<Story name="Large" asChild args={{ variant: 'default', size: 'lg' }}>
	<Button variant="default" size="lg">Large Button</Button>
</Story>

<Story name="Icon" asChild args={{ variant: 'default', size: 'icon' }}>
	<Button variant="default" size="icon">&#9733;</Button>
</Story>

<Story name="Disabled" asChild args={{ variant: 'default', size: 'default', disabled: true }}>
	<Button variant="default" size="default" disabled>Button</Button>
</Story>

<Story
	name="Admin Default"
	asChild
	parameters={ADMIN}
	args={{ variant: 'default', size: 'default' }}
>
	<Button variant="default" size="default">Button</Button>
</Story>

<Story
	name="Admin Secondary"
	asChild
	parameters={ADMIN}
	args={{ variant: 'secondary', size: 'default' }}
>
	<Button variant="secondary" size="default">Button</Button>
</Story>
