<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SelectFilter from '../../components/atoms/SelectFilter.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/SelectFilter',
		component: SelectFilter,
		tags: ['autodocs']
	});

	const options = [
		{ value: 'all', label: 'All industries' },
		{ value: 'tech', label: 'Technology' },
		{ value: 'finance', label: 'Finance' },
		{ value: 'health', label: 'Healthcare & Education' }
	];
</script>

<script>
	let value = $state('all');
</script>

<Story name="Default" asChild>
	<div class="frame">
		<SelectFilter {options} {value} onchange={(v) => (value = v)} />
	</div>
</Story>

<Story name="Searchable" asChild>
	<div class="frame">
		<SelectFilter {options} {value} searchable onchange={(v) => (value = v)} />
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		width: 18rem;
	}
</style>
