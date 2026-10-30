/**
 * Story fixture for the article reading stories (AL-034): an essay long
 * enough to scroll on a phone, in sanitised-HTML sections the way Atlas
 * renders them, plus two images at the extremes the site serves.
 */

/**
 * An SVG image with a fixed natural size, inlined so the stories carry no
 * binary assets. An SVG with width and height on its root has exactly that
 * natural size, which is what the image rules are measured against.
 */
function placeholderImage(width: number, height: number, label: string, fill: string): string {
	const svg =
		`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" ` +
		`viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${fill}"/>` +
		`<text x="50%" y="50%" fill="#f4ecde" font-family="monospace" ` +
		`font-size="${Math.round(width / 12)}" text-anchor="middle">${label}</text></svg>`;
	return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

/** A 192 x 256 logo: the image the old width rule stretched to the measure. */
export const smallLogo = placeholderImage(192, 256, '192x256', '#c8352b');
/** A 2160 x 2160 square: taller than any phone, so the viewport cap shows. */
export const squareCover = placeholderImage(2160, 2160, '2160x2160', '#2f5d8a');

export const imagesHtml = `
	<p>The first figure is a 192 by 256 logo. It stays at its own size, centred
	on the column, with its caption directly beneath it.</p>
	<figure>
		<img src="${smallLogo}" alt="A small red placeholder logo, 192 by 256 pixels" />
		<figcaption>A 192 x 256 logo at its natural size</figcaption>
	</figure>
	<p>The second is a 2160 pixel square. It narrows to the measure and never
	grows taller than the screen, so it is always seen whole.</p>
	<figure>
		<img src="${squareCover}" alt="A blue placeholder square, 2160 by 2160 pixels" />
		<figcaption>A 2160 x 2160 square, capped to the viewport</figcaption>
	</figure>
	<p>An image without a figure follows the same rules.</p>
	<img src="${smallLogo}" alt="The same small logo, outside a figure" />`;

const paragraphs = [
	'A personal agent starts as a list of chores and ends as a question about trust. Each tool it can call is a small grant of authority, and the interesting design work is in deciding which grants it keeps.',
	'The first version answered questions from a folder of notes. It was useful for a week, then wrong in a way that mattered: it quoted a decision that a later one had replaced, and nothing in the notes said so.',
	'So the notes became a ledger. Decisions supersede one another explicitly, tasks carry the criteria that close them, and every answer can point at the row it came from.',
	'Reading on a phone changes what the page owes the reader. The column is narrow, the thumb is the only pointer, and anything fixed to the screen competes with the text for the same few hundred pixels.'
];

export interface ReadingSection {
	id: string;
	kicker: string;
	html: string;
}

const kickers = ['The chores', 'The ledger', 'The trust', 'The page', 'The dock'];

export const readingSections: ReadingSection[] = kickers.map((kicker, index) => ({
	id: `section-${index + 1}`,
	kicker,
	html:
		`<h2>${kicker}</h2>` +
		paragraphs
			.map((_, offset) => `<p>${paragraphs[(index + offset) % paragraphs.length]}</p>`)
			.join('')
}));

export const readingLede =
	'<p>What it takes to build an agent that acts for one person, and what the page that explains it should do on a phone.</p>';
