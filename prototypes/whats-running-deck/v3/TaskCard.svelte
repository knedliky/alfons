<script lang="ts">
	/**
	 * One running task, at the full size of the screen.
	 *
	 * The bet of this approach is that a card this large needs no second level:
	 * everything the reader would have tapped for is already rendered. So the
	 * card spends its height rather than centring a small block in it — the
	 * identity sits at the top, the progress sits at the bottom in the thumb's
	 * reach, and the space between them is what makes the title readable at a
	 * glance.
	 */
	import { elapsedSince, type RunningTask } from './tasks.ts';
	import StatusMark from './StatusMark.svelte';

	let { task, position, total }: { task: RunningTask; position: number; total: number } = $props();

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
		<p class="where">
			<span class="project">{task.project}</span>
			<span class="sep" aria-hidden="true">/</span>
			<span class="release">{task.release}</span>
		</p>
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
		gap: var(--space-6);
		height: 100%;
		padding: var(--space-5);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		/* The card must not be a scroll container in ANY axis, and `clip` on both
		   axes is the only value that achieves it — `auto` and `hidden` both make
		   one, and the card then swallows the horizontal swipe meant for the deck
		   behind it. Measured: with a scrolling card the swipe moved the deck
		   0px; with this line it moves a full card width. (overflow-y:auto alone
		   is not a way out either — CSS computes the unstated overflow-x to a
		   scrolling value to match it.) That is also the honest reading of the
		   direction: the card is the screen, so it does not scroll. */
		overflow: clip;
		/* The peek takes 96px off the card, so the card is no longer the width of
		   the screen and type sized against the viewport no longer fits inside it.
		   Making the card its own container is what lets the title and the counts
		   answer to the width they actually have rather than the width of the
		   phone. */
		container-type: inline-size;
	}

	.identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-height: 0;
		/* A flex item shrinks below its content and then paints over its sibling.
		   On the narrower card that put an eleven-line title straight through the
		   progress block. Clipping keeps the overflow inside the identity, and the
		   container-relative title below means it does not arise in practice. */
		overflow: clip;
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.id {
		/* AL-014 broken across two lines is not an id. */
		white-space: nowrap;
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
		   a literal, and there is no token that would have prevented it. */
		/* Height is in the clamp as well as width. The card cannot scroll, so on a
		   short viewport the title has to give ground rather than be cut off. */
		/* Sized against the card, not the viewport: 8cqi is the same proportion of
		   this card that 7.5vw was of the full-width one, so a card that gave up
		   96px to the peek gives up type with it instead of overflowing. */
		font-size: clamp(var(--text-lead), min(8cqi, 3.4vh), 2.125rem);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	.where {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-caption);
	}

	.project {
		color: var(--text-secondary);
	}

	.sep {
		color: var(--text-muted);
	}

	.release {
		color: var(--text-primary);
	}

	/* The progress block never moves between cards, which is what makes paging
	   cheap: the numbers are always in the same place. It keeps its size and the
	   identity above it absorbs the difference. */
	.progress {
		display: flex;
		flex-direction: column;
		flex: none;
		gap: var(--space-4);
		padding-top: var(--space-4);
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

	/* Four columns need about 55px each for CRITERIA to fit in mono, which the
	   peeked card on a phone does not have. It folds to two rows rather than
	   truncating a label, and unfolds again once the card is wide enough.
	   Folding costs a row of height the card has not got, so each pair lies down
	   at the same time — label and value on one line rather than stacked. That
	   pays the height back with 40px to spare, which is what stops the title
	   above from being clipped on an 800px-tall phone. */
	@container (max-width: 19rem) {
		.counts {
			grid-template-columns: repeat(2, 1fr);
			column-gap: var(--space-5);
		}

		.count {
			flex-direction: row;
			align-items: baseline;
			justify-content: space-between;
			gap: var(--space-2);
		}
	}
</style>
