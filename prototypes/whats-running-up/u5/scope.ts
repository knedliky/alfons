/**
 * What the deck is holding.
 *
 * This is the whole of approach u5. There is one screen and one deck; going up
 * does not move the reader, it changes the set the deck contains. A scope is
 * therefore not a route and not a filter — it is the answer to "which tasks are
 * these", and everything visible on the page is derived from it: the heading,
 * the count, the label, the ordering, and whether the live beacon is showing.
 *
 * Three kinds, and only three. `running` is home and is the reason the page
 * exists. `release` and `project` are the two rungs above a task that the corpus
 * actually has. There is no fourth kind, no "everything", no search: the reader
 * can only reach a set that some task they were already reading belongs to.
 */
import { isRunning, releases, releaseBySlug, tasks, type Task } from './tasks.ts';

export type ScopeKind = 'running' | 'release' | 'project';

export interface Scope {
	kind: ScopeKind;
	/** Release slug, project name, or '' for the running scope. */
	key: string;
}

export const RUNNING_SCOPE: Scope = { kind: 'running', key: '' };

/** Stable identity for a scope, used to key the deck so a refill remounts it. */
export function scopeId(scope: Scope): string {
	return `${scope.kind}:${scope.key}`;
}

export interface ScopeContents {
	scope: Scope;
	/** The tasks the deck holds, in the order it holds them. */
	tasks: Task[];
	/** How many of those are building or verifying. */
	running: number;
	/** The set's own name — a slug, a project name, or nothing when home. */
	name: string;
	/** A longer line for the release scope; empty otherwise. */
	subtitle: string;
}

/**
 * Running work first, then everything else by phase and id.
 *
 * A release deck is mostly finished work, and dropping the reader into a wall of
 * `done` would bury the one thing this page is for. Sorting is not filtering:
 * nothing is hidden, the coloured live cells simply occupy the top of the grid,
 * so "1 running of 4" is verifiable in the same glance that reads it. Ledger
 * order is preserved inside each of the two bands, so nothing shuffles between
 * refills.
 */
function orderForDeck(set: Task[]): Task[] {
	return [...set].sort((left, right) => {
		const motion = Number(isRunning(right.status)) - Number(isRunning(left.status));
		if (motion !== 0) return motion;
		if (left.phase !== right.phase) return left.phase - right.phase;
		return left.id.localeCompare(right.id);
	});
}

export function contentsOf(scope: Scope, corpus: Task[] = tasks): ScopeContents {
	const set =
		scope.kind === 'running'
			? corpus.filter((task) => isRunning(task.status))
			: scope.kind === 'release'
				? corpus.filter((task) => task.release === scope.key)
				: corpus.filter((task) => task.project === scope.key);

	const ordered = scope.kind === 'running' ? set : orderForDeck(set);
	const release = scope.kind === 'release' ? releaseBySlug(scope.key) : undefined;

	return {
		scope,
		tasks: ordered,
		running: ordered.filter((task) => isRunning(task.status)).length,
		name: scope.kind === 'running' ? '' : scope.key,
		subtitle: release?.title ?? ''
	};
}

/**
 * The releases whose work moved most recently.
 *
 * This exists for one state and one state only: nothing is running. Everywhere
 * else the reader reaches a release through a task they were already reading,
 * which is the whole discipline of the upward move — it is navigation from where
 * you stand, not a browser of the corpus. With an empty deck there is nowhere to
 * stand, so the empty state seeds the move with the handful of releases whose
 * work stopped most recently. It is a statement about the corpus rather than a
 * menu of everything in it, which is why it is capped and why it is ranked by
 * recency rather than offered alphabetically.
 */
export function releasesLastInMotion(limit = 3, corpus: Task[] = tasks) {
	return releases
		.map((release) => {
			const set = corpus.filter((task) => task.release === release.slug);
			const latest = set.reduce(
				(newest, task) => Math.max(newest, new Date(task.createdOn).getTime()),
				0
			);
			return { release, latest, count: set.length };
		})
		.filter((entry) => entry.count > 0)
		.sort((left, right) => right.latest - left.latest)
		.slice(0, limit);
}

/**
 * The second line under the heading: what the heading's number is measured over.
 *
 * The h1 always says "N running", because that is the page's one question and
 * its answer must not change shape with the scope. What this line adds is the
 * denominator — "of 4 in prototype-loop-v1" — so "1 running" is never a claim
 * about the world when it is a claim about a release. Home has no denominator
 * because the running scope IS the world.
 *
 * The KIND is named here — "in release prototype-loop-v1" — rather than in the
 * scope bar. That keeps the bar a single 44px row in every scope, so the deck
 * below it does not resize when the reader goes up, and it means one sentence
 * carries the count, the kind and the name with nothing else repeating any of
 * them.
 */
export function denominatorLine(contents: ScopeContents): string {
	if (contents.scope.kind === 'running') return 'across every project';
	const noun = contents.tasks.length === 1 ? 'task' : 'tasks';
	return `of ${contents.tasks.length} ${noun} in ${contents.scope.kind} ${contents.name}`;
}
