<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ReadingFloor from '../../components/blog/ReadingFloor.svelte';
	import SectionList from '../../components/blog/SectionList.svelte';
	import LongreadArticle from '../../components/blog/LongreadArticle.svelte';
	import LongreadHero from '../../components/blog/LongreadHero.svelte';
	import LongreadProse from '../../components/blog/LongreadProse.svelte';
	import LongreadProseSection from '../../components/blog/LongreadProseSection.svelte';
	import PeekSheet from '../../components/overlays/PeekSheet.svelte';
	import { readingLede, readingSections } from './readingFixture';

	const { Story } = defineMeta({
		title: 'Blog/ReadingFloor',
		component: ReadingFloor,
		tags: ['autodocs'],
		parameters: { layout: 'fullscreen' }
	});

	const sections = readingSections.map(({ kicker }) => ({ kicker }));
</script>

<script lang="ts">
	let activeIndex = $state(-1);
	let progress = $state(0);
	let contentsOpen = $state(false);

	function jumpTo(index: number): void {
		contentsOpen = false;
		// The article is inert while the sheet is up; let it come back first.
		requestAnimationFrame(() => {
			document
				.getElementById(readingSections[index].id)
				?.scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	}
</script>

<!-- The whole article page on a phone (view it at 375 wide). The document
     scrolls; the floor is fixed to the viewport's foot and its in-flow
     reserve keeps the last line clear of it. The dashed box stands in for
     the site's agent pill, whose corner the floor leaves free through
     --reading-floor-clearance. Scroll down to sink the controls, up to raise
     them; the contents control opens a PeekSheet holding a SectionList. -->
<Story name="Article page" asChild>
	<div
		class="story-page"
		style:--reading-floor-height="4.5rem"
		style:--reading-floor-clearance="14rem"
	>
		<div class="story-article" inert={contentsOpen}>
			<LongreadArticle presentation="sheet" {sections} bind:activeIndex bind:progress>
				<LongreadHero
					kicker="Essay"
					title="I'm building a personal agent"
					standfirst="Notes on trust, ledgers and the page that explains them."
					meta={['2026-10-30', '8 min read']}
				/>
				<LongreadProse html={readingLede} />
				{#each readingSections as section (section.id)}
					<LongreadProseSection id={section.id} kicker={section.kicker} html={section.html} />
				{/each}
			</LongreadArticle>
		</div>

		<ReadingFloor
			{progress}
			{activeIndex}
			{sections}
			backHref="#"
			{contentsOpen}
			onOpenContents={() => (contentsOpen = true)}
		/>

		<div class="story-pill" aria-hidden="true">agent pill</div>

		{#if contentsOpen}
			<PeekSheet
				rank="Contents"
				name="I'm building a personal agent"
				commitLabel="Back to the top"
				reducedMotion={false}
				onCommit={() => {
					contentsOpen = false;
					window.scrollTo({ top: 0, behavior: 'smooth' });
				}}
				onDismiss={() => (contentsOpen = false)}
			>
				<SectionList sections={readingSections} {activeIndex} onPick={jumpTo} />
			</PeekSheet>
		{/if}
	</div>
</Story>

<style>
	.story-article {
		padding: var(--space-6) var(--page-padding-x-mobile) 0;
	}

	/* Where the site's agent pill sits: fixed bottom left, above the floor. */
	.story-pill {
		position: fixed;
		left: var(--space-4);
		bottom: var(--space-4);
		z-index: var(--z-widget);
		width: 12rem;
		height: 2.5rem;
		display: grid;
		place-items: center;
		border: 1px dashed var(--border-hairline);
		border-radius: var(--radius-pill);
		font-family: var(--font-monospace);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
