/**
 * The corpus this approach renders.
 *
 * Realistic rows rather than placeholders: the whole argument of a structural
 * grid is that real titles of uneven length still align, so lorem would prove
 * nothing. Shapes follow the ledger schema — tasks carry provenance counts and
 * a latest verification verdict; releases group their tasks into integer
 * phases, which is what the timeline draws.
 */

export type TaskStatus =
	'pending' | 'triaged' | 'building' | 'verifying' | 'done' | 'blocked' | 'wontfix' | 'duplicate';

export type TaskType = 'feature' | 'refactor' | 'chore' | 'spike' | 'bug' | 'adhoc' | 'test';

export type Verdict = 'pass' | 'fail' | 'partial';

export interface Task {
	id: string;
	title: string;
	project: string;
	release: string;
	phase: number;
	status: TaskStatus;
	type: TaskType;
	risk: 'low' | 'medium' | 'high';
	createdOn: string;
	completedOn: string | null;
	stepCount: number;
	criterionCount: number;
	fileChangeCount: number;
	latestAttempt: number;
	latestVerdict: Verdict | null;
	latestSealedOn: string | null;
	/** Task ids this one cannot land without. Empty for most of the corpus. */
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
	phases: Phase[];
}

export interface Phase {
	number: number;
	label: string;
	taskIds: string[];
}

/**
 * How a status is drawn, in one place.
 *
 * Colour alone never carries the encoding: every status also has a mark shape
 * and a fill fraction, so the page still reads on a monochrome print or to a
 * reader who cannot separate olive from amber. `custom` names the page-root
 * property the mark reads, so the mapping cannot drift between regions.
 */
export interface StatusMeta {
	label: string;
	/** Lifecycle statuses are squares; the exceptional exits are diamonds. */
	shape: 'square' | 'diamond';
	/** How much of the mark is filled — the second, non-colour encoding. */
	fill: 0 | 0.25 | 0.5 | 0.75 | 1;
	custom: string;
}

export const STATUS_META: Record<TaskStatus, StatusMeta> = {
	pending: { label: 'Pending', shape: 'square', fill: 0, custom: '--status-pending' },
	triaged: { label: 'Triaged', shape: 'square', fill: 0.25, custom: '--status-triaged' },
	building: { label: 'Building', shape: 'square', fill: 0.5, custom: '--status-building' },
	verifying: { label: 'Verifying', shape: 'square', fill: 0.75, custom: '--status-verifying' },
	done: { label: 'Done', shape: 'square', fill: 1, custom: '--status-done' },
	blocked: { label: 'Blocked', shape: 'diamond', fill: 1, custom: '--status-blocked' },
	wontfix: { label: 'Wontfix', shape: 'diamond', fill: 0, custom: '--status-wontfix' },
	duplicate: { label: 'Duplicate', shape: 'diamond', fill: 0.5, custom: '--status-duplicate' }
};

/** Reading order for legends and column summaries — lifecycle, then the exits. */
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
];

