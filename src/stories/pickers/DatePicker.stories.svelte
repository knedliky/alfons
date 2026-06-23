<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DatePicker from '../../components/pickers/DatePicker.svelte';

	/**
	 * DatePicker accepts plain ISO date strings (YYYY-MM-DD) for value, minDate, and maxDate —
	 * it converts them internally via parseISODate. No @internationalized/date imports needed here.
	 * The trigger button displays the date in Australian format (DD/MM/YYYY).
	 *
	 * The popover calendar opens on trigger click. There is no `open` prop — to view the calendar
	 * in Storybook, click the trigger button in the canvas.
	 */
	const { Story } = defineMeta({
		title: 'Pickers/DatePicker',
		component: DatePicker,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['admin', 'public']
			},
			disabled: {
				control: { type: 'boolean' }
			},
			placeholder: {
				control: { type: 'text' }
			},
			value: {
				control: { type: 'text' },
				description: 'ISO date string, e.g. 2026-06-19'
			},
			minDate: {
				control: { type: 'text' },
				description: 'ISO date string for minimum selectable date'
			},
			maxDate: {
				control: { type: 'text' },
				description: 'ISO date string for maximum selectable date'
			}
		}
	});
</script>

<!-- Default: no pre-selected date, shows placeholder text -->
<Story name="Default" asChild>
	<DatePicker variant="admin" placeholder="Select date" onchange={() => {}} />
</Story>

<!-- Preselected: trigger shows 19/06/2026 on mount -->
<Story name="With Preselected Date" asChild>
	<DatePicker variant="admin" value="2026-06-19" onchange={() => {}} />
</Story>

<!-- Constrained: days outside 01/06/2026 – 30/06/2026 are disabled in the popover -->
<Story name="With Min/Max Constraints" asChild>
	<DatePicker
		variant="admin"
		value="2026-06-19"
		minDate="2026-06-01"
		maxDate="2026-06-30"
		onchange={() => {}}
	/>
</Story>

<!-- Disabled: trigger is non-interactive, popover does not open -->
<Story name="Disabled" asChild>
	<DatePicker variant="admin" disabled={true} placeholder="Select date" onchange={() => {}} />
</Story>

<!-- Custom Placeholder: shows alternate prompt copy -->
<Story name="Custom Placeholder" asChild>
	<DatePicker variant="admin" placeholder="Choose a date" onchange={() => {}} />
</Story>

<!-- Public Variant: same behaviour using public design tokens -->
<Story name="Public Variant" asChild>
	<DatePicker variant="public" value="2026-06-19" onchange={() => {}} />
</Story>

<!-- Public Disabled: public token disabled state -->
<Story name="Public Disabled" asChild>
	<DatePicker variant="public" disabled={true} placeholder="Select date" onchange={() => {}} />
</Story>
