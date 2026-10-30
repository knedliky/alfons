<script lang="ts">
	/**
	 * Article page — approach 4 of 5: Figures lead.
	 *
	 * A narrow reading column with the figures breaking out of it: each image
	 * sits in a wide frame with its caption, centred at no more than its
	 * natural size and never taller than the viewport, so the essay reads as
	 * text punctuated by full-screen moments. Nothing floats beside the text.
	 * The only navigation is a hairline progress bar laid along the header's
	 * bottom edge, and the back link sits in the flow above the title.
	 */
	import {
		BackLink,
		Card,
		EmptyState,
		Footer,
		Grid,
		Header,
		LongreadArticle,
		LongreadFigure,
		LongreadHero,
		LongreadProse,
		PageFrame,
		SectionHeader
	} from '@alfons/design';
	import AgentPillStandIn from '../shared/AgentPillStandIn.svelte';
	import { article } from '../shared/article';
	import ReadingProgress from './ReadingProgress.svelte';
	import { countFigures, splitIntoScenes, type Scene } from './scenes';

	interface RelatedArticle {
		category: string;
		title: string;
		publishedLabel: string;
		href: string;
	}

	// Stand-ins: the related list keeps its content in production; only its layout is being tried.
	const relatedArticles: RelatedArticle[] = [
		{
			category: 'Experiment',
			title: 'How Merlin scores an occupation',
			publishedLabel: '2 February 2026',
			href: '#'
		},
		{
			category: 'Essay',
			title: 'A design system with one customer',
			publishedLabel: '14 January 2026',
			href: '#'
		},
		{
			category: 'Notes',
			title: 'What my typing says about my thinking',
			publishedLabel: '9 December 2025',
			href: '#'
		}
	];

	// The lede opens with the cover; it is lifted out to sit under the title.
	const ledeScenes = splitIntoScenes(article.ledeHtml);
	const cover = ledeScenes[0]?.kind === 'figure' ? ledeScenes[0] : undefined;
	const ledeBody = cover ? ledeScenes.slice(1) : ledeScenes;

	const sectionScenes: { kicker: string; scenes: Scene[] }[] = [];
	let nextFigureNumber = countFigures(ledeScenes) + 1;
	for (const section of article.sections) {
		const scenes = splitIntoScenes(section.html, nextFigureNumber);
		nextFigureNumber += countFigures(scenes);
		sectionScenes.push({ kicker: section.kicker, scenes });
	}

	function figureCaption(number: number, caption?: string): string {
		return caption ? `Fig. ${number} · ${caption}` : `Fig. ${number}`;
	}

	let articleElement = $state<HTMLElement>();
</script>

