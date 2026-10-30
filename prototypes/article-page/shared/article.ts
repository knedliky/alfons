/**
 * Shared fixture access for the article-page round.
 *
 * Every approach reads the same real article and the same figure pairing, so
 * the round compares layouts rather than five different parsings of the HTML.
 * In production the pairing belongs to the server renderer (Atlas's
 * markdown.ts); here it is a string pass over the sanitised fixture.
 */
import fixture from '../fixture.json';

export interface ArticleSection {
	kicker: string;
	html: string;
}

export interface Article {
	slug: string;
	category: string;
	publishedLabel: string;
	readingTime: number;
	title: string;
	standfirst: string;
	ledeHtml: string;
	sections: ArticleSection[];
}

// An image alone in a paragraph, optionally followed by an emphasised-only
// paragraph: the published markdown's convention for a captioned figure.
const imageParagraph = /<p>(<img [^>]+>)<\/p>(?:\s*<p><em>([^<]+)<\/em><\/p>)?/g;

/** Turn image paragraphs into figure elements, taking a following italic line as the caption. */
export function pairFigures(html: string): string {
	return html.replace(imageParagraph, (_match, image: string, caption?: string) =>
		caption
			? `<figure>${image}<figcaption>${caption}</figcaption></figure>`
			: `<figure>${image}</figure>`
	);
}

export const article: Article = {
	...fixture,
	ledeHtml: pairFigures(fixture.ledeHtml),
	sections: fixture.sections.map((section) => ({ ...section, html: pairFigures(section.html) }))
};
