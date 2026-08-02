<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatCard from '../../components/stats/StatCard.svelte';

	const { Story } = defineMeta({
		title: 'Stats/StatCard',
		component: StatCard,
		tags: ['autodocs'],
		argTypes: {
			colour: {
				control: { type: 'select' },
				options: ['red', 'green', 'blue', 'purple']
			},
			icon: {
				control: { type: 'select' },
				options: ['messages', 'users', 'posts', 'chart']
			},
			loading: { control: { type: 'boolean' } }
		}
	});
</script>

<Story name="Default" asChild>
	<StatCard label="Total Messages" value={1284} icon="messages" colour="red" />
</Story>

<Story name="Active Users" asChild>
	<StatCard label="Active Users" value={3_847} icon="users" colour="blue" />
</Story>

<Story name="Published Posts" asChild>
	<StatCard label="Published Posts" value={92} icon="posts" colour="purple" />
</Story>

<Story name="Chart Metric" asChild>
	<StatCard label="Applications This Month" value={427} icon="chart" colour="green" />
</Story>

<!-- subValue used as contextual indicator: positive performance -->
<Story name="With Sub-value (Growth)" asChild>
	<StatCard
		label="Monthly Active Users"
		value={12_480}
		subValue="+18% from last month"
		icon="users"
		colour="green"
	/>
</Story>

<!-- subValue used as contextual indicator: negative performance -->
<Story name="With Sub-value (Decline)" asChild>
	<StatCard
		label="Job Applications"
		value={638}
		subValue="−12% from last month"
		icon="chart"
		colour="red"
	/>
</Story>

<!-- subValue used as neutral context (e.g. a comparison period with no direction) -->
<Story name="With Sub-value (Neutral)" asChild>
	<StatCard
		label="Resume Downloads"
		value={2_051}
		subValue="Same as last quarter"
		icon="posts"
		colour="blue"
	/>
</Story>

<!-- Large numbers — exercises the formatValue path inside the card's value display -->
<Story name="Large Value" asChild>
	<StatCard
		label="Total Page Views"
		value="1.4M"
		subValue="+31% year on year"
		icon="chart"
		colour="purple"
	/>
</Story>

<!-- With suffix prop -->
<Story name="With Suffix" asChild>
	<StatCard label="Average Session" value={4.7} suffix=" min" icon="chart" colour="blue" />
</Story>

<!-- With badge count — notification-style indicator -->
<Story name="With Badge" asChild>
	<StatCard label="Unread Messages" value={84} icon="messages" colour="red" badgeCount={7} />
</Story>

<Story name="Loading" asChild>
	<StatCard label="Total Messages" value={0} icon="messages" colour="red" loading={true} />
</Story>

<!-- Four-up grid: typical dashboard usage -->
<Story name="Dashboard Row" asChild>
	<div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; max-width: 900px;">
		<StatCard
			label="Active Users"
			value={3_847}
			icon="users"
			colour="blue"
			subValue="+9% this month"
		/>
		<StatCard
			label="Messages Sent"
			value={12_640}
			icon="messages"
			colour="red"
			subValue="+22% this month"
		/>
		<StatCard
			label="Published Posts"
			value={92}
			icon="posts"
			colour="purple"
			subValue="3 pending review"
		/>
		<StatCard
			label="Applications"
			value={427}
			icon="chart"
			colour="green"
			subValue="−5% this month"
		/>
	</div>
</Story>
