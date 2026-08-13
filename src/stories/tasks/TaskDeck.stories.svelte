<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TaskDeck from '../../components/tasks/TaskDeck.svelte';
	import { runningTasks } from './sample.js';

	const { Story } = defineMeta({
		title: 'Tasks/TaskDeck',
		component: TaskDeck,
		tags: ['autodocs']
	});

	const noop = () => {};
</script>

<script lang="ts">
	let index = $state(0);
</script>

<!-- Swipe, the rail's ticks and arrows all drive the same index. The frame
     plays the consuming page: the --status-* palette and a phone-shaped
     column. -->
<Story name="Default" asChild>
	<div class="frame">
		<TaskDeck
			tasks={runningTasks}
			{index}
			onSelect={(next) => (index = next)}
			onPeekRelease={noop}
			onPeekProject={noop}
		/>
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		max-width: 24rem;
		height: 38rem;
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
