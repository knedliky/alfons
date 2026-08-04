<script lang="ts">
	/**
	 * One running task, at the full size of the screen.
	 *
	 * The bet of the approach this builds on was that a card this large needs no
	 * second level: everything the reader would have tapped for is already
	 * rendered. So the card spends its height rather than centring a small block
	 * in it — the identity sits at the top, the progress sits at the bottom in
	 * the thumb's reach, and the space between them is what makes the title
	 * readable at a glance.
	 *
	 * What this round adds is the only new thing on the card: two destinations.
	 * They replace the `where` line rather than sitting beside it, because the
	 * line already said "alfons / prototype-loop-v1" and printing the same two
	 * words twice — once as text, once as a control — would be the card telling
	 * the reader the same fact in two voices.
	 *
	 * They are stacked full-width rows rather than two columns. Measured at
	 * 370px: two columns leaves about 155px per destination, and
	 * `prototype-loop-v1` truncates in it. A destination whose name is clipped is
	 * a worse promise than a nameplate's clipped title, because the reader is
	 * being asked to commit a tap to it.
	 *
	 * The card is the only place the upward move is offered. A grid cell is a
	 * nameplate with exactly one action — open this at full size — and giving it
	 * three would make the reader aim at a 158px cell for one of them. That is a
	 * real cost of this approach and it is named in the report rather than
	 * papered over: from the landing state, going up is two taps, not one.
	 */
	import { Icon } from '@alfons/design';
	import { elapsedSince, type RunningTask } from './tasks.ts';
	import StatusMark from './StatusMark.svelte';

	let {
		task,
		position,
		total,
		onOpenRelease,
		onOpenProject
	}: {
		task: RunningTask;
		position: number;
		total: number;
		// The opener is handed up rather than looked up. Back has to return focus
		// to the exact control that opened the screen, and `document.activeElement`
		// at push time is a guess about which browsers focus a button on click.
		onOpenRelease: (opener: HTMLElement) => void;
		onOpenProject: (opener: HTMLElement) => void;
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
	</header>

	<!-- A nav, not a group: these two are the only ways out of the running view,
	     and naming them as navigation is what tells a screen reader that tapping
	     one is a move rather than a change of state. -->
	<nav class="up" aria-label="Go up from this task">
		<button type="button" class="dest" onclick={(event) => onOpenRelease(event.currentTarget)}>
			<span class="rank">Release</span>
			<span class="name">{task.release}</span>
			<Icon name="chevron-right" size="sm" />
		</button>
		<button type="button" class="dest" onclick={(event) => onOpenProject(event.currentTarget)}>
			<span class="rank">Project</span>
			<span class="name">{task.project}</span>
			<Icon name="chevron-right" size="sm" />
		</button>
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
		/* Tighter than the card this is built from, at both the gap and the edge.
		   Two 48px destination rows and the gap above them cost this card 128px of
		   height it used to spend on the title, and at 370x800 the title ran into
		   the first destination — measured, and visible in the screenshot before
		   this line changed. The second level is paid for here, in millimetres. */
		gap: var(--space-3);
		height: 100%;
		padding: var(--space-4);
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

	/* `clip` is the guard rail, not the plan. The title is sized to fit, but a
	   longer one on a shorter phone must give ground rather than print itself
	   over the destination rows — which is exactly what it did before the sizes
	   above were measured. */
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
		   a literal, and there is no token that would have prevented it. */
		/* Height is in the clamp as well as width. The card cannot scroll, so on a
		   short viewport the title has to give ground rather than be cut off — and
		   it now gives ground to the two destination rows as well, which is where
		   the second level is paid for on this card. */
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

	/* A bare <button>. Button is a pill with a centred label and its own
	   horizontal padding; a destination row is a three-column grid — rank, name,
	   chevron — that has to fill the card's width and hold a 44px target. Every
	   one of Button's decisions would be overridden. Named plainly in the report
	   as a component the library does not have. */
	.dest {
		appearance: none;
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		/* --filter-control-height is the library's control height and it is the
		   wrong token for a touch target: it is 2.75rem on a phone but 2.25rem
		   from 640px up, so it resolves to 36px exactly where a laptop with a
		   touchscreen reads this page. Measured at 1280px: 41px tall. --space-7
		   is 48px at every width. Reported. */
		min-height: var(--space-7);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		background: var(--surface-hover-subtle);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
	}

	/* Neutral, deliberately: a release is not a status and a project is not a
	   status, so neither may take a status colour. */
	.rank {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.name {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.dest:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
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
