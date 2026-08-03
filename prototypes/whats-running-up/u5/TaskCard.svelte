<script lang="ts">
	/**
	 * One task, at the full size of the screen, and the two ways up from it.
	 *
	 * Carried over from the winning approach with two changes, both forced by
	 * this approach's premise.
	 *
	 * 1. The `project / release` line is now UpFromHere: the same two words, made
	 *    reachable. Nothing was added to the card to support going up.
	 * 2. The card can hold a task that is not running, because the deck can hold
	 *    a whole release. The verdict line therefore has to say something true
	 *    about a `pending` task that has never been attempted and about a
	 *    `wontfix` one that never will be, rather than reporting "no verification
	 *    attempted yet" as though the work were about to start.
	 */
	import { elapsedSince, type Task } from './tasks.ts';
	import type { Scope } from './scope.ts';
	import StatusMark from './StatusMark.svelte';
	import UpFromHere from './UpFromHere.svelte';

	let {
		task,
		position,
		total,
		scope,
		onup
	}: {
		task: Task;
		position: number;
		total: number;
		scope: Scope;
		onup: (next: Scope) => void;
	} = $props();

	// Progress on this page is what the ledger actually knows: which phase, how
	// many criteria are waiting, and what the last verification said. Nothing is
	// synthesised into a percentage, because no percentage exists.
	const verdictLine = $derived(
		task.latestVerdict
			? `Attempt ${task.latestAttempt} — ${task.latestVerdict}`
			: task.status === 'pending' || task.status === 'triaged'
				? 'Not started'
				: task.status === 'wontfix' || task.status === 'duplicate'
					? 'Closed without a verification'
					: 'No verification attempted yet'
	);

	// One line, deliberately. It wrapped to two at 370px while it also said
	// "running", which the status mark at the top of the card already says twice —
	// once in colour and once in a word.
	const ageLine = $derived(`opened ${elapsedSince(task.createdOn)} ago`);
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

	<!-- Outside the identity block on purpose. The card cannot scroll, so on a
	     short phone something has to give, and it has to be the title rather than
	     the controls: an identity that shrinks with the up-row inside it pushes
	     44px of button underneath the progress block, where it is unclickable and
	     invisible. Measured at 370x667 before the split, and the reason the title
	     is line-clamped rather than allowed to overflow. -->
	<UpFromHere {task} {scope} {onup} />

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
		<p class="meta">{task.type} &middot; {task.risk} risk &middot; {ageLine}</p>
	</div>
</article>

<style>
	.card {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		height: 100%;
		padding: var(--space-4);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		/* The card must not be a scroll container in ANY axis, and `clip` on both
		   axes is the only value that achieves it — `auto` and `hidden` both make
		   one, and the card then swallows the horizontal swipe meant for the deck
		   behind it. (overflow-y: auto alone is not a way out either: CSS computes
		   the unstated overflow-x to a scrolling value to match it.) That is also
		   the honest reading of the direction: the card is the screen, so it does
		   not scroll. */
		overflow: clip;
	}

	/* The only part of the card that gives. Everything below it is fixed, so a
	   short viewport takes lines off the title and nothing else. */
	.identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: 1;
		min-height: 0;
		overflow: clip;
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		flex: none;
	}

	.id {
		font-family: var(--font-mono);
		font-size: var(--text-ui);
		line-height: 1.2;
		color: var(--text-secondary);
		letter-spacing: 0.04em;
	}

	.title {
		margin: 0;
		font-family: var(--font-display);
		/* The typography scale stops at --text-lead, which is a caption size on a
		   card that owns the whole screen. The floor is the token; the ceiling is
		   a literal, and there is no token that would have prevented it. Height is
		   in the clamp as well as width: the card cannot scroll, so on a short
		   viewport the title gives ground rather than being cut off. */
		font-size: clamp(var(--text-lead), min(6.5vw, 3vh), 1.875rem);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
		/* An honest cut rather than a ragged one. Without the clamp the title was
		   sliced through the middle of a line of glyphs by the identity block's
		   overflow, which reads as a rendering fault rather than as a truncation.
		   The card is the place a title is supposed to be readable in full, and on
		   a 667px-tall phone this approach can no longer promise that — the 44px
		   up-row and the scope bar above it are paid for out of the title's lines.
		   Reported as a cost. */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 4;
		overflow: hidden;
		/* Takes whatever the identity block has left, so the clamp caps it rather
		   than the parent's overflow slicing through a line of glyphs. */
		flex: 1;
		min-height: 0;
	}

	/* A short phone is where the budget actually binds. Four lines do not fit, and
	   a clamp that promises more lines than the box has just moves the ragged cut
	   somewhere else. */
	@media (max-height: 760px) {
		.title {
			-webkit-line-clamp: 2;
		}
	}

	/* The progress block never moves between cards, which is what makes paging
	   cheap: the numbers are always in the same place. */
	.progress {
		display: flex;
		flex-direction: column;
		flex: none;
		gap: var(--space-2);
		padding-top: var(--space-3);
		border-top: 1px solid var(--card-border);
	}

	/* Deliberately not status-coloured. The eight status colours are spent on the
	   eight statuses; tinting a verdict as well would make them mean two things. */
	.verdict {
		margin: 0;
		font-size: var(--text-caption);
		line-height: 1.3;
		color: var(--text-secondary);
	}

	/* Flex rather than four equal columns. Equal columns overflowed their own
	   tracks once the label and the number shared a line, and "CRITERIA 4STEPS 9"
	   is what that looks like. */
	.counts {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: var(--space-2) var(--space-3);
	}

	/* Label and number on one line rather than stacked. Stacked they were the tall
	   half of a progress block that has to be fixed height, and every pixel it
	   spends comes straight off the title above it — which is what the up-row put
	   under pressure. The four columns still line up, so they still scan. */
	.count {
		display: flex;
		align-items: baseline;
		gap: var(--space-1);
		min-width: 0;
	}

	.count dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		line-height: 1.2;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--text-muted);
	}

	.count dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		line-height: 1.2;
		color: var(--text-primary);
	}

	.meta {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		line-height: 1.3;
		color: var(--text-muted);
	}
</style>
