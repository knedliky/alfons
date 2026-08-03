/**
 * The two levels above a task, and the data a page about them can honestly show.
 *
 * A task sits in a release and a release sits in a project. That is the whole
 * hierarchy the corpus has; there is no fourth level and this file does not
 * invent one.
 *
 * These types are deliberately NOT extensions of RunningTask. A release holds
 * every one of its tasks, and most of them are not running — `pending`,
 * `triaged`, `blocked`, `done`. RunningStatus cannot express those and must not
 * learn to: it is the type that keeps the running view honest. So the upward
 * views get their own status type, and the running view keeps its two-value one.
 */

/** Every ledger status, which is what a release view has to be able to render. */
export type TaskStatus =
	| 'pending'
	| 'triaged'
	| 'building'
	| 'verifying'
	| 'blocked'
	| 'done'
	| 'abandoned';

/** Only these two are motion, and only these two may take a status colour. */
export const RUNNING_STATUSES = ['building', 'verifying'] as const;

export function isRunning(status: TaskStatus): boolean {
	return status === 'building' || status === 'verifying';
}

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
	/** Null until a release has been written up. Shown as a fact, not a warning. */
	documentedOn: string | null;
	tasks: ReleaseTask[];
}

export interface Project {
	name: string;
	repoPath: string;
	/** One line saying what the project is for. The project view has nothing else. */
	blurb: string;
}

/**
 * Eleven projects exist in the corpus. Four of them own something that is
 * running today, and those four are the only ones reachable by going up from
 * this page — going up is navigation from where the reader stands, so a project
 * with nothing running is simply not on the way.
 */
export const projects: Project[] = [
	{
		name: 'alfons',
		repoPath: '~/Agents/alfons',
		blurb: 'One design system, three surfaces — library, Storybook, and the MCP server agents build against.'
	},
	{
		name: 'ledger',
		repoPath: '~/Agents/ledger',
		blurb: 'The single write path into the ledger schema. Tasks, decisions, releases and projects.'
	},
	{
		name: 'atlas',
		repoPath: '~/Agents/atlas',
		blurb: 'The machine itself — reverse proxy, local domains, and the services behind them.'
	},
	{
		name: 'gateway',
		repoPath: '~/Agents/gateway',
		blurb: 'The edge every external call passes through. Auth, rate limits, and retries.'
	}
];

/**
 * Two of these are real (`prototype-loop-v1` and `alfons-mcp`); the rest are
 * plausible stand-ins so the other three running tasks have a release to reach.
 */
