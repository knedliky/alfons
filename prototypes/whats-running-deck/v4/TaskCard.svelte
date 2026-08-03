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
	}

	.identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-height: 0;
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
		   a literal, and there is no token that would have prevented it. */
		/* Height is in the clamp as well as width. The card cannot scroll, so on a
		   short viewport the title has to give ground rather than be cut off. */
		font-size: clamp(var(--text-lead), min(7.5vw, 4vh), 2.125rem);
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
</style>
