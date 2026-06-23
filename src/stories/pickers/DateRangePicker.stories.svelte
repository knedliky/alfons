<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DateRangePicker from '../../components/pickers/DateRangePicker.svelte';

	/**
	 * DateRangePicker shows a row of preset buttons (Today, 7 Days, 30 Days, 90 Days) plus a
	 * Custom button that opens a two-month calendar popover. The popover is triggered by clicking
	 * the Custom button — there is no `open` prop to force it open. Click in the canvas to view it.
	 *
	 * customStart / customEnd are ISO date strings (YYYY-MM-DD). They are only applied when
	 * selectedPreset is 'custom'.
	 */
	const { Story } = defineMeta({
		title: 'Pickers/DateRangePicker',
		component: DateRangePicker,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['admin', 'public']
			},
			selectedPreset: {
				control: { type: 'select' },
				options: ['today', '7d', '30d', '90d', 'custom']
			},
			disabled: {
				control: { type: 'boolean' }
			},
			customStart: {
				control: { type: 'text' },
				description: 'ISO date string for custom range start, e.g. 2026-06-01'
			},
			customEnd: {
				control: { type: 'text' },
				description: 'ISO date string for custom range end, e.g. 2026-06-19'
			}
		}
	});
</script>

<!-- Default: 7-day preset active, no custom range -->
<Story name="Default (7 Days)" asChild>
	<DateRangePicker
		variant="admin"
		selectedPreset="7d"
		onPresetChange={() => {}}
		onCustomRangeChange={() => {}}
	/>
</Story>

<!-- Today preset active -->
<Story name="Today Preset" asChild>
	<DateRangePicker
		variant="admin"
		selectedPreset="today"
		onPresetChange={() => {}}
		onCustomRangeChange={() => {}}
	/>
</Story>

<!-- 30-day preset active -->
<Story name="Last 30 Days" asChild>
	<DateRangePicker
		variant="admin"
		selectedPreset="30d"
		onPresetChange={() => {}}
		onCustomRangeChange={() => {}}
	/>
</Story>

<!-- 90-day preset active -->
<Story name="Last 90 Days" asChild>
	<DateRangePicker
		variant="admin"
		selectedPreset="90d"
		onPresetChange={() => {}}
		onCustomRangeChange={() => {}}
	/>
</Story>

<!-- Custom preset with a preselected range of 01/06/2026 – 19/06/2026 -->
<Story name="Custom Range (Preselected)" asChild>
	<DateRangePicker
		variant="admin"
		selectedPreset="custom"
		customStart="2026-06-01"
		customEnd="2026-06-19"
		onPresetChange={() => {}}
		onCustomRangeChange={() => {}}
	/>
</Story>

<!-- Disabled: all preset buttons and custom trigger are non-interactive -->
<Story name="Disabled" asChild>
	<DateRangePicker
		variant="admin"
		selectedPreset="7d"
		disabled={true}
		onPresetChange={() => {}}
		onCustomRangeChange={() => {}}
	/>
</Story>

<!-- Public variant: public design tokens, 7-day preset active -->
<Story name="Public Variant" asChild>
	<DateRangePicker
		variant="public"
		selectedPreset="7d"
		onPresetChange={() => {}}
		onCustomRangeChange={() => {}}
	/>
</Story>

<!-- Public variant with preselected custom range -->
<Story name="Public Custom Range" asChild>
	<DateRangePicker
		variant="public"
		selectedPreset="custom"
		customStart="2026-06-01"
		customEnd="2026-06-19"
		onPresetChange={() => {}}
		onCustomRangeChange={() => {}}
	/>
</Story>
