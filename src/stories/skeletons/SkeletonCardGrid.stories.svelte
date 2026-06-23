<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SkeletonCardGrid from '../../components/skeletons/SkeletonCardGrid.svelte';

	const { Story } = defineMeta({
		title: 'Skeletons/SkeletonCardGrid',
		component: SkeletonCardGrid,
		tags: ['autodocs'],
		argTypes: {
			count: { control: { type: 'number' } }
		}
	});
</script>

<Story name="Default" asChild args={{ count: 6 }}>
	<SkeletonCardGrid count={6} />
</Story>

<Story name="Four Cards" asChild args={{ count: 4 }}>
	<SkeletonCardGrid count={4} />
</Story>

<Story name="Two Cards" asChild args={{ count: 2 }}>
	<SkeletonCardGrid count={2} />
</Story>

<Story name="Single Card" asChild args={{ count: 1 }}>
	<SkeletonCardGrid count={1} />
</Story>