export const TASKS: Task[] = [
	{
		id: 'AL-012',
		title: 'Seed five approach shells from the round manifest',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-07-29',
		completedOn: '2026-07-31',
		stepCount: 6,
		criterionCount: 4,
		fileChangeCount: 9,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-31',
		dependsOn: []
	},
	{
		id: 'AL-013',
		title: 'Serve the prototype round at /dev with live reload',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-07-29',
		completedOn: '2026-08-01',
		stepCount: 8,
		criterionCount: 5,
		fileChangeCount: 12,
		latestAttempt: 2,
		latestVerdict: 'pass',
		latestSealedOn: '2026-08-01',
		dependsOn: ['AL-012']
	},
	{
		id: 'AL-014',
		title: 'Draw a release as a phase timeline',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'verifying',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-08-01',
		completedOn: null,
		stepCount: 7,
		criterionCount: 6,
		fileChangeCount: 5,
		latestAttempt: 3,
		latestVerdict: 'partial',
		latestSealedOn: '2026-08-03',
		dependsOn: ['AL-012', 'AL-013']
	},
	{
		id: 'AL-015',
		title: 'Publish the round index with per-approach deviations',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'done',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-08-01',
		completedOn: '2026-08-02',
		stepCount: 5,
		criterionCount: 3,
		fileChangeCount: 4,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-08-02',
		dependsOn: ['AL-013']
	},
	{
		id: 'AL-004',
		title: 'Describe every component for an agent, not a human',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-07-14',
		completedOn: '2026-07-17',
		stepCount: 9,
		criterionCount: 5,
		fileChangeCount: 21,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-17',
		dependsOn: []
	},
	{
		id: 'AL-007',
		title: 'Refuse an admin token on a public surface',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 2,
		status: 'done',
		type: 'feature',
		risk: 'high',
		createdOn: '2026-07-18',
		completedOn: '2026-07-23',
		stepCount: 11,
		criterionCount: 7,
		fileChangeCount: 14,
		latestAttempt: 2,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-23',
		dependsOn: ['AL-004']
	},
	{
		id: 'AL-009',
		title: 'Answer a retired token with its replacement',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 3,
		status: 'building',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-07-24',
		completedOn: null,
		stepCount: 6,
		criterionCount: 5,
		fileChangeCount: 8,
		latestAttempt: 1,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['AL-004']
	},
	{
		id: 'AL-011',
		title: 'Recognise a stale working marker before publish',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 4,
		status: 'triaged',
		type: 'chore',
		risk: 'low',
		createdOn: '2026-07-30',
		completedOn: null,
		stepCount: 3,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['AL-009']
	},
	{
		id: 'LDG-041',
		title: 'Refuse a task write when the repository is off the release branch',
		project: 'ledger',
		release: 'a-rule-reaches-every-repo',
		phase: 2,
		status: 'done',
		type: 'feature',
		risk: 'high',
		createdOn: '2026-07-20',
		completedOn: '2026-07-26',
		stepCount: 12,
		criterionCount: 8,
		fileChangeCount: 17,
		latestAttempt: 3,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-26',
		dependsOn: []
	},
	{
		id: 'LDG-046',
		title: 'Regenerate the base schema from the live corpus',
		project: 'ledger',
		release: 'hooks-that-actually-run',
		phase: 1,
		status: 'verifying',
		type: 'refactor',
		risk: 'high',
		createdOn: '2026-08-01',
		completedOn: null,
		stepCount: 9,
		criterionCount: 6,
		fileChangeCount: 6,
		latestAttempt: 2,
		latestVerdict: 'partial',
		latestSealedOn: '2026-08-03',
		dependsOn: ['LDG-041']
	},
	{
		id: 'ATL-118',
		title: 'Reverse-proxy the prototype surface through Caddy',
		project: 'atlas',
		release: 'dev-surface-v2',
		phase: 1,
		status: 'building',
		type: 'chore',
		risk: 'low',
		createdOn: '2026-07-28',
		completedOn: null,
		stepCount: 4,
		criterionCount: 3,
		fileChangeCount: 3,
		latestAttempt: 1,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: []
	},
	{
		id: 'ATL-121',
		title: 'Analyse the prototype bundle for duplicated token sheets',
		project: 'atlas',
		release: 'dev-surface-v2',
		phase: 2,
		status: 'pending',
		type: 'spike',
		risk: 'low',
		createdOn: '2026-08-02',
		completedOn: null,
		stepCount: 0,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['ATL-118']
	},
	{
		id: 'MRL-027',
		title: 'Recognise a role title the taxonomy has not seen',
		project: 'merlin',
		release: 'taxonomy-drift',
		phase: 3,
		status: 'blocked',
		type: 'bug',
		risk: 'high',
		createdOn: '2026-07-11',
		completedOn: null,
		stepCount: 5,
		criterionCount: 4,
		fileChangeCount: 2,
		latestAttempt: 2,
		latestVerdict: 'fail',
		latestSealedOn: '2026-07-27',
		dependsOn: []
	},
	{
		id: 'GTW-009',
		title: 'Organise the gateway routes behind one prototype prefix',
		project: 'gateway',
		release: 'gateway-v1',
		phase: 1,
		status: 'triaged',
		type: 'refactor',
		risk: 'medium',
		createdOn: '2026-07-31',
		completedOn: null,
		stepCount: 0,
		criterionCount: 3,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: []
	}
];

