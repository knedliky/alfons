/**
 * The corpus this spread reports on.
 *
 * Held apart from the page so the narrative markup reads as prose rather than
 * as a data dump, and so the chart can be handed a series without the page
 * knowing how the chart draws it.
 */

export type TaskStatus =
	| 'pending'
	| 'triaged'
	| 'building'
	| 'verifying'
	| 'done'
	| 'blocked'
	| 'wontfix'
	| 'duplicate';

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
	/** The standfirst: what this release is for, in one editorial sentence. */
	standfirst: string;
}

export interface ThroughputWeek {
	/** Monday of the week, ISO. Weeks start Monday. */
	weekStarting: string;
	shipped: number;
}

export interface ChartAnnotation {
	weekStarting: string;
	label: string;
	detail: string;
}

export interface FeedEvent {
	taskId: string;
	from: TaskStatus;
	to: TaskStatus;
	at: string;
}

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

/**
 * Ordered as a narrative, not as a grid: the release the reader is most likely
 * to have arrived for comes first, and the buckets come last because nobody
 * arrives looking for a bucket.
 */
export const RELEASES: Release[] = [
	{
		slug: 'prototype-loop-v1',
		title: 'Five approaches, one brief, one afternoon',
		project: 'alfons',
		isBucket: false,
		tags: ['design-system', 'workflow', 'agents'],
		documentedOn: '2026-07-24',
		taskCount: 9,
		standfirst:
			'The prototyping loop that turns one design brief into five parallel agent-built pages, paged through at /dev and judged side by side. Phase one built the surface; phase two built the journey that fans the agents out; phase three is still deciding how a winner is promoted.'
	},
	{
		slug: 'alfons-mcp',
		title: 'Alfons v1 — one design system, three surfaces',
		project: 'alfons',
		isBucket: false,
		tags: ['design-system', 'mcp'],
		documentedOn: '2026-05-29',
		taskCount: 12,
		standfirst:
			'Eighty-two components stopped being a folder and became a service an agent can interrogate. The library now answers what it has before a second copy of it gets written, which is the failure the server was built to prevent.'
	},
	{
		slug: 'hooks-that-actually-run',
		title: 'One release-document check, four callers',
		project: 'ledger',
		isBucket: false,
		tags: ['ledger', 'git', 'invariants'],
		documentedOn: '2026-07-30',
		taskCount: 7,
		standfirst:
			'A rule that lived in a Claude Code hook covered exactly one caller and every other client walked past it. Moved onto the write path, it now holds for the CLI, for psql and for anything that speaks MCP.'
	},
	{
		slug: 'gateway-v1',
		title: 'The token exchange, and what it refuses',
		project: 'gateway',
		isBucket: false,
		tags: ['auth', 'security'],
		documentedOn: null,
		taskCount: 6,
		standfirst:
			'Undocumented, and stalled on the one blocked task in the corpus: the exchange will not issue against an unstated audience, and nothing upstream states one yet.'
	},
	{
		slug: 'atlas-search',
		title: 'Finding a task by what you remember of it',
		project: 'atlas',
		isBucket: false,
		tags: ['search', 'postgres'],
		documentedOn: '2026-07-11',
		taskCount: 8,
		standfirst:
			'Full-text search over task bodies, with the angle brackets translated to spaces before the parser sees them — the fix for prose that vanished from the index the day the bodies stopped being XML.'
	}
];

