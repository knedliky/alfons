<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ToggleGroup from '../../components/atoms/ToggleGroup.svelte';
	import SelectFilter from '../../components/atoms/SelectFilter.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/ToggleGroup',
		component: ToggleGroup,
		tags: ['autodocs']
	});

	const facets = [
		{ value: 'industry', label: 'Industry' },
		{ value: 'exposure', label: 'Exposure' },
		{ value: 'country', label: 'Country' }
	];

	const industries = [
		{ value: 'all', label: 'All industries' },
		{ value: 'tech', label: 'Technology' },
		{ value: 'finance', label: 'Finance' }
	];
</script>

<script>
	let facet = $state('industry');
	let industry = $state('all');
</script>

<Story name="Default" asChild>
	<div class="frame">
		<ToggleGroup options={facets} selected={facet} onchange={(v) => (facet = v)} />
	</div>
</Story>

<!-- ToggleGroup and SelectFilter share --filter-control-height, so they line up. -->
<Story name="Filter row" asChild>
	<div class="frame row">
		<ToggleGroup options={facets} selected={facet} onchange={(v) => (facet = v)} />
		<SelectFilter options={industries} value={industry} onchange={(v) => (industry = v)} />
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
	}

	.row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
</style>
