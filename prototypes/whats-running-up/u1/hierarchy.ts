/**
 * The two levels above a task: the release it sits in, and the project that
 * holds the release.
 *
 * This file exists only because the brief relaxed "no second level" for the
 * upward move. Note what it does NOT contain: there is no index of the eleven
 * projects and no list of every release. Only the ancestors of a task that is
 * running today are reachable, because the only way into this data is from a
 * card, and a card is always a runner. A full index would be a corpus browser,
 * which is the thing the relaxation did not license.
 *
 * A release's roster carries every task, not only the running ones. That is
 * deliberate and it is the cost: a release rendered with its running tasks only
 * would be the grid again, filtered, and the rung would tell the reader nothing
 * they did not already have. Rosters are read-only on this page — see
 * ReleaseScale.svelte for why nothing here is a way back down.
 */

/** Every ledger status, not only the two that are motion. A roster shows them all. */
export type LedgerStatus = 'pending' | 'triaged' | 'building' | 'verifying' | 'blocked' | 'done';

export interface RosterTask {
	id: string;
	phase: number;
	status: LedgerStatus;
}

export interface Release {
	slug: string;
	title: string;
	project: string;
	tags: string[];
	/** Null when the release has no write-up yet, which is most of them. */
	documentedOn: string | null;
	taskCount: number;
	roster: RosterTask[];
}

export interface Project {
	slug: string;
	/** Release slugs, newest first. The project rung renders these in order. */
	releases: string[];
}

