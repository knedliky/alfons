/**
 * Splits paired article HTML into scenes: runs of prose, and the figures
 * between them.
 *
 * Figures lead in this approach, so they cannot stay inside the prose column
 * as injected HTML: each one has to become its own element that the page can
 * lay on a wider measure than the text. In production this split belongs to
 * the server renderer beside the figure pairing; here it is a string pass
 * over the already paired, already sanitised fixture.
 */

export type Scene =
	| { kind: 'prose'; html: string }
	| { kind: 'figure'; number: number; src: string; alt: string; caption?: string };

const pairedFigure = /<figure>(<img [^>]+>)(?:<figcaption>([^<]*)<\/figcaption>)?<\/figure>/g;

const namedEntities: Record<string, string> = {
	'&amp;': '&',
	'&quot;': '"',
	'&#39;': "'",
	'&lt;': '<',
	'&gt;': '>'
};

/** Undo the sanitiser's entity escaping, since Svelte escapes attribute values itself. */
function decodeEntities(value: string): string {
	return value.replace(/&(amp|quot|#39|lt|gt);/g, (entity) => namedEntities[entity] ?? entity);
}

function readAttribute(tag: string, name: string): string {
	const found = tag.match(new RegExp(`${name}="([^"]*)"`));
	return found ? decodeEntities(found[1]) : '';
}

/**
 * Split one block of paired HTML into prose and figure scenes, numbering
 * figures from firstNumber so numbering runs across the whole article.
 */
export function splitIntoScenes(html: string, firstNumber = 1): Scene[] {
	const scenes: Scene[] = [];
	let cursor = 0;
	let number = firstNumber;
	for (const match of html.matchAll(pairedFigure)) {
		const proseBefore = html.slice(cursor, match.index).trim();
		if (proseBefore) scenes.push({ kind: 'prose', html: proseBefore });
		scenes.push({
			kind: 'figure',
			number,
			src: readAttribute(match[1], 'src'),
			alt: readAttribute(match[1], 'alt'),
			caption: match[2] ? decodeEntities(match[2]) : undefined
		});
		number += 1;
		cursor = (match.index ?? 0) + match[0].length;
	}
	const proseAfter = html.slice(cursor).trim();
	if (proseAfter) scenes.push({ kind: 'prose', html: proseAfter });
	return scenes;
}

export function countFigures(scenes: Scene[]): number {
	return scenes.filter((scene) => scene.kind === 'figure').length;
}
