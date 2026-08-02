/**
 * A representative slice of the live ledger corpus.
 *
 * Hand-authored rather than fetched: the prototype has to show the shape of a
 * release — phases, siblings, dependencies — and a fixture makes that legible
 * without standing up the MCP server behind the dev surface.
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

export interface Criterion {
	id: string;
	body: string;
	verdict: Verdict | null;
}

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
	criteria: Criterion[];
	steps: string[];
	fileChanges: string[];
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

/**
 * Status colour is reserved for state. The map is declared once and set as
 * custom properties at the page root so no region can drift from it.
 */
export const STATUS_COLOURS: Record<TaskStatus, string> = {
	pending: 'var(--text-muted)',
	triaged: 'var(--sky-blue)',
	building: 'var(--amber)',
	verifying: 'var(--blush-pink)',
	done: 'var(--olive-green)',
	blocked: 'var(--fire-engine-red)',
	// Terminal-but-inert states read as absent work, not as a state worth colouring.
	wontfix: 'var(--text-muted)',
	duplicate: 'var(--text-muted)'
};

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

export const releases: Release[] = [
	{
		slug: 'prototype-loop-v1',
		title: 'Prototype loop v1 — watchable five-approach prototyping at dev/<page-name>',
		project: 'alfons',
		isBucket: false,
		tags: ['prototyping', 'dev-surface', 'mcp'],
		documentedOn: null,
		taskCount: 4
	},
	{
		slug: 'alfons-mcp',
		title: 'Alfons v1 — one design system, three surfaces',
		project: 'alfons',
		isBucket: false,
		tags: ['design-system', 'mcp', 'tokens'],
		documentedOn: '2026-08-02',
		taskCount: 12
	},
	{
		slug: 'hooks-that-actually-run',
		title: 'Hooks that actually run — one release-document check, four callers',
		project: 'ledger',
		isBucket: false,
		tags: ['githooks', 'enforcement'],
		documentedOn: '2026-07-29',
		taskCount: 6
	},
	{
		slug: 'schema-comes-home',
		title: 'Schema comes home — base.sql as the install path, migrations as the upgrade',
		project: 'ledger',
		isBucket: false,
		tags: ['schema', 'postgres', 'bootstrap'],
		documentedOn: '2026-07-21',
		taskCount: 9
	},
	{
		slug: 'atlas-ingress',
		title: 'Atlas ingress — Caddy in front of every local surface',
		project: 'atlas',
		isBucket: false,
		tags: ['caddy', 'tls', 'routing'],
		documentedOn: '2026-07-14',
		taskCount: 7
	},
	{
		slug: 'field-notes-v2',
		title: 'Field notes v2 — the longread template and its stat band',
		project: 'field-notes',
		isBucket: false,
		tags: ['editorial', 'templates'],
		documentedOn: '2026-06-30',
		taskCount: 5
	},
	{
		slug: 'gateway-v1',
		title: 'Gateway v1 — one authenticated edge for the agent fleet',
		project: 'gateway',
		isBucket: false,
		tags: ['auth', 'edge'],
		documentedOn: null,
		taskCount: 8
	},
	{
		slug: 'domovoi-watch',
		title: 'Domovoi — the household daemon and its notification budget',
		project: 'domovoi',
		isBucket: false,
		tags: ['daemon', 'notifications'],
		documentedOn: '2026-06-11',
		taskCount: 4
	},
	{
		slug: 'merlin-recall',
		title: 'Merlin recall — retrieval over the corpus without a vector store',
		project: 'merlin',
		isBucket: false,
		tags: ['retrieval', 'search'],
		documentedOn: null,
		taskCount: 6
	},
	{
		slug: 'agentbench-harness',
		title: 'Agentbench harness — evals that fail loudly',
		project: 'agentbench',
		isBucket: false,
		tags: ['evals', 'ci'],
		documentedOn: '2026-05-28',
		taskCount: 5
	},
	{
		slug: 'motivka-site',
		title: 'Motivka site — the public surface and its blog measure',
		project: 'motivka',
		isBucket: false,
		tags: ['site', 'public'],
		documentedOn: '2026-05-19',
		taskCount: 11
	},
	{
		slug: 'scratch',
		title: 'Scratch — unfiled work awaiting a release',
		project: 'scratch',
		isBucket: true,
		tags: ['bucket'],
		documentedOn: null,
		taskCount: 23
	},
	{
		slug: 'task-manager-triage',
		title: 'Task manager — triage rules and the pending queue',
		project: 'task-manager',
		isBucket: false,
		tags: ['triage'],
		documentedOn: null,
		taskCount: 5
	}
];

