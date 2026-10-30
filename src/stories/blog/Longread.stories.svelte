<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LongreadArticle from '../../components/blog/LongreadArticle.svelte';
	import LongreadHero from '../../components/blog/LongreadHero.svelte';
	import LongreadSection from '../../components/blog/LongreadSection.svelte';
	import LongreadProse from '../../components/blog/LongreadProse.svelte';
	import LongreadFigure from '../../components/blog/LongreadFigure.svelte';
	import LongreadStatBand from '../../components/blog/LongreadStatBand.svelte';
	import LongreadProseSection from '../../components/blog/LongreadProseSection.svelte';
	import { imagesHtml, readingLede, readingSections } from './readingFixture';

	const { Story } = defineMeta({
		title: 'Blog/Longread',
		component: LongreadArticle,
		tags: ['autodocs'],
		parameters: { layout: 'fullscreen' }
	});

	const sections = [{ kicker: 'The council' }, { kicker: 'Scoring' }, { kicker: 'Findings' }];

	const proseA = `
		<p class="lead">The longread template family — promoted from Atlas after proving
		itself on the methodology page.</p>
		<p>LongreadArticle orchestrates scroll focus: an IntersectionObserver tracks a
		reading band in the upper-middle of the viewport and the progress rail follows.</p>`;

	const proseB = `
		<p>Sections register themselves through context — no prop drilling. The rail
		doubles as the article's table of contents.</p>
		<blockquote>Square corners, warm glass, and the grid reading through.</blockquote>`;

	const proseC = `
		<p>Stat bands and figures slot between prose blocks as full-width interludes.</p>`;

	const stats = [
		{ value: '923', label: 'occupations scored' },
		{ value: '19k', label: 'tasks assessed' },
		{ value: '3', label: 'judge passes' }
	];
</script>

<Story name="Full Article" asChild>
	<LongreadArticle {sections}>
		<LongreadHero
			kicker="Methodology"
			title="How the council scores an occupation"
			standfirst="A weighted blend of task-level exposure estimates, argued over by a panel of judges."
			meta={['12/07/2026', '11 min']}
		/>
		<LongreadSection title="The council" id="council">
			<LongreadProse html={proseA} />
		</LongreadSection>
		<LongreadSection title="Scoring" id="scoring">
			<LongreadProse html={proseB} />
			<LongreadStatBand {stats} />
		</LongreadSection>
		<LongreadSection title="Findings" id="findings">
			<LongreadProse html={proseC} />
			<LongreadFigure caption="the focus band follows the reading eye line">
				<div style="height: 160px; background: var(--elevation-1-bg)"></div>
			</LongreadFigure>
		</LongreadSection>
	</LongreadArticle>
</Story>

<Story name="No Rail" asChild>
	<LongreadArticle sections={[{ kicker: 'Solo' }]} showProgress={false}>
		<LongreadHero kicker="Note" title="A single-section piece" meta={['12/07/2026']} />
		<LongreadSection title="Solo" id="solo">
			<LongreadProse html={proseA} />
		</LongreadSection>
	</LongreadArticle>
</Story>

<!-- The raised sheet with the lamp rail (AL-034). View it at 1440 wide: from
     80rem the rail's lamps sit on the sheet's left edge, centred until the
     sheet's foot reaches them, then travelling with it. Below 80rem the sheet
     is the plain column and the rail hides, for ReadingFloor to take over. -->
<Story name="Sheet" asChild>
	<div class="story-sheet-ground">
		<LongreadArticle
			presentation="sheet"
			sections={readingSections.map(({ kicker }) => ({ kicker }))}
		>
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
		<p class="story-after-sheet">Related reading follows the sheet's foot.</p>
	</div>
</Story>

<!-- Images keep their natural size up to the measure and never grow taller
     than the viewport; a figure's caption sits under its image. -->
<Story name="Images" asChild>
	<LongreadArticle sections={[{ kicker: 'Images' }]} showProgress={false}>
		<LongreadProse html={imagesHtml} />
	</LongreadArticle>
</Story>

<style>
	.story-sheet-ground {
		padding: var(--space-8) var(--page-padding-x);
	}

	.story-after-sheet {
		min-height: 100vh;
		padding-top: var(--space-8);
		text-align: center;
		color: var(--text-muted);
	}
</style>
