/**
 * The two levels above a task: releases and projects.
 *
 * This file exists only because this round relaxed "no second level". The
 * running view needs none of it — a runner already carries its project and
 * release as strings — and everything here is loaded for the sake of a screen
 * that is only reached by a deliberate tap.
 *
 * A release screen shows a release, which means it shows tasks that are not
 * running. That is the point: a release rendered as only its two building tasks
 * would be a lie about the release. The running view's admission rule
 * (building and verifying only) is a rule about the running view, not about
 * every screen in the app, and the pushed screen is not the running view.
 */

import type { TaskStatus } from './tasks.ts';

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
	/** Null when the release has shipped nothing written down yet. */
	documentedOn: string | null;
	taskCount: number;
	/** Present for the releases a runner can reach; the rest are index entries. */
	tasks?: ReleaseTask[];
}

export interface Project {
	name: string;
	/** One line, because a project screen is a destination, not a dossier. */
	blurb: string;
}

/** Every project in the corpus, in the order the ledger lists them. */
export const projects: Project[] = [
	{
		name: 'alfons',
		blurb: 'The design system: tokens, components, and three surfaces over one manifest.'
	},
	{ name: 'atlas', blurb: 'The site and its local edge — Caddy, mounts and the public routes.' },
	{
		name: 'ledger',
		blurb: 'The MCP server that is the single write path into the context database.'
	},
	{ name: 'motivka', blurb: 'The retired file pipeline and what was salvaged out of it.' },
	{ name: 'field-notes', blurb: 'Writing, published from the corpus.' },
	{ name: 'gateway', blurb: 'The authenticated front door to every local service.' },
	{ name: 'scratch', blurb: 'Work with no home yet.' },
	{ name: 'agentbench', blurb: 'Evals for agent behaviour under the house rules.' },
	{ name: 'domovoi', blurb: 'The household automation runtime.' },
	{ name: 'merlin', blurb: 'Scheduling and the calendar surface.' },
	{ name: 'task-manager', blurb: 'The original tracker, kept for its history.' }
];

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
				title: 'plan_prototype_round seeds five distinct approaches from one brief',
				phase: 1,
				status: 'done'
			},
			{
				id: 'AL-013',
				title: 'Discover rounds from the tree so provisioning is writing files',
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
				title: 'promote_prototype names what the library must absorb before a win ships',
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
		taskCount: 12
	},
	{
		slug: 'schema-lives-here',
		title: 'The schema lives here — DDL, a generated base file and a bootstrap test',
		project: 'ledger',
		tags: ['ledger', 'schema', 'postgres', 'migrations'],
		documentedOn: null,
		taskCount: 6,
		tasks: [
			{
				id: 'LDG-038',
				title: 'Move the DDL out of motivka before that repository is dismantled',
				phase: 1,
				status: 'done'
			},
			{
				id: 'LDG-039',
				title: 'Record the base file in a manifest so migrations are never replayed',
				phase: 1,
				status: 'done'
			},
			{
				id: 'LDG-040',
				title: 'Delete the xml_text definition, not only the object it created',
				phase: 1,
				status: 'done'
			},
			{
				id: 'LDG-041',
				title: 'Regenerate base.sql from the live corpus and hold it there with a bootstrap test',
				phase: 2,
				status: 'building'
			},
			{
				id: 'LDG-042',
				title: 'Emit the CREATE EXTENSION lines a schema-scoped dump leaves out',
				phase: 2,
				status: 'pending'
			},
			{
				id: 'LDG-043',
				title: 'Drop the provenance columns once nothing depends on a task having a document',
				phase: 3,
				status: 'blocked'
			}
		]
	},
	{
		slug: 'hooks-that-actually-run',
		title: 'Hooks that actually run — one release-document check, four callers',
		project: 'ledger',
		tags: ['ledger', 'githooks', 'enforcement'],
		documentedOn: '2026-07-29',
		taskCount: 5
	},
	{
		slug: 'dev-surface-v2',
		title: 'Dev surface v2 — the prototyping app served on a name that survives a restart',
		project: 'atlas',
		tags: ['atlas', 'caddy', 'dev-app', 'proxy'],
		documentedOn: null,
		taskCount: 5,
		tasks: [
			{
				id: 'ATL-115',
				title: 'Serve the catalogue as a static mount rather than through the gateway',
				phase: 1,
				status: 'done'
			},
			{
				id: 'ATL-116',
				title: 'A reverse-proxy block for /dev/* with the paths left intact',
				phase: 1,
				status: 'done'
			},
			{
				id: 'ATL-117',
				title: 'Keep the dev server alive across a machine restart',
				phase: 2,
				status: 'triaged'
			},
			{
				id: 'ATL-118',
				title: 'Proxy /dev through Caddy so the prototyping surface survives a restart',
				phase: 3,
				status: 'building'
			},
			{
				id: 'ATL-119',
				title: 'Serve /dev over TLS with a certificate of its own',
				phase: 3,
				status: 'wontfix'
			}
		]
	},
	{
		slug: 'catalogue-mount',
		title: 'The catalogue on a name of its own',
		project: 'atlas',
		tags: ['atlas', 'caddy', 'storybook'],
		documentedOn: '2026-07-21',
		taskCount: 3
	},
	{
		slug: 'auth-hardening',
		title: 'Auth hardening — one refresh in flight and a truthful 401',
		project: 'gateway',
		tags: ['gateway', 'auth', 'tokens', 'reliability'],
		documentedOn: null,
		taskCount: 7,
		tasks: [
			{
				id: 'GW-068',
				title: 'Read the expiry from the introspection response rather than the cache',
				phase: 1,
				status: 'done'
			},
			{ id: 'GW-069', title: 'One refresh in flight at a time', phase: 1, status: 'done' },
			{
				id: 'GW-070',
				title: 'Retry once on a 401 before giving up',
				phase: 1,
				status: 'duplicate'
			},
			{
				id: 'GW-071',
				title: 'Distinguish an expired token from a revoked one',
				phase: 2,
				status: 'done'
			},
			{
				id: 'GW-072',
				title: 'Retry a token refresh once before surfacing a 401 to the caller',
				phase: 2,
				status: 'verifying'
			},
			{
				id: 'GW-073',
				title: 'Log the refresh path without ever logging the token',
				phase: 3,
				status: 'pending'
			},
			{
				id: 'GW-074',
				title: 'Fail closed when the identity provider is unreachable',
				phase: 3,
				status: 'triaged'
			}
		]
	},
	{
		slug: 'gateway-v1',
		title: 'Gateway v1 — one bearer token in front of everything local',
		project: 'gateway',
		tags: ['gateway', 'auth', 'caddy'],
		documentedOn: '2026-06-30',
		taskCount: 9
	}
];

export function findRelease(slug: string): Release | null {
	return releases.find((release) => release.slug === slug) ?? null;
}

export function findProject(name: string): Project | null {
	return projects.find((project) => project.name === name) ?? null;
}

export function releasesOf(project: string): Release[] {
	return releases.filter((release) => release.project === project);
}

/**
 * Tasks grouped by integer phase, phases ascending.
 *
 * Phase is the release's own structure — it is what the release says about the
 * order of its own work — so it is the grouping a release screen owns. Grouping
 * by status instead would have made the screen a board, which is the thing this
 * page is not.
 */
export function tasksByPhase(release: Release): { phase: number; tasks: ReleaseTask[] }[] {
	const tasks = release.tasks ?? [];
	const phases = [...new Set(tasks.map((task) => task.phase))].sort((a, b) => a - b);
	return phases.map((phase) => ({
		phase,
		tasks: tasks.filter((task) => task.phase === phase)
	}));
}

/** The two statuses this page calls motion, counted inside a release. */
export function runningCount(release: Release): number {
	return (release.tasks ?? []).filter(
		(task) => task.status === 'building' || task.status === 'verifying'
	).length;
}
