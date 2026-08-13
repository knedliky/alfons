/**
 * The running set, and the one rule this approach turns on.
 *
 * "In motion" is `building` or `verifying` and nothing else, so the shape here
 * carries only what a runner needs. The interesting field is
 * `movedSecondsAgo`: the age of the task's last status transition.
 *
 * WHY THAT FIELD DECIDES THE LEAD, and not one of the obvious alternatives:
 *
 * - `created_on` is when a task was filed. A task filed weeks ago and picked up
 *   this minute would sort last, which is the opposite of the truth. In the
 *   fixture below LDG-041 is the oldest task on the page and the one an agent
 *   is touching right now.
 * - `started_on` is stamped once, when a task first enters `building`, and
 *   never moves again. A task that started three days ago and has been grinding
 *   since would outrank one that flipped into `verifying` a minute ago. In the
 *   fixture ATL-118 started most recently and is still not the freshest thing
 *   on the page.
 * - The last status transition is the only signal that says "an agent did
 *   something to this task just now". It is also exactly the event the SSE feed
 *   delivers — `record_status_transition` writes one `task_events` row per
 *   change and notifies `ledger_task_events` — so the lead's ordering key is
 *   the same fact the page updates on. One clock, not two.
 *
 * The three orderings deliberately disagree in this fixture, so the choice is
 * exercised rather than asserted.
 */

export type RunningStatus = 'building' | 'verifying';

export interface Runner {
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
	latestVerdict: 'pass' | 'partial' | 'fail' | null;
	/** Age of the last status transition — the lead's ordering key. */
	movedSecondsAgo: number;
	/** Age of `started_on`. Kept to show it gives a different answer. */
	startedSecondsAgo: number;
}

export const RUNNERS: Runner[] = [
	{
		// Oldest task on the page, and the lead: it fell back into `building`
		// forty-five seconds ago after a verification came back partial.
		id: 'LDG-041',
		title: 'Regenerate base.sql from the live corpus and prove the invariants match',
		project: 'ledger',
		release: 'schema-in-the-repo',
		phase: 1,
		status: 'building',
		type: 'refactor',
		risk: 'high',
		createdOn: '2026-07-26',
		stepCount: 12,
		criterionCount: 5,
		fileChangeCount: 3,
		latestAttempt: 1,
		latestVerdict: 'partial',
		movedSecondsAgo: 45,
		startedSecondsAgo: 3 * 24 * 60 * 60
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
		createdOn: '2026-08-02',
		stepCount: 9,
		criterionCount: 4,
		fileChangeCount: 6,
		latestAttempt: 1,
		latestVerdict: 'partial',
		movedSecondsAgo: 6 * 60,
		startedSecondsAgo: 2 * 24 * 60 * 60
	},
	{
		// Most recently started, and still not the lead.
		id: 'ATL-118',
		title: 'Caddy serves the prototyping surface at /dev with paths left intact',
		project: 'atlas',
		release: 'reverse-proxy-v2',
		phase: 3,
		status: 'building',
		type: 'fix',
		risk: 'low',
		createdOn: '2026-07-29',
		stepCount: 7,
		criterionCount: 3,
		fileChangeCount: 4,
		latestAttempt: 0,
		latestVerdict: null,
		movedSecondsAgo: 22 * 60,
		startedSecondsAgo: 22 * 60
	},
	{
		id: 'GW-072',
		title: 'Express the retry budget per route rather than once for the whole gateway',
		project: 'gateway',
		release: 'timeout-budgets',
		phase: 2,
		status: 'verifying',
		type: 'feat',
		risk: 'medium',
		createdOn: '2026-07-31',
		stepCount: 15,
		criterionCount: 6,
		fileChangeCount: 9,
		latestAttempt: 2,
		latestVerdict: 'partial',
		movedSecondsAgo: 70 * 60,
		startedSecondsAgo: 5 * 60 * 60
	}
];

/** Most recently transitioned first. The lead is simply the head of this. */
export function byMostRecentlyActive(runners: Runner[]): Runner[] {
	return [...runners].sort((a, b) => a.movedSecondsAgo - b.movedSecondsAgo);
}

/** Coarse enough to read in a glance, precise enough to trust near zero. */
export function describeAge(seconds: number): string {
	if (seconds < 10) return 'just now';
	if (seconds < 60) return `${seconds}s ago`;
	if (seconds < 60 * 60) return `${Math.round(seconds / 60)}m ago`;
	if (seconds < 24 * 60 * 60) return `${Math.round(seconds / (60 * 60))}h ago`;
	return `${Math.round(seconds / (24 * 60 * 60))}d ago`;
}
