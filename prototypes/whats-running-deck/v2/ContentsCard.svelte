<script lang="ts">
	/**
	 * Card one: the whole, before the particular.
	 *
	 * This approach's bet is that the overview does not need a register of its
	 * own — it can simply be another card, first in the deck. The reader lands on
	 * it, gets the sense check, and pages into whichever task they wanted.
	 *
	 * Three things make that hold up rather than making it an obstacle.
	 *
	 * 1. Every row is a control, not a line of text. Tapping a row goes straight
	 *    to that task's card, so the contents card is a launcher rather than a
	 *    toll gate: reaching the fourth task costs one tap here versus three
	 *    swipes without it. The card the reader passes through is the card that
	 *    makes the rest of the deck cheap.
	 *
	 * 2. It does not restate the heading. The h1 above already says "4 running";
	 *    this card says what those four are made of — the split between building
	 *    and verifying, the spread across projects — and then names them.
	 *
	 * 3. It is a list given a full screen, which is only justified if the rows
	 *    are generous. Each row is roughly a hundred pixels tall on a phone and
	 *    carries the status word, the id and how long it has been open, the title
	 *    on two lines, and the project with its release. That is a block, not a
	 *    table row.
	 *
	 * When nothing is running this card is the whole deck, and its content is the
	 * empty state. See the note in Page.svelte for why that is one card and not
	 * two.
	 */
	import { Icon } from '@alfons/design';
	import NothingRunning from './NothingRunning.svelte';
	import StatusMark from './StatusMark.svelte';
	import { describeMotion, elapsedSince, type RunningTask } from './tasks.ts';

	let {
		tasks,
		checkedAt,
		onOpen
	}: { tasks: RunningTask[]; checkedAt: Date; onOpen: (position: number) => void } = $props();

	const summary = $derived(describeMotion(tasks));
</script>

<article class="card" role="group" aria-roledescription="contents" aria-label="Contents">
	{#if tasks.length === 0}
		<NothingRunning {checkedAt} />
	{:else}
		<p class="summary">{summary}</p>

		<ul class="rows">
			{#each tasks as task, position (task.id)}
				<li class="row">
					<!-- A bare button, deliberately. Button is an inline control with its
					     own padding, background and fixed sizes; this is a full-width
					     block of stacked, left-aligned text that happens to navigate.
					     Overriding every one of those properties would leave a Button in
					     name only. Reported to review_markup rather than worked around. -->
					<button
						type="button"
						class="open"
						onclick={() => onOpen(position + 1)}
						aria-label="Open {task.id}, {task.status}: {task.title}"
					>
						<span class="state">
							<StatusMark status={task.status} />
							<span class="stamp"
								><span class="id">{task.id}</span><span class="sep" aria-hidden="true"
									>&middot;</span
								>{elapsedSince(task.createdOn)}</span
							>
						</span>
						<span class="title">{task.title}</span>
						<!-- The id sits on the line above rather than here, which is what
						     lets project and release both fit on one unbroken line at
						     370px. Three wrapped lines of provenance was what pushed the
						     fourth row off the card. -->
						<span class="where"
							><span class="project">{task.project}</span><span class="sep" aria-hidden="true"
								>/</span
							><span class="release">{task.release}</span></span
						>
						<span class="chevron" aria-hidden="true">
							<Icon name="chevron-right" size="md" />
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</article>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		height: 100%;
		/* One step tighter than a task card. A task card spends its padding on
		   making one title readable; this card spends it on fitting four rows at
		   a size that is still a block rather than a table row. */
		padding: var(--space-4);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		/* Both axes, and `clip` rather than `hidden` or `auto`. An unstated
		   overflow-x computes to a scrolling value the moment overflow-y is set,
		   and `clip` on one axis alone computes to `hidden` on the other — both of
		   which make this a scroll container that eats the deck's swipe. This card
		   is the one most likely to want to scroll, so it is the one that must most
		   clearly refuse to. */
		overflow: clip;
	}

	/* What the heading cannot say. The count is above; this is its shape. */
	.summary {
		margin: 0;
		flex: none;
		font-family: var(--font-display);
		font-size: clamp(var(--text-lead), 4.5vw, 1.5rem);
		line-height: 1.25;
		color: var(--text-primary);
		text-wrap: balance;
	}

	.rows {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		flex: 1;
		min-height: 0;
	}

	.row {
		display: flex;
		/* Rows share the card's height rather than each taking a fixed slice, so
		   four rows fill a tall phone and stay legible on a short one. */
		flex: 1;
		min-height: 0;
		border-top: 1px solid var(--card-border);
	}

	.open {
		appearance: none;
		width: 100%;
		/* Comfortably past the 44px floor even before the rows stretch. */
		min-height: var(--space-7);
		display: grid;
		grid-template-columns: 1fr auto;
		grid-template-areas:
			'state chevron'
			'title chevron'
			'where chevron';
		align-content: center;
		align-items: center;
		gap: var(--space-1) var(--space-3);
		padding: var(--space-2) 0;
		text-align: left;
		background: transparent;
		border: none;
		color: inherit;
		cursor: pointer;
		overflow: clip;
	}

	.state {
		grid-area: state;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.stamp {
		flex: none;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.title {
		grid-area: title;
		font-family: var(--font-display);
		font-size: var(--text-ui);
		line-height: 1.3;
		color: var(--text-primary);
		/* Two lines is the budget. A third would push the fourth row off a short
		   phone, and the full title is one tap away on the task's own card. */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: clip;
	}

	.where {
		grid-area: where;
		display: block;
		min-width: 0;
		white-space: nowrap;
		overflow: clip;
		text-overflow: ellipsis;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
	}

	.id {
		color: var(--text-secondary);
		letter-spacing: 0.04em;
	}

	.sep {
		padding-inline: var(--space-2);
		color: var(--text-muted);
	}

	.project {
		color: var(--text-secondary);
	}

	.release {
		color: var(--text-primary);
	}

	/* The only decoration on the row, and it is not decoration: it says the row
	   goes somewhere, without depending on a pointer to reveal it. */
	.chevron {
		grid-area: chevron;
		display: flex;
		align-items: center;
		color: var(--text-muted);
	}

	.open:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: calc(var(--space-1) * -1);
	}

	/* On a short phone the fourth row is what gets squeezed, and a row that
	   clips its own status line is worse than a row with a shorter title. The
	   title gives the line back rather than the card losing a runner. */
	@media (max-height: 780px) {
		.title {
			-webkit-line-clamp: 1;
			line-clamp: 1;
		}
	}
</style>
