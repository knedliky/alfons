/**
 * The camera, and the fact that the browser owns its history.
 *
 * This approach's whole claim is that a jump is the camera moving over a fixed
 * map, not a screen being pushed. But the phone's back gesture is still real
 * and still sacred: every deliberate camera move is a `history.pushState`, and
 * popstate moves the camera back along where the reader has been. Back never
 * exits the page unexpectedly, because the entries it walks are camera
 * positions this page wrote.
 *
 * The target is encoded in the LOCATION HASH rather than the path or the
 * query, for exactly the reasons the approach this builds on recorded:
 *
 * - Not the path, because the prototyping harness routes on
 *   `location.pathname` (src/dev/App.svelte) and would unmount this page the
 *   moment the path moved. A production page would push a real path.
 * - Not the query, because the query already carries `?empty` and `?live`,
 *   and a navigation mechanism that clobbers the page's own state parameters
 *   is a bug waiting for the first reload.
 *
 * Unlike the stack it replaces, the hash carries ONE target, not a pile of
 * frames. A camera has a position, not a depth: standing over the ledger
 * project after visiting three releases is the same place as standing over it
 * directly, and encoding the journey would make two readers at the same spot
 * see two different URLs. The journey lives where journeys live — in the
 * browser's history.
 */

export type Target =
	| { kind: 'task'; id: string }
	| { kind: 'release'; slug: string }
	| { kind: 'project'; name: string };

/** The camera position as a hash fragment: `#at/release/schema-lives-here`. */
export function encodeTarget(target: Target | null): string {
	if (target === null) return '';
	if (target.kind === 'task') return `#at/task/${encodeURIComponent(target.id)}`;
	if (target.kind === 'release') return `#at/release/${encodeURIComponent(target.slug)}`;
	return `#at/project/${encodeURIComponent(target.name)}`;
}

/** Parses defensively: an unreadable hash is the overview, never a throw. */
export function decodeTarget(hash: string): Target | null {
	const segments = hash.replace(/^#/, '').split('/').filter(Boolean);
	if (segments.length !== 3 || segments[0] !== 'at') return null;
	const value = decodeURIComponent(segments[2]);
	if (segments[1] === 'task') return { kind: 'task', id: value };
	if (segments[1] === 'release') return { kind: 'release', slug: value };
	if (segments[1] === 'project') return { kind: 'project', name: value };
	return null;
}

export function sameTarget(a: Target | null, b: Target | null): boolean {
	if (a === null || b === null) return a === b;
	if (a.kind === 'task' && b.kind === 'task') return a.id === b.id;
	if (a.kind === 'release' && b.kind === 'release') return a.slug === b.slug;
	if (a.kind === 'project' && b.kind === 'project') return a.name === b.name;
	return false;
}

/**
 * A stable key for a camera stop, used to register the focusable element that
 * stands at that position on the map. The overview is a stop too — 'map' —
 * because back can land there and the focus has to have somewhere to go.
 */
export function targetKey(target: Target | null): string {
	if (target === null) return 'map';
	if (target.kind === 'task') return `task/${target.id}`;
	if (target.kind === 'release') return `release/${target.slug}`;
	return `project/${target.name}`;
}
