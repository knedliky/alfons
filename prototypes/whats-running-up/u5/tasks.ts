/**
 * The corpus this page reads, and the shape of the three things in it.
 *
 * This approach differs from every earlier one in a single, load-bearing way:
 * `Status` here is all eight ledger statuses, not the two that mean motion. The
 * earlier rounds could express "not running" only as absence, because the type
 * had no word for it. This deck can be handed a whole release, and a release is
 * mostly finished work, so the type has to carry the finished work too.
 *
 * `isRunning` is therefore the only definition of motion on the page, and every
 * count, colour rule and animation goes through it rather than testing statuses
 * inline. There is exactly one place to look when the question "what counts as
 * running" comes up again.
 */

export type Status =
	| 'pending'
	| 'triaged'
	| 'building'
	| 'verifying'
	| 'done'
	| 'blocked'
	| 'wontfix'
	| 'duplicate';

export type Verdict = 'pass' | 'partial' | 'fail';

/** Motion is building and verifying. Nothing else, ever, on this page. */
export function isRunning(status: Status): boolean {
	return status === 'building' || status === 'verifying';
}

export interface Task {
	id: string;
	title: string;
	project: string;
	release: string;
	phase: number;
	status: Status;
	type: string;
	risk: 'low' | 'medium' | 'high';
	createdOn: string;
	stepCount: number;
	criterionCount: number;
	fileChangeCount: number;
	latestAttempt: number;
	latestVerdict: Verdict | null;
}

export interface Release {
	slug: string;
	title: string;
	project: string;
	tags: string[];
	/** Null until the release document is written. A live release has none. */
	documentedOn: string | null;
}

export const releases: Release[] = [
	{
		slug: 'prototype-loop-v1',
		title: 'Prototype loop v1 — watchable five-approach prototyping at dev/<page-name>',
		project: 'alfons',
		tags: ['alfons', 'mcp', 'prototyping', 'dev-app', 'skill'],
		documentedOn: null
	},
	{
		slug: 'alfons-mcp',
		title: 'Alfons v1 — one design system, three surfaces',
		project: 'alfons',
		tags: ['alfons', 'mcp', 'design-system', 'storybook', 'postgres'],
		documentedOn: '2026-08-02'
	},
	{
		slug: 'schema-lives-here',
		title: 'The schema moves into the repository that talks to it',
		project: 'ledger',
		tags: ['ledger', 'postgres', 'schema', 'migrations'],
		documentedOn: null
	},
	{
		slug: 'dev-surface-v2',
		title: 'The dev surface on a name, served by Caddy',
		project: 'atlas',
		tags: ['atlas', 'caddy', 'dev-app', 'infra'],
		documentedOn: null
	},
	{
		slug: 'auth-hardening',
		title: 'Auth hardening — tokens that rotate and 401s that explain themselves',
		project: 'gateway',
		tags: ['gateway', 'auth', 'security'],
		documentedOn: null
	}
];

/**
 * Every task in the five releases above, in ledger order.
 *
 * Four are running — AL-014, LDG-041, ATL-118, GW-072 — which is the corpus's
 * real answer today and the same four the winning approach carried. The other
 * thirty exist so the scale question in this approach is measured rather than
 * imagined: `alfons` alone is sixteen tasks, which is what a project deck has
 * to survive.
 */
