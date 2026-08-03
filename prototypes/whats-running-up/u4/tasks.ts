/**
 * The shape of a running task, and the four that are running today.
 *
 * Carried over from the winning approach with one change forced by the upward
 * move: the ledger's full status set now has a type, because the sheet that
 * rises over the card lists a release's tasks and a release contains done,
 * blocked and pending work. `RunningStatus` stays a narrow subset of it, so the
 * running view still cannot express anything that is not in motion — the
 * relaxation is confined to the sheet rather than leaking into the deck.
 */

/** Every status the ledger has. Only the sheet ever sees more than two of them. */
export type TaskStatus =
	| 'pending'
	| 'triaged'
	| 'building'
	| 'verifying'
	| 'done'
	| 'blocked'
	| 'wontfix'
	| 'duplicate';

/** In motion. The only two statuses the deck and the grid can render. */
export type RunningStatus = Extract<TaskStatus, 'building' | 'verifying'>;

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
	}
];

/**
 * Whether a status means an agent is at the keyboard right now. The status mark
 * pulses for these and holds still for the rest: a done task with a breathing
 * dot would say something untrue on a sheet where most rows are finished.
 */
export function isInMotion(status: TaskStatus): boolean {
	return status === 'building' || status === 'verifying';
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
