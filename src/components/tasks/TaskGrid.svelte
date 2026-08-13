<script lang="ts" module>
	export interface TaskGridProps {
		tasks: RunningTask[];
		/** The selected task's index; owned by the page so the two scales agree. */
		index: number;
		onSelect: (next: number) => void;
		/** Opens the task at card scale. */
		onOpen: (next: number) => void;
		/** Raises the task's release as a peek. */
		onPeekRelease: (task: RunningTask, opener: HTMLElement) => void;
		/** Take focus on mount — only when the reader changed scale, so nothing
		 * steals the focus on first load. */
		autofocus?: boolean;
	}
</script>

<script lang="ts">
	/**
	 * TaskGrid — every runner at once, in the room one card used to have.
	 *
	 * This is the landing state. The reader's question — a sense check of where
	 * things stand — is plural, and a deck answers plural questions one at a
	 * time. A handful of cells answers it in a single frame with no gesture:
	 * how many, which ones, what state each is in. The card is then one
	 * deliberate tap away, so nothing is traded, only re-priced. Each cell can
	 * also glance at its release (see TaskCell).
	 *
	 * Two columns at every width: the consuming page is expected to cap its own
	 * column, so above a phone the cells grow instead of multiplying.
	 *
	 * Keyboard: one tab stop, then arrows. Left and right move by one, up and
	 * down move by however many columns the grid actually has — read off the
	 * computed template rather than hard-coded, so a column-count change cannot
	 * quietly make the arrows skip cells.
	 *
	 * Usage:
	 *   <TaskGrid {tasks} {index} onSelect={select} onOpen={open}
	 *     onPeekRelease={raise} />
	 */
	import TaskCell from './TaskCell.svelte';
	import type { RunningTask } from './types.js';

	let {
		tasks,
		index,
		onSelect,
		onOpen,
		onPeekRelease,
		autofocus = false
	}: TaskGridProps = $props();

	let grid = $state<HTMLDivElement | null>(null);
	let cells = $state<({ focus: () => void } | null)[]>([]);

	$effect(() => {
		if (autofocus) cells[index]?.focus();
	});

	function columnCount(): number {
		if (!grid) return 1;
		const template = getComputedStyle(grid).gridTemplateColumns;
		return template.split(' ').filter(Boolean).length || 1;
	}

	function onKeydown(event: KeyboardEvent) {
		const columns = columnCount();
		const jump =
			event.key === 'ArrowRight'
				? index + 1
				: event.key === 'ArrowLeft'
					? index - 1
					: event.key === 'ArrowDown'
						? index + columns
						: event.key === 'ArrowUp'
							? index - columns
							: event.key === 'Home'
								? 0
								: event.key === 'End'
									? tasks.length - 1
									: null;
		if (jump === null) return;
		event.preventDefault();
		const landed = Math.min(Math.max(jump, 0), tasks.length - 1);
		onSelect(landed);
		// Roving focus, same contract as the deck's rail: the key that moved the
		// selection moves the focus with it.
		cells[landed]?.focus();
	}
</script>

<div class="grid" bind:this={grid} role="group" aria-label="All running tasks">
	{#each tasks as task, position (task.id)}
		<TaskCell
			{task}
			position={position + 1}
			total={tasks.length}
			current={position === index}
			bind:this={cells[position]}
			onopen={() => onOpen(position)}
			onpeek={(opener) => onPeekRelease(task, opener)}
			onkeydown={onKeydown}
		/>
	{/each}
</div>

<style>
	.grid {
		flex: 1;
		min-height: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		/* Equal rows so the cells divide the height rather than stacking to their
		   content and leaving a hole under them. */
		grid-auto-rows: minmax(0, 1fr);
		gap: var(--space-3);
	}

	/* Beyond a handful of runners the grid gives up and scrolls rather than
	   crushing the cells. There is no horizontal gesture at this scale, so a
	   scroll container here costs nothing. */
	@media (max-height: 30rem) {
		.grid {
			grid-auto-rows: minmax(9rem, 1fr);
			overflow-y: auto;
			overflow-x: hidden;
		}
	}

	/* Still two columns above a phone: the cells grow rather than multiply.
	   Three columns would leave four runners as a row of three and an orphan,
	   which reads as a list that ran out. */
	@media (min-width: 640px) {
		.grid {
			gap: var(--space-4);
		}
	}
</style>