export const TASKS: Task[] = [
	{
		id: 'AL-012',
		title: 'Dev app: production-accurate prototype surface at /dev with pager and work glow',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-07-18',
		completedOn: '2026-07-22',
		stepCount: 6,
		criterionCount: 4,
		fileChangeCount: 8,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-22',
		dependsOn: []
	},
	{
		id: 'AL-013',
		title: 'Round manifest: prototypes discovered from the tree, never from a registry',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'refactor',
		risk: 'low',
		createdOn: '2026-07-18',
		completedOn: '2026-07-23',
		stepCount: 4,
		criterionCount: 3,
		fileChangeCount: 5,
		latestAttempt: 2,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-23',
		dependsOn: ['AL-012']
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
		createdOn: '2026-07-24',
		completedOn: null,
		stepCount: 11,
		criterionCount: 6,
		fileChangeCount: 14,
		latestAttempt: 3,
		latestVerdict: 'partial',
		latestSealedOn: '2026-08-02',
		dependsOn: ['AL-012', 'AL-013']
	},
	{
		id: 'AL-015',
		title: 'Work glow: the animated outline an agent moves as it composes a region',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'building',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-07-25',
		completedOn: null,
		stepCount: 5,
		criterionCount: 3,
		fileChangeCount: 4,
		latestAttempt: 1,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['AL-012']
	},
	{
		id: 'AL-018',
		title: 'Promotion: move a winning prototype into a real consumer unchanged',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 3,
		status: 'triaged',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-07-29',
		completedOn: null,
		stepCount: 0,
		criterionCount: 4,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['AL-014']
	},
	{
		id: 'AL-019',
		title: 'Deviations: an approach records the rule it broke and why',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 3,
		status: 'pending',
		type: 'chore',
		risk: 'low',
		createdOn: '2026-07-30',
		completedOn: null,
		stepCount: 0,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['AL-018']
	},
	{
		id: 'AL-004',
		title: 'find_components: rank the library by what a component does, in plain language',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-05-11',
		completedOn: '2026-05-19',
		stepCount: 7,
		criterionCount: 5,
		fileChangeCount: 11,
		latestAttempt: 2,
		latestVerdict: 'pass',
		latestSealedOn: '2026-05-19',
		dependsOn: []
	},
	{
		id: 'AL-007',
		title: 'review_markup: findings are advisory and nothing here fails a build',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 2,
		status: 'done',
		type: 'feature',
		risk: 'high',
		createdOn: '2026-05-14',
		completedOn: '2026-05-27',
		stepCount: 9,
		criterionCount: 6,
		fileChangeCount: 17,
		latestAttempt: 4,
		latestVerdict: 'pass',
		latestSealedOn: '2026-05-27',
		dependsOn: ['AL-004']
	},
	{
		id: 'AL-009',
		title: 'get_tokens: refuse an admin token on a public surface',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 2,
		status: 'done',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-05-16',
		completedOn: '2026-05-28',
		stepCount: 4,
		criterionCount: 3,
		fileChangeCount: 6,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-05-28',
		dependsOn: ['AL-004']
	},
	{
		id: 'LDG-041',
		title: 'Base schema regenerated from the live corpus, never hand-written',
		project: 'ledger',
		release: 'hooks-that-actually-run',
		phase: 1,
		status: 'done',
		type: 'refactor',
		risk: 'high',
		createdOn: '2026-07-04',
		completedOn: '2026-07-14',
		stepCount: 8,
		criterionCount: 5,
		fileChangeCount: 9,
		latestAttempt: 2,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-14',
		dependsOn: []
	},
	{
		id: 'LDG-047',
		title: 'Migration 0019: drop xml_text and delete the definition that kept recreating it',
		project: 'ledger',
		release: 'hooks-that-actually-run',
		phase: 1,
		status: 'done',
		type: 'chore',
		risk: 'medium',
		createdOn: '2026-07-09',
		completedOn: '2026-07-21',
		stepCount: 5,
		criterionCount: 4,
		fileChangeCount: 7,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-21',
		dependsOn: ['LDG-041']
	},
	{
		id: 'LDG-052',
		title: 'Branch is the release: refuse a task written from the wrong working tree',
		project: 'ledger',
		release: 'hooks-that-actually-run',
		phase: 2,
		status: 'verifying',
		type: 'feature',
		risk: 'high',
		createdOn: '2026-07-22',
		completedOn: null,
		stepCount: 7,
		criterionCount: 5,
		fileChangeCount: 6,
		latestAttempt: 2,
		latestVerdict: 'partial',
		latestSealedOn: '2026-08-01',
		dependsOn: ['LDG-041', 'LDG-047']
	},
	{
		id: 'LDG-055',
		title: 'Release document check: one rule, four callers, no hook',
		project: 'ledger',
		release: 'hooks-that-actually-run',
		phase: 2,
		status: 'building',
		type: 'refactor',
		risk: 'medium',
		createdOn: '2026-07-28',
		completedOn: null,
		stepCount: 3,
		criterionCount: 4,
		fileChangeCount: 3,
		latestAttempt: 1,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['LDG-052']
	},
	{
		id: 'ATL-118',
		title: 'Longread figure: an evidence panel on the elevation ladder',
		project: 'atlas',
		release: 'atlas-search',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-06-28',
		completedOn: '2026-07-06',
		stepCount: 4,
		criterionCount: 3,
		fileChangeCount: 5,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-06',
		dependsOn: []
	},
	{
		id: 'ATL-124',
		title: 'Search vectors: translate the angle brackets before the parser eats them',
		project: 'atlas',
		release: 'atlas-search',
		phase: 2,
		status: 'building',
		type: 'bug',
		risk: 'high',
		createdOn: '2026-07-08',
		completedOn: null,
		stepCount: 6,
		criterionCount: 4,
		fileChangeCount: 4,
		latestAttempt: 2,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['ATL-118']
	},
	{
		id: 'ATL-131',
		title: 'Typeahead: rank a task by title trigram before release or project',
		project: 'atlas',
		release: 'atlas-search',
		phase: 2,
		status: 'triaged',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-07-19',
		completedOn: null,
		stepCount: 0,
		criterionCount: 3,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['ATL-124']
	},
	{
		id: 'GTW-007',
		title: 'Token exchange: refuse a request whose audience is unstated',
		project: 'gateway',
		release: 'gateway-v1',
		phase: 2,
		status: 'blocked',
		type: 'feature',
		risk: 'high',
		createdOn: '2026-06-12',
		completedOn: null,
		stepCount: 4,
		criterionCount: 5,
		fileChangeCount: 2,
		latestAttempt: 2,
		latestVerdict: 'fail',
		latestSealedOn: '2026-07-02',
		dependsOn: ['GTW-003']
	},
	{
		id: 'GTW-003',
		title: 'Audience claim: state it upstream or the exchange has nothing to check',
		project: 'gateway',
		release: 'gateway-v1',
		phase: 1,
		status: 'pending',
		type: 'spike',
		risk: 'high',
		createdOn: '2026-06-02',
		completedOn: null,
		stepCount: 0,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: []
	},
	{
		id: 'MTV-063',
		title: 'Ledger dashboard at /ledger keeps the site Header and Footer, relaxes the measure',
		project: 'motivka',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-07-20',
		completedOn: '2026-07-26',
		stepCount: 3,
		criterionCount: 3,
		fileChangeCount: 4,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-26',
		dependsOn: []
	},
	{
		id: 'FN-029',
		title: 'Weekly note ingest: one file, one row, and no shredder in the middle',
		project: 'field-notes',
		release: 'atlas-search',
		phase: 3,
		status: 'pending',
		type: 'chore',
		risk: 'low',
		createdOn: '2026-07-27',
		completedOn: null,
		stepCount: 0,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: []
	},
	{
		id: 'DOM-011',
		title: 'Prototype harness: render an approach at production width, not in a frame',
		project: 'domovoi',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'duplicate',
		type: 'adhoc',
		risk: 'low',
		createdOn: '2026-07-25',
		completedOn: '2026-07-25',
		stepCount: 0,
		criterionCount: 1,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['AL-012']
	},
	{
		id: 'MRL-004',
		title: 'Similar roles: stop the mono token resolving to Tailwind’s default',
		project: 'merlin',
		release: 'atlas-search',
		phase: 1,
		status: 'wontfix',
		type: 'bug',
		risk: 'low',
		createdOn: '2026-06-30',
		completedOn: '2026-07-15',
		stepCount: 2,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 1,
		latestVerdict: 'fail',
		latestSealedOn: '2026-07-15',
		dependsOn: []
	},
	{
		id: 'AGB-022',
		title: 'Eval harness: one task per fixture, and the fixture outlives its example',
		project: 'agentbench',
		release: 'alfons-mcp',
		phase: 3,
		status: 'building',
		type: 'test',
		risk: 'medium',
		createdOn: '2026-07-13',
		completedOn: null,
		stepCount: 5,
		criterionCount: 4,
		fileChangeCount: 6,
		latestAttempt: 1,
		latestVerdict: null,
		latestSealedOn: null,
		dependsOn: ['AL-007']
	},
	{
		id: 'TM-015',
		title: 'Task manager: the pending queue reads from the ledger, never from a file',
		project: 'task-manager',
		release: 'hooks-that-actually-run',
		phase: 3,
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
		dependsOn: ['LDG-055']
	},
	{
		id: 'SCR-003',
		title: 'Scratch: prototype the annotated throughput chart before it earns a component',
		project: 'scratch',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'spike',
		risk: 'low',
		createdOn: '2026-07-21',
		completedOn: '2026-07-23',
		stepCount: 2,
		criterionCount: 1,
		fileChangeCount: 3,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-23',
		dependsOn: []
	}
];

