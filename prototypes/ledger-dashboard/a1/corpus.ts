/**
 * A slice of the live ledger corpus, shaped exactly as the API returns it.
 *
 * Hand-written rather than fetched because the prototype has to render without
 * a database behind it, and because a search field is only honestly testable
 * against titles a person would half-remember.
 */

export type TaskStatus =
	'pending' | 'triaged' | 'building' | 'verifying' | 'done' | 'blocked' | 'wontfix' | 'duplicate';

export type TaskType = 'feature' | 'refactor' | 'chore' | 'spike' | 'bug' | 'adhoc' | 'test';

export type Verdict = 'pass' | 'fail' | 'partial';

export type Risk = 'low' | 'medium' | 'high';

export interface Task {
	id: string;
	title: string;
	project: string;
	release: string;
	phase: number;
	status: TaskStatus;
	type: TaskType;
	risk: Risk;
	createdOn: string;
	completedOn: string | null;
	stepCount: number;
	criterionCount: number;
	fileChangeCount: number;
	latestAttempt: number | null;
	latestVerdict: Verdict | null;
	latestSealedOn: string | null;
	dependsOn: string[];
}

export interface Release {
	slug: string;
	title: string;
	project: string;
	isBucket: boolean;
	tags: string[];
	documentedOn: string | null;
	taskCount: number;
}

export interface Transition {
	at: string;
	taskId: string;
	title: string;
	from: TaskStatus;
	to: TaskStatus;
}

/** Ordered as the ledger orders them: entry states first, terminal states last. */
export const STATUS_ORDER: TaskStatus[] = [
	'pending',
	'triaged',
	'building',
	'verifying',
	'done',
	'blocked',
	'wontfix',
	'duplicate'
];

export const PROJECTS = [
	'alfons',
	'atlas',
	'ledger',
	'motivka',
	'field-notes',
	'gateway',
	'scratch',
	'agentbench',
	'domovoi',
	'merlin',
	'task-manager'
] as const;

export const releases: Release[] = [
	{
		slug: 'prototype-loop-v1',
		title: 'Prototype loop — five approaches, one page, one winner',
		project: 'alfons',
		isBucket: false,
		tags: ['design-system', 'agents', 'tooling'],
		documentedOn: null,
		taskCount: 9
	},
	{
		slug: 'alfons-mcp',
		title: 'Alfons v1 — one design system, three surfaces',
		project: 'alfons',
		isBucket: false,
		tags: ['design-system', 'mcp'],
		documentedOn: '2026-07-19',
		taskCount: 12
	},
	{
		slug: 'hooks-that-actually-run',
		title: 'Hooks that actually run — one check, four callers',
		project: 'ledger',
		isBucket: false,
		tags: ['governance', 'hooks'],
		documentedOn: '2026-08-01',
		taskCount: 6
	},
	{
		slug: 'atlas-proxy-v2',
		title: 'Atlas — one reverse proxy for every local surface',
		project: 'atlas',
		isBucket: false,
		tags: ['infra'],
		documentedOn: '2026-06-30',
		taskCount: 8
	},
	{
		slug: 'gateway-v1',
		title: 'Gateway — metered access to the agent fleet',
		project: 'gateway',
		isBucket: false,
		tags: ['infra', 'billing'],
		documentedOn: null,
		taskCount: 11
	},
	{
		slug: 'field-notes-ingest',
		title: 'Field notes — capture before it is a thought',
		project: 'field-notes',
		isBucket: false,
		tags: ['capture'],
		documentedOn: null,
		taskCount: 5
	},
	{
		slug: 'scratch-bucket',
		title: 'Scratch — unfiled work',
		project: 'scratch',
		isBucket: true,
		tags: [],
		documentedOn: null,
		taskCount: 41
	}
];

