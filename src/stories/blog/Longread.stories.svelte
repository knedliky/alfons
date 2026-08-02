<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import LongreadArticle from '../../components/blog/LongreadArticle.svelte';
	import LongreadHero from '../../components/blog/LongreadHero.svelte';
	import LongreadSection from '../../components/blog/LongreadSection.svelte';
	import LongreadProse from '../../components/blog/LongreadProse.svelte';
	import LongreadFigure from '../../components/blog/LongreadFigure.svelte';
	import LongreadStatBand from '../../components/blog/LongreadStatBand.svelte';

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
