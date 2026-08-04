/**
 * The shape of a running task, and the four that are running today.
 *
 * Carried from the winning approach with one change forced by this round: the
 * status type is no longer only the two motion statuses. A release screen shows
 * the whole release, and a release is mostly not running — so `TaskStatus`
 * carries all eight ledger labels and `RunningStatus` narrows to the two that
 * are motion. The narrow type is still what the running view is typed against,
 * so nothing that is not building or verifying can reach the grid or the deck
 * by accident.
 */

export type RunningStatus = 'building' | 'verifying';

export type TaskStatus =
	| 'pending'
	| 'triaged'
	| 'building'
	| 'verifying'
	| 'done'
	| 'blocked'
	| 'wontfix'
	| 'duplicate';

export type Verdict = 'pass' | 'partial' | 'fail';

export interface RunningTask {
	id: string;
	title: string;
	project: string;
	release: string;
	phase: number;
	status: RunningStatus;
	type: string;
	risk: 'low' | 'medium' | 'high';
	createdOn: string;
	stepCount: number;
	criterionCount: number;
	fileChangeCount: number;
	latestAttempt: number;
	latestVerdict: Verdict | null;
}

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
		createdOn: '2026-08-03T09:12:00+10:00',
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
		createdOn: '2026-08-03T11:40:00+10:00',
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
		createdOn: '2026-08-02T16:05:00+10:00',
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
		createdOn: '2026-08-03T08:20:00+10:00',
		stepCount: 4,
		criterionCount: 5,
		fileChangeCount: 2,
		latestAttempt: 2,
		latestVerdict: 'fail'
	}
];

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
