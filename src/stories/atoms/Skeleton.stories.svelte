<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Skeleton from '../../components/atoms/Skeleton.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/Skeleton',
		component: Skeleton,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['rectangle', 'circle', 'text']
			},
			width: { control: { type: 'text' } },
			height: { control: { type: 'text' } },
			size: { control: { type: 'text' } },
			lines: { control: { type: 'number' } },
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			}
		}
	});
</script>

<Story name="Rectangle" asChild args={{ variant: 'rectangle', width: '100%', height: '3rem', theme: 'public' }}>
	<div style="padding: 1rem; width: 300px;">
		<Skeleton variant="rectangle" width="100%" height="3rem" theme="public" />
	</div>
</Story>

<Story name="Circle" asChild args={{ variant: 'circle', size: '48px', theme: 'public' }}>
	<div style="padding: 1rem;">
		<Skeleton variant="circle" size="48px" theme="public" />
	</div>
</Story>

<Story name="Large Circle" asChild args={{ variant: 'circle', size: '80px', theme: 'public' }}>
	<div style="padding: 1rem;">
		<Skeleton variant="circle" size="80px" theme="public" />
	</div>
</Story>

<Story name="Text — 3 Lines" asChild args={{ variant: 'text', lines: 3, theme: 'public' }}>
	<div style="padding: 1rem; width: 300px;">
		<Skeleton variant="text" lines={3} theme="public" />
	</div>
</Story>

<Story name="Text — 5 Lines" asChild args={{ variant: 'text', lines: 5, theme: 'public' }}>
	<div style="padding: 1rem; width: 300px;">
		<Skeleton variant="text" lines={5} theme="public" />
	</div>
</Story>

<Story name="Card Placeholder" asChild args={{ variant: 'rectangle', width: '100%', height: '8rem', theme: 'public' }}>
	<div style="padding: 1rem; width: 300px; display: flex; flex-direction: column; gap: 0.75rem;">
		<Skeleton variant="rectangle" width="100%" height="8rem" theme="public" />
		<Skeleton variant="text" lines={2} theme="public" />
	</div>
</Story>

<Story name="Admin Rectangle" asChild args={{ variant: 'rectangle', width: '100%', height: '2rem', theme: 'admin' }}>
	<div style="padding: 1rem; width: 300px;">
		<Skeleton variant="rectangle" width="100%" height="2rem" theme="admin" />
	</div>
</Story>

<Story name="Admin Text" asChild args={{ variant: 'text', lines: 3, theme: 'admin' }}>
	<div style="padding: 1rem; width: 300px;">
		<Skeleton variant="text" lines={3} theme="admin" />
	</div>
</Story>
