<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Popover from '../../components/overlays/Popover.svelte';
	import Button from '../../components/atoms/Button.svelte';

	const { Story } = defineMeta({
		title: 'Overlays/Popover',
		component: Popover,
		tags: ['autodocs'],
		argTypes: {
			align: {
				control: { type: 'select' },
				options: ['start', 'end']
			},
			width: { control: { type: 'text' } }
		}
	});
</script>

<Story name="Default" asChild>
	<div style="min-height: 240px">
		<Popover>
			{#snippet trigger()}
				<Button variant="secondary">Details</Button>
			{/snippet}
			<p style="margin: 0">
				An anchored floating panel with arbitrary content — richer than a tooltip.
			</p>
		</Popover>
	</div>
</Story>

<Story name="Fixed Width" asChild>
	<div style="min-height: 240px">
		<Popover width="18rem">
			{#snippet trigger()}
				<Button variant="ghost">What is this?</Button>
			{/snippet}
			<p style="margin: 0 0 var(--space-2); color: var(--text-primary); font-weight: 600">
				Automatability score
			</p>
			<p style="margin: 0">
				A weighted blend of task-level exposure estimates across the occupation's activity mix.
			</p>
		</Popover>
	</div>
</Story>