export const releases: Release[] = [
	{
		slug: 'prototype-loop-v1',
		title: 'Prototype loop v1 — watchable five-approach prototyping at dev/<page-name>',
		project: 'alfons',
		tags: ['alfons', 'mcp', 'prototyping', 'dev-app', 'skill'],
		documentedOn: null,
		tasks: [
			{ id: 'AL-011', title: 'The /dev surface: rounds discovered from the tree, not a registry', phase: 1, status: 'done' },
			{ id: 'AL-012', title: 'The approach pager and the live work glow', phase: 1, status: 'done' },
			{ id: 'AL-013', title: 'plan_prototype_round: write a round.json and seed five approach shells', phase: 2, status: 'done' },
			{ id: 'AL-014', title: 'Skill: /prototype — the one-question-at-a-time journey and the five-agent fan-out', phase: 2, status: 'verifying' }
		]
	},
	{
		slug: 'alfons-mcp',
		title: 'Alfons v1 — one design system, three surfaces',
		project: 'alfons',
		tags: ['alfons', 'mcp', 'design-system', 'storybook', 'postgres'],
		documentedOn: '2026-08-02',
		tasks: [
			{ id: 'AL-001', title: 'Token manifest generated from the CSS rather than curated by hand', phase: 1, status: 'done' },
			{ id: 'AL-002', title: 'find_components: search the library by what it should do', phase: 1, status: 'done' },
			{ id: 'AL-003', title: 'get_component: props, variants, snippets and the Storybook link', phase: 1, status: 'done' },
			{ id: 'AL-004', title: 'review_markup: the design rules, as findings rather than a gate', phase: 2, status: 'done' },
			{ id: 'AL-005', title: 'get_tokens narrowed by surface, with deprecations carrying replacements', phase: 2, status: 'done' },
			{ id: 'AL-006', title: 'scaffold_component and the rules it writes against', phase: 2, status: 'done' },
			{ id: 'AL-007', title: 'get_layout_recipe: the composition order, by tier', phase: 3, status: 'done' },
			{ id: 'AL-008', title: 'review_library: sweep the whole library on the same rules', phase: 3, status: 'done' },
			{ id: 'AL-009', title: 'apply_fixes: take a finding’s own correction', phase: 3, status: 'done' },
			{ id: 'AL-010', title: 'Retire the curated token list and read Postgres instead', phase: 3, status: 'done' },
			{ id: 'AL-015', title: 'Storybook catalogue published behind the proxy', phase: 4, status: 'done' },
			{ id: 'AL-016', title: 'Lifecycle: retired components answer with their replacement', phase: 4, status: 'done' }
		]
	},
	{
		slug: 'schema-lives-here',
		title: 'The schema moves in — base.sql as the install path, migrations as the upgrade path',
		project: 'ledger',
		tags: ['ledger', 'postgres', 'schema', 'migrations'],
		documentedOn: null,
		tasks: [
			{ id: 'LDG-039', title: 'Move schema/ out of the repository being dismantled', phase: 1, status: 'done' },
			{ id: 'LDG-040', title: 'base.manifest: record what base.sql already contains', phase: 1, status: 'done' },
			{ id: 'LDG-041', title: 'Regenerate base.sql from the live corpus and hold it there with a bootstrap test', phase: 1, status: 'building' },
			{ id: 'LDG-042', title: 'Emit CREATE EXTENSION lines pg_dump leaves out of a schema-scoped dump', phase: 2, status: 'triaged' },
			{ id: 'LDG-043', title: 'Compare trigger definitions with search_path emptied on both sides', phase: 2, status: 'pending' },
			{ id: 'LDG-044', title: 'Seed a CI corpus so the database-marked tests run rather than skip', phase: 3, status: 'pending' }
		]
	},
	{
		slug: 'hooks-that-actually-run',
		title: 'One release-document check, four callers',
		project: 'ledger',
		tags: ['ledger', 'hooks', 'git'],
		documentedOn: '2026-08-01',
		tasks: [
			{ id: 'LDG-035', title: 'Probe psql-18: bare psql resolves only in interactive shells', phase: 1, status: 'done' },
			{ id: 'LDG-036', title: 'Scope the rule to the repository and say when the server has drifted', phase: 1, status: 'done' },
			{ id: 'LDG-037', title: 'Collapse four near-identical hooks into one checked script', phase: 2, status: 'done' },
			{ id: 'LDG-038', title: 'A test that outlives its example', phase: 2, status: 'done' }
		]
	},
	{
		slug: 'dev-surface-v2',
		title: 'The prototyping surface survives a restart',
		project: 'atlas',
		tags: ['atlas', 'caddy', 'proxy', 'dev-app'],
		documentedOn: null,
		tasks: [
			{ id: 'ATL-115', title: 'A local domain per service rather than a remembered port', phase: 1, status: 'done' },
			{ id: 'ATL-116', title: 'Certificates that the browser and curl both accept', phase: 1, status: 'done' },
			{ id: 'ATL-117', title: 'Restart policy: bring the vite dev server back with the machine', phase: 2, status: 'done' },
			{ id: 'ATL-118', title: 'Proxy /dev through Caddy so the prototyping surface survives a restart', phase: 3, status: 'building' },
			{ id: 'ATL-119', title: 'Health check the proxy rather than the process behind it', phase: 3, status: 'blocked' }
		]
	},
	{
		slug: 'auth-hardening',
		title: 'Fail the way a caller can act on',
		project: 'gateway',
		tags: ['gateway', 'auth', 'tokens', 'resilience'],
		documentedOn: null,
		tasks: [
			{ id: 'GW-070', title: 'Distinguish an expired token from a revoked one at the edge', phase: 1, status: 'done' },
			{ id: 'GW-071', title: 'Carry the failure reason into the response body, not only the status', phase: 1, status: 'done' },
			{ id: 'GW-072', title: 'Retry a token refresh once before surfacing a 401 to the caller', phase: 1, status: 'verifying' },
			{ id: 'GW-073', title: 'Back off rather than hammer when the identity provider is down', phase: 2, status: 'triaged' }
		]
	}
];

export function findRelease(slug: string): Release | undefined {
	return releases.find((release) => release.slug === slug);
}

export function findProject(name: string): Project | undefined {
	return projects.find((project) => project.name === name);
}

export function releasesInProject(name: string): Release[] {
	return releases.filter((release) => release.project === name);
}

/**
 * Tasks grouped into the integer phases the release declares, in order. A phase
 * is not a status: an empty phase never appears, and a phase with one task is
 * still a phase.
 */
export function phasesOf(release: Release): { phase: number; tasks: ReleaseTask[] }[] {
	const buckets = new Map<number, ReleaseTask[]>();
	for (const task of release.tasks) {
		const bucket = buckets.get(task.phase);
		if (bucket) bucket.push(task);
		else buckets.set(task.phase, [task]);
	}
	return [...buckets.entries()]
		.sort(([a], [b]) => a - b)
		.map(([phase, tasks]) => ({ phase, tasks }));
}

export function runningCount(release: Release): number {
	return release.tasks.filter((task) => isRunning(task.status)).length;
}
