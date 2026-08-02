<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Tabs from '../../components/navigation/Tabs.svelte';

	const { Story } = defineMeta({
		title: 'Navigation/Tabs',
		component: Tabs,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['line', 'pill']
			},
			size: {
				control: { type: 'select' },
				options: ['default', 'sm']
			},
			fitted: { control: { type: 'boolean' } }
		}
	});

	const sections = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'tasks', label: 'Tasks', badge: 12 },
		{ id: 'methodology', label: 'Methodology' },
		{ id: 'archived', label: 'Archived', disabled: true }
	];
</script>

<Story name="Line" asChild>
	<div style="width: 560px">
		<Tabs tabs={sections} defaultValue="tasks" />
	</div>
</Story>

<Story name="Pill" asChild>
	<Tabs tabs={sections} variant="pill" defaultValue="overview" />
</Story>

<Story name="Small Pill" asChild>
	<Tabs tabs={sections} variant="pill" size="sm" defaultValue="methodology" />
</Story>

<Story name="Fitted" asChild>
	<div style="width: 560px">
		<Tabs tabs={sections.slice(0, 3)} fitted defaultValue="overview" />
	</div>
</Story>