{#snippet frame(figure: Extract<Scene, { kind: 'figure' }>)}
	<LongreadFigure caption={figureCaption(figure.number, figure.caption)}>
		<div class="screen">
			<img class="frame-image" src={figure.src} alt={figure.alt} loading="lazy" decoding="async" />
		</div>
	</LongreadFigure>
{/snippet}

{#snippet scenes(list: Scene[])}
	{#each list as scene, index (index)}
		{#if scene.kind === 'figure'}
			<div class="lane lane-figure">{@render frame(scene)}</div>
		{:else}
			<div class="lane lane-text"><LongreadProse html={scene.html} /></div>
		{/if}
	{/each}
{/snippet}

<PageFrame>
	{#snippet header()}
		<Header />
		<ReadingProgress target={articleElement} />
	{/snippet}
	{#snippet footer()}<Footer />{/snippet}

	<div class="reel" bind:this={articleElement}>
		<LongreadArticle sections={sectionScenes} showProgress={false}>
			<div class="lane lane-chrome slate">
				<BackLink href="/blog" label="Back to Blog" />
			</div>

			<div class="lane lane-chrome lane-hero">
				<LongreadHero
					kicker={article.category}
					title={article.title}
					standfirst={article.standfirst}
					meta={[article.publishedLabel, `${article.readingTime} min read`]}
				/>
			</div>

			{#if cover}
				<div class="lane lane-cover">{@render frame(cover)}</div>
			{/if}

			{@render scenes(ledeBody)}

			{#each sectionScenes as section (section.kicker)}
				<section class="passage" aria-label={section.kicker}>
					{@render scenes(section.scenes)}
				</section>
			{/each}

			<p class="lane lane-text end-mark">End · {article.readingTime} min read</p>

			<section class="lane lane-chrome after-reading" aria-label="Related articles">
				<SectionHeader title="Read next" align="left" spacing="compact" />
				<Grid columns={{ base: 1, md: 3 }} gap="md">
					{#each relatedArticles as related (related.title)}
						<Card as="a" href={related.href} variant="interactive">
							<p class="related-kicker">{related.category}</p>
							<h3 class="related-title">{related.title}</h3>
							<p class="related-date">{related.publishedLabel}</p>
						</Card>
					{/each}
				</Grid>
			</section>

			<section class="lane lane-text after-reading" aria-label="Comments">
				<SectionHeader title="Comments" align="left" spacing="compact" />
				<EmptyState
					icon="messages"
					title="No comments yet"
					message="Replies to this essay will appear here."
				/>
			</section>
		</LongreadArticle>
	</div>

	<AgentPillStandIn />
</PageFrame>

<style>
	/* Four measures on one axis: a narrow column for reading, the header's
	   row for page furniture, a wide screen for figures and a wider one still
	   for the cover. On a phone they all collapse to the viewport less a
	   gutter, and the figures lose theirs to run edge to edge. */
	.reel {
		--measure-text: 36rem;
		--measure-chrome: 64rem;
		--measure-figure: 72rem;
		--measure-cover: 80rem;
		--gutter-text: var(--page-padding-x);
		--gutter-figure: var(--page-padding-x-mobile);
		/* One screen: the viewport below the header, less room for the frame's
		   padding and caption, so a whole frame always fits on screen at once. */
		--screen-height: calc(100dvh - var(--header-height) - var(--space-9) - var(--space-5));
		/* Leaves the agent pill its corner below the last block of the page. */
		padding-bottom: var(--space-9);
	}

	.lane {
		box-sizing: border-box;
	}

	.lane-text {
		width: min(var(--measure-text), 100% - 2 * var(--gutter-text));
	}

	.lane-figure {
		width: min(var(--measure-figure), 100% - 2 * var(--gutter-figure));
	}

	/* Page furniture lines up with the header's own 64rem row, so only the
	   figures break past it, and on wide screens it starts clear of the
	   agent pill's corner. It keeps the text gutter on a phone. */
	.lane-chrome {
		width: min(var(--measure-chrome), 100% - 2 * var(--gutter-text));
	}

	.lane-cover {
		width: min(var(--measure-cover), 100% - 2 * var(--gutter-figure));
	}

	.lane-hero {
		display: flex;
		justify-content: center;
	}

	.slate {
		padding-top: var(--space-5);
	}

	.passage {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* On a phone the figures run edge to edge: the frame is the screen. */
	@media (max-width: 48rem) {
		.reel {
			--gutter-figure: 0px;
		}
	}

	/* Every figure gets a full screen, letterboxed like a film still: the
	   image is centred in it rather than stretched to fill it. */
	.screen {
		display: grid;
		place-items: center;
		min-height: var(--screen-height);
		background: var(--surface-sunken);
		border-radius: var(--radius-1);
	}

	/* Natural size at most, and never taller than its screen. */
	.frame-image {
		display: block;
		width: auto;
		height: auto;
		max-width: 100%;
		max-height: var(--screen-height);
		border-radius: var(--radius-1);
	}

	.end-mark {
		margin: var(--space-7) 0 0;
		text-align: center;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.after-reading {
		margin-top: var(--space-8);
	}

	.related-kicker,
	.related-date {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}

	.related-kicker {
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
	}

	.related-title {
		margin: var(--space-2) 0 var(--space-3);
		font: var(--type-h3);
		color: var(--text-primary);
	}
</style>
