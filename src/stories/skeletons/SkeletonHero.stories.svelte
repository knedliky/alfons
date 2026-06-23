<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SkeletonHero from '../../components/skeletons/SkeletonHero.svelte';

	const { Story } = defineMeta({
		title: 'Skeletons/SkeletonHero',
		component: SkeletonHero,
		tags: ['autodocs'],
		argTypes: {}
	});
</script>

<Story name="Default" asChild args={{}}>
	<SkeletonHero />
</Story>

<Story name="With Card Grid Below" asChild args={{}}>
	<div>
		<SkeletonHero />
		<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem; margin-top: 1.25rem;">
			<div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--card-radius); height: 160px;"></div>
			<div style="background: var(--card-bg); border: 1px solid var(--card-border); border-radius: var(--card-radius); height: 160px;"></div>
		</div>
	</div>
</Story>
