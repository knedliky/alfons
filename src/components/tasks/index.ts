// Task components — the running view family absorbed from the
// whats-running-across prototype round (winner x4, "Peek, then commit").
export { default as TaskGrid } from './TaskGrid.svelte';
export type { TaskGridProps } from './TaskGrid.svelte';

export { default as TaskCell } from './TaskCell.svelte';
export type { TaskCellProps } from './TaskCell.svelte';

export { default as TaskDeck } from './TaskDeck.svelte';
export type { TaskDeckProps } from './TaskDeck.svelte';

export { default as TaskCard } from './TaskCard.svelte';
export type { TaskCardProps } from './TaskCard.svelte';

export { default as ReleaseBody } from './ReleaseBody.svelte';
export type { ReleaseBodyProps } from './ReleaseBody.svelte';

export { default as ProjectBody } from './ProjectBody.svelte';
export type { ProjectBodyProps } from './ProjectBody.svelte';

export { default as NothingRunning } from './NothingRunning.svelte';
export type { NothingRunningProps } from './NothingRunning.svelte';

export { default as ScaleControl } from './ScaleControl.svelte';
export type { ScaleControlProps } from './ScaleControl.svelte';

export { elapsedSince, clockTime } from './time.js';
export type {
	TaskStatus,
	RunningStatus,
	TaskVerdict,
	RunningTask,
	ReleaseTaskSummary,
	ReleaseSummary,
	ProjectSummary,
	ReleasePeekTarget,
	TaskScale
} from './types.js';
