/**
 * The two scales this page renders the same content at.
 *
 * A type of its own rather than a boolean, because `zoomedOut = true` reads as a
 * deviation from a normal state and neither of these is the deviation: they are
 * two sizes of one answer. Carried over from the winning approach unchanged.
 */
export type Scale = 'grid' | 'card';
