/**
 * The corpus shapes this page reads, and the fixtures it reads today.
 *
 * Modelled first because the whole direction turns on one distinction the
 * shape has to carry honestly: a criterion with no result is UNJUDGED, which
 * is not the same fact as a criterion that was judged and failed. Anything
 * that collapses both into a number ("0 of 4") tells the reader a lie, so the
 * model keeps a result optional rather than defaulting it.
 */

export type RunningStatus = 'building' | 'verifying';
export type Verdict = 'pass' | 'fail' | 'partial';
export type ResultStatus = 'pass' | 'fail' | 'skip';

/** The four things a criterion mark can say. `unjudged` is the absence of a result. */
export type CriterionOutcome = ResultStatus | 'unjudged';

export interface Criterion {
	id: string;
	body: string;
}

export interface VerificationResult {
	ref: string;
	status: ResultStatus;
	evidence?: string;
}

export interface VerificationAttempt {
	attempt: number;
	verdict: Verdict;
	sealedOn: string;
	results: VerificationResult[];
}

export interface RunningTask {
	id: string;
	title: string;
	project: string;
	release: string;
	phase: number;
	status: RunningStatus;
	criteria: Criterion[];
	/** Append-only and numbered. Empty means never judged, which is not a zero score. */
	attempts: VerificationAttempt[];
}

export const runners: RunningTask[] = [
	{
		id: 'LG-341',
		title: 'Replay ledger_task_events into a fresh corpus so a lost session can be reconstructed',
		project: 'ledger',
		release: 'events-that-outlive-a-session',
		phase: 3,
		status: 'verifying',
		criteria: [
			{
				id: 'C1',
				body: 'Replaying the event log against an empty corpus reproduces every task status held by the live database'
			},
			{
				id: 'C2',
				body: 'Replay is idempotent: running it twice leaves the same rows and writes no second event'
			},
			{
				id: 'C3',
				body: 'An event whose transition the lifecycle would now reject halts the replay and names the row'
			},
			{
				id: 'C4',
				body: 'Replay of a corpus predating the event trigger degrades to a warning rather than an error'
			}
		],
		attempts: [
			{
				attempt: 1,
				verdict: 'fail',
				sealedOn: '2026-07-29',
				results: [
					{ ref: 'C1', status: 'pass' },
					{ ref: 'C2', status: 'fail', evidence: 'second run wrote a duplicate event per task' },
					{ ref: 'C3', status: 'pass' }
				]
			},
			{
				attempt: 2,
				verdict: 'pass',
				sealedOn: '2026-08-02',
				results: [
					{ ref: 'C1', status: 'pass' },
					{ ref: 'C2', status: 'pass', evidence: 'replay twice, row and event counts unchanged' },
					{ ref: 'C3', status: 'pass' },
					{ ref: 'C4', status: 'skip', evidence: 'no pre-trigger corpus available to replay in CI' }
				]
			}
		]
	},
	{
		id: 'AL-014',
		title: 'Skill: /prototype — the one-question-at-a-time journey and the five-agent fan-out',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'verifying',
		criteria: [
			{
				id: 'C1',
				body: 'Discovery questions are asked one at a time, never batched, and stop when the brief is sufficient'
			},
			{
				id: 'C2',
				body: 'Each of the five agents receives a distinct named design direction and owns exactly one approach directory, so no file conflicts arise'
			},
			{
				id: 'C3',
				body: 'The closing report lists, per approach, the new library components promotion would require'
			},
			{
				id: 'C4',
				body: "Promotion instructions merge the winner, retire the losers with their reasoning recorded, and close the round's ledger release"
			}
		],
		attempts: [
			{
				attempt: 1,
				verdict: 'partial',
				sealedOn: '2026-08-03',
				results: [
					{ ref: 'C1', status: 'pass' },
					{ ref: 'C2', status: 'pass', evidence: 'five directories, no overlapping writes across the round' },
					{ ref: 'C3', status: 'fail', evidence: 'two of five reports named no components at all' }
				]
			}
		]
	},
	{
		id: 'GW-072',
		title: 'Reject unsigned webhooks at the edge rather than inside each handler',
		project: 'gateway',
		release: 'one-door-in',
		phase: 2,
		status: 'building',
		criteria: [
			{
				id: 'C1',
				body: 'A request with no signature header is refused before any handler is reached'
			},
			{
				id: 'C2',
				body: 'Signature verification is constant-time and the secret never appears in a log line'
			},
			{
				id: 'C3',
				body: 'Every existing handler drops its own signature check, and none regains one'
			}
		],
		attempts: [
			{
				attempt: 1,
				verdict: 'fail',
				sealedOn: '2026-07-31',
				results: [
					{ ref: 'C1', status: 'pass' },
					{ ref: 'C2', status: 'fail', evidence: 'string comparison short-circuits on the first byte' },
					{ ref: 'C3', status: 'fail', evidence: 'four handlers still verify locally' }
				]
			}
		]
	},
	{
		id: 'AT-208',
		title: 'Rank corpus search by anchor proximity rather than term frequency alone',
		project: 'atlas',
		release: 'search-that-answers',
		phase: 1,
		status: 'building',
		criteria: [
			{
				id: 'C1',
				body: 'A query naming a decision id returns that decision first, ahead of any task that merely cites it'
			},
			{
				id: 'C2',
				body: 'Ranking runs inside Postgres; no result set is re-sorted in Python'
			},
			{
				id: 'C3',
				body: 'The existing search tests pass unchanged, so ranking is additive rather than a rewrite'
			}
		],
		attempts: []
	}
];

