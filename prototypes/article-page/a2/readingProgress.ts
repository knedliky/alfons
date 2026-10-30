/**
 * The reading position shared by the outside rail (wide screens) and the
 * header strip (phones): one measurement, two drawings of it, so the two can
 * never disagree about where the reader is.
 */

export interface SectionStop {
	id: string;
	kicker: string;
	/** Brand lamp colour, as a var() reference to a palette token. */
	lampColour: string;
}

export interface ReadingPosition {
	/** Fraction of each section already read, 0 to 1, in document order. */
	sectionProgress: number[];
	/** The section under the reading line, or -1 while still in the lede. */
	activeIndex: number;
}

/**
 * The same walk around the brand hue wheel that LongreadArticle's rail uses,
 * so a section keeps its colour whichever surface draws it.
 */
const lampPalette = [
	'var(--girder-red)',
	'var(--gantry-orange)',
	'var(--brass-amber)',
	'var(--toolbox-olive)',
	'var(--pulley-blue)',
	'var(--boiler-navy)',
	'var(--flange-plum)',
	'var(--pinion-pink)'
];

export function toSectionStops(kickers: string[]): SectionStop[] {
	return kickers.map((kicker, index) => ({
		id: `section-${index + 1}`,
		kicker,
		lampColour: lampPalette[index % lampPalette.length]
	}));
}

/**
 * The reading line sits at the upper third of the viewport, where the eye
 * rests on a long read, rather than at the viewport's top edge.
 */
const readingLineRatio = 0.3;

export function measureReadingPosition(sectionElements: HTMLElement[]): ReadingPosition {
	const readingLine = window.innerHeight * readingLineRatio;
	let activeIndex = -1;
	const sectionProgress = sectionElements.map((element, index) => {
		const bounds = element.getBoundingClientRect();
		if (bounds.top <= readingLine) activeIndex = index;
		if (bounds.height === 0) return 0;
		return Math.min(1, Math.max(0, (readingLine - bounds.top) / bounds.height));
	});
	// The last section can be shorter than the space below the reading line,
	// so reaching the end of the page counts as having read everything.
	const atPageEnd =
		window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
	if (atPageEnd) return { sectionProgress: sectionProgress.map(() => 1), activeIndex };
	return { sectionProgress, activeIndex };
}
