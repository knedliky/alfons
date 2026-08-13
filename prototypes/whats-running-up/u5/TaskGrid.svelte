<script lang="ts">
	/**
	 * The grid scale: every task in the current scope, in the room one card had.
	 *
	 * This is the landing state. The reader's question is plural, and four cells
	 * is the answer in a single frame with no gesture at all.
	 *
	 * What this approach has to confront is that the scope can be a project, and a
	 * project is sixteen tasks. Four cells is a glance; sixteen is a list. The grid
	 * therefore declares a floor on its row height and scrolls past it rather than
	 * crushing the cells into illegibility — an honest failure rather than a
	 * silent one, and the same trade a list makes. It is still two columns at
	 * every width, because the page caps its own column and cells that multiply
	 * across a desktop would make the phone layout the special case.
	 *
	 * The cost is stated plainly rather than designed around: above the number of
	 * cells that fit the viewport, this stops being a glance. Six on a 370x667
	 * phone. Everything past that is scrolled to, and the running work is at the
	 * top of the order precisely so the scroll is never where the answer lives.
	 *
	 * A scroll container here is safe in a way it would not be in the deck: there
	 * is no horizontal gesture at grid scale, so nothing is competing for the
	 * touch. `overflow-x: hidden` is stated rather than left unset, because an
	 * unstated overflow-x computes to a scrolling value once overflow-y is set.
	 *
	 * Keyboard: one tab stop, then arrows. Up and down move by however many
	 * columns the grid actually has, read off the computed template rather than
	 * hard-coded.
	 */
	import type { Task } from './tasks.ts';
	import type { Scope } from './scope.ts';
	import TaskCell from './TaskCell.svelte';

	let {
		tasks,
		index,
		scope,
		onSelect,
		onOpen,
		autofocus = false
	}: {
		tasks: Task[];
		index: number;
		scope: Scope;
		onSelect: (next: number) => void;
		onOpen: (next: number) => void;
		autofocus?: boolean;
	} = $props();

	let grid = $state<HTMLDivElement | null>(null);
	let cells = $state<({ focus: () => void } | null)[]>([]);

	$effect(() => {
		if (autofocus) cells[index]?.focus();
	});

	// A refill can land the reader's task below the fold of a sixteen-cell grid.
	// Scrolling it into view is not optional here: the whole contract of the
	// upward move is that the reader keeps their place, and a place they cannot
	// see is not kept. `block: 'nearest'` so a cell already on screen does not move.
	$effect(() => {
		void scope;
		const cell = grid?.children[index];
		cell?.scrollIntoView({ block: 'nearest', behavior: 'auto' });
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

<div class="grid" bind:this={grid} role="group" aria-label="Every task in the deck">
	{#each tasks as task, position (task.id)}
		<TaskCell
			{task}
			{scope}
			position={position + 1}
			total={tasks.length}
			current={position === index}
			bind:this={cells[position]}
			onopen={() => onOpen(position)}
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
		/* Equal rows so four cells divide the height rather than stacking to their
		   content and leaving a hole under them — and a floor, so sixteen cells
		   scroll rather than crush. */
		/* The floor is the measured height of a full nameplate — rule, status, id,
		   two lines of context, the current tag and the age. Below it the cell
		   clips its own last row, which is a silent lie about what a cell carries. */
		grid-auto-rows: minmax(9.25rem, 1fr);
		gap: var(--space-3);
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
	}

	/* Still two columns above a phone. The page caps itself at 34rem, so the cells
	   grow rather than multiply; three columns would leave four runners as a row
	   of three and an orphan, which reads as a list that ran out. */
	@media (min-width: 640px) {
		.grid {
			gap: var(--space-4);
		}
	}
</style>
