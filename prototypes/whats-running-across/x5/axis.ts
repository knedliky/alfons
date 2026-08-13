/**
 * The two axes, and what the browser is told about them.
 *
 * This approach has no stack. The reader is at exactly one position on one
 * surface: a level (task, release, project) and a sibling index at that level.
 * The hash encodes the position, not a journey — `#release/auth-hardening` is
 * "standing at the release auth-hardening", never "task, then release".
 *
 * It is the LOCATION HASH for the same two reasons the winning approach gave:
 * the prototyping harness routes on `location.pathname` and would unmount the
 * page the moment the path moved, and the query already carries `?empty` and
 * `?live`. A production page would use a real path.
 *
 * WHAT IS A HISTORY ENTRY. Vertical moves push; horizontal moves replace.
 * The defence, against a reader who swipes through twelve siblings: back that
 * replays twelve swipes one at a time is a back button that has stopped
 * working — the reader wants to leave the level, and the browser would make
 * them re-live it in reverse. A level change is a decision; a swipe is a
 * glance. So each entry remembers the LAST horizontal position it had when the
 * reader left it (replaceState keeps the entry's URL current), and back lands
 * on the level below at the exact sibling the reader was reading when they
 * climbed. Both vertical directions push — an explicit "down" is a move, not
 * an undo, and making it call history.back() would sometimes be right and
 * sometimes rewind through positions the reader never meant to revisit.
 *
 * A reloaded deep position gets NO synthetic entries beneath it. The winning
 * approach rebuilt its stack on restore because a stack claims frames exist
 * beneath you; a position claims nothing. Back from a freshly-loaded
 * `#project/ledger` leaves the page, which is the browser telling the truth
 * about this session's history — and the down control is standing right there.
 */

/** Top to bottom, in the order the surface stacks them. Up means index - 1. */
export const LEVELS = ['project', 'release', 'task'] as const;

export type Level = (typeof LEVELS)[number];

/** How many panes a given pane sits above (negative) or below the current one. */
export function paneOffset(pane: Level, current: Level): number {
	return LEVELS.indexOf(pane) - LEVELS.indexOf(current);
}

export type Position =
	| { level: 'task'; id: string | null }
	| { level: 'release'; slug: string }
	| { level: 'project'; name: string };

/** `#task/AL-014`, `#task` when nothing is running, `#release/auth-hardening`. */
export function encodePosition(position: Position): string {
	switch (position.level) {
		case 'task':
			return position.id === null ? '#task' : `#task/${encodeURIComponent(position.id)}`;
		case 'release':
			return `#release/${encodeURIComponent(position.slug)}`;
		case 'project':
			return `#project/${encodeURIComponent(position.name)}`;
	}
}

/** Parses defensively: an unreadable hash is the task level, never a throw. */
export function decodePosition(hash: string): Position {
	const [head, ...rest] = hash.replace(/^#/, '').split('/').filter(Boolean);
	const value = rest.length > 0 ? decodeURIComponent(rest.join('/')) : null;
	if (head === 'release' && value !== null) return { level: 'release', slug: value };
	if (head === 'project' && value !== null) return { level: 'project', name: value };
	if (head === 'task') return { level: 'task', id: value };
	return { level: 'task', id: null };
}