export const releases: Record<string, Release> = {
	'prototype-loop-v1': {
		slug: 'prototype-loop-v1',
		title: 'Prototype loop v1 — watchable five-approach prototyping at dev/<page-name>',
		project: 'alfons',
		tags: ['alfons', 'mcp', 'prototyping', 'dev-app', 'skill'],
		documentedOn: null,
		taskCount: 4,
		roster: [
			{ id: 'AL-011', phase: 1, status: 'done' },
			{ id: 'AL-012', phase: 1, status: 'done' },
			{ id: 'AL-014', phase: 2, status: 'verifying' },
			{ id: 'AL-017', phase: 3, status: 'pending' }
		]
	},
	'alfons-mcp': {
		slug: 'alfons-mcp',
		title: 'Alfons v1 — one design system, three surfaces',
		project: 'alfons',
		tags: ['alfons', 'mcp', 'design-system', 'storybook', 'postgres'],
		documentedOn: '2026-08-02',
		taskCount: 12,
		roster: [
			{ id: 'AL-001', phase: 1, status: 'done' },
			{ id: 'AL-002', phase: 1, status: 'done' },
			{ id: 'AL-003', phase: 1, status: 'done' },
			{ id: 'AL-004', phase: 2, status: 'done' },
			{ id: 'AL-005', phase: 2, status: 'done' },
			{ id: 'AL-006', phase: 2, status: 'done' },
			{ id: 'AL-007', phase: 2, status: 'done' },
			{ id: 'AL-008', phase: 3, status: 'done' },
			{ id: 'AL-009', phase: 3, status: 'done' },
			{ id: 'AL-010', phase: 3, status: 'done' },
			{ id: 'AL-013', phase: 4, status: 'done' },
			{ id: 'AL-016', phase: 4, status: 'done' }
		]
	},
	'schema-lives-here': {
		slug: 'schema-lives-here',
		title: 'The schema moves in, and a bootstrap test holds it to the live corpus',
		project: 'ledger',
		tags: ['ledger', 'postgres', 'schema', 'migrations'],
		documentedOn: null,
		taskCount: 7,
		roster: [
			{ id: 'LDG-036', phase: 1, status: 'done' },
			{ id: 'LDG-038', phase: 1, status: 'done' },
			{ id: 'LDG-041', phase: 1, status: 'building' },
			{ id: 'LDG-042', phase: 2, status: 'blocked' },
			{ id: 'LDG-043', phase: 2, status: 'triaged' },
			{ id: 'LDG-044', phase: 3, status: 'pending' },
			{ id: 'LDG-045', phase: 3, status: 'pending' }
		]
	},
	'hooks-that-actually-run': {
		slug: 'hooks-that-actually-run',
		title: 'One release-document check, four callers',
		project: 'ledger',
		tags: ['ledger', 'hooks', 'git'],
		documentedOn: '2026-07-29',
		taskCount: 5,
		roster: []
	},
	'dev-surface-v2': {
		slug: 'dev-surface-v2',
		title: 'The prototyping surface survives a restart',
		project: 'atlas',
		tags: ['atlas', 'caddy', 'proxy', 'dev-app'],
		documentedOn: null,
		taskCount: 5,
		roster: [
			{ id: 'ATL-115', phase: 1, status: 'done' },
			{ id: 'ATL-116', phase: 2, status: 'done' },
			{ id: 'ATL-118', phase: 3, status: 'building' },
			{ id: 'ATL-119', phase: 3, status: 'triaged' },
			{ id: 'ATL-121', phase: 4, status: 'pending' }
		]
	},
	'caddy-everywhere': {
		slug: 'caddy-everywhere',
		title: 'Every local service behind one reverse proxy',
		project: 'atlas',
		tags: ['atlas', 'caddy', 'tls'],
		documentedOn: '2026-07-11',
		taskCount: 9,
		roster: []
	},
	'auth-hardening': {
		slug: 'auth-hardening',
		title: 'Token refresh, retries and the 401 the caller finally sees',
		project: 'gateway',
		tags: ['gateway', 'auth', 'tokens', 'reliability'],
		documentedOn: null,
		taskCount: 6,
		roster: [
			{ id: 'GW-068', phase: 1, status: 'done' },
			{ id: 'GW-072', phase: 1, status: 'verifying' },
			{ id: 'GW-073', phase: 2, status: 'blocked' },
			{ id: 'GW-074', phase: 2, status: 'pending' },
			{ id: 'GW-076', phase: 3, status: 'pending' },
			{ id: 'GW-077', phase: 3, status: 'pending' }
		]
	},
	'rate-limits-v2': {
		slug: 'rate-limits-v2',
		title: 'Per-tenant rate limits with a shared token bucket',
		project: 'gateway',
		tags: ['gateway', 'redis', 'limits'],
		documentedOn: '2026-06-30',
		taskCount: 8,
		roster: []
	}
};

export const projects: Record<string, Project> = {
	alfons: { slug: 'alfons', releases: ['prototype-loop-v1', 'alfons-mcp'] },
	ledger: { slug: 'ledger', releases: ['schema-lives-here', 'hooks-that-actually-run'] },
	atlas: { slug: 'atlas', releases: ['dev-surface-v2', 'caddy-everywhere'] },
	gateway: { slug: 'gateway', releases: ['auth-hardening', 'rate-limits-v2'] }
};

/** Phases in order, each with its tasks. A release groups its work this way. */
export function phasesOf(release: Release): { phase: number; tasks: RosterTask[] }[] {
	const seen = new Map<number, RosterTask[]>();
	for (const task of release.roster) {
		const bucket = seen.get(task.phase) ?? [];
		bucket.push(task);
		seen.set(task.phase, bucket);
	}
	return [...seen.entries()].sort(([a], [b]) => a - b).map(([phase, tasks]) => ({ phase, tasks }));
}

/** How many of a roster are in motion. Only these two statuses count as running. */
export function runningIn(release: Release): number {
	return release.roster.filter((task) => task.status === 'building' || task.status === 'verifying')
		.length;
}

/** "documented 2026-08-02" or the honest absence, which is the common case. */
export function documentedLine(release: Release): string {
	return release.documentedOn ? `documented ${release.documentedOn}` : 'not documented';
}