/** Thirteen weeks of shipped tasks, Mondays, to 2026-07-27. */
export const THROUGHPUT: ThroughputWeek[] = [
	{ weekStarting: '2026-05-04', shipped: 22 },
	{ weekStarting: '2026-05-11', shipped: 31 },
	{ weekStarting: '2026-05-18', shipped: 27 },
	{ weekStarting: '2026-05-25', shipped: 45 },
	{ weekStarting: '2026-06-01', shipped: 38 },
	{ weekStarting: '2026-06-08', shipped: 19 },
	{ weekStarting: '2026-06-15', shipped: 24 },
	{ weekStarting: '2026-06-22', shipped: 41 },
	{ weekStarting: '2026-06-29', shipped: 52 },
	{ weekStarting: '2026-07-06', shipped: 33 },
	{ weekStarting: '2026-07-13', shipped: 29 },
	{ weekStarting: '2026-07-20', shipped: 64 },
	{ weekStarting: '2026-07-27', shipped: 78 }
];

export const THROUGHPUT_ANNOTATIONS: ChartAnnotation[] = [
	{
		weekStarting: '2026-05-25',
		label: 'alfons-mcp documented',
		detail: '45 shipped — the library became a service'
	},
	{
		weekStarting: '2026-06-29',
		label: 'ledger schema moved in-repo',
		detail: '52 shipped, then a fortnight of falling back'
	},
	{
		weekStarting: '2026-07-20',
		label: 'prototype-loop-v1 opened',
		detail: '142 across the fortnight, and still climbing'
	}
];

