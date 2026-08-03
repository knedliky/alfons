/**
 * The two levels above a task: its release, and the project that release sits in.
 *
 * This file exists only because the sheet exists. Nothing here reaches the deck
 * or the grid — the running view still knows about running tasks and nothing
 * else, and the lookups below are called at the moment a reader summons the
 * sheet, not while the page is being read.
 *
 * The shape is the corpus's own. A release carries a slug, a title, a project, a
 * set of tags, a documented date that is frequently null, a task count and its
 * tasks grouped by integer phase. A project is deliberately thin: a name and two
 * counts. That thinness is the point rather than an omission — a project page
 * would be a corpus browser, and this round is not building one.
 */

import type { TaskStatus } from './tasks.ts';

/** A task as a release knows it: enough to list, not enough to be a card. */
export interface ReleaseTask {
	id: string;
	title: string;
	phase: number;
	status: TaskStatus;
}

export interface Release {
	slug: string;
	title: string;
	project: string;
	tags: string[];
	/** Null is the common case. A release is documented when it lands, not before. */
	documentedOn: string | null;
	taskCount: number;
	tasks: ReleaseTask[];
}

/**
 * A project, as much of one as this page is willing to show. Two counts and a
 * name. Anything more — a list of releases, a description, a repository path —
 * would make the sheet a place rather than a note, and the whole argument of
 * this approach is that the reader never goes anywhere.
 */
export interface Project {
	slug: string;
	releaseCount: number;
	runningCount: number;
}

export const releases: Release[] = [
	{
		slug: 'prototype-loop-v1',
		title: 'Prototype loop v1 — watchable five-approach prototyping at dev/<page-name>',
		project: 'alfons',
		tags: ['alfons', 'mcp', 'prototyping', 'dev-app', 'skill'],
		documentedOn: null,
		taskCount: 4,
		tasks: [
			{
				id: 'AL-012',
				title: 'Serve prototypes/ at /dev/<page>/<approach> and discover rounds from the tree',
				phase: 1,
				status: 'done'
			},
			{
				id: 'AL-013',
				title: 'plan_prototype_round: write round.json and seed five approach shells',
				phase: 1,
				status: 'done'
			},
			{
				id: 'AL-014',
				title: 'Skill: /prototype — the one-question-at-a-time journey and the five-agent fan-out',
				phase: 2,
				status: 'verifying'
			},
			{
				id: 'AL-015',
				title: 'The live glow: watch a region being composed without reloading the page',
				phase: 2,
				status: 'done'
			}
		]
	},
	{
		slug: 'alfons-mcp',
		title: 'Alfons v1 — one design system, three surfaces',
		project: 'alfons',
		tags: ['alfons', 'mcp', 'design-system', 'storybook', 'postgres'],
		documentedOn: '2026-08-02',
		taskCount: 12,
		tasks: []
	},
	{
		slug: 'schema-lives-here',
		title: 'The schema lives here — DDL out of a repository being dismantled',
		project: 'ledger',
		tags: ['ledger', 'schema', 'postgres', 'migrations'],
		documentedOn: null,
		taskCount: 8,
		tasks: [
			{
				id: 'LDG-036',
				title: 'Move the DDL out of motivka and into this repository',
				phase: 1,
				status: 'done'
			},
			{
				id: 'LDG-039',
				title: 'Probe psql-18 in every script, because bare psql resolves interactively only',
				phase: 1,
				status: 'blocked'
			},
			{
				id: 'LDG-041',
				title: 'Regenerate base.sql from the live corpus and hold it there with a bootstrap test',
				phase: 1,
				status: 'building'
			},
			{
				id: 'LDG-037',
				title: 'Record base.manifest so a fresh build never replays migration 0001',
				phase: 2,
				status: 'done'
			},
			{
				id: 'LDG-038',
				title: 'Drop xml_text and delete its definition, not only the object',
				phase: 2,
				status: 'done'
			},
			{
				id: 'LDG-040',
				title: 'Grandfather the thirteen legacy unmatched verification results',
				phase: 2,
				status: 'triaged'
			},
			{
				id: 'LDG-042',
				title: 'Document the regeneration path so the next hand-written guess is not made',
				phase: 3,
				status: 'pending'
			},
			{
				id: 'LDG-043',
				title: 'Mirror the state machine in Python for offline validation',
				phase: 3,
				status: 'wontfix'
			}
		]
	},
	{
		slug: 'dev-surface-v2',
		title: 'The dev surface survives a restart',
		project: 'atlas',
		tags: ['atlas', 'caddy', 'dev-app', 'proxy'],
		documentedOn: '2026-07-28',
		taskCount: 6,
		tasks: [
			{
				id: 'ATL-110',
				title: 'Pin the dev server to a port Caddy can reverse-proxy',
				phase: 1,
				status: 'done'
			},
			{
				id: 'ATL-111',
				title: 'Serve under base /dev so proxied paths arrive intact',
				phase: 1,
				status: 'done'
			},
			{
				id: 'ATL-114',
				title: 'Watch prototypes/ from outside the Vite root and invalidate on add',
				phase: 2,
				status: 'done'
			},
			{
				id: 'ATL-115',
				title: 'Add a second watcher for round.json',
				phase: 2,
				status: 'duplicate'
			},
			{
				id: 'ATL-118',
				title: 'Proxy /dev through Caddy so the prototyping surface survives a restart',
				phase: 3,
				status: 'building'
			},
			{
				id: 'ATL-119',
				title: 'Health-check the upstream so a dead dev server reads as dead',
				phase: 3,
				status: 'pending'
			}
		]
	},
	{
		slug: 'auth-hardening',
		title: 'Auth hardening — a 401 the caller can act on',
		project: 'gateway',
		tags: ['gateway', 'auth', 'oauth', 'security'],
		documentedOn: null,
		taskCount: 5,
		tasks: [
			{
				id: 'GW-070',
				title: 'Cache the token introspection response for its own lifetime',
				phase: 1,
				status: 'done'
			},
			{
				id: 'GW-071',
				title: 'Distinguish an expired token from a revoked one in the log',
				phase: 1,
				status: 'done'
			},
			{
				id: 'GW-072',
				title: 'Retry a token refresh once before surfacing a 401 to the caller',
				phase: 1,
				status: 'verifying'
			},
			{
				id: 'GW-073',
				title: 'Rate-limit the refresh endpoint per client rather than per address',
				phase: 2,
				status: 'triaged'
			},
			{
				id: 'GW-074',
				title: 'Rotate the signing key without a restart',
				phase: 2,
				status: 'pending'
			}
		]
	}
];

