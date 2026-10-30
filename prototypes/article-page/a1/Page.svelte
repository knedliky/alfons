<script lang="ts">
	/**
	 * Article page — approach 1 of 5: Quiet column
	 *
	 * Direction: Reduces the page to one centred reading column with no raised sheet and no fixed elements at all: the contents become an inline list under the standfirst, and the back link sits in the flow, pushing restraint and typography as the whole design.
	 *
	 * Brief: This is the page where Simon's published writing is read, at /blog/<slug> on the public website, and its one job is comfortable long-form reading on a 375 pixel phone and on a 1440 pixel desktop. Readers arrive from a shared link, the blog index or the homepage, mostly on a phone, and read one essay of about eight minutes from top to bottom. The page opens with the category, the publication date, the title, a one-line standfirst and the reading time, then an optional cover image, then the body: a lede, then sections that each start with an h2, with paragraphs, links, an ordered list, a blockquote and images. Body paragraphs are body copy and carry the primary text colour; only the kicker, dates and captions use supporting greys, all through Alfons typography tokens. Images arrive as sanitised HTML with natural sizes from 192 by 256 to 2160 square; each one is sized to its content, never upscaled past its natural width, never taller than the viewport, and a caption that follows an image as an emphasised paragraph is shown as that image's caption. The page has two floating companions that must never cover a word of text at either width: the section contents, which today is a fixed left rail of dots with labels, and the site-wide 'ask scheherazade' agent pill, fixed bottom left at roughly 190 by 40 pixels, which this page cannot change and must leave room for. The 'Back to Blog' link is also fixed today and likewise must not cover text. After the body come related articles and comments, which keep their content but may change their layout. The fixture is the real article 'I'm building a personal agent' (fixture.json beside round.json), which on the live site renders its 192 by 256 logo as an 883 pixel red block and lets the rail and pill overlap the opening text on a phone. Dark is the only colour mode, and the page takes its whole look from Alfons tokens and components, with LongreadHero, LongreadProse, LongreadProseSection, LongreadArticle and LongreadFigure as the existing parts to reuse before inventing any.
	 *
	 * Owned by one agent. Build from the base layer up — shell, then
	 * regions, then containers, then components — and keep
	 * data-alfons-working="what you are composing" on the region under
	 * construction so the build can be watched live at /dev/article-page.
	 * Remove the marker when the region is finished.
	 */
	import { Container, Footer, Header, PageFrame, PageHeader, PageSection } from '@alfons/design';
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}
	<main data-alfons-working="Quiet column — seeded shell, composing the base layer">
		<PageSection>
			<Container>
				<PageHeader
					title="Article page"
					subtitle="Quiet column"
				/>
			</Container>
		</PageSection>
	</main>
</PageFrame>
