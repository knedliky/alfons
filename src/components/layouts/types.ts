/**
 * Shared layout types for spacing and alignment primitives.
 *
 * Semantic gap names map to the 10-step --space-N CSS variable scale:
 *   xs=4px (--space-1), sm=8px (--space-2), md=16px (--space-4),
 *   lg=24px (--space-5), xl=32px (--space-6), 2xl=64px (--space-8)
 *
 * New intermediate steps available for finer control:
 *   --space-3 (12px), --space-7 (48px), --space-9 (96px), --space-10 (128px)
 *
 * resolveGap builds the token name at runtime, so every rung 1-10 must exist
 * in spacing.css whether or not a stylesheet writes it. A dead-token audit
 * greps for literal names and cannot see these; spacing.css carries the
 * matching warning.
 */

export type SemanticGap = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type NumericGap = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type Gap = NumericGap | SemanticGap;

export type Align = 'start' | 'center' | 'end' | 'stretch';
export type Justify = 'start' | 'center' | 'end' | 'between' | 'around';

const SEMANTIC_TO_NUMERIC: Record<SemanticGap, NumericGap> = {
	xs: 1,
	sm: 2,
	md: 4,
	lg: 5,
	xl: 6,
	'2xl': 8
};

/** Resolve a semantic or numeric gap value to a CSS variable reference. */
export function resolveGap(gap: Gap): string {
	const numericValue = typeof gap === 'number' ? gap : SEMANTIC_TO_NUMERIC[gap];
	return `var(--space-${numericValue})`;
}
