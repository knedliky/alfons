import { getContext, setContext } from 'svelte';

/**
 * Context contract between LongreadArticle and its LongreadSection children.
 *
 * Sections self-register their root element and receive an index; the article
 * owns the IntersectionObserver and answers "is this section active" through
 * the closure below (reads track the article's runes, so sections re-derive
 * automatically). Registration happens inside $effect — browser only — which
 * is what keeps the SSR payload fully visible: a section that never registers
 * never dims.
 */
export interface LongreadContext {
	/** Register a section root; returns the section's index in scroll order. */
	register(element: HTMLElement): number;
	/** Whether the section at `index` currently holds scroll focus. */
	isActive(index: number): boolean;
}

const LONGREAD_CONTEXT_KEY = Symbol('longread-article');

export function setLongreadContext(context: LongreadContext): void {
	setContext(LONGREAD_CONTEXT_KEY, context);
}

export function getLongreadContext(): LongreadContext | undefined {
	return getContext(LONGREAD_CONTEXT_KEY);
}
