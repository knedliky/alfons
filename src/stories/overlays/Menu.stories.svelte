<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Menu from '../../components/overlays/Menu.svelte';
	import Button from '../../components/atoms/Button.svelte';

	const { Story } = defineMeta({
		title: 'Overlays/Menu',
		component: Menu,
		tags: ['autodocs'],
		argTypes: {
			align: {
				control: { type: 'select' },
				options: ['start', 'end']
			}
		}
	});

	function noop() {
		// Storybook demo callback
	}

	const actions = [
		{ label: 'Edit', onSelect: noop, shortcut: 'E' },
		{ label: 'Duplicate', onSelect: noop },
		'separator' as const,
		{ label: 'Archive', onSelect: noop, disabled: true },
		{ label: 'Delete', onSelect: noop, danger: true }
	];
</script>

<Story name="Default" asChild>
	<div style="min-height: 260px">
		<Menu items={actions}>
			{#snippet trigger()}
				<Button variant="secondary">Actions</Button>
			{/snippet}
		</Menu>
	</div>
</Story>

<Story name="End Aligned" asChild>
	<div style="min-height: 260px; display: flex; justify-content: flex-end">
		<Menu items={actions} align="end">
			{#snippet trigger()}
				<Button variant="ghost">More</Button>
			{/snippet}
		</Menu>
	</div>
</Story>
