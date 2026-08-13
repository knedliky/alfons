/**
 * The journey: a committed stack the browser owns, plus at most one peek.
 *
 * Carried from the approach this builds on (whats-running-up/u3): the committed
 * stack lives in the LOCATION HASH because the prototyping harness routes on
 * `location.pathname` and the query already carries `?empty` and `?live`. A
 * production page would push real paths. What this approach adds is the peek —
 * a frame the reader is glancing at without having gone there.
 *
 * The peek IS a history entry, and that is the load-bearing decision of the
 * whole approach. A sheet outside history means the phone's edge-swipe, made
 * while a sheet covers half the screen, leaves the page entirely — the same
 * trap u3 named for an in-page stack. One entry, appended as `peek/release/x`,
 * makes scrim tap, swipe-down, Escape, the on-screen close and the phone's own
 * back all the same `history.back()`.
 *
 * But only ONE entry, however far the glance wanders. Swapping the peeked frame
 * — release to its project, project to another release — is a `replaceState`,
 * so a whole chain of glances is dismissed by a single back. Glances the reader
 * did not commit to must not pile up as places back has to revisit; that is the
 * brief's "replaying intermediate places" failure, priced out by construction.
 *
 * Committing is a `replaceState` too: the peek entry becomes the committed
 * frame, so history reads as if the reader had navigated there directly —
 * [running, release], never [running, glance-at-release, release].
 */

export type Frame = { kind: 'release'; slug: string } | { kind: 'project'; name: string };

export interface Journey {
	stack: Frame[];
	peek: Frame | null;
}

function encodeFrame(frame: Frame): string {
	return frame.kind === 'release'
		? `release/${encodeURIComponent(frame.slug)}`
		: `project/${encodeURIComponent(frame.name)}`;
}

/** `#release/a/peek/project/b` — the committed stack, then the glance if any. */
export function encodeJourney(journey: Journey): string {
	const parts = journey.stack.map(encodeFrame);
	if (journey.peek) parts.push('peek', encodeFrame(journey.peek));
	return parts.length === 0 ? '' : `#${parts.join('/')}`;
}

/** Parses defensively: an unreadable hash is an empty journey, never a throw. */
export function decodeJourney(hash: string): Journey {
	const segments = hash.replace(/^#/, '').split('/').filter(Boolean);
	const stack: Frame[] = [];
	let peek: Frame | null = null;
	let peeking = false;
	for (let at = 0; at < segments.length; at += 1) {
		const kind = segments[at];
		if (kind === 'peek') {
			peeking = true;
			continue;
		}
		const value = decodeURIComponent(segments[at + 1] ?? '');
		if (value === '') continue;
		if (kind === 'release' || kind === 'project') {
			const frame: Frame =
				kind === 'release' ? { kind: 'release', slug: value } : { kind: 'project', name: value };
			if (peeking) peek = frame;
			else stack.push(frame);
			at += 1;
		}
	}
	return { stack, peek };
}

export function sameFrame(a: Frame, b: Frame): boolean {
	if (a.kind === 'release' && b.kind === 'release') return a.slug === b.slug;
	if (a.kind === 'project' && b.kind === 'project') return a.name === b.name;
	return false;
}

/**
 * Where this frame already stands on the committed stack, or -1.
 *
 * u3 bounded its stack by rendering an already-open ancestor as inert text —
 * the model itself forbade a jump the reader plainly wanted, and the round
 * brief names that concession. Here the same rule bounds the depth without
 * forbidding the jump: any frame can be PEEKED, and committing to a frame
 * already beneath you is a `history.go` backwards to it rather than a forward
 * push of a duplicate. The stack still cannot grow release/project/release
 * without end, and nothing is rendered inert text.
 */
export function indexOnStack(stack: Frame[], frame: Frame): number {
	return stack.findIndex((open) => sameFrame(open, frame));
}
