/**
 * The two scales the running view renders the same content at.
 *
 * A type of its own rather than a boolean, because `zoomedOut = true` reads as a
 * deviation from a normal state and neither of these is the deviation: they are
 * two sizes of one answer. Carried unchanged from the winning approach.
 *
 * Note what this type deliberately does NOT gain in this round. A pushed screen
 * is not a third scale — it is a different place, at the same scale. Adding
 * 'release' here would have made the scale control the way up, which is the
 * neighbouring approach's experiment and not this one's.
 */
export type Scale = 'grid' | 'card';
