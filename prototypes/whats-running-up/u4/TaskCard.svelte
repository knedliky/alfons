<script lang="ts">
	/**
	 * One running task, at the full size of the screen.
	 *
	 * Unchanged from the winning approach except in one place, which is the whole
	 * of this approach's surface area on the card: the "project / release" line
	 * was a caption and is now the control that summons the ancestry.
	 *
	 * That line is the right trigger because it is already the answer to "where am
	 * I" — the reader's eye is on it at the moment the upward question occurs to
	 * them, and making it tappable adds nothing new to look at. One target, one
	 * gesture, both levels. A pair of separate project and release links would
	 * have been two 44px targets on a phone card and would have made the reader
	 * choose a level before they had seen either.
	 *
	 * It is not a link and does not read as one. aria-haspopup="dialog" says what
	 * actually happens, and aria-expanded says whether it has already happened, so
	 * a screen reader user is never told they are about to navigate.
	 */
	import { Icon } from '@alfons/design';
	import { elapsedSince, type RunningTask } from './tasks.ts';
	import StatusMark from './StatusMark.svelte';

	let {
		task,
		position,
		total,
		consulting = false,
		onconsult
	}: {
		task: RunningTask;
		position: number;
		total: number;
		/** True while this card's own sheet is up, for aria-expanded. */
		consulting?: boolean;
		onconsult: () => void;
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

		<!-- A bare <button>. Button is a pill with centred content and its own
		     padding; this is a full-width two-line caption with a trailing glyph,
		     which would be a Button in name only. Named in the report. -->
		<button
			type="button"
			class="where"
			aria-haspopup="dialog"
			aria-expanded={consulting}
			aria-label="Consult the release {task.release} and the project {task.project}"
			onclick={onconsult}
		>
			<span class="path">
				<span class="project">{task.project}</span>
				<span class="sep" aria-hidden="true">/</span>
				<span class="release">{task.release}</span>
			</span>
			<span class="up" aria-hidden="true"><Icon name="chevron-up" size="sm" /></span>
		</button>
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
		   behind it. (overflow-y:auto alone is not a way out either — CSS computes
		   the unstated overflow-x to a scrolling value to match it.) */
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
		   a literal, and there is no token that would have prevented it. Height is
		   in the clamp as well as width: the card cannot scroll, so on a short
		   viewport the title gives ground rather than being cut off. */
		font-size: clamp(var(--text-lead), min(7.5vw, 4vh), 2.125rem);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	/* The one place the upward move touches the card. It reads as the same caption
	   it always was, with a rule above it and a chevron after it — enough to be
	   found, not enough to compete with the title. */
	.where {
		appearance: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		width: 100%;
		/* 44px, the touch floor, from a spacing token rather than a literal. */
		min-height: var(--filter-control-height);
		margin: 0;
		padding: var(--space-2) 0;
		text-align: left;
		background: transparent;
		border: none;
		border-top: 1px solid var(--card-border);
		cursor: pointer;
	}

	.path {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
		min-width: 0;
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

	.up {
		display: flex;
		flex: none;
		color: var(--text-muted);
	}

	.where:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	/* The progress block never moves between cards, which is what makes paging
	   cheap: the numbers are always in the same place. */
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