export const RELEASES: Release[] = [
	{
		slug: 'prototype-loop-v1',
		title: 'Five approaches, one round, watched live',
		project: 'alfons',
		isBucket: false,
		tags: ['prototyping', 'design-system'],
		documentedOn: null,
		taskCount: 4,
		phases: [
			{ number: 1, label: 'Provision the round', taskIds: ['AL-012', 'AL-013'] },
			{ number: 2, label: 'Draw and publish', taskIds: ['AL-014', 'AL-015'] }
		]
	},
	{
		slug: 'alfons-mcp',
		title: 'Alfons v1 — one design system, three surfaces',
		project: 'alfons',
		isBucket: false,
		tags: ['mcp', 'tokens', 'review'],
		documentedOn: '2026-08-02',
		taskCount: 12,
		phases: [
			{ number: 1, label: 'Describe the library', taskIds: ['AL-004'] },
			{ number: 2, label: 'Enforce the surfaces', taskIds: ['AL-007'] },
			{ number: 3, label: 'Answer for what was retired', taskIds: ['AL-009'] },
			{ number: 4, label: 'Publish and watch', taskIds: ['AL-011'] }
		]
	}
];

/**
 * Status transitions arriving over the SSE feed.
 *
 * The page corrects task statuses underneath the reader, so the strip is the
 * only place that announces the correction rather than performing it silently.
 */
export interface Transition {
	taskId: string;
	from: TaskStatus;
	to: TaskStatus;
	at: string;
}

export const TRANSITIONS: Transition[] = [
	{ taskId: 'AL-014', from: 'building', to: 'verifying', at: '14:22' },
	{ taskId: 'LDG-046', from: 'building', to: 'verifying', at: '14:09' },
	{ taskId: 'ATL-118', from: 'triaged', to: 'building', at: '13:47' },
	{ taskId: 'AL-015', from: 'verifying', to: 'done', at: '13:31' },
	{ taskId: 'MRL-027', from: 'building', to: 'blocked', at: '11:58' }
];

/** One headline figure: the number, what it counts, and the caveat under it. */
export interface Figure {
	value: string;
	label: string;
	note: string;
}

/** Column indices for the drawn twelve-column guides. */
export const COLUMN_GUIDES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/** Headline figures, stated once so the band and the masthead cannot disagree. */
export const HEADLINE = {
	open: 124,
	inFlight: 4,
	blocked: 0,
	shipped: 142,
	shippedWindowDays: 14,
	releases: 37,
	projects: PROJECTS.length
};

const TASKS_BY_ID = new Map(TASKS.map((task) => [task.id, task]));

export function taskById(id: string): Task | undefined {
	return TASKS_BY_ID.get(id);
}

export function releaseBySlug(slug: string): Release | undefined {
	return RELEASES.find((release) => release.slug === slug);
}

/** Case-insensitive match over the fields Simon actually half-remembers. */
export function searchTasks(query: string): Task[] {
	const needle = query.trim().toLowerCase();
	if (!needle) return [];
	return TASKS.filter(
		(task) =>
			task.title.toLowerCase().includes(needle) ||
			task.id.toLowerCase().includes(needle) ||
			task.release.toLowerCase().includes(needle) ||
			task.project.toLowerCase().includes(needle)
	);
}
