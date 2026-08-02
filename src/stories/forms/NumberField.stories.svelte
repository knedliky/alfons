<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import NumberField from '../../components/forms/NumberField.svelte';

	const { Story } = defineMeta({
		title: 'Forms/NumberField',
		component: NumberField,
		tags: ['autodocs'],
		argTypes: {
			label: { control: { type: 'text' } },
			value: { control: { type: 'number' } },
			placeholder: { control: { type: 'text' } },
			error: { control: { type: 'text' } },
			required: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } }
		}
	});
</script>

<Story name="Default" asChild args={{ name: 'headcount', label: 'Headcount', value: null }}>
	<NumberField name="headcount" label="Headcount" value={null} onchange={() => {}} />
</Story>

<Story name="With value" asChild args={{ name: 'headcount', label: 'Headcount', value: 42 }}>
	<NumberField name="headcount" label="Headcount" value={42} onchange={() => {}} />
</Story>

<Story
	name="Integer only"
	asChild
	args={{
		name: 'years_experience',
		label: 'Years of experience',
		value: 5,
		options: { min: 0, max: 50, noDecimal: true }
	}}
>
	<NumberField
		name="years_experience"
		label="Years of experience"
		value={5}
		options={{ min: 0, max: 50, noDecimal: true }}
		onchange={() => {}}
	/>
</Story>

<Story
	name="Decimal with range"
	asChild
	args={{
		name: 'hourly_rate',
		label: 'Hourly rate (AUD)',
		value: 95.5,
		options: { min: 0, max: 500 }
	}}
>
	<NumberField
		name="hourly_rate"
		label="Hourly rate (AUD)"
		value={95.5}
		options={{ min: 0, max: 500 }}
		onchange={() => {}}
	/>
</Story>

<Story
	name="Required"
	asChild
	args={{ name: 'headcount', label: 'Headcount', value: null, required: true }}
>
	<NumberField
		name="headcount"
		label="Headcount"
		value={null}
		required
		placeholder="0"
		onchange={() => {}}
	/>
</Story>

<Story
	name="With error"
	asChild
	args={{
		name: 'headcount',
		label: 'Headcount',
		value: null,
		required: true,
		error: 'Headcount must be greater than 0'
	}}
>
	<NumberField
		name="headcount"
		label="Headcount"
		value={null}
		required
		error="Headcount must be greater than 0"
		onchange={() => {}}
	/>
</Story>

<Story
	name="Disabled"
	asChild
	args={{ name: 'salary', label: 'Annual salary (AUD)', value: 120000, disabled: true }}
>
	<NumberField
		name="salary"
		label="Annual salary (AUD)"
		value={120000}
		disabled
		onchange={() => {}}
	/>
</Story>