export const tasks: Task[] = [
	{
		id: 'AL-011',
		title: 'Dev harness: a Vite entry that mounts a prototype page outside Storybook',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-07-28',
		completedOn: '2026-07-30',
		stepCount: 5,
		criterionCount: 3,
		fileChangeCount: 4,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-30',
		dependsOn: []
	},
	{
		id: 'AL-012',
		title: 'Dev app: production-accurate prototype surface at /dev with pager and work glow',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-07-29',
		completedOn: '2026-08-01',
		stepCount: 6,
		criterionCount: 4,
		fileChangeCount: 8,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-08-01',
		dependsOn: ['AL-011', 'AL-013']
	},
	{
		id: 'AL-013',
		title: 'Round manifest: round.json as the single description of a prototyping round',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-07-29',
		completedOn: '2026-07-31',
		stepCount: 4,
		criterionCount: 3,
		fileChangeCount: 3,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-31',
		dependsOn: []
	},
	{
		id: 'AL-014',
		title: 'Skill: /prototype — the one-question-at-a-time journey and the five-agent fan-out',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'verifying',
		type: 'feature',
		risk: 'high',
		createdOn: '2026-07-30',
		completedOn: null,
		stepCount: 9,
		criterionCount: 6,
		fileChangeCount: 5,
		latestAttempt: 2,
		latestVerdict: 'partial',
		latestSealedOn: '2026-08-03',
		dependsOn: ['AL-012']
	},
	{
		id: 'AL-015',
		title: 'Work glow: an animated outline that names what the agent is composing',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'building',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-07-31',
		completedOn: null,
		stepCount: 3,
		criterionCount: 2,
		fileChangeCount: 2,
		latestAttempt: null,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['AL-012']
	},
	{
		id: 'AL-016',
		title: 'Approach pager: keyboard navigation between the five approaches',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'triaged',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-08-01',
		completedOn: null,
		stepCount: 3,
		criterionCount: 2,
		fileChangeCount: 1,
		latestAttempt: null,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['AL-012']
	},
	{
		id: 'AL-017',
		title: 'Promotion: move a winning approach into src without editing it',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 3,
		status: 'pending',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-08-01',
		completedOn: null,
		stepCount: 0,
		criterionCount: 3,
		fileChangeCount: 0,
		latestAttempt: null,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['AL-014']
	},
	{
		id: 'AL-018',
		title: 'Round teardown: retire the losing four approaches and record why',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 3,
		status: 'pending',
		type: 'chore',
		risk: 'low',
		createdOn: '2026-08-01',
		completedOn: null,
		stepCount: 0,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: null,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['AL-017']
	},
	{
		id: 'AL-019',
		title: 'Screenshot every approach at review width for the round record',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 3,
		status: 'blocked',
		type: 'chore',
		risk: 'low',
		createdOn: '2026-08-02',
		completedOn: null,
		stepCount: 1,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 1,
		latestVerdict: 'fail',
		latestSealedOn: '2026-08-02',
		dependsOn: ['AL-016']
	},
	{
		id: 'LDG-041',
		title: 'Branch is the release: refuse a task write when the worktree has drifted',
		project: 'ledger',
		release: 'hooks-that-actually-run',
		phase: 2,
		status: 'done',
		type: 'feature',
		risk: 'high',
		createdOn: '2026-07-24',
		completedOn: '2026-07-29',
		stepCount: 7,
		criterionCount: 5,
		fileChangeCount: 9,
		latestAttempt: 2,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-29',
		dependsOn: []
	},
	{
		id: 'LDG-044',
		title: 'One release-document check, four callers',
		project: 'ledger',
		release: 'hooks-that-actually-run',
		phase: 3,
		status: 'verifying',
		type: 'refactor',
		risk: 'medium',
		createdOn: '2026-07-30',
		completedOn: null,
		stepCount: 5,
		criterionCount: 4,
		fileChangeCount: 6,
		latestAttempt: 1,
		latestVerdict: 'partial',
		latestSealedOn: '2026-08-02',
		dependsOn: ['LDG-041']
	},
	{
		id: 'LDG-038',
		title: 'Regenerate base.sql from the live corpus rather than by hand',
		project: 'ledger',
		release: 'hooks-that-actually-run',
		phase: 1,
		status: 'done',
		type: 'refactor',
		risk: 'high',
		createdOn: '2026-07-20',
		completedOn: '2026-07-23',
		stepCount: 6,
		criterionCount: 4,
		fileChangeCount: 11,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-23',
		dependsOn: []
	},
	{
		id: 'ATL-118',
		title: 'Serve Storybook behind the reverse proxy at /alfons',
		project: 'atlas',
		release: 'atlas-proxy-v2',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-06-18',
		completedOn: '2026-06-24',
		stepCount: 4,
		criterionCount: 3,
		fileChangeCount: 5,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-06-24',
		dependsOn: []
	},
	{
		id: 'ATL-121',
		title: 'Certificate renewal without a manual restart',
		project: 'atlas',
		release: 'atlas-proxy-v2',
		phase: 2,
		status: 'building',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-07-11',
		completedOn: null,
		stepCount: 4,
		criterionCount: 3,
		fileChangeCount: 3,
		latestAttempt: null,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['ATL-118']
	},
	{
		id: 'GW-007',
		title: 'Token bucket per organisation, not per key',
		project: 'gateway',
		release: 'gateway-v1',
		phase: 2,
		status: 'building',
		type: 'feature',
		risk: 'high',
		createdOn: '2026-07-26',
		completedOn: null,
		stepCount: 8,
		criterionCount: 5,
		fileChangeCount: 7,
		latestAttempt: 1,
		latestVerdict: 'fail',
		latestSealedOn: '2026-08-01',
		dependsOn: []
	},
	{
		id: 'FN-022',
		title: 'Ingest a voice memo without a transcript step',
		project: 'field-notes',
		release: 'field-notes-ingest',
		phase: 1,
		status: 'triaged',
		type: 'spike',
		risk: 'medium',
		createdOn: '2026-07-27',
		completedOn: null,
		stepCount: 2,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: null,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: []
	},
	{
		id: 'MV-090',
		title: 'Relax the blog measure on data-bearing pages',
		project: 'motivka',
		release: 'scratch-bucket',
		phase: 1,
		status: 'pending',
		type: 'refactor',
		risk: 'low',
		createdOn: '2026-08-02',
		completedOn: null,
		stepCount: 0,
		criterionCount: 1,
		fileChangeCount: 0,
		latestAttempt: null,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: []
	},
	{
		id: 'DOM-014',
		title: 'Retire the second scheduler',
		project: 'domovoi',
		release: 'scratch-bucket',
		phase: 1,
		status: 'wontfix',
		type: 'chore',
		risk: 'low',
		createdOn: '2026-05-14',
		completedOn: '2026-06-02',
		stepCount: 1,
		criterionCount: 1,
		fileChangeCount: 0,
		latestAttempt: null,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: []
	},
	{
		id: 'MER-003',
		title: 'Prompt cache warming on the merlin worker pool',
		project: 'merlin',
		release: 'scratch-bucket',
		phase: 1,
		status: 'duplicate',
		type: 'adhoc',
		risk: 'low',
		createdOn: '2026-06-09',
		completedOn: '2026-06-09',
		stepCount: 0,
		criterionCount: 1,
		fileChangeCount: 0,
		latestAttempt: null,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: []
	},
	{
		id: 'SCR-055',
		title: 'Spike a diffable prompt format so a review reads like a code review',
		project: 'scratch',
		release: 'scratch-bucket',
		phase: 1,
		status: 'done',
		type: 'spike',
		risk: 'low',
		createdOn: '2026-07-02',
		completedOn: '2026-07-04',
		stepCount: 3,
		criterionCount: 2,
		fileChangeCount: 2,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-04',
		dependsOn: []
	}
];

/** Headline figures as the corpus reports them, not as a sum of the slice above. */
export const corpusFigures = [
	{ label: 'open', value: 124 },
	{ label: 'in flight', value: 4 },
	{ label: 'blocked', value: 0 },
	{ label: 'shipped, 14 days', value: 142 }
];

/** Seeded from the SSE feed; the tape keeps appending while the page is open. */
export const seedTransitions: Transition[] = [
	{
		at: '23:50',
		taskId: 'AL-018',
		title: 'Retire the prototype round',
		from: 'verifying',
		to: 'done'
	},
	{
		at: '23:44',
		taskId: 'LDG-044',
		title: 'One release-document check, four callers',
		from: 'building',
		to: 'verifying'
	},
	{
		at: '23:31',
		taskId: 'GW-007',
		title: 'Token bucket per organisation',
		from: 'triaged',
		to: 'building'
	},
	{
		at: '23:12',
		taskId: 'AL-019',
		title: 'Screenshot every approach at review width',
		from: 'building',
		to: 'blocked'
	}
];

export const taskById = new Map(tasks.map((task) => [task.id, task]));
export const releaseBySlug = new Map(releases.map((release) => [release.slug, release]));
