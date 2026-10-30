<script lang="ts">
	/**
	 * Article page — approach 5 of 5: Reading dock.
	 *
	 * Every control that floats on today's page (the section rail, the fixed
	 * back link, a progress cue) is gathered into one dock, and the dock is
	 * given ground of its own instead of a place on top of the text.
	 *
	 * Phone and tablet: the article scrolls inside a viewport that stops short
	 * of a reserved floor band. The site's agent pill already owns the corner of
	 * that band; the dock takes the rest of it (back, contents, progress), and
	 * sinks while the reader scrolls forward. Contents opens as a PeekSheet.
	 * Text cannot reach the band, so nothing fixed ever sits over a word.
	 *
	 * Desktop (80rem and up): the band is not needed, because the measure sits
	 * well clear of the pill's corner. The dock stands up instead and becomes a
	 * sticky margin column beside the measure, in its own grid track, holding
	 * the same three things with the contents always open.
	 */
	import {
		BackLink,
		Card,
		Container,
		EmptyState,
		Footer,
		Grid,
		Header,
		LongreadArticle,
		LongreadHero,
		LongreadProse,
		LongreadProseSection,
		PageFrame,
		PageSection,
		PeekSheet,
		ProgressBar
	} from '@alfons/design';
	import { tick } from 'svelte';
	import { article } from '../shared/article';
	import AgentPillStandIn from '../shared/AgentPillStandIn.svelte';
	import ReadingFloor from './ReadingFloor.svelte';
	import SectionList, { type SectionEntry } from './SectionList.svelte';

	const backHref = '/blog';

	const sections: SectionEntry[] = article.sections.map((section, index) => ({
		id: `section-${index + 1}`,
		kicker: section.kicker
	}));

	// Static stand-ins: the related-articles query and comments are out of this
	// round's scope; only their place and layout are being decided.
	const relatedArticles = [
		{
			href: '/blog/the-interface-is-the-product',
			category: 'Essay',
			title: 'The interface is the product',
			standfirst: 'Why every leap in computing arrived as a new way to ask.'
		},
		{
			href: '/blog/notes-on-a-local-memory',
			category: 'Build log',
			title: 'Notes on a local memory',
			standfirst: 'What it takes for an agent to remember you, on your own machine.'
		},
		{
			href: '/blog/robots-are-a-czech-word',
			category: 'Essay',
			title: 'Robots are a Czech word',
			standfirst: 'A play from 1920 and the servants we keep building.'
		}
	];

	let viewport = $state<HTMLElement>();
	let articleBody = $state<HTMLElement>();

	let progress = $state(0);
	let activeIndex = $state(-1);
	let dockRaised = $state(true);
	let contentsOpen = $state(false);
	let wide = $state(false);
	let reducedMotion = $state(false);

	// Measured from the pill itself, so the floor clears whatever the agent dock
	// actually renders rather than the size it was documented at.
	let floorHeight = $state<string | undefined>();
	let pillClearance = $state<string | undefined>();

	const positionLabel = $derived(
		activeIndex < 0 ? 'Start' : `${activeIndex + 1}/${sections.length}`
	);
	const positionDescription = $derived(
		activeIndex < 0
			? `opening, ${sections.length} sections`
			: `section ${activeIndex + 1} of ${sections.length}, ${sections[activeIndex].kicker}`
	);
	const minutesLeft = $derived(Math.max(0, Math.ceil(article.readingTime * (1 - progress))));

	let lastScrollTop = 0;
	let frame = 0;

	/** Whichever element is scrolling: the reading viewport below 80rem, the document above. */
	function scrollMetrics() {
		if (!wide && viewport) {
			return {
				top: viewport.scrollTop,
				height: viewport.clientHeight,
				max: viewport.scrollHeight - viewport.clientHeight
			};
		}
		return {
			top: window.scrollY,
			height: window.innerHeight,
			max: document.documentElement.scrollHeight - window.innerHeight
		};
	}

	function measure() {
		frame = 0;
		if (!articleBody) return;
		const { top, height, max } = scrollMetrics();

		// Progress follows a reading line at mid-screen through the body, so the
		// opening reads as 0 and the last paragraph as done.
		const body = articleBody.getBoundingClientRect();
		const readingLine = height / 2;
		progress = Math.min(1, Math.max(0, (readingLine - body.top) / body.height));

		const anchors = articleBody.querySelectorAll<HTMLElement>('[data-section-anchor]');
		let current = -1;
		anchors.forEach((anchor, index) => {
			if (anchor.getBoundingClientRect().top < height * 0.4) current = index;
		});
		activeIndex = current;

		// Forward scrolling sinks the dock; any scroll back, the opening and the
		// end raise it. A small dead band stops a resting thumb from flickering it.
		const delta = top - lastScrollTop;
		if (Math.abs(delta) > 6) {
			dockRaised = delta < 0;
			lastScrollTop = top;
		}
		if (top < 96 || top >= max - 24) dockRaised = true;
	}

	function scheduleMeasure() {
		if (!frame) frame = requestAnimationFrame(measure);
	}

	function measurePill() {
		const pill = document.querySelector<HTMLElement>('[data-agent-pill-stand-in]');
		if (!pill) return;
		const box = pill.getBoundingClientRect();
		const bottomInset = window.innerHeight - box.bottom;
		floorHeight = `${Math.ceil(box.height + bottomInset * 2)}px`;
		pillClearance = `${Math.ceil(box.right + box.left)}px`;
	}

	$effect(() => {
		const wideQuery = window.matchMedia('(min-width: 80rem)');
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => {
			wide = wideQuery.matches;
			reducedMotion = motionQuery.matches;
			measurePill();
			scheduleMeasure();
		};
		sync();
		wideQuery.addEventListener('change', sync);
		motionQuery.addEventListener('change', sync);
		return () => {
			wideQuery.removeEventListener('change', sync);
			motionQuery.removeEventListener('change', sync);
			if (frame) cancelAnimationFrame(frame);
		};
	});

	async function jumpTo(index: number) {
		contentsOpen = false;
		// The viewport is inert while the sheet is up; let it come back first.
		await tick();
		document
			.getElementById(sections[index].id)
			?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
	}

	async function jumpToAfterword() {
		contentsOpen = false;
		await tick();
		document
			.getElementById('afterword')
			?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' });
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && contentsOpen) contentsOpen = false;
	}
