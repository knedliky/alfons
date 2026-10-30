<script lang="ts">
	/**
	 * Article page — approach 1 of 5: Quiet column.
	 *
	 * One centred reading column and nothing else. No raised sheet, no rail, no
	 * fixed or sticky element of the page's own: the back link opens the column
	 * in the flow, the section contents are an inline numbered list under the
	 * opener, and related articles and comments follow the essay as ruled end
	 * matter. Restraint and typography carry the whole design; the only thing
	 * floating is the site's agent pill, which this page cannot move, so the
	 * column leaves it a clear floor at the end of the page.
	 */
	import {
		BackLink,
		Container,
		Footer,
		Header,
		LongreadHero,
		LongreadProse,
		LongreadProseSection,
		PageFrame,
		PageSection
	} from '@alfons/design';
	import { article } from '../shared/article';
	import AgentPillStandIn from '../shared/AgentPillStandIn.svelte';
	import ArticleContents, { type ContentsEntry } from './ArticleContents.svelte';
	import CommentsPlaceholder from './CommentsPlaceholder.svelte';
	import RelatedArticles, { type RelatedArticle } from './RelatedArticles.svelte';

	/** Section anchors come from the kicker, which is unique within an article. */
	function anchorFor(kicker: string): string {
		return kicker
			.toLowerCase()
			.replace(/[’']/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	const sections = article.sections.map((section) => ({
		...section,
		id: anchorFor(section.kicker)
	}));

	const contents: ContentsEntry[] = sections.map((section) => ({
		id: section.id,
		label: section.kicker
	}));

	// Static stand-ins: the round explores where related articles sit, not
	// which ones the site picks.
	const related: RelatedArticle[] = [
		{
			slug: 'what-a-motif-is-for',
			category: 'Essay',
			title: 'What a motif is for',
			publishedLabel: '2 February 2026'
		},
		{
			slug: 'the-labour-market-in-one-chart',
			category: 'Experiment',
			title: 'The labour market in one chart',
			publishedLabel: '11 January 2026'
		},
		{
			slug: 'notes-on-local-first-agents',
			category: 'Notes',
			title: 'Notes on local-first agents',
			publishedLabel: '28 November 2025'
		}
	];
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}
	<PageSection>
		<Container maxWidth="sm" padding={false}>
			<article class="quiet-column">
				<BackLink href="/blog" label="Back to Blog" />

				<LongreadHero
					kicker={article.category}
					title={article.title}
					standfirst={article.standfirst}
					meta={[article.publishedLabel, `${article.readingTime} min read`]}
				/>

				<ArticleContents entries={contents} />

				<div class="quiet-column__body" data-article-body>
					<LongreadProse html={article.ledeHtml} />
					{#each sections as section (section.id)}
						<div class="quiet-column__anchor" id={section.id}>
							<LongreadProseSection kicker={section.kicker} html={section.html} />
						</div>
					{/each}
				</div>

				<footer class="quiet-column__end-matter">
					<RelatedArticles articles={related} />
					<CommentsPlaceholder count={3} />
				</footer>
			</article>
		</Container>
	</PageSection>
</PageFrame>

<AgentPillStandIn />

<style>
	/* 36rem holds the lead-size serif near 65 characters a line on a desktop. */
	.quiet-column {
		max-width: 36rem;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		/* The agent pill floats at the bottom left of every viewport; the column
		   ends on a floor tall enough that its last line can scroll clear of it. */
		padding-bottom: var(--space-9);
	}

	/* LongreadHero centres itself with its own top padding; in a quiet column the
	   back link already opens the page, so the opener sits directly below it. */
	.quiet-column :global(.longread-hero) {
		padding-top: 0;
		padding-bottom: 0;
		margin: 0 auto;
	}

	.quiet-column__body {
		display: flex;
		flex-direction: column;
	}

	/* Typography is the whole design here, so the body steps up from the
	   template's body size to lead size: about 45 characters a line on a phone
	   and near 65 on a desktop, the comfortable range for long-form reading. */
	.quiet-column__body :global(.longread-prose p),
	.quiet-column__body :global(.longread-prose li) {
		font-size: var(--text-lead);
	}

	.quiet-column__anchor {
		scroll-margin-top: var(--scroll-margin-top);
	}

	/* Figures: an image keeps its natural size, never wider than the column,
	   never taller than most of the viewport, centred with its caption under
	   it. LongreadProse stretches every image to the full measure, which turns
	   a 192 by 256 logo into a column-wide block; this restores natural size. */
	.quiet-column__body :global(figure) {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: var(--space-7) 0;
	}

	.quiet-column__body :global(.longread-prose img) {
		width: auto;
		max-width: 100%;
		height: auto;
		max-height: 80dvh;
		margin: 0;
	}

	.quiet-column__body :global(figcaption) {
		max-width: 32rem;
		text-align: center;
	}

	.quiet-column__end-matter {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		padding-top: var(--space-7);
		border-top: 1px solid var(--border-default);
	}
</style>
