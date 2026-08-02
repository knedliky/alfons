<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TextField from '../../components/forms/TextField.svelte';

	const { Story } = defineMeta({
		title: 'Forms/TextField',
		component: TextField,
		tags: ['autodocs'],
		argTypes: {
			type: {
				control: { type: 'select' },
				options: ['text', 'email', 'url']
			},
			label: { control: { type: 'text' } },
			value: { control: { type: 'text' } },
			placeholder: { control: { type: 'text' } },
			error: { control: { type: 'text' } },
			required: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } }
		}
	});
</script>

<Story
	name="Default"
	asChild
	args={{ name: 'organisation_name', label: 'Organisation name', value: '', type: 'text' }}
>
	<TextField
		name="organisation_name"
		label="Organisation name"
		value=""
		type="text"
		onchange={() => {}}
	/>
</Story>

<Story
	name="With value"
	asChild
	args={{
		name: 'organisation_name',
		label: 'Organisation name',
		value: 'Acme Pty Ltd',
		type: 'text'
	}}
>
	<TextField
		name="organisation_name"
		label="Organisation name"
		value="Acme Pty Ltd"
		type="text"
		onchange={() => {}}
	/>
</Story>

<Story
	name="Required"
	asChild
	args={{ name: 'full_name', label: 'Full name', value: '', type: 'text', required: true }}
>
	<TextField
		name="full_name"
		label="Full name"
		value=""
		type="text"
		required
		placeholder="Jane Smith"
		onchange={() => {}}
	/>
</Story>

<Story
	name="Email"
	asChild
	args={{
		name: 'contact_email',
		label: 'Contact email',
		value: 'hello@example.com.au',
		type: 'email'
	}}
>
	<TextField
		name="contact_email"
		label="Contact email"
		value="hello@example.com.au"
		type="email"
		onchange={() => {}}
	/>
</Story>

<Story name="URL" asChild args={{ name: 'website', label: 'Website', value: '', type: 'url' }}>
	<TextField
		name="website"
		label="Website"
		value=""
		type="url"
		placeholder="https://example.com.au"
		onchange={() => {}}
	/>
</Story>

<Story
	name="With error"
	asChild
	args={{
		name: 'full_name',
		label: 'Full name',
		value: '',
		type: 'text',
		required: true,
		error: 'Full name is required'
	}}
>
	<TextField
		name="full_name"
		label="Full name"
		value=""
		type="text"
		required
		error="Full name is required"
		onchange={() => {}}
	/>
</Story>

<Story
	name="With character limit"
	asChild
	args={{
		name: 'bio',
		label: 'Bio',
		value: 'Experienced labour-market analyst',
		type: 'text',
		options: { max: 80 }
	}}
>
	<TextField
		name="bio"
		label="Bio"
		value="Experienced labour-market analyst"
		type="text"
		options={{ max: 80 }}
		onchange={() => {}}
	/>
</Story>

<Story
	name="Disabled"
	asChild
	args={{
		name: 'username',
		label: 'Username',
		value: 'simon.karumbi',
		type: 'text',
		disabled: true
	}}
>
	<TextField
		name="username"
		label="Username"
		value="simon.karumbi"
		type="text"
		disabled
		onchange={() => {}}
	/>
</Story>
