<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import { CalendarDate } from '@internationalized/date';
	import CalendarGrid from '../../components/pickers/CalendarGrid.svelte';

	const { Story } = defineMeta({
		title: 'Pickers/CalendarGrid',
		component: CalendarGrid,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['admin', 'public']
			},
			showRangeHighlight: {
				control: { type: 'boolean' }
			}
		}
	});

	// June 2026 — month to render
	const june2026 = new CalendarDate(2026, 6, 1);

	// A single selected date: 19 June 2026
	const selectedDate = new CalendarDate(2026, 6, 19);

	// A date range: 10 – 20 June 2026
	const rangeStart = new CalendarDate(2026, 6, 10);
	const rangeEnd = new CalendarDate(2026, 6, 20);

	// Min/max constraints bounding the selectable window
	const minDate = new CalendarDate(2026, 6, 5);
	const maxDate = new CalendarDate(2026, 6, 28);
</script>

<!-- Default: June 2026 with no selection -->
<Story name="Default" asChild>
	<CalendarGrid month={june2026} variant="admin" onMonthChange={() => {}} onSelectDate={() => {}} />
</Story>

<!-- With Selected Date: 19/06/2026 highlighted -->
<Story name="With Selected Date" asChild>
	<CalendarGrid
		month={june2026}
		{selectedDate}
		variant="admin"
		onMonthChange={() => {}}
		onSelectDate={() => {}}
	/>
</Story>

<!-- With Range: 10/06/2026 – 20/06/2026 highlighted as a range -->
<Story name="With Selected Range" asChild>
	<CalendarGrid
		month={june2026}
		selectedRange={{ start: rangeStart, end: rangeEnd }}
		showRangeHighlight={true}
		variant="admin"
		onMonthChange={() => {}}
		onSelectDate={() => {}}
	/>
</Story>

<!-- Constrained: days outside 05/06/2026 – 28/06/2026 are disabled -->
<Story name="With Min/Max Constraints" asChild>
	<CalendarGrid
		month={june2026}
		{minDate}
		{maxDate}
		variant="admin"
		onMonthChange={() => {}}
		onSelectDate={() => {}}
	/>
</Story>

<!-- Public variant: public design tokens -->
<Story name="Public Variant" asChild>
	<CalendarGrid
		month={june2026}
		{selectedDate}
		variant="public"
		onMonthChange={() => {}}
		onSelectDate={() => {}}
	/>
</Story>
