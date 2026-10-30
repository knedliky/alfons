<script lang="ts">
	/**
	 * Article page — approach 3 of 5: Contents margin.
	 *
	 * The page is a grid, and the grid is the design. On a wide screen it has
	 * three tracks: a contents column on the left whose list sticks while the
	 * essay scrolls, the reading measure in the middle, and a margin lane on
	 * the right where every figure's caption is set beside its image. Nothing
	 * floats over the text: the contents live in their own column, so they can
	 * never cross a line, the back link sits in the flow above the kicker, and
	 * the contents column is also the one that runs under the agent pill in
	 * the bottom-left corner. Between tablet and desktop the margin lane folds
	 * away and captions return under their figures. On a phone it is one
	 * column, with the contents folded into a single row under the title and
	 * a bottom margin band reserved for the pill.
	 */
	import {
		BackLink,
		Card,
		EmptyState,
		Footer,
		Grid,
		Header,
		LongreadHero,
		LongreadProse,
		LongreadProseSection,
		PageFrame,
		PageSection,
		SectionHeader
	} from '@alfons/design';
	import AgentPillStandIn from '../shared/AgentPillStandIn.svelte';
	import { article } from '../shared/article';
	import ContentsNav, { type ContentsEntry } from './ContentsNav.svelte';

	interface RelatedArticle {
		href: string;
		category: string;
		title: string;
		publishedLabel: string;
	}

	// Static stand-ins: the round keeps the related block's content and only
	// changes its layout.
	const relatedArticles: RelatedArticle[] = [
		{
			href: '/blog/the-interface-is-the-product',
			category: 'Essay',
			title: 'The interface is the product',
			publishedLabel: '2 February 2026'
		},
		{
			href: '/blog/what-a-tokeniser-taught-me',
			category: 'Notes',
			title: 'What building a tokeniser taught me',
			publishedLabel: '14 April 2026'
		},
		{
			href: '/blog/robots-from-prague',
			category: 'Essay',
			title: 'Robots from Prague',
			publishedLabel: '9 June 2026'
		}
	];

	function slugify(text: string): string {
		return text
			.toLowerCase()
			.replace(/[’']/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-|-$/g, '');
	}

	const sections = article.sections.map((section) => ({
		...section,
		id: slugify(section.kicker)
	}));

	const contentsEntries: ContentsEntry[] = sections.map(({ id, kicker }) => ({ id, label: kicker }));

	const heroMeta = [article.publishedLabel, `${article.readingTime} min read`];

	// The contents column exists from 48rem up; below that it folds into one row.
	const twoColumnQuery = window.matchMedia('(min-width: 48rem)');
	let hasContentsColumn = $state(twoColumnQuery.matches);

	$effect(() => {
		const update = () => (hasContentsColumn = twoColumnQuery.matches);
		twoColumnQuery.addEventListener('change', update);
		return () => twoColumnQuery.removeEventListener('change', update);
	});

	let activeSectionId = $state<string | null>(null);

	// The focus band sits on the upper part of the viewport, where the eye
	// reads, so the marked section changes as its heading passes that line.
	$effect(() => {
		const sectionElements = sections
			.map(({ id }) => document.getElementById(id))
			.filter((element): element is HTMLElement => element !== null);
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) activeSectionId = entry.target.id;
				}
			},
			{ rootMargin: '-25% 0px -65% 0px' }
		);
		for (const element of sectionElements) observer.observe(element);
		return () => observer.disconnect();
	});
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}
	<div class="article-page">
		<PageSection>
			<article class="article-grid">
				<div class="article-grid__back">
					<BackLink href="/blog" label="Back to Blog" />
				</div>

				<div class="article-grid__hero">
					<LongreadHero
						kicker={article.category}
						title={article.title}
						standfirst={article.standfirst}
						meta={heroMeta}
					/>
				</div>

				<aside class="article-grid__contents">
					<div class="contents-column">
						<ContentsNav
							entries={contentsEntries}
							activeId={activeSectionId}
							collapsible={!hasContentsColumn}
						/>
					</div>
				</aside>

				<div class="article-grid__body article-body" data-article-body>
					<LongreadProse html={article.ledeHtml} />
					{#each sections as section (section.id)}
						<div id={section.id} class="article-body__section">
							<LongreadProseSection kicker={section.kicker} html={section.html} />
						</div>
					{/each}
				</div>

				<div class="article-grid__after">
					<section aria-label="Related reading">
						<SectionHeader title="Related reading" align="left" spacing="compact" />
						<Grid columns={{ base: 1, md: 3 }} gap="md" justify="stretch">
							{#each relatedArticles as related (related.href)}
								<Card as="a" variant="interactive" size="compact" href={related.href}>
									<h3 class="related__title">{related.title}</h3>
									<p class="mcn-spec related__spec">
										{related.category} · {related.publishedLabel}
									</p>
								</Card>
							{/each}
						</Grid>
					</section>

					<section aria-label="Comments">
						<SectionHeader title="Comments" align="left" spacing="compact" />
						<EmptyState
							icon="messages"
							title="No comments yet"
							message="Sign in to start the conversation on this essay."
						/>
					</section>
				</div>
			</article>
		</PageSection>
		<div class="pill-foot" aria-hidden="true"></div>
	</div>
	<AgentPillStandIn />
</PageFrame>

<style>
	.article-page {
		/* The site header is fixed; PageSection's own top padding clears its
		   phone height, and this adds the breath below it. */
		padding-top: var(--space-4);
	}

	/* The phone's bottom margin. The agent pill owns the bottom-left corner
	   and spans half the column, so no layout of the text alone can keep
	   lines out from under it. This band reserves the strip the pill sits
	   on: it sticks to the viewport foot while the article is on screen, so
	   lines end above it the way they start below the header, and at the end
	   of the article it settles into the flow as the page's bottom room. */
	.pill-foot {
		position: sticky;
		bottom: 0;
		z-index: var(--z-sticky);
		height: var(--space-8);
		background: var(--surface-page);
		border-top: 1px solid var(--border-hairline);
	}

	/* Phone: one column, in reading order. */
	.article-grid {
		--contents-width: 13rem;
		--reading-measure: 40rem;
		--margin-lane: 12rem;
		--column-gap: var(--space-7);

		display: grid;
		grid-template-columns: minmax(0, 1fr);
		/* Source order is back, hero, contents, body, after: the phone reads it
		   straight down; wider grids lift the contents into their own column. */
		grid-template-areas:
			'back'
			'hero'
			'contents'
			'body'
			'after';
		row-gap: var(--space-5);
	}

	.article-grid__back {
		grid-area: back;
	}

	.article-grid__hero {
		grid-area: hero;
	}

	.article-grid__contents {
		grid-area: contents;
	}

	.article-grid__body {
		grid-area: body;
		min-width: 0;
	}

	.article-grid__after {
		grid-area: after;
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
		margin-top: var(--space-7);
		padding-top: var(--space-7);
		border-top: 1px solid var(--border-hairline);
	}

	/* The hero sits on the grid's start edge, not the centred axis LongreadHero
	   assumes: the title, standfirst and lede share one left line. */
	.article-grid__hero :global(.longread-hero) {
		text-align: start;
		padding: 0;
	}

	.article-grid__hero :global(.longread-hero .hero-standfirst) {
		margin-inline: 0;
	}

	/* Every image is sized to its content: never wider than its natural width,
	   never wider than the measure, never taller than the viewport. */
	.article-body :global(.longread-prose figure img),
	.article-body :global(.longread-prose p > img) {
		width: auto;
		max-width: 100%;
		height: auto;
		max-height: 75dvh;
		margin: 0;
	}

	.article-body :global(.longread-prose figure) {
		margin: var(--space-6) 0;
	}

	.article-body :global(.longread-prose figcaption) {
		max-width: var(--margin-lane);
		margin-top: var(--space-3);
		padding-top: var(--space-2);
		border-top: 1px solid var(--border-hairline);
		font: var(--type-small);
		color: var(--text-muted);
	}

	.article-body__section {
		scroll-margin-top: calc(var(--header-height) + var(--space-5));
	}

	.related__title {
		margin: 0 0 var(--space-4);
		font: var(--type-h3);
		color: var(--text-primary);
	}

	.related__spec {
		margin: 0;
		color: var(--text-muted);
	}

	/* Tablet and up: the contents get their own column, sticky beside the body. */
	@media (min-width: 48rem) {
		.article-page {
			padding-top: var(--space-7);
		}

		/* From here the pill sits under the contents column, never the text. */
		.pill-foot {
			display: none;
		}

		.article-grid {
			grid-template-columns: var(--contents-width) minmax(0, var(--reading-measure));
			grid-template-areas:
				'contents back'
				'contents hero'
				'contents body'
				'contents after';
			column-gap: var(--column-gap);
			justify-content: center;
		}

		/* The column stretches the full height of the body so its list can
		   stick; the list stops short of the viewport foot, leaving the
		   bottom-left corner to the agent pill. */
		.contents-column {
			position: sticky;
			top: calc(var(--header-height) + var(--space-5));
			max-height: calc(100dvh - var(--header-height) - var(--space-5) - var(--space-9));
			overflow-y: auto;
		}
	}

	/* Desktop: a third track, the margin lane, takes the captions. Figures
	   reach across the lane gap into it; the image keeps the measure and the
	   caption sits beside the image's top edge. */
	@media (min-width: 75rem) {
		.article-grid {
			grid-template-columns:
				var(--contents-width) minmax(0, var(--reading-measure))
				var(--margin-lane);
			grid-template-areas:
				'contents back back'
				'contents hero hero'
				'contents body .'
				'contents after after';
		}

		.article-body :global(.longread-prose) {
			max-width: none;
		}

		.article-body :global(.longread-prose figure) {
			display: grid;
			grid-template-columns: minmax(0, 1fr) var(--margin-lane);
			column-gap: var(--column-gap);
			align-items: start;
			margin-right: calc(-1 * (var(--margin-lane) + var(--column-gap)));
		}

		.article-body :global(.longread-prose figcaption) {
			grid-column: 2;
			grid-row: 1;
			margin-top: 0;
		}
	}
</style>
