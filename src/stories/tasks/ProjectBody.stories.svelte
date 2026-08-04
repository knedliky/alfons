<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProjectBody from '../../components/tasks/ProjectBody.svelte';
	import { project, projectReleases } from './sample.js';

	const { Story } = defineMeta({
		title: 'Tasks/ProjectBody',
		component: ProjectBody,
		tags: ['autodocs']
	});

	const noop = () => {};
</script>

<!-- One line about the project, then its releases as peekable destination
     rows — nothing else, because anything more is a corpus browser. -->
<Story name="Default" asChild>
	<div class="frame">
		<ProjectBody {project} releases={projectReleases} onPeekRelease={noop} />
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		max-width: 24rem;
	}
</style>
