<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ScaleControl from '../../components/tasks/ScaleControl.svelte';
	import type { TaskScale } from '../../components/tasks/types.js';

	const { Story } = defineMeta({
		title: 'Tasks/ScaleControl',
		component: ScaleControl,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let scale = $state<TaskScale>('grid');
</script>

<!-- Both scales named on screen at all times: no hidden mode, nothing to guess
     at, and 48px segments at every width. -->
<Story name="Default" asChild>
	<div class="frame">
		<ScaleControl {scale} onchange={(next) => (scale = next)} />
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		max-width: 24rem;
		display: flex;
		flex-direction: column;
	}
</style>
