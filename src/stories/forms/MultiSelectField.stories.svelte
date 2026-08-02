<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MultiSelectField from '../../components/forms/MultiSelectField.svelte';

	const { Story } = defineMeta({
		title: 'Forms/MultiSelectField',
		component: MultiSelectField,
		tags: ['autodocs'],
		argTypes: {
			label: { control: { type: 'text' } },
			placeholder: { control: { type: 'text' } },
			error: { control: { type: 'text' } },
			required: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } }
		}
	});

	const skillOptions = {
		values: [
			'Project management',
			'Data analysis',
			'Python',
			'SQL',
			'Communication',
			'Stakeholder management',
			'Agile',
			'Machine learning'
		]
	};

	const industryOptions = {
		values: [
			'Technology',
			'Finance',
			'Healthcare',
			'Education',
			'Government',
			'Non-profit',
			'Retail',
			'Manufacturing'
		],
		maxSelect: 3
	};
</script>

<Story name="Default — empty" asChild args={{ name: 'skills', label: 'Skills', value: [] }}>
	<MultiSelectField
		name="skills"
		label="Skills"
		value={[]}
		options={skillOptions}
		onchange={() => {}}
	/>
</Story>

<Story
	name="With selections"
	asChild
	args={{ name: 'skills', label: 'Skills', value: ['Python', 'Data analysis', 'SQL'] }}
>
	<MultiSelectField
		name="skills"
		label="Skills"
		value={['Python', 'Data analysis', 'SQL']}
		options={skillOptions}
		onchange={() => {}}
	/>
</Story>

<Story
	name="With max selection limit"
	asChild
	args={{ name: 'industries', label: 'Industries (max 3)', value: ['Technology', 'Finance'] }}
>
	<MultiSelectField
		name="industries"
		label="Industries (max 3)"
		value={['Technology', 'Finance']}
		options={industryOptions}
		onchange={() => {}}
	/>
</Story>

<Story
	name="Many selections — overflow display"
	asChild
	args={{
		name: 'skills',
		label: 'Skills',
		value: ['Python', 'SQL', 'Data analysis', 'Machine learning', 'Agile']
	}}
>
	<MultiSelectField
		name="skills"
		label="Skills"
		value={['Python', 'SQL', 'Data analysis', 'Machine learning', 'Agile']}
		options={skillOptions}
		onchange={() => {}}
	/>
</Story>

<Story
	name="Required"
	asChild
	args={{ name: 'skills', label: 'Skills', value: [], required: true }}
>
	<MultiSelectField
		name="skills"
		label="Skills"
		value={[]}
		options={skillOptions}
		required
		placeholder="Select at least one skill"
		onchange={() => {}}
	/>
</Story>

<Story
	name="With error"
	asChild
	args={{
		name: 'skills',
		label: 'Skills',
		value: [],
		required: true,
		error: 'Please select at least one skill'
	}}
>
	<MultiSelectField
		name="skills"
		label="Skills"
		value={[]}
		options={skillOptions}
		required
		error="Please select at least one skill"
		onchange={() => {}}
	/>
</Story>

<Story
	name="Disabled"
	asChild
	args={{ name: 'skills', label: 'Skills', value: ['Python', 'SQL'], disabled: true }}
>
	<MultiSelectField
		name="skills"
		label="Skills"
		value={['Python', 'SQL']}
		options={skillOptions}
		disabled
		onchange={() => {}}
	/>
</Story>
