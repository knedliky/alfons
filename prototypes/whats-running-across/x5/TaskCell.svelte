<script lang="ts">
	/**
	 * One runner at grid scale — a nameplate, not a shrunken card.
	 *
	 * On a 370px phone a 2x2 grid gives this thing 158x258px, measured. The
	 * temptation is to render the card smaller, which at that width means a clipped
	 * title: "Skill: /prototype — the one-question-at-a…" is not a title, it is a
	 * promise the cell cannot keep. So the title is not here at all.
	 *
	 * What a cell carries instead is the five facts that survive being small and
	 * answer "where am I": what state it is in, what it is called, whose it is,
	 * which release it belongs to, and how long it has been going. Every one is a
	 * short token that never wraps, so the grid reads as aligned rows rather than
	 * ragged paragraphs, and nothing in it is a truncated version of something
	 * longer. The title lives one scale up, at the size it deserves.
	 *
	 * Status appears twice on purpose — a rule across the top and the word below
	 * it. At grid scale the reader is scanning states rather than reading them, so
	 * the state has to be legible without being read; the word is still there so
	 * the colour never carries the meaning alone.
	 *
	 * A bare <button>. Button is a pill with its own padding, height and centred
	 * label; a six-row nameplate filling a grid cell would be a Button in name
	 * only. Named plainly in the report as a component the library does not have.
	 */
	import { elapsedSince, type RunningTask } from './tasks.ts';
	import StatusMark from './StatusMark.svelte';

	let {
		task,
		position,
		total,
		current,
		onopen,
		onkeydown
	}: {
		task: RunningTask;
		position: number;
		total: number;
		current: boolean;
		onopen: () => void;
		onkeydown: (event: KeyboardEvent) => void;
	} = $props();

	let element = $state<HTMLButtonElement | null>(null);

	// The grid owns roving focus and needs the element, not the instance. An
	// exported function is the Svelte 5 way to hand it out without leaking the node.
	export function focus() {
		element?.focus();
	}
</script>

<button
	bind:this={element}
	type="button"
	class="cell"
	data-status={task.status}
	aria-current={current ? 'true' : undefined}
	aria-label="{task.id}, {task.status}, {task.project}, {position} of {total}. Open at full size."
	tabindex={current ? 0 : -1}
	onclick={onopen}
	{onkeydown}
>
	<span class="rule" aria-hidden="true"></span>
	<span class="state"><StatusMark status={task.status} /></span>
	<span class="id">{task.id}</span>
	<span class="where">
		<span class="project">{task.project}</span>
		<span class="release">{task.release}</span>
	</span>
	<span class="tag">
		{#if current}
			<!-- The thread between the two scales. Zooming out has to say which cell
			     was the card, or the reader works it out from memory. It gets a row of
			     its own — beside the status word it ran out of cell at 158px, which is
			     what a 370px phone actually gives a 2x2 grid. -->
			current
		{/if}
	</span>
	<span class="age">{elapsedSince(task.createdOn)} &middot; phase {task.phase}</span>
</button>

<style>
	.cell {
		appearance: none;
		display: grid;
		/* Rule, state, id, where, then a flexible row carrying the current tag, then
		   the age on the floor. Every cell declares the same six rows whether or not
		   it is the current one, so the age line and the id line stay level across
		   the grid and a cell does not shift when the reader's place moves to it. */
		grid-template-rows: auto auto auto auto 1fr auto;
		gap: var(--space-2);
		width: 100%;
		height: 100%;
		min-height: var(--space-10);
		text-align: left;
		padding: var(--space-3);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		cursor: pointer;
		overflow: clip;
	}

	/* Status as a mark you do not have to read. The colours come from the page
	   root, where they are declared once and mean only these two things. */
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

	.where {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.id {
		font-family: var(--font-mono);
		font-size: var(--text-lead);
		line-height: 1.1;
		letter-spacing: 0.02em;
		color: var(--text-primary);
	}

	/* `hidden` rather than `clip` only because text-overflow needs it. There is no
	   horizontal swipe at grid scale, so no gesture is at risk here. */
	.project,
	.release {
		font-family: var(--font-mono);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.project {
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}

	/* The release is the branch the work is on, which is the more useful half of
	   "where am I" once the project is known. It is the last thing to be legible,
	   so it takes the smallest size. */
	.release {
		font-size: var(--text-micro);
		color: var(--text-muted);
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
	.cell[aria-current='true'] {
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

	.cell:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}
</style>
