<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DateField from '../../components/forms/DateField.svelte';

	const { Story } = defineMeta({
		title: 'Forms/DateField',
		component: DateField,
		tags: ['autodocs'],
		argTypes: {
			label: { control: { type: 'text' } },
			value: { control: { type: 'text' } },
			includeTime: { control: { type: 'boolean' } },
			required: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } },
			error: { control: { type: 'text' } },
			minDate: { control: { type: 'text' } },
			maxDate: { control: { type: 'text' } }
		}
	});
</script>

<Story
	name="Default — empty"
	asChild
	args={{ name: 'published_at', label: 'Published at', value: null, includeTime: true }}
>
	<DateField
		name="published_at"
		label="Published at"
		value={null}
		includeTime
		onchange={() => {}}
	/>
</Story>

<Story
	name="With datetime value"
	asChild
	args={{
		name: 'published_at',
		label: 'Published at',
		value: '2026-06-19T09:30:00.000Z',
		includeTime: true
	}}
>
	<DateField
		name="published_at"
		label="Published at"
		value="2026-06-19T09:30:00.000Z"
		includeTime
		onchange={() => {}}
	/>
</Story>

<Story
	name="Date only"
	asChild
	args={{
		name: 'start_date',
		label: 'Start date',
		value: '2026-07-01T00:00:00.000Z',
		includeTime: false
	}}
>
	<DateField
		name="start_date"
		label="Start date"
		value="2026-07-01T00:00:00.000Z"
		includeTime={false}
		onchange={() => {}}
	/>
</Story>

<Story
	name="Required"
	asChild
	args={{
		name: 'application_deadline',
		label: 'Application deadline',
		value: null,
		required: true
	}}
>
	<DateField
		name="application_deadline"
		label="Application deadline"
		value={null}
		required
		includeTime
		onchange={() => {}}
	/>
</Story>

<Story
	name="With error"
	asChild
	args={{
		name: 'start_date',
		label: 'Start date',
		value: null,
		required: true,
		error: 'Start date is required'
	}}
>
	<DateField
		name="start_date"
		label="Start date"
		value={null}
		required
		error="Start date is required"
		onchange={() => {}}
	/>
</Story>

<Story
	name="With date range constraint"
	asChild
	args={{
		name: 'interview_date',
		label: 'Interview date',
		value: null,
		includeTime: true,
		minDate: '2026-06-19',
		maxDate: '2026-12-31'
	}}
>
	<DateField
		name="interview_date"
		label="Interview date"
		value={null}
		includeTime
		minDate="2026-06-19"
		maxDate="2026-12-31"
		onchange={() => {}}
	/>
</Story>

<Story
	name="Disabled"
	asChild
	args={{
		name: 'created_at',
		label: 'Created at',
		value: '2026-01-15T08:00:00.000Z',
		disabled: true
	}}
>
	<DateField
		name="created_at"
		label="Created at"
		value="2026-01-15T08:00:00.000Z"
		includeTime
		disabled
		onchange={() => {}}
	/>
</Story>
