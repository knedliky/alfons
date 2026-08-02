/**
 * Blog components — the editorial longread template family (Motion Glow).
 *
 * Promoted from Atlas on 12/07/2026: selected via prototype-explorer
 * (rounds 1-3) for the merlin methodology page and proven across the blog
 * longread and index before graduating here. LongreadArticle orchestrates
 * scroll focus and renders the section rail (the article's table of
 * contents); sections, hero, figures and stat bands are the named slots.
 */
export { default as LongreadArticle } from './LongreadArticle.svelte';
export type { LongreadSectionInfo } from './LongreadArticle.svelte';
export { default as LongreadSection } from './LongreadSection.svelte';
export { default as LongreadHero } from './LongreadHero.svelte';
export { default as LongreadProse } from './LongreadProse.svelte';
export { default as LongreadProseSection } from './LongreadProseSection.svelte';
export { default as LongreadFigure } from './LongreadFigure.svelte';
export { default as LongreadStatBand } from './LongreadStatBand.svelte';
export type { LongreadStat } from './LongreadStatBand.svelte';
export type { LongreadContext } from './context.js';
