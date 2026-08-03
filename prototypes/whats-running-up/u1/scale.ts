/**
 * The ladder this approach is testing: four rungs where the winning approach
 * had two.
 *
 * Ordered closest to widest, and that order is the whole hypothesis. Rung 0 is
 * one task filling the screen; rung 3 is the project it belongs to. Moving is
 * always ±1, so the control that moved between two scales moves between four
 * without learning a new trick.
 *
 * A type of its own rather than a number, for the same reason the winning
 * approach refused a boolean: none of these four is the deviation from a normal
 * state, they are four widths of one answer.
 */
export type Scale = 'card' | 'grid' | 'release' | 'project';

/** Closest first. The index into this array is the rung number the control shows. */
export const LADDER: readonly Scale[] = ['card', 'grid', 'release', 'project'];

export function rungOf(scale: Scale): number {
	return LADDER.indexOf(scale);
}

/** One rung wider, or null at the top. Null is what disables the control. */
export function wider(scale: Scale): Scale | null {
	return LADDER[rungOf(scale) + 1] ?? null;
}

/** One rung closer, or null at the bottom. */
export function closer(scale: Scale): Scale | null {
	return LADDER[rungOf(scale) - 1] ?? null;
}

/**
 * What a rung is called on the control.
 *
 * The kind is fixed per rung; the name is read off whichever task the reader is
 * standing on, which is what stops the control implying a single fixed
 * destination when two runners have different ladders.
 */
export interface Rung {
	kind: string;
	name: string;
}

/** A rung the control can move to, with the label it shows for it. */
export interface Destination {
	scale: Scale;
	rung: Rung;
}
