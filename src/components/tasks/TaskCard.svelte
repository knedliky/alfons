<script lang="ts" module>
	export interface TaskCardProps {
		task: RunningTask;
		/** 1-based position in the deck, for the accessible name. */
		position: number;
		total: number;
		/**
		 * The opener is handed up rather than looked up. Dismissing a peek has to
		 * return focus to the exact control that raised it, and
		 * `document.activeElement` at raise time is a guess about which browsers
		 * focus a button on click.
		 */
		onPeekRelease: (opener: HTMLElement) => void;
		onPeekProject: (opener: HTMLElement) => void;
	}
</script>

<script lang="ts">
	/**
	 * TaskCard — one running task, at the full size of the screen.
	 *
	 * A card this large needs no second level: everything the reader would have
	 * tapped for is already rendered. The identity sits at the top, the progress
	 * at the bottom in the thumb's reach, and the space between is what makes
	 * the title readable at a glance.
	 *
	 * The two destinations do not navigate; they peek — the release or project
	 * rises as a partial sheet (PeekSheet) over this card, and each row says so
	 * with its "peek" cue, because a two-stage gesture that hides its first
	 * stage is a lie about cost. The rows replace the where line rather than
	 * sitting beside it: printing the same two words twice, once as text and
	 * once as a control, is the card saying one fact in two voices. They are
	 * stacked full-width rows rather than two columns because at 370px two
	 * columns clip the very name the reader is asked to commit a tap to.
	 *
	 * Requires the --status-* palette declared by the page; see StatusMark.
	 *
	 * Usage:
	 *   <TaskCard {task} position={1} total={4}
	 *     onPeekRelease={raise} onPeekProject={raise} />
	 */
	import DestinationRow from '../atoms/DestinationRow.svelte';
	import StatusMark from '../atoms/StatusMark.svelte';
	import { elapsedSince } from './time.js';
	import type { RunningTask } from './types.js';

	let { task, position, total, onPeekRelease, onPeekProject }: TaskCardProps = $props();

	// Progress here is what the ledger actually knows: which phase, how many
	// criteria are waiting, and what the last verification said. Nothing is
	// synthesised into a percentage, because no percentage exists.
	const verdictLine = $derived(
		task.latestVerdict
			? `Attempt ${task.latestAttempt} — ${task.latestVerdict}`
			: 'No verification attempted yet'
	);
</script>

<article
	class="card"
	role="group"
	aria-roledescription="task"
	aria-label="{position} of {total}: {task.id}, {task.status}"
>
	<header class="identity">
		<div class="top">
			<StatusMark status={task.status} size="lead" />
			<span class="id">{task.id}</span>
		</div>
		<h2 class="title">{task.title}</h2>
	</header>

	<!-- Still a nav: a peek is the first stage of a navigation, and committing it
	     from the sheet is the second. The cue word carries the price. -->
	<nav class="up" aria-label="Peek up from this task">
		<DestinationRow
			rank="Release"
			name={task.release}
			cue="peek"
			fill="subtle"
			onactivate={onPeekRelease}
		/>
		<DestinationRow
			rank="Project"
			name={task.project}
			cue="peek"
			fill="subtle"
			onactivate={onPeekProject}
		/>
	</nav>

	<div class="progress">
		<p class="verdict">{verdictLine}</p>
		<dl class="counts">
			<div class="count">
				<dt>Phase</dt>
				<dd>{task.phase}</dd>
			</div>
			<div class="count">
				<dt>Criteria</dt>
				<dd>{task.criterionCount}</dd>
			</div>
			<div class="count">
				<dt>Steps</dt>
				<dd>{task.stepCount}</dd>
			</div>
			<div class="count">
				<dt>Files</dt>
				<dd>{task.fileChangeCount}</dd>
			</div>
		</dl>
		<p class="meta">
			{task.type} &middot; {task.risk} risk &middot; opened {elapsedSince(task.createdOn)} ago
		</p>
	</div>
</article>

<style>
	.card {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		/* Tight at both the gap and the edge: two 48px destination rows and the
		   gap above them cost this card 128px of height it used to spend on the
		   title, and at 370x800 the title ran into the first destination —
		   measured, before this line changed. */
		gap: var(--space-3);
		height: 100%;
		padding: var(--space-4);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		/* The card must not be a scroll container in ANY axis, and `clip` on both
		   axes is the only value that achieves it — `auto` and `hidden` both make
		   one, and the card then swallows the horizontal swipe meant for the deck
		   behind it. Measured: with a scrolling card the swipe moved the deck
		   0px; with this line it moves a full card width. That is also the honest
		   reading of the direction: the card is the screen, so it does not
		   scroll. */
		overflow: clip;
	}

	/* `clip` is the guard rail, not the plan. The title is sized to fit, but a
	   longer one on a shorter phone must give ground rather than print itself
	   over the destination rows. */
	.identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		min-height: 0;
		overflow: clip;
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.id {
		font-family: var(--font-mono);
		font-size: var(--text-ui);
		color: var(--text-secondary);
		letter-spacing: 0.04em;
	}

	.title {
		margin: 0;
		font-family: var(--font-display);
		/* The typography scale stops at --text-lead, which is a caption size on a
		   card that owns the whole screen. The floor is the token; the ceiling is
		   a literal, and no token would have prevented it. Height is in the clamp
		   as well as width: the card cannot scroll, so on a short viewport the
		   title gives ground to the destination rows rather than being cut off. */
		font-size: clamp(var(--text-lead), min(6vw, 2.8vh), 2.125rem);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	.up {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: none;
	}

	/* The progress block never moves between cards, which is what makes paging
	   cheap: the numbers are always in the same place. It keeps its size and the
	   identity above it absorbs the difference. */
	.progress {
		display: flex;
		flex-direction: column;
		flex: none;
		gap: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--card-border);
	}

	/* The verdict is deliberately not status-coloured. The motion colours are
	   spent on building and verifying; tinting a verdict as well would make the
	   one thing colour means on this page mean two. */
	.verdict {
		margin: 0;
		font-size: var(--text-ui);
		color: var(--text-secondary);
	}

	.counts {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-3);
	}

	.count {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.count dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.count dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-lead);
		color: var(--text-primary);
	}

	.meta {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
