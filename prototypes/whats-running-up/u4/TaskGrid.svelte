<script lang="ts">
	/**
	 * The grid scale: every runner at once, in the room one card used to have.
	 *
	 * This is the landing state. The reader's question — "a sense check of where I
	 * am" — is plural, and a deck answers plural questions one at a time. Four
	 * cells is the answer in a single frame with no gesture at all: how many, which
	 * ones, what state each is in. The card is then one deliberate tap away and
	 * still renders everything, so nothing was traded, only re-priced.
	 *
	 * The grid is not a list and it does not scroll on the sizes this page is for.
	 * Two columns at every width — the page caps its own column at 34rem, so above
	 * a phone the cells grow instead of multiplying.
	 *
	 * Keyboard: one tab stop, then arrows. Left and right move by one, up and down
	 * move by however many columns the grid actually has — read off the computed
	 * template rather than hard-coded, so the day the column count changes with the
	 * viewport the arrows do not quietly start skipping cells.
	 */
	import type { RunningTask } from './tasks.ts';
	import TaskCell from './TaskCell.svelte';

	let {
		tasks,
		index,
		onSelect,
		onOpen,
		autofocus = false
	}: {
		tasks: RunningTask[];
		index: number;
		onSelect: (next: number) => void;
		onOpen: (next: number) => void;
		autofocus?: boolean;
	} = $props();

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

	/* Still two columns above a phone. The page caps itself at 34rem, so the cells
	   grow rather than multiply; three columns would leave four runners as a row of
	   three and an orphan, which reads as a list that ran out. */
	@media (min-width: 640px) {
		.grid {
			gap: var(--space-4);
		}
	}
</style>