export const tasks: Task[] = [
	{
		id: 'AL-012',
		title: 'Dev app: production-accurate prototype surface at /dev with pager and work glow',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-07-30',
		completedOn: '2026-08-01',
		stepCount: 6,
		criterionCount: 4,
		fileChangeCount: 8,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-08-01',
		criteria: [
			{
				id: 'C1',
				body: 'The dev surface renders a prototype page inside the real PageFrame, Header and Footer.',
				verdict: 'pass'
			},
			{
				id: 'C2',
				body: 'Rounds are discovered from the tree by import.meta.glob, not from a registry.',
				verdict: 'pass'
			},
			{
				id: 'C3',
				body: 'The pager moves between approaches without a full reload.',
				verdict: 'pass'
			},
			{
				id: 'C4',
				body: 'data-alfons-working draws an animated outline carrying its label.',
				verdict: 'pass'
			}
		],
		steps: [
			'Stand up vite.dev.config.ts aliasing @alfons/design to src',
			'Glob prototypes/*/round.json and prototypes/*/*/Page.svelte',
			'History-based routing at /dev/<page>/<approach>',
			'ApproachPager across the round',
			'WorkGlow reading data-alfons-working',
			'Mount the surface behind Caddy on port 6008'
		],
		fileChanges: [
			'src/dev/App.svelte',
			'src/dev/ApproachPager.svelte',
			'src/dev/RoundIndex.svelte',
			'src/dev/WorkGlow.svelte',
			'src/dev/types.ts',
			'vite.dev.config.ts',
			'package.json',
			'Caddyfile'
		],
		dependsOn: []
	},
	{
		id: 'AL-013',
		title: 'MCP tools: plan_prototype_round and promote_prototype over the manifest',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-07-30',
		completedOn: '2026-08-02',
		stepCount: 5,
		criterionCount: 3,
		fileChangeCount: 6,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-08-02',
		criteria: [
			{
				id: 'C1',
				body: 'plan_prototype_round writes round.json and seeds one Page.svelte per approach.',
				verdict: 'pass'
			},
			{
				id: 'C2',
				body: 'promote_prototype moves a winning page into a real consumer unchanged.',
				verdict: 'pass'
			},
			{
				id: 'C3',
				body: 'Both tools declare a concrete return type so structured_content is populated.',
				verdict: 'pass'
			}
		],
		steps: [
			'Define the round manifest shape',
			'plan_prototype_round: scaffold directories and seed pages',
			'promote_prototype: rewrite imports and relocate',
			'Concrete dict return types on both tools',
			'Smoke test through scripts/mcp-smoke.ts'
		],
		fileChanges: [
			'src/mcp/server.ts',
			'src/mcp/tools/plan-prototype-round.ts',
			'src/mcp/tools/promote-prototype.ts',
			'src/mcp/manifest.ts',
			'scripts/mcp-smoke.ts',
			'src/mcp/types.ts'
		],
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
		createdOn: '2026-08-01',
		completedOn: null,
		stepCount: 7,
		criterionCount: 5,
		fileChangeCount: 4,
		latestAttempt: 2,
		latestVerdict: 'partial',
		latestSealedOn: '2026-08-03',
		criteria: [
			{
				id: 'C1',
				body: 'The skill asks one discovery question at a time and never batches them.',
				verdict: 'pass'
			},
			{
				id: 'C2',
				body: 'Five approaches are fanned out in a single message so they run concurrently.',
				verdict: 'pass'
			},
			{
				id: 'C3',
				body: 'Each agent is given ownership of exactly one approach directory.',
				verdict: 'pass'
			},
			{
				id: 'C4',
				body: 'Deviations are recorded in round.json against the approach that took them.',
				verdict: 'partial'
			},
			{
				id: 'C5',
				body: 'The brief is passed verbatim and identically to all five agents.',
				verdict: null
			}
		],
		steps: [
			'Draft the discovery question ladder',
			'Write the brief-assembly step',
			'Fan out five Agent calls in one message',
			'Give each agent an absolute ownership boundary',
			'Collect the five return values into a comparison',
			'Record deviations against each approach',
			'Promote the winner through the MCP tool'
		],
		fileChanges: [
			'.claude/skills/prototype/SKILL.md',
			'.claude/skills/prototype/references/brief-template.md',
			'.claude/skills/prototype/references/approach-directions.md',
			'prototypes/ledger-dashboard/round.json'
		],
		dependsOn: ['AL-012', 'AL-013']
	},
	{
		id: 'AL-015',
		title: 'Document the dev surface: CLAUDE.md, prototypes directory contract and the Caddy mount',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'done',
		type: 'chore',
		risk: 'low',
		createdOn: '2026-08-01',
		completedOn: '2026-08-02',
		stepCount: 3,
		criterionCount: 2,
		fileChangeCount: 3,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-08-02',
		criteria: [
			{
				id: 'C1',
				body: 'CLAUDE.md states the prototypes directory contract and the ownership rule.',
				verdict: 'pass'
			},
			{
				id: 'C2',
				body: 'The Caddy mount for port 6008 is documented where it can be found.',
				verdict: 'pass'
			}
		],
		steps: [
			'Write the prototypes directory contract',
			'Document the Caddy mount and the dev port',
			'Cross-reference the /prototype skill'
		],
		fileChanges: ['CLAUDE.md', 'prototypes/README.md', 'Caddyfile'],
		dependsOn: ['AL-014']
	},

	// alfons-mcp — the sibling release, so switching the rail shows real material.
	{
		id: 'AL-001',
		title: 'Token pipeline: one source of truth for 256 public tokens',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'high',
		createdOn: '2026-07-02',
		completedOn: '2026-07-09',
		stepCount: 8,
		criterionCount: 4,
		fileChangeCount: 14,
		latestAttempt: 2,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-09',
		criteria: [
			{ id: 'C1', body: 'public.css and admin.css are generated from one token source.', verdict: 'pass' },
			{ id: 'C2', body: 'Deprecated tokens carry their replacement.', verdict: 'pass' },
			{ id: 'C3', body: 'An --admin-* token on a public surface is detectable.', verdict: 'pass' },
			{ id: 'C4', body: 'The manifest is checkable in CI.', verdict: 'pass' }
		],
		steps: ['Extract tokens', 'Generate both stylesheets', 'Mark deprecations', 'Wire manifest:check'],
		fileChanges: ['src/tokens/public.css', 'src/tokens/admin.css', 'scripts/generate-manifest.ts'],
		dependsOn: []
	},
	{
		id: 'AL-004',
		title: 'review_markup: advisory rules over Svelte source',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 2,
		status: 'done',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-07-10',
		completedOn: '2026-07-19',
		stepCount: 6,
		criterionCount: 3,
		fileChangeCount: 9,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-19',
		criteria: [
			{ id: 'C1', body: 'Literal colours and lengths are flagged where a token exists.', verdict: 'pass' },
			{ id: 'C2', body: 'Layout nesting reads the same ordering as get_layout_recipe.', verdict: 'pass' },
			{ id: 'C3', body: 'Findings are advisory and never fail a build (D-159).', verdict: 'pass' }
		],
		steps: ['Parse the source', 'Match against the token table', 'Read the layout tiers', 'Emit positions'],
		fileChanges: ['src/mcp/review/rules.ts', 'src/mcp/review/index.ts'],
		dependsOn: ['AL-001']
	},
	{
		id: 'AL-009',
		title: 'Retire the duplicated status indicator: StatusBadge stays admin-only',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 3,
		status: 'blocked',
		type: 'refactor',
		risk: 'medium',
		createdOn: '2026-07-22',
		completedOn: null,
		stepCount: 4,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 1,
		latestVerdict: 'fail',
		latestSealedOn: '2026-07-27',
		criteria: [
			{ id: 'C1', body: 'Public surfaces have a status indicator that is not admin-scoped.', verdict: 'fail' },
			{ id: 'C2', body: 'The indicator carries a shape or label, never colour alone.', verdict: null }
		],
		steps: ['Audit public status usage', 'Design the public mark', 'Port StatusBadge', 'Deprecate the admin one'],
		fileChanges: [],
		dependsOn: ['AL-004']
	},
	{
		id: 'AL-011',
		title: 'Storybook: a story per component, screenshotted in CI',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 3,
		status: 'building',
		type: 'test',
		risk: 'low',
		createdOn: '2026-07-25',
		completedOn: null,
		stepCount: 5,
		criterionCount: 3,
		fileChangeCount: 22,
		latestAttempt: 1,
		latestVerdict: null,
		latestSealedOn: null,
		criteria: [
			{ id: 'C1', body: 'Every exported component has at least one story.', verdict: null },
			{ id: 'C2', body: 'Screenshots are taken headlessly and diffed.', verdict: null },
			{ id: 'C3', body: 'The story id matches the one get_component reports.', verdict: null }
		],
		steps: ['Scaffold missing stories', 'Wire the screenshot script', 'Diff against the baseline'],
		fileChanges: ['scripts/screenshot-stories.mjs'],
		dependsOn: ['AL-001']
	},

	// A scattering across other releases so search crosses project boundaries.
	{
		id: 'LDG-041',
		title: 'Branch is the release: refuse a task write when the repo is on another branch',
		project: 'ledger',
		release: 'hooks-that-actually-run',
		phase: 1,
		status: 'done',
		type: 'feature',
		risk: 'high',
		createdOn: '2026-07-24',
		completedOn: '2026-07-28',
		stepCount: 5,
		criterionCount: 4,
		fileChangeCount: 7,
		latestAttempt: 2,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-28',
		criteria: [
			{ id: 'C1', body: 'The repo path comes from projects.repo_path, never from the caller.', verdict: 'pass' },
			{ id: 'C2', body: 'A detached or unborn HEAD fails open.', verdict: 'pass' },
			{ id: 'C3', body: 'The rule applies to every MCP client, not only a hook.', verdict: 'pass' },
			{ id: 'C4', body: 'The rejection names the branch it expected.', verdict: 'pass' }
		],
		steps: ['Read the branch from the worktree', 'Look up repo_path', 'Compare to the release slug', 'Fail open on unknowable cases'],
		fileChanges: ['src/ledger_mcp/worktree.py', 'src/ledger_mcp/validation.py', 'tests/test_worktree.py'],
		dependsOn: []
	},
	{
		id: 'LDG-047',
		title: 'One release-document check, four callers',
		project: 'ledger',
		release: 'hooks-that-actually-run',
		phase: 2,
		status: 'done',
		type: 'refactor',
		risk: 'low',
		createdOn: '2026-07-28',
		completedOn: '2026-07-29',
		stepCount: 3,
		criterionCount: 2,
		fileChangeCount: 5,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-07-29',
		criteria: [
			{ id: 'C1', body: 'The check exists once and is sourced by every caller.', verdict: 'pass' },
			{ id: 'C2', body: 'Hooks probe psql-18 as well as psql.', verdict: 'pass' }
		],
		steps: ['Extract the check', 'Point four hooks at it', 'Probe psql-18'],
		fileChanges: ['scripts/githooks/check-release-document.sh'],
		dependsOn: ['LDG-041']
	},
	{
		id: 'LDG-052',
		title: 'Search the corpus by title fragment, ranked, with release and project carried',
		project: 'ledger',
		release: 'merlin-recall',
		phase: 1,
		status: 'building',
		type: 'feature',
		risk: 'medium',
		createdOn: '2026-08-01',
		completedOn: null,
		stepCount: 4,
		criterionCount: 3,
		fileChangeCount: 3,
		latestAttempt: 1,
		latestVerdict: null,
		latestSealedOn: null,
		criteria: [
			{ id: 'C1', body: 'A title fragment ranks above a body match.', verdict: null },
			{ id: 'C2', body: 'Every result carries release, project, status and phase.', verdict: null },
			{ id: 'C3', body: 'The search vector wraps its input in translate(..., \'<>\', \'  \').', verdict: null }
		],
		steps: ['Build the vector', 'Rank title over body', 'Carry the context columns'],
		fileChanges: ['src/ledger_mcp/repository.py', 'schema/migrations/0020_search-ranking.sql'],
		dependsOn: []
	},
	{
		id: 'ATL-118',
		title: 'Caddy mount for the dev surface on 6008 with a stable local hostname',
		project: 'atlas',
		release: 'atlas-ingress',
		phase: 2,
		status: 'triaged',
		type: 'chore',
		risk: 'low',
		createdOn: '2026-08-02',
		completedOn: null,
		stepCount: 2,
		criterionCount: 2,
		fileChangeCount: 1,
		latestAttempt: 0,
		latestVerdict: null,
		latestSealedOn: null,
		criteria: [
			{ id: 'C1', body: 'The dev surface resolves over TLS at a stable hostname.', verdict: null },
			{ id: 'C2', body: 'The mount survives a Caddy reload.', verdict: null }
		],
		steps: ['Add the reverse proxy block', 'Reload and verify'],
		fileChanges: ['Caddyfile'],
		dependsOn: ['AL-012']
	},
	{
		id: 'GW-023',
		title: 'Token exchange for the agent fleet, scoped per surface',
		project: 'gateway',
		release: 'gateway-v1',
		phase: 1,
		status: 'pending',
		type: 'feature',
		risk: 'high',
		createdOn: '2026-08-03',
		completedOn: null,
		stepCount: 0,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null,
		latestSealedOn: null,
		criteria: [
			{ id: 'C1', body: 'A token is scoped to one surface and cannot be replayed at another.', verdict: null },
			{ id: 'C2', body: 'Expiry is enforced at the edge, not in the service.', verdict: null }
		],
		steps: [],
		fileChanges: [],
		dependsOn: []
	},
	{
		id: 'FN-030',
		title: 'Longread stat band: display serif figures with mono microtype labels',
		project: 'field-notes',
		release: 'field-notes-v2',
		phase: 2,
		status: 'done',
		type: 'feature',
		risk: 'low',
		createdOn: '2026-06-24',
		completedOn: '2026-06-29',
		stepCount: 3,
		criterionCount: 2,
		fileChangeCount: 2,
		latestAttempt: 1,
		latestVerdict: 'pass',
		latestSealedOn: '2026-06-29',
		criteria: [
			{ id: 'C1', body: 'Figures wear the display serif; labels wear mono microtype.', verdict: 'pass' },
			{ id: 'C2', body: 'More than three figures is refused by review, not by the component.', verdict: 'pass' }
		],
		steps: ['Draft the band', 'Wire the glow', 'Write the story'],
		fileChanges: ['src/blog/LongreadStatBand.svelte'],
		dependsOn: []
	}
];

export interface TransitionEvent {
	taskId: string;
	title: string;
	from: TaskStatus;
	to: TaskStatus;
	at: string;
}

/** What the SSE feed announces. Replayed on a timer so the page visibly moves. */
export const transitionFeed: TransitionEvent[] = [
	{ taskId: 'AL-014', title: 'Skill: /prototype', from: 'building', to: 'verifying', at: '14:22' },
	{ taskId: 'LDG-052', title: 'Search the corpus by title fragment', from: 'triaged', to: 'building', at: '14:09' },
	{ taskId: 'AL-011', title: 'Storybook: a story per component', from: 'triaged', to: 'building', at: '13:47' },
	{ taskId: 'ATL-118', title: 'Caddy mount for the dev surface', from: 'pending', to: 'triaged', at: '13:31' },
	{ taskId: 'AL-009', title: 'Retire the duplicated status indicator', from: 'verifying', to: 'blocked', at: '12:58' }
];

export const headlineStats = [
	{ value: '124', label: 'Open' },
	{ value: '4', label: 'In flight' },
	{ value: '0', label: 'Blocked' },
	{ value: '142', label: 'Shipped, 14 days' }
];
