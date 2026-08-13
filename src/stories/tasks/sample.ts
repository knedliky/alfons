/**
 * Sample data for the task component stories — a small, self-consistent slice
 * of what a consuming page would fetch. Shapes match src/components/tasks/types.ts.
 */
import type { ProjectSummary, ReleaseSummary, RunningTask } from '../../components/tasks/types.js';

export const runningTasks: RunningTask[] = [
	{
		id: 'AL-014',
		title: 'Skill: /prototype — the one-question-at-a-time journey and the five-agent fan-out',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'verifying',
		type: 'feat',
		risk: 'medium',
		createdOn: new Date(Date.now() - 4 * 3_600_000).toISOString(),
		stepCount: 9,
		criterionCount: 4,
		fileChangeCount: 12,
		latestAttempt: 1,
		latestVerdict: 'partial'
	},
	{
		id: 'LDG-041',
		title: 'Regenerate base.sql from the live corpus and hold it there with a bootstrap test',
		project: 'ledger',
		release: 'schema-lives-here',
		phase: 2,
		status: 'building',
		type: 'refactor',
		risk: 'high',
		createdOn: new Date(Date.now() - 90 * 60_000).toISOString(),
		stepCount: 11,
		criterionCount: 3,
		fileChangeCount: 7,
		latestAttempt: 0,
		latestVerdict: null
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
		createdOn: new Date(Date.now() - 26 * 3_600_000).toISOString(),
		stepCount: 6,
		criterionCount: 2,
		fileChangeCount: 3,
		latestAttempt: 0,
		latestVerdict: null
	},
	{
		id: 'GW-072',
		title: 'Retry a token refresh once before surfacing a 401 to the caller',
		project: 'gateway',
		release: 'auth-hardening',
		phase: 2,
		status: 'verifying',
		type: 'fix',
		risk: 'medium',
		createdOn: new Date(Date.now() - 5 * 3_600_000).toISOString(),
		stepCount: 4,
		criterionCount: 5,
		fileChangeCount: 2,
		latestAttempt: 2,
		latestVerdict: 'fail'
	}
];

export const release: ReleaseSummary = {
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
};

export const releaseIndexEntry: ReleaseSummary = {
	slug: 'hooks-that-actually-run',
	title: 'Hooks that actually run — one release-document check, four callers',
	project: 'ledger',
	tags: ['ledger', 'githooks', 'enforcement'],
	documentedOn: '2026-07-29',
	taskCount: 5
};

export const project: ProjectSummary = {
	name: 'ledger',
	blurb: 'The MCP server that is the single write path into the context database.'
};

export const projectReleases: ReleaseSummary[] = [release, releaseIndexEntry];