</script>

<svelte:window
	onscroll={scheduleMeasure}
	onresize={() => (measurePill(), scheduleMeasure())}
	onkeydown={onKeydown}
/>

<div class="reading-page" style:--floor-height={floorHeight} style:--pill-clearance={pillClearance}>
	<div
		class="reading-viewport"
		bind:this={viewport}
		onscroll={scheduleMeasure}
		inert={contentsOpen}
	>
		<PageFrame>
			{#snippet header()}<Header variant="compact" />{/snippet}
			{#snippet footer()}<Footer />{/snippet}
			<main>
				<PageSection>
					<div class="reading-grid">
						<aside class="margin-dock" aria-label="Reading dock">
							<BackLink href={backHref} label="Back to Blog" />
							<ProgressBar
								value={Math.round(progress * 100)}
								size="sm"
								label={minutesLeft === 0 ? 'Read' : `${minutesLeft} min left`}
								showValue
							/>
							<SectionList {sections} {activeIndex} onPick={jumpTo} />
						</aside>

						<div class="reading-column">
							<LongreadArticle
								sections={sections.map(({ kicker }) => ({ kicker }))}
								showProgress={false}
							>
								<LongreadHero
									kicker={article.category}
									title={article.title}
									standfirst={article.standfirst}
									meta={[article.publishedLabel, `${article.readingTime} min read`]}
								/>
								<div class="article-body" data-article-body bind:this={articleBody}>
									<LongreadProse html={article.ledeHtml} />
									{#each article.sections as section, index (section.kicker)}
										<div class="section-anchor" id={sections[index].id} data-section-anchor>
											<LongreadProseSection kicker={section.kicker} html={section.html} />
										</div>
									{/each}
								</div>
							</LongreadArticle>
						</div>
					</div>
				</PageSection>

				<PageSection>
					<Container maxWidth="lg">
						<div class="afterword" id="afterword">
							<section class="afterword-block" aria-labelledby="related-heading">
								<h2 class="afterword-heading" id="related-heading">Read next</h2>
								<Grid columns={{ base: 1, md: 3 }} gap="md">
									{#each relatedArticles as related (related.href)}
										<Card as="a" href={related.href} variant="interactive">
											<p class="related-category">{related.category}</p>
											<h3 class="related-title">{related.title}</h3>
											<p class="related-standfirst">{related.standfirst}</p>
										</Card>
									{/each}
								</Grid>
							</section>

							<section class="afterword-block" aria-labelledby="comments-heading">
								<h2 class="afterword-heading" id="comments-heading">Comments</h2>
								<EmptyState
									title="No comments yet"
									message="Replies to this essay will gather here. Ask scheherazade in the meantime."
									icon="messages"
									variant="public"
								/>
							</section>
						</div>
					</Container>
				</PageSection>
			</main>
		</PageFrame>
	</div>

	<ReadingFloor
		{progress}
		{positionLabel}
		{positionDescription}
		raised={dockRaised || contentsOpen}
		{contentsOpen}
		{backHref}
		onOpenContents={() => (contentsOpen = true)}
	/>
</div>

<AgentPillStandIn />

{#if contentsOpen}
	<PeekSheet
		rank="Contents"
		name={article.title}
		commitLabel="Skip to related reading and comments"
		{reducedMotion}
		onCommit={jumpToAfterword}
		onDismiss={() => (contentsOpen = false)}
	>
		<SectionList {sections} {activeIndex} onPick={jumpTo} />
	</PeekSheet>
{/if}

<style>
	/* Below 80rem the page scrolls inside this viewport, which ends where the
	   floor begins: the band under the agent pill and the dock is ground the
	   text never enters, rather than a layer it slides beneath. */
	.reading-viewport {
		position: fixed;
		inset: 0 0 var(--floor-height, var(--space-8)) 0;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior-y: contain;
	}

	/* One column on phones; on desktop three tracks with the measure in the
	   centre track, so the margin dock and the text can never share a box. The
	   empty right track mirrors the dock and keeps the measure on the page axis. */
	.reading-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}

	.margin-dock {
		display: none;
	}

	.reading-column {
		min-width: 0;
	}

	/* Images arrive from 192px to 2160px wide. Each keeps its own size up to
	   the measure, never past its natural width, and never taller than the
	   screen, so the small logo stays small and the square cover fits whole. */
	.article-body :global(.longread-prose img) {
		width: auto;
		max-width: 100%;
		height: auto;
		max-height: 70dvh;
		margin-inline: auto;
	}

	.article-body :global(.longread-prose figure) {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.article-body :global(.longread-prose figcaption) {
		text-align: center;
	}

	.section-anchor {
		scroll-margin-top: var(--scroll-margin-top);
	}

	.afterword {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		/* The last block keeps clear of the dev pager and the floor's edge. */
		padding-bottom: var(--space-7);
	}

	.afterword-block {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.afterword-heading {
		margin: 0;
		font: var(--type-h3);
		color: var(--text-primary);
	}

	.related-category {
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.related-title {
		margin: 0 0 var(--space-2);
		font-family: var(--font-display);
		font-size: var(--text-lead);
		line-height: var(--lh-snug);
		color: var(--text-primary);
	}

	.related-standfirst {
		margin: 0;
		font: var(--type-small);
		color: var(--text-secondary);
	}

	@media (min-width: 80rem) {
		/* The document scrolls again; the band has nothing to protect. */
		.reading-viewport {
			position: static;
			overflow: visible;
		}

		.reading-grid {
			grid-template-columns: 14rem minmax(0, 42rem) 14rem;
			column-gap: var(--space-7);
			justify-content: center;
		}

		/* The dock stands up beside the measure. It sticks under the header
		   and stops a full pill band short of the screen's foot, so it can
		   never meet the agent pill in the corner below it. */
		.margin-dock {
			position: sticky;
			top: calc(var(--header-height) + var(--space-6));
			align-self: start;
			display: flex;
			flex-direction: column;
			gap: var(--space-5);
			max-height: calc(
				100dvh - var(--header-height) - var(--space-6) - var(--space-8) - var(--space-5)
			);
			overflow-y: auto;
			padding-top: var(--space-7);
		}
	}
</style>