/** What the SSE feed has said since the page was opened. */
export const SEEDED_FEED: FeedEvent[] = [
	{ taskId: 'LDG-055', from: 'triaged', to: 'building', at: '14:02' },
	{ taskId: 'AL-014', from: 'building', to: 'verifying', at: '13:47' },
	{ taskId: 'ATL-124', from: 'triaged', to: 'building', at: '13:31' }
];

/** The transitions the feed will announce while the page is watched. */
export const PENDING_FEED: FeedEvent[] = [
	{ taskId: 'AL-015', from: 'building', to: 'verifying', at: '14:09' },
	{ taskId: 'AL-018', from: 'triaged', to: 'building', at: '14:16' },
	{ taskId: 'ATL-131', from: 'triaged', to: 'building', at: '14:24' },
	{ taskId: 'AL-015', from: 'verifying', to: 'done', at: '14:33' }
];

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

/** The headline figures, as the corpus reported them this morning. */
export const HEADLINE = {
	open: 124,
	inFlight: 4,
	/**
	 * One, not the zero the corpus reported this morning: GTW-007 went blocked
	 * over the feed at 11:20. The figure and the task list must agree, so the
	 * headline follows the corpus rather than the briefing note.
	 */
	blocked: 1,
	shippedFortnight: 142
};
