<script lang="ts">
	/**
	 * One running task, at the full size of the screen.
	 *
	 * Carried from last round's winner with its two destination buttons REMOVED.
	 * That is this approach's cleanest consequence: going up is the vertical
	 * axis, one persistent control that works from every state of every level,
	 * so a per-card copy of the same move would be the page offering one jump in
	 * two grammars. The card goes back to being what the two-scale winner proved
	 * it should be — everything rendered, nothing to tap — and the 128px the
	 * destination rows cost it goes back into the title.
	 *
	 * The `where` line returns for the same reason: with the buttons gone the
	 * card must still say which release and project the vertical axis is
	 * anchored to, and a reader should be able to read the destination before
	 * they commit to the move.
	 */
	import { elapsedSince, type RunningTask } from './tasks.ts';
	import StatusMark from './StatusMark.svelte';

	let {
		task,
		position,
		total
	}: {
		task: RunningTask;
		position: number;
		total: number;
	} = $props();

	// Progress on this page is what the ledger actually knows: which phase, how
	// many criteria are waiting, and what the last verification said. Nothing is
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
		<p class="where">{task.project} / {task.release}</p>
	</header>

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
		gap: var(--space-4);
		height: 100%;
		padding: var(--space-4);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		/* The card must not be a scroll container in ANY axis, and `clip` on both
		   axes is the only value that achieves it — `auto` and `hidden` both make
		   one, and the card then swallows the horizontal swipe meant for the deck
		   behind it. Measured in the round this carries from: with a scrolling
		   card the swipe moved the deck 0px; with this line it moves a full card
		   width. */
		overflow: clip;
	}

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
		   a literal, and there is no token that would have prevented it. Height is
		   in the clamp as well as width, because the card cannot scroll. */
		font-size: clamp(var(--text-lead), min(6vw, 3vh), 2.125rem);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	/* Where the vertical axis is anchored, readable before the reader commits to
	   the move. Text, not a control: the axis bar is the control. */
	.where {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* The progress block never moves between cards, which is what makes paging
	   cheap: the numbers are always in the same place. */
	.progress {
		display: flex;
		flex-direction: column;
		flex: none;
		gap: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--card-border);
	}

	/* The verdict is deliberately not status-coloured. Amber and blush are spent
	   on building and verifying; tinting a verdict as well would make the one
	   thing colour means on this page mean two. */
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
