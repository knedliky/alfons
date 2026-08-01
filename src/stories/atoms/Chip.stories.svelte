<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Chip from '../../components/atoms/Chip.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Chip',
		component: Chip,
		tags: ['autodocs'],
		argTypes: {
			fill: {
				control: { type: 'select' },
				options: ['outline', 'soft']
			},
			size: {
				control: { type: 'select' },
				options: ['default', 'sm']
			},
			colour: { control: { type: 'text' } },
			disabled: { control: { type: 'boolean' } }
		}
	});

	function noop() {
		// Storybook demo callback
	}
</script>

<Story name="Default" asChild args={{ label: 'Finance' }}>
	<Chip label="Finance" />
</Story>

<Story name="Soft Fill" asChild args={{ label: 'Finance', fill: 'soft' }}>
	<Chip label="Finance" fill="soft" colour="var(--sky-blue)" />
</Story>

<Story name="Removable" asChild>
	<div style="display: inline-flex; gap: var(--space-2)">
		<Chip label="Technology" colour="var(--sky-blue)" fill="soft" onRemove={noop} />
		<Chip label="Healthcare" colour="var(--olive-green)" fill="soft" onRemove={noop} />
		<Chip label="Legal" colour="var(--aubergine)" fill="soft" onRemove={noop} />
	</div>
</Story>

<Story name="Interactive" asChild>
	<Chip label="High exposure" onClick={noop} />
</Story>

<Story name="Small" asChild args={{ label: 'Filter', size: 'sm' }}>
	<Chip label="Filter" size="sm" onRemove={noop} />
</Story>

<Story name="Disabled" asChild args={{ label: 'Disabled', disabled: true }}>
	<Chip label="Disabled" disabled onRemove={noop} />
</Story>
