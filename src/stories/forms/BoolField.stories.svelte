<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BoolField from '../../components/forms/BoolField.svelte';

	const { Story } = defineMeta({
		title: 'Forms/BoolField',
		component: BoolField,
		tags: ['autodocs'],
		argTypes: {
			label: { control: { type: 'text' } },
			value: { control: { type: 'boolean' } },
			description: { control: { type: 'text' } },
			error: { control: { type: 'text' } },
			required: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } }
		}
	});
</script>

<Story
	name="Default — off"
	asChild
	args={{ name: 'published', label: 'Published', value: false }}
>
	<BoolField
		name="published"
		label="Published"
		value={false}
		onchange={() => {}}
	/>
</Story>

<Story
	name="On"
	asChild
	args={{ name: 'published', label: 'Published', value: true }}
>
	<BoolField
		name="published"
		label="Published"
		value={true}
		onchange={() => {}}
	/>
</Story>

<Story
	name="With description"
	asChild
	args={{
		name: 'allow_applications',
		label: 'Accept applications',
		value: true,
		description: 'When enabled, candidates can submit applications for this role.'
	}}
>
	<BoolField
		name="allow_applications"
		label="Accept applications"
		value={true}
		description="When enabled, candidates can submit applications for this role."
		onchange={() => {}}
	/>
</Story>

<Story
	name="Required"
	asChild
	args={{ name: 'terms_agreed', label: 'I agree to the terms of service', value: false, required: true }}
>
	<BoolField
		name="terms_agreed"
		label="I agree to the terms of service"
		value={false}
		required
		onchange={() => {}}
	/>
</Story>

<Story
	name="With error"
	asChild
	args={{
		name: 'terms_agreed',
		label: 'I agree to the terms of service',
		value: false,
		required: true,
		error: 'You must agree to the terms of service to continue'
	}}
>
	<BoolField
		name="terms_agreed"
		label="I agree to the terms of service"
		value={false}
		required
		error="You must agree to the terms of service to continue"
		onchange={() => {}}
	/>
</Story>

<Story
	name="Disabled"
	asChild
	args={{ name: 'is_verified', label: 'Organisation verified', value: true, disabled: true }}
>
	<BoolField
		name="is_verified"
		label="Organisation verified"
		value={true}
		disabled
		description="Verification status is managed by the platform team."
		onchange={() => {}}
	/>
</Story>
