<script lang="ts">
	/**
	 * One task at grid scale — a nameplate, not a shrunken card.
	 *
	 * On a 370px phone a 2x2 grid gives this thing about 158x258px. The temptation
	 * is to render the card smaller, which at that width means a clipped title:
	 * "Skill: /prototype — the one-question-at-a…" is not a title, it is a promise
	 * the cell cannot keep. So there is no title here at all. That contract is the
	 * winning approach's and it is kept.
	 *
	 * What this approach changes is which facts a cell carries, because the deck
	 * can now hold a set in which some of them are constant. In a release deck
	 * every cell has the same project and the same release, and printing them
	 * thirty times is two rows of noise at exactly the scale where the grid is
	 * under the most pressure. So the cell drops whatever the scope has already
	 * fixed and spends the room on what still varies:
	 *
	 *   running deck  — project, release   (both vary)
	 *   project deck  — release, type      (project is fixed by the scope)
	 *   release deck  — type               (project and release are both fixed)
	 *
	 * The status rule keeps full strength only for work in motion. A release is
	 * mostly `done`, and eight full-strength rules stacked down a grid would read
	 * as a chart of colours rather than as an answer to "is anything running".
	 *
	 * A bare <button>. Button is a pill with its own padding, height and centred
	 * label; a nameplate filling a grid cell would be a Button in name only.
	 * Named plainly in the report as a component the library does not have.
	 */
	import { elapsedSince, isRunning, type Task } from './tasks.ts';
	import type { Scope } from './scope.ts';
	import StatusMark from './StatusMark.svelte';

	let {
		task,
		position,
		total,
		current,
		scope,
		onopen,
		onkeydown
	}: {
		task: Task;
		position: number;
		total: number;
		current: boolean;
		scope: Scope;
		onopen: () => void;
		onkeydown: (event: KeyboardEvent) => void;
	} = $props();

	let element = $state<HTMLButtonElement | null>(null);

	const contextLines = $derived(
		scope.kind === 'running'
			? [task.project, task.release]
			: scope.kind === 'project'
				? [task.release, task.type]
				: [task.type]
	);

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
	data-motion={isRunning(task.status) ? 'yes' : 'no'}
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
		{#each contextLines as line, depth (line)}
			<span class="context" data-depth={depth}>{line}</span>
		{/each}
	</span>
	<span class="tag">
		{#if current}
			<!-- The thread between the two scales. Zooming out has to say which cell
			     was the card, or the reader works it out from memory. It gets a row of
			     its own — beside the status word it ran out of cell at 158px. -->
			current
		{/if}
	</span>
	<span class="age">{elapsedSince(task.createdOn)} &middot; phase {task.phase}</span>
</button>

<style>
	.cell {
		appearance: none;
		display: grid;
		/* Rule, state, id, context, then a flexible row carrying the current tag,
		   then the age on the floor. Every cell declares the same six rows whether
		   or not it is current, so the age line and the id line stay level across
		   the grid and a cell does not shift when the reader's place moves to it. */
		grid-template-rows: auto auto auto auto 1fr auto;
		/* space-2 between six rows was 40px of gap in a 157px cell, and the "current"
		   tag fell off the bottom. Measured, not guessed. */
		gap: var(--space-1);
		width: 100%;
		height: 100%;
		text-align: left;
		padding: var(--space-3);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		cursor: pointer;
		overflow: clip;
	}

	/* Status as a mark you do not have to read. The colours come from the page
	   root, where they are declared once and mean only the eight statuses. */
	.rule {
		height: var(--space-1);
		background: var(--cell-status-colour);
	}

	/* Settled work still states its colour; it does not compete for the glance. */
	.cell[data-motion='no'] .rule {
		opacity: var(--opacity-tertiary);
	}

	.cell[data-status='pending'] {
		--cell-status-colour: var(--status-pending);
	}

	.cell[data-status='triaged'] {
		--cell-status-colour: var(--status-triaged);
	}

	.cell[data-status='building'] {
		--cell-status-colour: var(--status-building);
	}

	.cell[data-status='verifying'] {
		--cell-status-colour: var(--status-verifying);
	}

	.cell[data-status='done'] {
		--cell-status-colour: var(--status-done);
	}

	.cell[data-status='blocked'] {
		--cell-status-colour: var(--status-blocked);
	}

	.cell[data-status='wontfix'] {
		--cell-status-colour: var(--status-wontfix);
	}

	.cell[data-status='duplicate'] {
		--cell-status-colour: var(--status-duplicate);
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
	.context {
		font-family: var(--font-mono);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.context[data-depth='0'] {
		font-size: var(--text-caption);
		line-height: 1.2;
		color: var(--text-secondary);
	}

	/* The second line is the last thing to be legible, so it takes the smallest
	   size. It is neutral in every scope: a release and a project are not statuses
	   and never take a status hue. */
	.context[data-depth='1'] {
		font-size: var(--text-micro);
		line-height: 1.2;
		color: var(--text-muted);
	}

	.age {
		align-self: end;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		line-height: 1.2;
		color: var(--text-muted);
		white-space: nowrap;
	}

	/* Neutral, deliberately. Being the card the reader came from is not a status,
	   and tinting it would put a ninth meaning on the eight status colours. */
	.cell[aria-current='true'] {
		background: var(--surface-hover-subtle);
		border-color: var(--text-primary);
	}

	.tag {
		align-self: end;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		line-height: 1.2;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-primary);
	}

	.cell:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}
</style>
