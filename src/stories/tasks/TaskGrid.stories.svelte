<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TaskGrid from '../../components/tasks/TaskGrid.svelte';
	import { runningTasks } from './sample.js';

	const { Story } = defineMeta({
		title: 'Tasks/TaskGrid',
		component: TaskGrid,
		tags: ['autodocs']
	});

	const noop = () => {};
</script>

<script lang="ts">
	let index = $state(0);
</script>

<!-- One tab stop, then arrows: the grid owns roving focus. The frame plays the
     consuming page — the --status-* palette and a capped column. -->
<Story name="Four runners" asChild>
	<div class="frame">
		<TaskGrid
			tasks={runningTasks}
			{index}
			onSelect={(next) => (index = next)}
			onOpen={noop}
			onPeekRelease={noop}
		/>
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		max-width: 26rem;
		height: 30rem;
		display: flex;
		flex-direction: column;

		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);
	}
</style>
