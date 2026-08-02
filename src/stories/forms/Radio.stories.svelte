<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RadioGroup from '../../components/forms/RadioGroup.svelte';
	import Radio from '../../components/forms/Radio.svelte';

	const { Story } = defineMeta({
		title: 'Forms/Radio',
		component: RadioGroup,
		tags: ['autodocs'],
		argTypes: {
			orientation: {
				control: { type: 'select' },
				options: ['vertical', 'horizontal']
			},
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			},
			disabled: { control: { type: 'boolean' } }
		}
	});

	const frequencies = [
		{ value: 'daily', label: 'Daily' },
		{ value: 'weekly', label: 'Weekly', description: 'A Monday morning summary.' },
		{ value: 'never', label: 'Never' }
	];
</script>

<Story name="Options Array" asChild>
	<RadioGroup defaultValue="weekly" options={frequencies} aria-label="Email frequency" />
</Story>

<Story name="Nested Children" asChild>
	<RadioGroup defaultValue="b" aria-label="Nested example">
		<Radio value="a" label="Option A" />
		<Radio value="b" label="Option B" description="The recommended choice." />
		<Radio value="c" label="Option C" />
	</RadioGroup>
</Story>

<Story name="Horizontal" asChild>
	<RadioGroup
		defaultValue="daily"
		options={frequencies}
		orientation="horizontal"
		aria-label="Horizontal example"
	/>
</Story>

<Story name="Group Disabled" asChild>
	<RadioGroup defaultValue="weekly" options={frequencies} disabled aria-label="Disabled example" />
</Story>

<Story name="Standalone Radio" asChild>
	<Radio value="solo" label="Standalone radio" checked name="standalone-demo" />
</Story>
