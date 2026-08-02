<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LineChart from '../../components/stats/LineChart.svelte';

	// Monthly active users over the past year (views + uniqueSessions)
	const monthlyData = [
		{ timestamp: 1704067200000, label: 'Jan', views: 8420, uniqueSessions: 5310 },
		{ timestamp: 1706745600000, label: 'Feb', views: 9150, uniqueSessions: 5840 },
		{ timestamp: 1709164800000, label: 'Mar', views: 11280, uniqueSessions: 7120 },
		{ timestamp: 1711843200000, label: 'Apr', views: 10640, uniqueSessions: 6750 },
		{ timestamp: 1714435200000, label: 'May', views: 13210, uniqueSessions: 8480 },
		{ timestamp: 1717113600000, label: 'Jun', views: 14850, uniqueSessions: 9210 },
		{ timestamp: 1719705600000, label: 'Jul', views: 12320, uniqueSessions: 7890 },
		{ timestamp: 1722384000000, label: 'Aug', views: 15740, uniqueSessions: 10050 },
		{ timestamp: 1725062400000, label: 'Sep', views: 17980, uniqueSessions: 11430 },
		{ timestamp: 1727654400000, label: 'Oct', views: 16510, uniqueSessions: 10620 },
		{ timestamp: 1730332800000, label: 'Nov', views: 19240, uniqueSessions: 12380 },
		{ timestamp: 1732924800000, label: 'Dec', views: 21580, uniqueSessions: 13840 }
	];

	// Weekly data for a shorter, denser series (applications submitted per week)
	const weeklyData = [
		{ timestamp: 1748390400000, label: 'W1', views: 312, uniqueSessions: 198 },
		{ timestamp: 1748995200000, label: 'W2', views: 428, uniqueSessions: 271 },
		{ timestamp: 1749600000000, label: 'W3', views: 385, uniqueSessions: 245 },
		{ timestamp: 1750204800000, label: 'W4', views: 514, uniqueSessions: 326 },
		{ timestamp: 1750809600000, label: 'W5', views: 489, uniqueSessions: 311 },
		{ timestamp: 1751414400000, label: 'W6', views: 632, uniqueSessions: 402 }
	];

	const { Story } = defineMeta({
		title: 'Stats/LineChart',
		component: LineChart,
		tags: ['autodocs'],
		argTypes: {
			title: { control: { type: 'text' } },
			metric: {
				control: { type: 'select' },
				options: ['views', 'uniqueSessions']
			},
			width: { control: { type: 'number' } },
			height: { control: { type: 'number' } },
			isLoading: { control: { type: 'boolean' } }
		}
	});
</script>

<!-- LineChart renders an SVG sized by width/height props; wrap in a sized div so
     Storybook's canvas gives it a stable container regardless of panel width. -->

<Story name="Default — Monthly Views" asChild>
	<div style="width: 640px;">
		<LineChart
			data={monthlyData}
			title="Monthly Page Views"
			metric="views"
			width={600}
			height={300}
		/>
	</div>
</Story>

<Story name="Unique Sessions" asChild>
	<div style="width: 640px;">
		<LineChart
			data={monthlyData}
			title="Monthly Unique Sessions"
			metric="uniqueSessions"
			width={600}
			height={300}
		/>
	</div>
</Story>

<Story name="Weekly Applications" asChild>
	<div style="width: 640px;">
		<LineChart
			data={weeklyData}
			title="Weekly Applications Submitted"
			metric="views"
			width={600}
			height={260}
		/>
	</div>
</Story>

<Story name="Compact Height" asChild>
	<div style="width: 640px;">
		<LineChart
			data={monthlyData}
			title="Page Views (Compact)"
			metric="views"
			width={600}
			height={180}
		/>
	</div>
</Story>

<Story name="Loading" asChild>
	<div style="width: 640px;">
		<LineChart
			data={[]}
			title="Monthly Page Views"
			metric="views"
			width={600}
			height={300}
			isLoading={true}
		/>
	</div>
</Story>

<Story name="Empty" asChild>
	<div style="width: 640px;">
		<LineChart data={[]} title="Monthly Page Views" metric="views" width={600} height={300} />
	</div>
</Story>
