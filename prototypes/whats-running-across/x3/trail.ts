/**
 * The trail: the reader's own journey, as data.
 *
 * This approach's claim is that recency is the truest model of a reader who
 * jumps around, so the trail is not the hierarchy and not the history stack —
 * it is the hand of cards the reader has picked up, most recent on top.
 *
 * Three decisions, each of which could lose:
 *
 * 1. DEDUPED BY IDENTITY, MOVE-TO-FRONT. Revisiting a place does not add a
 *    second card; it moves the card to the front. A trail with three copies of
 *    `auth-hardening` is a log, and a log answers "what did I do" rather than
 *    "where can I go". The browser's history keeps the duplicates — it is the
 *    honest journey — and the trail is the deduped view over it.
 *
 * 2. CAPPED AT TWELVE, OLDEST FALLS OFF. With dedupe the trail is bounded by
 *    distinct places, which on this corpus is still dozens. Past about a dozen
 *    the recency signal has decayed to noise — a chip last touched forty places
 *    ago is not "where I was just now", it is a bookmark, and bookmarks are a
 *    different feature. The strip scrolls sideways for what the cap keeps, so
 *    "one tap" stays true for anything recent; nothing hides behind a menu.
 *
 * 3. IT SURVIVES A RELOAD, PER TAB. sessionStorage, not localStorage: the
 *    trail is this reader's journey in this sitting, not a server fact, and a
 *    fresh tab honestly starts with no journey. This is also what makes the
 *    empty running state navigable — the trail still carries the last things
 *    seen when the reader comes back and nothing runs.
 *
 * Only release and project places are encodable into the location hash. A task
 * read at card scale is a place on the trail but not a screen of its own — it
 * lives inside the running view, which owns scale and index — so its chip
 * navigates the running view rather than pushing a screen.
 */

export type Place =
	| { kind: 'task'; id: string; release: string }
	| { kind: 'release'; slug: string }
	| { kind: 'project'; name: string };

/** A screen of its own: what the hash can carry. Null is the running view. */
export type ScreenPlace = Extract<Place, { kind: 'release' | 'project' }> | null;

const TRAIL_CAP = 12;
const STORE_KEY = 'whats-running-across-x3-trail';

export function samePlace(a: Place, b: Place): boolean {
	if (a.kind === 'task' && b.kind === 'task') return a.id === b.id;
	if (a.kind === 'release' && b.kind === 'release') return a.slug === b.slug;
	if (a.kind === 'project' && b.kind === 'project') return a.name === b.name;
	return false;
}

export function placeKey(place: Place): string {
	if (place.kind === 'task') return `task/${place.id}`;
	if (place.kind === 'release') return `release/${place.slug}`;
	return `project/${place.name}`;
}

/** `#release/schema-lives-here`, `#project/ledger`, or nothing at all. */
export function encodePlace(place: ScreenPlace): string {
	if (place === null) return '';
	return place.kind === 'release'
		? `#release/${encodeURIComponent(place.slug)}`
		: `#project/${encodeURIComponent(place.name)}`;
}

/** Parses defensively: an unreadable hash is the running view, never a throw. */
export function decodePlace(hash: string): ScreenPlace {
	const segments = hash.replace(/^#/, '').split('/').filter(Boolean);
	if (segments.length < 2) return null;
	const value = decodeURIComponent(segments[1]);
	if (segments[0] === 'release') return { kind: 'release', slug: value };
	if (segments[0] === 'project') return { kind: 'project', name: value };
	return null;
}

/**
 * A place joins the trail, most-recent-first. Returns the SAME array when the
 * place is already at the front — that referential equality is what lets a
 * reactive effect call this on every card the deck settles on without
 * triggering itself.
 */
export function visit(trail: Place[], place: Place): Place[] {
	if (trail.length > 0 && samePlace(trail[0], place)) return trail;
	return [place, ...trail.filter((held) => !samePlace(held, place))].slice(0, TRAIL_CAP);
}

export function loadTrail(): Place[] {
	if (typeof sessionStorage === 'undefined') return [];
	try {
		const raw = sessionStorage.getItem(STORE_KEY);
		if (!raw) return [];
		const parsed: unknown = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(entry): entry is Place =>
				typeof entry === 'object' &&
				entry !== null &&
				'kind' in entry &&
				(entry.kind === 'task' || entry.kind === 'release' || entry.kind === 'project')
		);
	} catch {
		return [];
	}
}

export function saveTrail(trail: Place[]): void {
	if (typeof sessionStorage === 'undefined') return;
	try {
		sessionStorage.setItem(STORE_KEY, JSON.stringify(trail));
	} catch {
		// A full or forbidden store loses persistence, never the page.
	}
}
