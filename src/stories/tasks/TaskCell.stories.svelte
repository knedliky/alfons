<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TaskCell from '../../components/tasks/TaskCell.svelte';
	import { runningTasks } from './sample.js';

	const { Story } = defineMeta({
		title: 'Tasks/TaskCell',
		component: TaskCell,
		tags: ['autodocs']
	});

	const noop = () => {};
</script>

<!-- The frame plays the consuming page: it declares the --status-* palette and
     the cell's grid-sized footprint. The cell holds two targets — the plate
     opens at full size, the floor row peeks the release. -->
<Story name="Current" asChild>
	<div class="frame">
		<TaskCell
			task={runningTasks[1]}
			position={2}
			total={runningTasks.length}
			current={true}
			onopen={noop}
			onpeek={noop}
			onkeydown={noop}
		/>
	</div>
</Story>

<Story name="Not current" asChild>
	<div class="frame">
		<TaskCell
			task={runningTasks[0]}
			position={1}
			total={runningTasks.length}
			current={false}
			onopen={noop}
			onpeek={noop}
			onkeydown={noop}
		/>
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		max-width: 13rem;
		height: 14rem;
		display: flex;

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