/** The latest seal, or null when the task has never been judged. */
export function latestAttempt(task: RunningTask): VerificationAttempt | null {
	return task.attempts.length ? task.attempts[task.attempts.length - 1]! : null;
}

/** One outcome per criterion, in criterion order, from the latest attempt only. */
export function outcomes(task: RunningTask): { id: string; outcome: CriterionOutcome }[] {
	const latest = latestAttempt(task);
	return task.criteria.map((criterion) => ({
		id: criterion.id,
		outcome: (latest?.results.find((result) => result.ref === criterion.id)?.status ??
			'unjudged') as CriterionOutcome
	}));
}

export interface Tally {
	pass: number;
	fail: number;
	skip: number;
	unjudged: number;
	total: number;
	/** True when nothing has ever been judged — the state a count would misreport. */
	neverJudged: boolean;
}

export function tally(task: RunningTask): Tally {
	const counted = { pass: 0, fail: 0, skip: 0, unjudged: 0 };
	for (const { outcome } of outcomes(task)) counted[outcome] += 1;
	return {
		...counted,
		total: task.criteria.length,
		neverJudged: task.attempts.length === 0
	};
}

/**
 * The criterion standing between the task and done: the first failure, else the
 * first thing nobody has judged. Null when every criterion is resolved.
 *
 * One criterion in prose is the whole rationing decision — four bodies per task
 * is a page, one body per task is a glance.
 */
export function frontier(
	task: RunningTask
): { criterion: Criterion; outcome: CriterionOutcome } | null {
	const marks = outcomes(task);
	const failed = marks.find((mark) => mark.outcome === 'fail');
	const chosen = failed ?? marks.find((mark) => mark.outcome === 'unjudged');
	if (!chosen) return null;
	const criterion = task.criteria.find((candidate) => candidate.id === chosen.id);
	return criterion ? { criterion, outcome: chosen.outcome } : null;
}

/**
 * How near done, for ordering. Resolved criteria that passed count fully, skips
 * count as resolved, and a never-judged task sorts last rather than as a zero —
 * it has not lost, it has not yet played.
 */
export function nearness(task: RunningTask): number {
	const counted = tally(task);
	if (counted.neverJudged) return -1;
	return (counted.pass + counted.skip) / counted.total;
}

export function byNearness(tasks: RunningTask[]): RunningTask[] {
	return [...tasks].sort((a, b) => nearness(b) - nearness(a));
}

/** The screen-reader equivalent of the meter, and the visible detail line. */
export function tallySentence(task: RunningTask): string {
	const counted = tally(task);
	if (counted.neverJudged) {
		return `${counted.total} criteria, none judged yet.`;
	}
	const parts = [`${counted.pass} of ${counted.total} passed`];
	if (counted.fail) parts.push(`${counted.fail} failed`);
	if (counted.skip) parts.push(`${counted.skip} skipped`);
	if (counted.unjudged) parts.push(`${counted.unjudged} not yet judged`);
	return `${parts.join(', ')}.`;
}
