<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Icon from '../../components/atoms/Icon.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Icon',
		component: Icon,
		tags: ['autodocs'],
		argTypes: {
			name: {
				control: { type: 'select' },
				options: [
					'arrow-left',
					'arrow-right',
					'chevron-down',
					'chevron-right',
					'chevron-up',
					'external-link',
					'menu',
					'close',
					'search',
					'plus',
					'minus',
					'edit',
					'trash',
					'copy',
					'check',
					'warning',
					'info',
					'error',
					'eye',
					'eye-off'
				]
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'md', 'lg', 'xl']
			},
			colour: { control: { type: 'text' } }
		}
	});
</script>

<Story name="Default" asChild args={{ name: 'check', size: 'md' }}>
	<Icon name="check" size="md" />
</Story>

<Story name="Small" asChild args={{ name: 'close', size: 'sm' }}>
	<Icon name="close" size="sm" />
</Story>

<Story name="Large" asChild args={{ name: 'search', size: 'lg' }}>
	<Icon name="search" size="lg" />
</Story>

<Story name="Extra Large" asChild args={{ name: 'warning', size: 'xl' }}>
	<Icon name="warning" size="xl" />
</Story>

<Story name="Custom Colour" asChild args={{ name: 'info', size: 'lg', colour: 'var(--accent)' }}>
	<Icon name="info" size="lg" colour="var(--accent)" />
</Story>

<Story name="Navigation Icons" asChild args={{ name: 'arrow-left', size: 'md' }}>
	<div style="display: flex; gap: 1rem; align-items: center; padding: 0.5rem;">
		<Icon name="arrow-left" size="md" />
		<Icon name="arrow-right" size="md" />
		<Icon name="chevron-up" size="md" />
		<Icon name="chevron-down" size="md" />
		<Icon name="chevron-right" size="md" />
		<Icon name="external-link" size="md" />
		<Icon name="menu" size="md" />
	</div>
</Story>

<Story name="Action Icons" asChild args={{ name: 'edit', size: 'md' }}>
	<div style="display: flex; gap: 1rem; align-items: center; padding: 0.5rem;">
		<Icon name="search" size="md" />
		<Icon name="plus" size="md" />
		<Icon name="minus" size="md" />
		<Icon name="edit" size="md" />
		<Icon name="trash" size="md" />
		<Icon name="copy" size="md" />
		<Icon name="close" size="md" />
	</div>
</Story>

<Story name="Status Icons" asChild args={{ name: 'check', size: 'md' }}>
	<div style="display: flex; gap: 1rem; align-items: center; padding: 0.5rem;">
		<Icon name="check" size="md" />
		<Icon name="warning" size="md" />
		<Icon name="info" size="md" />
		<Icon name="error" size="md" />
	</div>
</Story>

<Story name="Visibility Icons" asChild args={{ name: 'eye', size: 'md' }}>
	<div style="display: flex; gap: 1rem; align-items: center; padding: 0.5rem;">
		<Icon name="eye" size="md" />
		<Icon name="eye-off" size="md" />
	</div>
</Story>
