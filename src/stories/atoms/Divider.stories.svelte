<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Divider from '../../components/atoms/Divider.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Divider',
		component: Divider,
		tags: ['autodocs'],
		argTypes: {
			orientation: {
				control: { type: 'select' },
				options: ['horizontal', 'vertical']
			},
			label: { control: { type: 'text' } },
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			}
		}
	});
</script>

<Story name="Horizontal" asChild args={{ orientation: 'horizontal', theme: 'public' }}>
	<div style="padding: 1rem; width: 100%;">
		<p style="margin-bottom: 1rem;">Content above</p>
		<Divider orientation="horizontal" theme="public" />
		<p style="margin-top: 1rem;">Content below</p>
	</div>
</Story>

<Story name="Labelled" asChild args={{ orientation: 'horizontal', label: 'or continue with', theme: 'public' }}>
	<div style="padding: 1rem; width: 100%;">
		<Divider orientation="horizontal" label="or continue with" theme="public" />
	</div>
</Story>

<Story name="Vertical" asChild args={{ orientation: 'vertical', theme: 'public' }}>
	<div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; height: 3rem;">
		<span>Left section</span>
		<Divider orientation="vertical" theme="public" />
		<span>Right section</span>
	</div>
</Story>

<Story name="Admin Horizontal" asChild args={{ orientation: 'horizontal', theme: 'admin' }}>
	<div style="padding: 1rem; width: 100%;">
		<p style="margin-bottom: 1rem;">Admin content above</p>
		<Divider orientation="horizontal" theme="admin" />
		<p style="margin-top: 1rem;">Admin content below</p>
	</div>
</Story>

<Story name="Admin Labelled" asChild args={{ orientation: 'horizontal', label: 'Section', theme: 'admin' }}>
	<div style="padding: 1rem; width: 100%;">
		<Divider orientation="horizontal" label="Section" theme="admin" />
	</div>
</Story>

<Story name="Admin Vertical" asChild args={{ orientation: 'vertical', theme: 'admin' }}>
	<div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; height: 3rem;">
		<span>Actions</span>
		<Divider orientation="vertical" theme="admin" />
		<span>Settings</span>
	</div>
</Story>
