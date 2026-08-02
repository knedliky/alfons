<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SelectField from '../../components/forms/SelectField.svelte';

	const { Story } = defineMeta({
		title: 'Forms/SelectField',
		component: SelectField,
		tags: ['autodocs'],
		argTypes: {
			label: { control: { type: 'text' } },
			value: { control: { type: 'text' } },
			placeholder: { control: { type: 'text' } },
			error: { control: { type: 'text' } },
			required: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } }
		}
	});

	const departmentOptions = {
		values: [
			'Engineering',
			'Product',
			'Design',
			'Marketing',
			'Finance',
			'People & Culture',
			'Legal',
			'Operations'
		]
	};

	const statusOptions = {
		values: ['Draft', 'Active', 'Closed', 'Archived']
	};
</script>

<Story name="Default — empty" asChild args={{ name: 'department', label: 'Department', value: '' }}>
	<SelectField
		name="department"
		label="Department"
		value=""
		options={departmentOptions}
		onchange={() => {}}
	/>
</Story>

<Story
	name="With selection"
	asChild
	args={{ name: 'department', label: 'Department', value: 'Engineering' }}
>
	<SelectField
		name="department"
		label="Department"
		value="Engineering"
		options={departmentOptions}
		onchange={() => {}}
	/>
</Story>

<Story
	name="Required"
	asChild
	args={{ name: 'status', label: 'Status', value: '', required: true }}
>
	<SelectField
		name="status"
		label="Status"
		value=""
		options={statusOptions}
		required
		onchange={() => {}}
	/>
</Story>

<Story
	name="With error"
	asChild
	args={{
		name: 'department',
		label: 'Department',
		value: '',
		required: true,
		error: 'Please select a department'
	}}
>
	<SelectField
		name="department"
		label="Department"
		value=""
		options={departmentOptions}
		required
		error="Please select a department"
		onchange={() => {}}
	/>
</Story>

<Story name="No options" asChild args={{ name: 'region', label: 'Region', value: '' }}>
	<SelectField
		name="region"
		label="Region"
		value=""
		options={{ values: [] }}
		placeholder="No regions configured"
		onchange={() => {}}
	/>
</Story>

<Story
	name="Disabled"
	asChild
	args={{ name: 'status', label: 'Status', value: 'Active', disabled: true }}
>
	<SelectField
		name="status"
		label="Status"
		value="Active"
		options={statusOptions}
		disabled
		onchange={() => {}}
	/>
</Story>
