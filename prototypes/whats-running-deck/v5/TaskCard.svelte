<script lang="ts">
	/**
	 * One running task, at the full size of the screen. Carried from n2 with one
	 * change, and it is a change the vertical axis forced.
	 *
	 * n2's card could not scroll because a scrolling card swallowed the deck's
	 * horizontal swipe. Here the deck's axis is vertical and the document is the
	 * scroller, so a card with `overflow-y: auto` would swallow the page scroll
	 * itself — the reader would push the card's own content up and the deck would
	 * not move at all. The rule is therefore the same rule, harder: `overflow:
	 * clip` on both axes, and the card takes responsibility for fitting.
	 *
	 * The one change is the title's height-derived ceiling. This approach spends
	 * more vertical chrome than n2 did (a sticky count bar that never leaves), so
	 * the card is shorter and the title's vh term comes down to match.
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
		gap: var(--space-5);
		height: 100%;
		padding: var(--space-5);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		/* Both axes, and `clip` rather than `hidden`, because `hidden` is a scroll
		   container and `clip` is not — and an unstated overflow on one axis
		   computes to a scrolling value the moment the other axis is set. On a
		   vertical deck that mistake is fatal rather than merely annoying: the
		   card would consume the page scroll and the deck would never advance. */
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
		/* The vh term is the card's insurance against a viewport too short to hold
		   it. It cannot scroll, so the title gives ground instead of being cut. */
		font-size: clamp(var(--text-lead), min(7vw, 3.4vh), 2.125rem);
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

	/* The progress block never moves between cards, which is what makes the deck
	   cheap to read: the numbers are always in the same place, so scrolling one
	   card on changes the values without moving the eye. */
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

	/* A short viewport is the one case that can break a deck of full-height
	   cards: the card cannot scroll, so anything that does not fit is simply
	   gone. Rather than let the release line and then the title disappear, the
	   card gives up its own spacing first. Measured at 370x560, which is a phone
	   held sideways: without this the title ran 14px into the progress block and
	   the project/release line was clipped away entirely. */
	@media (max-height: 660px) {
		.card {
			padding: var(--space-4);
			gap: var(--space-4);
		}

		.identity {
			gap: var(--space-3);
		}

		.progress {
			gap: var(--space-3);
			padding-top: var(--space-3);
		}

		.count dd {
			font-size: var(--text-ui);
		}
	}
</style>
