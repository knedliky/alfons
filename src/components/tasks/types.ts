/**
 * The shapes the task components render. These are presentation contracts,
 * not a data layer: a consuming page owns fetching and navigation, and passes
 * objects that structurally satisfy these interfaces.
 */

import type { TaskStatus } from '../atoms/StatusMark.svelte';

export type { TaskStatus };

/** The two statuses this family calls motion. The running views are typed
 * against the narrow union so nothing that is not building or verifying can
 * reach the grid or the deck by accident. */
export type RunningStatus = 'building' | 'verifying';

export type TaskVerdict = 'pass' | 'partial' | 'fail';

/** One task an agent is working on right now. */
export interface RunningTask {
	id: string;
	title: string;
	project: string;
	release: string;
	phase: number;
	status: RunningStatus;
	type: string;
	risk: 'low' | 'medium' | 'high';
	/** ISO timestamp; rendered as elapsed time, because "4h" answers "has this
	 * been sitting there?" without the reader doing arithmetic. */
	createdOn: string;
	stepCount: number;
	criterionCount: number;
	fileChangeCount: number;
	latestAttempt: number;
	latestVerdict: TaskVerdict | null;
}

/** A task as a release lists it — every status, not only the running ones. */
export interface ReleaseTaskSummary {
	id: string;
	title: string;
	phase: number;
	status: TaskStatus;
}

export interface ReleaseSummary {
	slug: string;
	title: string;
	project: string;
	tags: string[];
	/** Null when the release has shipped nothing written down yet. */
	documentedOn: string | null;
	taskCount: number;
	/** Present when the release's tasks are loaded; absent for index entries. */
	tasks?: ReleaseTaskSummary[];
}

export interface ProjectSummary {
	name: string;
	/** One line, because a project screen is a destination, not a dossier. */
	blurb: string;
}

/** The minimum a release row needs to offer itself as a glance. */
export interface ReleasePeekTarget {
	slug: string;
	project: string;
}

/** The two scales the running view renders the same content at. A type of its
 * own rather than a boolean, because neither is the deviation: they are two
 * sizes of one answer. */
export type TaskScale = 'grid' | 'card';
