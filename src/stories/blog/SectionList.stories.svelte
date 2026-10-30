<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SectionList from '../../components/blog/SectionList.svelte';
	import { readingSections } from './readingFixture';

	const { Story } = defineMeta({
		title: 'Blog/SectionList',
		component: SectionList,
		tags: ['autodocs'],
		argTypes: {
			activeIndex: { control: { type: 'number', min: -1, max: readingSections.length - 1 } }
		}
	});
</script>

<!-- The third section is current: its number takes the accent. -->
<Story name="Current section" asChild>
	<div class="story-frame">
		<SectionList sections={readingSections} activeIndex={2} />
	</div>
</Story>

<!-- Before the first section nothing is marked current. -->
<Story name="Opening" asChild>
	<div class="story-frame">
		<SectionList sections={readingSections} activeIndex={-1} />
	</div>
</Story>

<style>
	.story-frame {
		max-width: 24rem;
		padding: var(--space-5);
	}
</style>
