<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BarChart from '../../components/stats/BarChart.svelte';

	// Realistic ranked data: top pages by views in a labour-market platform
	const defaultData = [
		{ label: 'Job Market Overview', value: 18420, percentage: 28 },
		{ label: 'Resume Writing Tips', value: 14350, percentage: 22 },
		{ label: 'Interview Preparation', value: 11280, percentage: 17 },
		{ label: 'Salary Benchmarks AU', value: 9640, percentage: 15 },
		{ label: 'Career Change Pathways', value: 7210, percentage: 11 },
		{ label: 'Networking Strategies', value: 4850, percentage: 7 }
	];

	// Extended dataset with more items to exercise maxItems truncation
	const extendedData = [
		{ label: 'Job Market Overview', value: 34820 },
		{ label: 'Resume Writing Tips', value: 27450 },
		{ label: 'Interview Preparation', value: 21180 },
		{ label: 'Salary Benchmarks AU', value: 18640 },
		{ label: 'Career Change Pathways', value: 15210 },
		{ label: 'Networking Strategies', value: 12850 },
		{ label: 'Skills Gap Analysis', value: 10320 },
		{ label: 'LinkedIn Optimisation', value: 8740 },
		{ label: 'Cover Letter Templates', value: 6510 },
		{ label: 'Workplace Rights Guide', value: 4980 },
		{ label: 'Remote Work Resources', value: 3710 },
		{ label: 'Graduate Programs AU', value: 2340 }
	];

	const { Story } = defineMeta({
		title: 'Stats/BarChart',
		component: BarChart,
		tags: ['autodocs'],
		argTypes: {
			title: { control: { type: 'text' } },
			valueLabel: { control: { type: 'text' } },
			isLoading: { control: { type: 'boolean' } },
			maxItems: { control: { type: 'number' } }
		}
	});
</script>

<Story name="Default" asChild>
	<BarChart data={defaultData} title="Top Pages" valueLabel="Views" />
</Story>

<Story name="With Percentages" asChild>
	<BarChart data={defaultData} title="Top Pages by Share" valueLabel="Views" />
</Story>

<Story name="Extended List (Top 5)" asChild>
	<BarChart data={extendedData} title="Content Performance" valueLabel="Page Views" maxItems={5} />
</Story>

<Story name="Full Extended List" asChild>
	<BarChart data={extendedData} title="All Content" valueLabel="Page Views" maxItems={12} />
</Story>

<Story name="Loading" asChild>
	<BarChart data={[]} title="Top Pages" valueLabel="Views" isLoading={true} />
</Story>

<Story name="Empty" asChild>
	<BarChart data={[]} title="Top Pages" valueLabel="Views" />
</Story>