export const tasks: Task[] = [
	// prototype-loop-v1 — alfons
	{
		id: 'AL-012',
		title: 'Dev app: production-accurate prototype surface at /dev with pager and work glow',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'feat',
		risk: 'medium',
		createdOn: '2026-07-28T09:30:00+10:00',
		stepCount: 8,
		criterionCount: 3,
		fileChangeCount: 9,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},
	{
		id: 'AL-013',
		title: 'MCP tools: plan_prototype_round and promote_prototype over the manifest',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 1,
		status: 'done',
		type: 'feat',
		risk: 'medium',
		createdOn: '2026-07-29T14:10:00+10:00',
		stepCount: 7,
		criterionCount: 4,
		fileChangeCount: 6,
		latestAttempt: 2,
		latestVerdict: 'pass'
	},
	{
		id: 'AL-014',
		title: 'Skill: /prototype — the one-question-at-a-time journey and the five-agent fan-out',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'verifying',
		type: 'feat',
		risk: 'medium',
		createdOn: '2026-08-03T09:12:00+10:00',
		stepCount: 9,
		criterionCount: 4,
		fileChangeCount: 12,
		latestAttempt: 1,
		latestVerdict: 'partial'
	},
	{
		id: 'AL-015',
		title: 'Document the dev surface: CLAUDE.md, prototypes directory contract and the Caddy mount',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'done',
		type: 'docs',
		risk: 'low',
		createdOn: '2026-08-01T11:00:00+10:00',
		stepCount: 4,
		criterionCount: 2,
		fileChangeCount: 3,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},

	// alfons-mcp — alfons
	{
		id: 'AL-001',
		title: 'Rules engine: parse markup properly instead of scanning source text',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 1,
		status: 'done',
		type: 'refactor',
		risk: 'high',
		createdOn: '2026-07-06T10:00:00+10:00',
		stepCount: 14,
		criterionCount: 6,
		fileChangeCount: 22,
		latestAttempt: 3,
		latestVerdict: 'pass'
	},
	{
		id: 'AL-002',
		title: 'find_components: rank by what a component does, not by what it is called',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 1,
		status: 'done',
		type: 'feat',
		risk: 'medium',
		createdOn: '2026-07-08T09:20:00+10:00',
		stepCount: 6,
		criterionCount: 3,
		fileChangeCount: 4,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},
	{
		id: 'AL-003',
		title: 'get_tokens: exclude deprecated tokens unless asked, and carry their replacements',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 1,
		status: 'done',
		type: 'feat',
		risk: 'low',
		createdOn: '2026-07-09T15:45:00+10:00',
		stepCount: 5,
		criterionCount: 2,
		fileChangeCount: 3,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},
	{
		id: 'AL-004',
		title: 'scaffold_component: emit a component that already passes the rules',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 2,
		status: 'done',
		type: 'feat',
		risk: 'medium',
		createdOn: '2026-07-13T08:55:00+10:00',
		stepCount: 9,
		criterionCount: 4,
		fileChangeCount: 11,
		latestAttempt: 2,
		latestVerdict: 'pass'
	},
	{
		id: 'AL-005',
		title: 'Storybook 10: drop addon-essentials and republish the catalogue',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 2,
		status: 'done',
		type: 'chore',
		risk: 'low',
		createdOn: '2026-07-15T13:30:00+10:00',
		stepCount: 3,
		criterionCount: 2,
		fileChangeCount: 5,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},
	{
		id: 'AL-006',
		title: 'Two halves of the manifest: derive the components, author the lifecycle',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 2,
		status: 'done',
		type: 'refactor',
		risk: 'high',
		createdOn: '2026-07-18T10:15:00+10:00',
		stepCount: 12,
		criterionCount: 5,
		fileChangeCount: 17,
		latestAttempt: 2,
		latestVerdict: 'pass'
	},
	{
		id: 'AL-007',
		title: 'review_library: findings about Alfons itself rather than about markup',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 3,
		status: 'done',
		type: 'feat',
		risk: 'medium',
		createdOn: '2026-07-22T09:00:00+10:00',
		stepCount: 7,
		criterionCount: 3,
		fileChangeCount: 6,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},
	{
		id: 'AL-008',
		title: 'Serve the catalogue from Atlas Caddy rather than through the gateway',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 3,
		status: 'blocked',
		type: 'ci',
		risk: 'high',
		createdOn: '2026-07-24T16:40:00+10:00',
		stepCount: 5,
		criterionCount: 3,
		fileChangeCount: 2,
		latestAttempt: 1,
		latestVerdict: 'fail'
	},
	{
		id: 'AL-009',
		title: 'Promote the rules from advisory to blocking once the false-positive rate is measured',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 3,
		status: 'pending',
		type: 'chore',
		risk: 'medium',
		createdOn: '2026-07-25T11:05:00+10:00',
		stepCount: 0,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null
	},
	{
		id: 'AL-010',
		title: 'Retire the fourth frost level and record the decision behind it',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 3,
		status: 'triaged',
		type: 'chore',
		risk: 'low',
		createdOn: '2026-07-26T08:30:00+10:00',
		stepCount: 2,
		criterionCount: 1,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null
	},
	{
		id: 'AL-011',
		title: 'Light mode parity for the public surface',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 1,
		status: 'wontfix',
		type: 'feat',
		risk: 'medium',
		createdOn: '2026-07-10T12:00:00+10:00',
		stepCount: 0,
		criterionCount: 1,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null
	},
	{
		id: 'AL-016',
		title: 'Rank find_components by component name as well as by summary',
		project: 'alfons',
		release: 'alfons-mcp',
		phase: 1,
		status: 'duplicate',
		type: 'feat',
		risk: 'low',
		createdOn: '2026-07-11T09:40:00+10:00',
		stepCount: 0,
		criterionCount: 1,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null
	},

	// schema-lives-here — ledger
	{
		id: 'LDG-038',
		title: 'Move schema/ out of motivka and into the repository that talks to it',
		project: 'ledger',
		release: 'schema-lives-here',
		phase: 1,
		status: 'done',
		type: 'chore',
		risk: 'high',
		createdOn: '2026-07-30T09:00:00+10:00',
		stepCount: 6,
		criterionCount: 3,
		fileChangeCount: 24,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},
	{
		id: 'LDG-039',
		title: 'build_database.sh: baseline the manifest so a migration is never replayed',
		project: 'ledger',
		release: 'schema-lives-here',
		phase: 1,
		status: 'done',
		type: 'feat',
		risk: 'high',
		createdOn: '2026-07-31T10:20:00+10:00',
		stepCount: 8,
		criterionCount: 4,
		fileChangeCount: 5,
		latestAttempt: 2,
		latestVerdict: 'pass'
	},
	{
		id: 'LDG-040',
		title: 'Emit the CREATE EXTENSION lines pg_dump leaves out of a schema-scoped dump',
		project: 'ledger',
		release: 'schema-lives-here',
		phase: 1,
		status: 'done',
		type: 'fix',
		risk: 'medium',
		createdOn: '2026-08-01T14:15:00+10:00',
		stepCount: 4,
		criterionCount: 2,
		fileChangeCount: 2,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},
	{
		id: 'LDG-041',
		title: 'Regenerate base.sql from the live corpus and hold it there with a bootstrap test',
		project: 'ledger',
		release: 'schema-lives-here',
		phase: 1,
		status: 'building',
		type: 'refactor',
		risk: 'high',
		createdOn: '2026-08-03T11:40:00+10:00',
		stepCount: 11,
		criterionCount: 3,
		fileChangeCount: 7,
		latestAttempt: 0,
		latestVerdict: null
	},
	{
		id: 'LDG-042',
		title: 'Compare trigger definitions with search_path emptied on both connections',
		project: 'ledger',
		release: 'schema-lives-here',
		phase: 2,
		status: 'triaged',
		type: 'test',
		risk: 'medium',
		createdOn: '2026-08-02T09:50:00+10:00',
		stepCount: 3,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null
	},
	{
		id: 'LDG-043',
		title: 'Drop the provenance columns once nothing depends on a task having a document',
		project: 'ledger',
		release: 'schema-lives-here',
		phase: 2,
		status: 'pending',
		type: 'refactor',
		risk: 'high',
		createdOn: '2026-08-02T15:25:00+10:00',
		stepCount: 0,
		criterionCount: 3,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null
	},

	// dev-surface-v2 — atlas
	{
		id: 'ATL-114',
		title: 'Serve the dev surface on a name rather than on a port',
		project: 'atlas',
		release: 'dev-surface-v2',
		phase: 1,
		status: 'done',
		type: 'ci',
		risk: 'medium',
		createdOn: '2026-07-27T10:30:00+10:00',
		stepCount: 5,
		criterionCount: 2,
		fileChangeCount: 3,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},
	{
		id: 'ATL-115',
		title: 'Bind-mount the Storybook static build instead of proxying it',
		project: 'atlas',
		release: 'dev-surface-v2',
		phase: 1,
		status: 'done',
		type: 'ci',
		risk: 'low',
		createdOn: '2026-07-28T13:00:00+10:00',
		stepCount: 3,
		criterionCount: 2,
		fileChangeCount: 2,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},
	{
		id: 'ATL-116',
		title: 'Stop bun link from corrupting the esbuild signature',
		project: 'atlas',
		release: 'dev-surface-v2',
		phase: 2,
		status: 'done',
		type: 'fix',
		risk: 'high',
		createdOn: '2026-07-30T08:10:00+10:00',
		stepCount: 7,
		criterionCount: 3,
		fileChangeCount: 4,
		latestAttempt: 3,
		latestVerdict: 'pass'
	},
	{
		id: 'ATL-117',
		title: 'Reverse-proxy block for the dev surface in the Atlas Caddyfile',
		project: 'atlas',
		release: 'dev-surface-v2',
		phase: 2,
		status: 'blocked',
		type: 'ci',
		risk: 'medium',
		createdOn: '2026-08-01T09:45:00+10:00',
		stepCount: 2,
		criterionCount: 2,
		fileChangeCount: 1,
		latestAttempt: 1,
		latestVerdict: 'fail'
	},
	{
		id: 'ATL-118',
		title: 'Proxy /dev through Caddy so the prototyping surface survives a restart',
		project: 'atlas',
		release: 'dev-surface-v2',
		phase: 3,
		status: 'building',
		type: 'ci',
		risk: 'low',
		createdOn: '2026-08-02T16:05:00+10:00',
		stepCount: 6,
		criterionCount: 2,
		fileChangeCount: 3,
		latestAttempt: 0,
		latestVerdict: null
	},
	{
		id: 'ATL-119',
		title: 'Drop the vendored motif copy and depend on Alfons by git URL',
		project: 'atlas',
		release: 'dev-surface-v2',
		phase: 3,
		status: 'done',
		type: 'refactor',
		risk: 'high',
		createdOn: '2026-08-02T11:20:00+10:00',
		stepCount: 10,
		criterionCount: 4,
		fileChangeCount: 83,
		latestAttempt: 2,
		latestVerdict: 'pass'
	},
	{
		id: 'ATL-120',
		title: 'Lint the Caddyfile in CI so a bad block never reaches a restart',
		project: 'atlas',
		release: 'dev-surface-v2',
		phase: 3,
		status: 'pending',
		type: 'ci',
		risk: 'low',
		createdOn: '2026-08-03T07:15:00+10:00',
		stepCount: 0,
		criterionCount: 1,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null
	},

	// auth-hardening — gateway
	{
		id: 'GW-069',
		title: 'Rotate the bearer token on a schedule rather than on restart',
		project: 'gateway',
		release: 'auth-hardening',
		phase: 1,
		status: 'done',
		type: 'feat',
		risk: 'high',
		createdOn: '2026-07-29T08:40:00+10:00',
		stepCount: 9,
		criterionCount: 4,
		fileChangeCount: 8,
		latestAttempt: 2,
		latestVerdict: 'pass'
	},
	{
		id: 'GW-070',
		title: 'Reject a token whose audience does not match the route it arrived on',
		project: 'gateway',
		release: 'auth-hardening',
		phase: 1,
		status: 'done',
		type: 'fix',
		risk: 'high',
		createdOn: '2026-07-31T15:00:00+10:00',
		stepCount: 5,
		criterionCount: 3,
		fileChangeCount: 4,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},
	{
		id: 'GW-071',
		title: 'Log a 401 with the route and the subject, never with the token',
		project: 'gateway',
		release: 'auth-hardening',
		phase: 1,
		status: 'done',
		type: 'fix',
		risk: 'medium',
		createdOn: '2026-08-01T10:10:00+10:00',
		stepCount: 4,
		criterionCount: 2,
		fileChangeCount: 2,
		latestAttempt: 1,
		latestVerdict: 'pass'
	},
	{
		id: 'GW-072',
		title: 'Retry a token refresh once before surfacing a 401 to the caller',
		project: 'gateway',
		release: 'auth-hardening',
		phase: 1,
		status: 'verifying',
		type: 'fix',
		risk: 'medium',
		createdOn: '2026-08-03T08:20:00+10:00',
		stepCount: 4,
		criterionCount: 5,
		fileChangeCount: 2,
		latestAttempt: 2,
		latestVerdict: 'fail'
	},
	{
		id: 'GW-073',
		title: 'Drop the shared secret path entirely',
		project: 'gateway',
		release: 'auth-hardening',
		phase: 2,
		status: 'triaged',
		type: 'refactor',
		risk: 'high',
		createdOn: '2026-08-02T12:35:00+10:00',
		stepCount: 1,
		criterionCount: 2,
		fileChangeCount: 0,
		latestAttempt: 0,
		latestVerdict: null
	}
];

export function releaseBySlug(slug: string): Release | undefined {
	return releases.find((release) => release.slug === slug);
}

/**
 * Elapsed time reads better than a timestamp on a glance page: "4h" answers
 * "has this been sitting there?" without the reader doing arithmetic.
 */
export function elapsedSince(iso: string, now: number = Date.now()): string {
	const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.round(minutes / 60);
	if (hours < 48) return `${hours}h`;
	return `${Math.round(hours / 24)}d`;
}

/** 24-hour clock, the convention everywhere else in this corpus. */
export function clockTime(at: Date): string {
	return `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
}
