<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import StatusMark from '../../components/atoms/StatusMark.svelte';
	import type { TaskStatus } from '../../components/atoms/StatusMark.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/StatusMark',
		component: StatusMark,
		tags: ['autodocs'],
		argTypes: {
			size: {
				control: { type: 'select' },
				options: ['default', 'lead']
			}
		}
	});

	const statuses: TaskStatus[] = [
		'pending',
		'triaged',
		'building',
		'verifying',
		'done',
		'blocked',
		'wontfix',
		'duplicate'
	];
</script>

<!-- The consuming page declares the eight --status-* properties; the mark has
     no defaults on purpose — a wrong default colour is worse than a visible
     gap. The frame below plays the page's part. -->
<Story name="All statuses" asChild>
	<div class="frame">
		{#each statuses as status (status)}
			<StatusMark {status} />
		{/each}
	</div>
</Story>

<Story name="Lead size" asChild>
	<div class="frame">
		<StatusMark status="building" size="lead" />
		<StatusMark status="verifying" size="lead" />
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		align-items: flex-start;

		/* The page-level contract, played by the story. */
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
