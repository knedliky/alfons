<script lang="ts" module>
	export interface TaskCellProps {
		task: RunningTask;
		/** 1-based position in the grid, for the accessible name. */
		position: number;
		total: number;
		/** Whether this cell is the card the reader came from. */
		current: boolean;
		onopen: () => void;
		/** Raises the task's release as a peek; handed the row element as opener. */
		onpeek: (opener: HTMLElement) => void;
		/** The grid owns roving focus and arrow-key movement. */
		onkeydown: (event: KeyboardEvent) => void;
	}
</script>

<script lang="ts">
	/**
	 * TaskCell — one runner at grid scale: a nameplate, and a place to glance
	 * from.
	 *
	 * The cell holds two targets. The plate opens the task at full size — the
	 * identity contract between the two scales. Beneath it, the where block is a
	 * second, plainly cued target that peeks the release: a full navigation
	 * would fight the cell's one job, but a glance is cheap enough for a 158px
	 * cell to afford, and it makes going up from the landing state one tap. The
	 * cost is stated: the where row keeps a 44px target of its own, paid for in
	 * rows of plate.
	 *
	 * Requires the --status-* palette declared by the page; see StatusMark. Only
	 * the two motion statuses are mapped here, because only running tasks reach
	 * the grid.
	 *
	 * Usage:
	 *   <TaskCell {task} position={1} total={4} current
	 *     onopen={open} onpeek={raise} onkeydown={rove} />
	 */
	import DestinationRow from '../atoms/DestinationRow.svelte';
	import StatusMark from '../atoms/StatusMark.svelte';
	import { elapsedSince } from './time.js';
	import type { RunningTask } from './types.js';

	let { task, position, total, current, onopen, onpeek, onkeydown }: TaskCellProps = $props();

	let plate = $state<HTMLButtonElement | null>(null);

	// The grid owns roving focus and needs the element, not the instance. An
	// exported function is the Svelte 5 way to hand it out without leaking the
	// node. Roving lands on the plate; the peek row is the next tab stop only on
	// the current cell, so the grid still costs one Tab to cross.
	export function focus() {
		plate?.focus();
	}
</script>

<div class="cell" data-status={task.status} data-current={current ? 'true' : undefined}>
	<button
		bind:this={plate}
		type="button"
		class="plate"
		aria-current={current ? 'true' : undefined}
		aria-label="{task.id}, {task.status}, {task.project}, {position} of {total}. Open at full size."
		tabindex={current ? 0 : -1}
		onclick={onopen}
		{onkeydown}
	>
		<span class="rule" aria-hidden="true"></span>
		<span class="state"><StatusMark status={task.status} /></span>
		<span class="id">{task.id}</span>
		<span class="tag">
			{#if current}
				<!-- The thread between the two scales: zooming out has to say which
				     cell was the card. -->
				current
			{/if}
		</span>
		<span class="age">{elapsedSince(task.createdOn)} &middot; phase {task.phase}</span>
	</button>

	<DestinationRow
		name={task.release}
		secondary={task.project}
		cue="peek"
		chevron={false}
		fill="subtle"
		edge="top"
		label="Peek at release {task.release}, in {task.project}"
		tabindex={current ? 0 : -1}
		onactivate={onpeek}
		{onkeydown}
	/>
</div>

<style>
	.cell {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		min-height: var(--space-10);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		overflow: clip;
	}

	.plate {
		appearance: none;
		flex: 1;
		min-height: 0;
		display: grid;
		/* Rule, state, id, a flexible row carrying the current tag, the age on the
		   floor. Same rows on every cell so the lines stay level across the grid. */
		grid-template-rows: auto auto auto 1fr auto;
		gap: var(--space-2);
		width: 100%;
		text-align: left;
		padding: var(--space-3);
		background: transparent;
		border: none;
		cursor: pointer;
		overflow: clip;
	}

	/* Status as a mark you do not have to read. The colours come from the page
	   root, where they are declared once; only the two motion statuses are
	   mapped because only motion reaches the grid. */
	.rule {
		height: var(--space-1);
		background: var(--cell-status-colour);
	}

	.cell[data-status='building'] {
		--cell-status-colour: var(--status-building);
	}

	.cell[data-status='verifying'] {
		--cell-status-colour: var(--status-verifying);
	}

	.state {
		display: flex;
		min-width: 0;
	}

	.id {
		font-family: var(--font-mono);
		font-size: var(--text-lead);
		line-height: 1.1;
		letter-spacing: 0.02em;
		color: var(--text-primary);
	}

	.age {
		align-self: end;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		white-space: nowrap;
	}

	/* Neutral, deliberately. Being the card the reader came from is not a status,
	   and tinting it would put a third meaning on two status colours. */
	.cell[data-current='true'] {
		background: var(--surface-hover-subtle);
		border-color: var(--text-primary);
	}

	.tag {
		align-self: end;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-primary);
	}

	.plate:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: calc(var(--space-1) * -1);
	}
</style>
