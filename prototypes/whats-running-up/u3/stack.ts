/**
 * The stack, and the fact that the browser owns it.
 *
 * This approach's whole claim is that going up is a push, so back has to be
 * real: a phone reader will swipe from the screen edge and expect it to work,
 * and an in-page back button they have to find instead is a trap dressed as a
 * control. The History API is the only thing that makes the phone's own back
 * gesture, the hardware button and the desktop back button all do the right
 * thing, so the stack lives in history and the component tree reads it.
 *
 * It is encoded in the LOCATION HASH rather than the path or the query.
 *
 * - Not the path, because the prototyping harness routes on `location.pathname`
 *   (src/dev/App.svelte) and would unmount this page the moment the path moved.
 *   A production page would push a real path; here that is the harness's
 *   business, not the design's, and the hash proves the same interaction.
 * - Not the query, because the query already carries `?empty` and `?live`, and
 *   a navigation mechanism that clobbers the page's own state parameters is a
 *   bug waiting for the first reload.
 *
 * The whole stack is in the hash, not just the top frame, so a reload lands the
 * reader where they were with the frames beneath them intact.
 */

export type Frame = { kind: 'release'; slug: string } | { kind: 'project'; name: string };

/** The stack as a hash fragment: `#release/schema-lives-here/project/ledger`. */
export function encodeStack(stack: Frame[]): string {
	if (stack.length === 0) return '';
	const parts = stack.map((frame) =>
		frame.kind === 'release'
			? `release/${encodeURIComponent(frame.slug)}`
			: `project/${encodeURIComponent(frame.name)}`
	);
	return `#${parts.join('/')}`;
}

/** Parses defensively: an unreadable hash is an empty stack, never a throw. */
export function decodeStack(hash: string): Frame[] {
	const segments = hash.replace(/^#/, '').split('/').filter(Boolean);
	const stack: Frame[] = [];
	for (let at = 0; at + 1 < segments.length; at += 2) {
		const kind = segments[at];
		const value = decodeURIComponent(segments[at + 1]);
		if (kind === 'release') stack.push({ kind: 'release', slug: value });
		else if (kind === 'project') stack.push({ kind: 'project', name: value });
	}
	return stack;
}

/** Identity, so a frame already on the stack is never pushed onto itself. */
export function sameFrame(a: Frame, b: Frame): boolean {
	if (a.kind === 'release' && b.kind === 'release') return a.slug === b.slug;
	if (a.kind === 'project' && b.kind === 'project') return a.name === b.name;
	return false;
}

/**
 * Where the depth stops.
 *
 * A release names its project and a project lists its releases, so the two
 * screens point at each other and the stack could grow without end —
 * release, project, release, project — each push a legitimate destination and
 * the reader ten screens from a page that answers one question. The rule that
 * bounds it is that an ancestor already on the stack is not offered as a
 * destination: it is rendered as plain text instead, because tapping it would
 * mean going forward to somewhere the reader is already standing. That caps
 * the stack at two frames, which is exactly the hierarchy the brief asked for.
 */
export function alreadyOpen(stack: Frame[], frame: Frame): boolean {
	return stack.some((open) => sameFrame(open, frame));
}
