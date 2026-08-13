<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import NothingRunning from '../../components/tasks/NothingRunning.svelte';
	import { projectReleases } from './sample.js';

	const { Story } = defineMeta({
		title: 'Tasks/NothingRunning',
		component: NothingRunning,
		tags: ['autodocs']
	});

	const noop = () => {};
	const checkedAt = new Date();
</script>

<!-- The empty state is the primary design of a page that is empty most of the
     time. The statement keeps the display type; the releases beneath are
     offered as glances so emptiness is not a dead end; and nothing here takes
     a status colour, because nothing here is running. -->
<Story name="Default" asChild>
	<div class="frame">
		<NothingRunning {checkedAt} releases={projectReleases} onPeekRelease={noop} />
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		max-width: 24rem;
		height: 32rem;
		display: flex;
		flex-direction: column;
	}
</style>
