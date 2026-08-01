<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Checkbox from '../../components/forms/Checkbox.svelte';

	const { Story } = defineMeta({
		title: 'Forms/Checkbox',
		component: Checkbox,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'select' },
				options: ['default', 'sm']
			},
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			},
			checked: { control: { type: 'boolean' } },
			indeterminate: { control: { type: 'boolean' } },
			error: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } }
		}
	});
</script>

<Story name="Default" asChild args={{ label: 'Email me updates' }}>
	<Checkbox label="Email me updates" />
</Story>

<Story name="Checked" asChild args={{ checked: true, label: 'Subscribed' }}>
	<Checkbox checked label="Subscribed" />
</Story>

<Story name="With Description" asChild>
	<Checkbox
		label="Weekly digest"
		description="A summary of new experiments and posts, every Monday."
	/>
</Story>

<Story name="Indeterminate" asChild>
	<Checkbox indeterminate label="Select all" description="3 of 7 selected" />
</Story>

<Story name="Error" asChild args={{ error: true, label: 'Accept the terms' }}>
	<Checkbox error label="Accept the terms" />
</Story>

<Story name="Disabled" asChild args={{ disabled: true, label: 'Unavailable' }}>
	<Checkbox disabled label="Unavailable" />
</Story>

<Story name="Small" asChild args={{ size: 'sm', label: 'Compact row' }}>
	<Checkbox size="sm" label="Compact row" />
</Story>

<Story name="Admin Theme" asChild args={{ theme: 'admin', label: 'Admin setting' }}>
	<Checkbox theme="admin" checked label="Admin setting" />
</Story>
