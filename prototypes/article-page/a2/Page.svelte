<script lang="ts">
	/**
	 * Article page — approach 2 of 5: Sheet with an outside rail.
	 *
	 * Continuity with today's identity: the raised Meccano reading sheet, its
	 * bracketed title frame and its rail of square lamps all stay. What moves is
	 * the rail. From wide screens up it lives in a gutter of its own beside the
	 * sheet, sticky and always labelled, so it can never cross a line of text;
	 * below that the gutter does not exist and the rail lays itself flat as a
	 * segmented strip inside the header's bottom edge. The back link is in the
	 * flow (in the gutter on wide screens, above the sheet on phones) instead of
	 * pinned. Below the wide breakpoint a berth of page ground at the foot of
	 * the screen gives the site's agent pill somewhere to sit that is not text.
	 */
	import {
		BackLink,
		Card,
		Footer,
		Header,
		LongreadArticle,
		LongreadHero,
		LongreadProse,
		LongreadProseSection,
		PageFrame
	} from '@alfons/design';
	import { article } from '../shared/article';
	import AgentPillStandIn from '../shared/AgentPillStandIn.svelte';
	import HeaderProgressStrip from './HeaderProgressStrip.svelte';
	import OutsideRail from './OutsideRail.svelte';
	import { measureReadingPosition, toSectionStops, type ReadingPosition } from './readingProgress';

	const stops = toSectionStops(article.sections.map((section) => section.kicker));

	const relatedArticles = [
		{
			href: '#related-1',
			category: 'Essay',
			title: 'The interface is the product',
			summary: 'Why every leap in computing value came from how we talk to machines, not what they can do.'
		},
		{
			href: '#related-2',
			category: 'Notes',
			title: 'Naming Motivka',
			summary: 'Motifs, Czech diminutives and the creatives a personal agent is named after.'
		},
		{
			href: '#related-3',
			category: 'Experiment',
			title: 'Merlin: which jobs an agent can already do',
			summary: 'An occupation-by-occupation look at where AI exposure is highest.'
		}
	];

	const commentStandIns = [
		{
			author: 'Reader in Brno',
			dateLabel: '19 March 2026',
			body: 'The agricultural comparison landed for me. What would the equivalent of a tractor be for knowledge work?'
		},
		{
			author: 'Reader in Melbourne',
			dateLabel: '21 March 2026',
			body: 'Curious how you keep the context it learns about you from leaking into someone else’s model.'
		}
	];

	let position = $state<ReadingPosition>({
		sectionProgress: stops.map(() => 0),
		activeIndex: -1
	});

	// One rAF-throttled measurement feeds both the rail and the strip.
	$effect(() => {
		const sectionElements = stops
			.map((stop) => document.getElementById(stop.id))
			.filter((element): element is HTMLElement => element !== null);
		let frame = 0;
		const schedule = () => {
			if (frame) return;
			frame = requestAnimationFrame(() => {
				frame = 0;
				position = measureReadingPosition(sectionElements);
			});
		};
		schedule();
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		return () => {
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			cancelAnimationFrame(frame);
		};
	});
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}
	<div class="reading-desk">
		<aside class="desk-gutter">
			<BackLink href="/blog" label="Back to Blog" />
			<div class="gutter-rail">
				<OutsideRail {stops} {position} />
			</div>
		</aside>

		<article class="reading-sheet">
			<div class="sheet-masthead">
				<LongreadHero
					kicker={article.category}
					title={article.title}
					standfirst={article.standfirst}
					meta={[article.publishedLabel, `${article.readingTime} min read`]}
				/>
			</div>

			<div class="sheet-body">
				<LongreadArticle sections={stops} showProgress={false}>
					<LongreadProse html={article.ledeHtml} />
					{#each article.sections as section, index (section.kicker)}
						<div class="section-anchor" id={stops[index].id}>
							<LongreadProseSection kicker={section.kicker} html={section.html} />
						</div>
					{/each}
				</LongreadArticle>
			</div>

			<section class="sheet-afterword" aria-labelledby="related-heading">
				<h2 class="afterword-heading" id="related-heading">Keep reading</h2>
				<ul class="related-list">
					{#each relatedArticles as related (related.href)}
						<li>
							<Card as="a" href={related.href} variant="interactive" size="compact">
								<span class="related-category">{related.category}</span>
								<span class="related-title">{related.title}</span>
								<span class="related-summary">{related.summary}</span>
							</Card>
						</li>
					{/each}
				</ul>
			</section>

			<section class="sheet-afterword" aria-labelledby="comments-heading">
				<h2 class="afterword-heading" id="comments-heading">Comments</h2>
				<ul class="comment-list">
					{#each commentStandIns as comment (comment.author)}
						<li class="comment">
							<span class="comment-meta">{comment.author} · {comment.dateLabel}</span>
							<p class="comment-body">{comment.body}</p>
						</li>
					{/each}
				</ul>
			</section>
		</article>
	</div>
	<div class="pill-berth" aria-hidden="true"></div>

	<HeaderProgressStrip {stops} {position} />
	<AgentPillStandIn />
</PageFrame>

<style>
	/* Phones and tablets: one column, the sheet nearly edge to edge so the
	   measure is spent on text, and the back link in the flow above it. */
	.reading-desk {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-4);
		padding: var(--space-4) var(--space-2);
	}

	.desk-gutter {
		padding-inline: var(--space-2);
	}

	.gutter-rail {
		display: none;
	}

	.reading-sheet {
		width: 100%;
		max-width: 51.5rem;
		margin-inline: auto;
		padding: var(--space-5) var(--space-4) var(--space-7);
		background: var(--surface-page);
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-2);
		box-shadow: var(--shadow-2);
	}

	/* Wide screens: a gutter that exists only for the rail, mirrored by an
	   empty column on the right so the sheet stays on the header's axis. */
	@media (min-width: 80rem) {
		.reading-desk {
			grid-template-columns: 1fr 13rem minmax(0, 51.5rem) 13rem 1fr;
			column-gap: var(--space-6);
			padding: var(--space-7) 0 var(--space-9);
		}

		.desk-gutter {
			grid-column: 2;
			align-self: start;
			position: sticky;
			top: calc(var(--header-height) + var(--space-6));
			display: flex;
			flex-direction: column;
			gap: var(--space-6);
			padding: 0;
		}

		.gutter-rail {
			display: block;
		}

		.reading-sheet {
			grid-column: 3;
			padding: var(--space-7) var(--space-8) var(--space-8);
		}
	}

	/* Below the wide breakpoint the sheet runs under the agent pill's corner,
	   and no column can step around a box fixed to the viewport. The berth is
	   the header band's bottom twin: page ground the pill rests on, so text
	   slides out of view before it reaches the pill instead of under it. It is
	   sticky to the end of the main region, so once the footer arrives it stops
	   and leaves its own height as clear room below the last comment. */
	.pill-berth {
		position: sticky;
		bottom: 0;
		z-index: var(--z-sticky);
		height: var(--space-8);
		background: var(--bench-bg);
		border-top: 1px solid var(--border-hairline);
	}

	.pill-berth::before {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: 100%;
		height: var(--space-5);
		background: linear-gradient(to bottom, transparent, var(--bench-bg));
		pointer-events: none;
	}

	@media (min-width: 80rem) {
		.pill-berth {
			display: none;
		}
	}

	/* The bracketed frame from today's masthead, drawn around the opener. */
	.sheet-masthead {
		position: relative;
		display: flex;
		justify-content: center;
		padding: 0 var(--space-4);
	}

	.sheet-masthead::before,
	.sheet-masthead::after {
		content: '';
		position: absolute;
		width: var(--space-4);
		height: var(--space-4);
		pointer-events: none;
	}

	.sheet-masthead::before {
		top: var(--space-5);
		left: 0;
		border-top: 2px solid var(--ink-300);
		border-left: 2px solid var(--ink-300);
	}

	.sheet-masthead::after {
		right: 0;
		bottom: var(--space-3);
		border-right: 2px solid var(--ink-300);
		border-bottom: 2px solid var(--ink-300);
	}

	.sheet-body {
		margin-top: var(--space-5);
		padding-top: var(--space-5);
		border-top: 1px solid var(--border-hairline);
	}

	.section-anchor {
		scroll-margin-top: var(--scroll-margin-top);
	}

	/* Figures: sized to the picture, never past its natural width, never
	   taller than the screen, centred on a plate with the caption beneath. */
	.sheet-body :global(.longread-prose figure) {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
		margin: var(--space-6) 0;
		padding: var(--space-4);
		background: var(--surface-card);
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-2);
	}

	.sheet-body :global(.longread-prose img) {
		width: auto;
		max-width: 100%;
		height: auto;
		max-height: 80dvh;
		margin: 0;
		border-radius: var(--radius-1);
	}

	.sheet-body :global(.longread-prose figcaption) {
		margin: 0;
		align-self: stretch;
		font: var(--type-spec);
		line-height: var(--lh-body);
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.sheet-afterword {
		margin-top: var(--space-7);
		padding-top: var(--space-5);
		border-top: 1px solid var(--border-hairline);
	}

	.afterword-heading {
		margin: 0 0 var(--space-4);
		font: var(--type-spec);
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.related-list,
	.comment-list {
		display: grid;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	@media (min-width: 48rem) {
		.related-list {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.related-list :global(a) {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		height: 100%;
		text-decoration: none;
	}

	.related-category,
	.comment-meta {
		font: var(--type-spec);
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.related-title {
		font: var(--type-h3);
		color: var(--text-primary);
	}

	.related-summary {
		font: var(--type-small);
		color: var(--text-secondary);
	}

	.comment {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-4) 0;
		border-bottom: 1px solid var(--border-hairline);
	}

	.comment-body {
		margin: 0;
		font: var(--type-body);
		color: var(--text-primary);
	}
</style>
