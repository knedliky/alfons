<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TaskCard from '../../components/tasks/TaskCard.svelte';
	import { runningTasks } from './sample.js';

	const { Story } = defineMeta({
		title: 'Tasks/TaskCard',
		component: TaskCard,
		tags: ['autodocs']
	});

	const noop = () => {};
</script>

<!-- The frame plays the consuming page: it declares the --status-* palette
     StatusMark requires and gives the card the phone-shaped height it spends. -->
<Story name="Verifying" asChild>
	<div class="frame">
		<TaskCard
			task={runningTasks[0]}
			position={1}
			total={runningTasks.length}
			onPeekRelease={noop}
			onPeekProject={noop}
		/>
	</div>
</Story>

<Story name="Building, no verdict yet" asChild>
	<div class="frame">
		<TaskCard
			task={runningTasks[1]}
			position={2}
			total={runningTasks.length}
			onPeekRelease={noop}
			onPeekProject={noop}
		/>
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		max-width: 24rem;
		height: 36rem;

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
