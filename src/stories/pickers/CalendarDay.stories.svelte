<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { CalendarDate } from '@internationalized/date';
	import CalendarDay from '../../components/pickers/CalendarDay.svelte';

	const { Story } = defineMeta({
		title: 'Pickers/CalendarDay',
		component: CalendarDay,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['admin', 'public']
			},
			isToday: {
				control: { type: 'boolean' }
			},
			isSelected: {
				control: { type: 'boolean' }
			},
			isHighlighted: {
				control: { type: 'boolean' }
			},
			isOutsideMonth: {
				control: { type: 'boolean' }
			},
			isDisabled: {
				control: { type: 'boolean' }
			},
			isRangeStart: {
				control: { type: 'boolean' }
			},
			isRangeEnd: {
				control: { type: 'boolean' }
			}
		}
	});

	// 19 June 2026
	const sampleDate = new CalendarDate(2026, 6, 19);
</script>

<!-- Default: a plain unremarkable day cell -->
<Story name="Default" asChild>
	<CalendarDay date={sampleDate} variant="admin" onclick={() => {}} />
</Story>

<!-- Today: bold accent colour, marks the current day -->
<Story name="Today" asChild>
	<CalendarDay date={sampleDate} variant="admin" isToday={true} onclick={() => {}} />
</Story>

<!-- Selected: filled accent background, the chosen date -->
<Story name="Selected" asChild>
	<CalendarDay date={sampleDate} variant="admin" isSelected={true} onclick={() => {}} />
</Story>

<!-- Highlighted: within a date range but not an endpoint -->
<Story name="Highlighted (In Range)" asChild>
	<CalendarDay date={sampleDate} variant="admin" isHighlighted={true} onclick={() => {}} />
</Story>

<!-- Range Start: left rounded end of a selection range -->
<Story name="Range Start" asChild>
	<CalendarDay
		date={sampleDate}
		variant="admin"
		isSelected={true}
		isRangeStart={true}
		onclick={() => {}}
	/>
</Story>

<!-- Range End: right rounded end of a selection range -->
<Story name="Range End" asChild>
	<CalendarDay
		date={sampleDate}
		variant="admin"
		isSelected={true}
		isRangeEnd={true}
		onclick={() => {}}
	/>
</Story>

<!-- Outside Month: muted, belongs to adjacent month shown for grid padding -->
<Story name="Outside Month" asChild>
	<CalendarDay date={sampleDate} variant="admin" isOutsideMonth={true} onclick={() => {}} />
</Story>

<!-- Disabled: non-interactive, below minDate or above maxDate -->
<Story name="Disabled" asChild>
	<CalendarDay date={sampleDate} variant="admin" isDisabled={true} onclick={() => {}} />
</Story>

<!-- Public variant: uses public design tokens instead of admin -->
<Story name="Public Variant" asChild>
	<CalendarDay date={sampleDate} variant="public" onclick={() => {}} />
</Story>

<!-- Public Selected: public accent colour on selection -->
<Story name="Public Selected" asChild>
	<CalendarDay date={sampleDate} variant="public" isSelected={true} onclick={() => {}} />
</Story>
