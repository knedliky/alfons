<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import RangeSlider from '../../components/atoms/RangeSlider.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/RangeSlider',
		component: RangeSlider,
		tags: ['autodocs'],
		argTypes: {
			value: { control: { type: 'number' } },
			min: { control: { type: 'number' } },
			max: { control: { type: 'number' } },
			step: { control: { type: 'number' } },
			disabled: { control: { type: 'boolean' } }
		}
	});
</script>

<Story name="Default" asChild args={{ value: 50, min: 0, max: 100, step: 1, disabled: false }}>
	<div style="padding: 1rem; width: 300px;">
		<RangeSlider value={50} min={0} max={100} step={1} onchange={() => {}} />
	</div>
</Story>

<Story name="Custom Range" asChild args={{ value: 25, min: 0, max: 200, step: 5, disabled: false }}>
	<div style="padding: 1rem; width: 300px;">
		<RangeSlider value={25} min={0} max={200} step={5} onchange={() => {}} />
	</div>
</Story>

<Story name="Fine Step" asChild args={{ value: 0.5, min: 0, max: 1, step: 0.01, disabled: false }}>
	<div style="padding: 1rem; width: 300px;">
		<RangeSlider value={0.5} min={0} max={1} step={0.01} onchange={() => {}} />
	</div>
</Story>

<Story name="At Minimum" asChild args={{ value: 0, min: 0, max: 100, step: 1, disabled: false }}>
	<div style="padding: 1rem; width: 300px;">
		<RangeSlider value={0} min={0} max={100} step={1} onchange={() => {}} />
	</div>
</Story>

<Story name="At Maximum" asChild args={{ value: 100, min: 0, max: 100, step: 1, disabled: false }}>
	<div style="padding: 1rem; width: 300px;">
		<RangeSlider value={100} min={0} max={100} step={1} onchange={() => {}} />
	</div>
</Story>

<Story name="Disabled" asChild args={{ value: 40, min: 0, max: 100, step: 1, disabled: true }}>
	<div style="padding: 1rem; width: 300px;">
		<RangeSlider value={40} min={0} max={100} step={1} disabled={true} onchange={() => {}} />
	</div>
</Story>