export const projects: Project[] = [
	{ slug: 'alfons', releaseCount: 2, runningCount: 1 },
	{ slug: 'ledger', releaseCount: 3, runningCount: 1 },
	{ slug: 'atlas', releaseCount: 4, runningCount: 1 },
	{ slug: 'gateway', releaseCount: 2, runningCount: 1 }
];

export function findRelease(slug: string): Release | null {
	return releases.find((candidate) => candidate.slug === slug) ?? null;
}

export function findProject(slug: string): Project | null {
	return projects.find((candidate) => candidate.slug === slug) ?? null;
}

/** One phase and the tasks in it, in phase order. Phases are integers in the corpus. */
export interface Phase {
	number: number;
	tasks: ReleaseTask[];
}

export function phasesOf(release: Release): Phase[] {
	const byNumber = new Map<number, ReleaseTask[]>();
	for (const task of release.tasks) {
		const bucket = byNumber.get(task.phase);
		if (bucket) bucket.push(task);
		else byNumber.set(task.phase, [task]);
	}
	return [...byNumber.entries()]
		.sort(([a], [b]) => a - b)
		.map(([number, tasks]) => ({ number, tasks }));
}

/**
 * Australian English, and the corpus's own date format. A release with no
 * documented date says so in words rather than showing an empty field, because
 * "not documented" is a fact about the release and a blank is a bug.
 */
export function documentedLine(release: Release): string {
	return release.documentedOn ? `Documented ${release.documentedOn}` : 'Not documented';
}
