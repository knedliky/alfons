<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SkeletonCard from '../../components/skeletons/SkeletonCard.svelte';

	const { Story } = defineMeta({
		title: 'Skeletons/SkeletonCard',
		component: SkeletonCard,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story name="Default" asChild args={{}}>
	<div style="width: 320px;">
		<SkeletonCard />
	</div>
</Story>

<Story name="In Grid Context" asChild args={{}}>
	<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; max-width: 680px;">
		<SkeletonCard />
		<SkeletonCard />
		<SkeletonCard />
		<SkeletonCard />
	</div>
</Story>
