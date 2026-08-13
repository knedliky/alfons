<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ReleaseBody from '../../components/tasks/ReleaseBody.svelte';
	import { release, releaseIndexEntry } from './sample.js';

	const { Story } = defineMeta({
		title: 'Tasks/ReleaseBody',
		component: ReleaseBody,
		tags: ['autodocs'],
		argTypes: {
			context: {
				control: { type: 'select' },
				options: ['peek', 'place']
			}
		}
	});

	const noop = () => {};
</script>

<!-- Every task, every status: a release shown as only its runners would be a
     lie about the release. The frame plays the consuming page and declares the
     full --status-* palette. -->
<Story name="As a place" asChild>
	<div class="frame">
		<ReleaseBody {release} context="place" onPeekProject={noop} />
	</div>
</Story>

<!-- The peek withholds only the tags: at 60% of a phone's height they pushed
     the first task rows below the fold, and the tasks are what a glance is
     for. -->
<Story name="As a peek" asChild>
	<div class="frame">
		<ReleaseBody {release} context="peek" onPeekProject={noop} />
	</div>
</Story>

<Story name="Tasks not loaded" asChild>
	<div class="frame">
		<ReleaseBody release={releaseIndexEntry} context="peek" onPeekProject={noop} />
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		max-width: 24rem;

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
