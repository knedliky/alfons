<script lang="ts">
	/**
	 * One running task, at the full size of the screen, now carrying the line.
	 *
	 * The card spends its height rather than centring a small block in it — the
	 * identity sits at the top, the progress sits at the bottom in the thumb's
	 * reach, and the space between them is what makes the title readable at a
	 * glance. That is unchanged.
	 *
	 * What changed is the top of it. The standing line goes above everything, in
	 * the place a breadcrumb goes on every page that has ever had one, and this
	 * page has never had chrome of any kind before. It is paid for rather than
	 * simply added: the line carries the project, the release and the id, so the
	 * `id` beside the status mark and the `project / release` line under the title
	 * are both deleted. They said the same three things in two places, and once
	 * one of those places is tappable the other is a copy.
	 *
	 * Net cost is measured and reported, not guessed at: the line takes 44px plus
	 * a 16px gap, and hands 33px of it straight back.
	 */
	import { elapsedSince, type RunningTask } from './tasks.ts';
	import StandingLine, { type Segment } from './StandingLine.svelte';
	import StatusMark from './StatusMark.svelte';

	let {
		task,
		position,
		total,
		onOpenProject,
		onOpenRelease
	}: {
		task: RunningTask;
		position: number;
		total: number;
		onOpenProject: (name: string) => void;
		onOpenRelease: (slug: string) => void;
	} = $props();

	// Three segments, two of them targets. The task is where the reader already
	// stands, so it is stated and not offered — the ordinary breadcrumb rule, and
	// the only reason three segments fit a 370px phone at all.
	const segments = $derived<Segment[]>([
		{ label: task.project, kind: 'project', onSelect: () => onOpenProject(task.project) },
		{ label: task.release, kind: 'release', onSelect: () => onOpenRelease(task.release) },
		{ label: task.id, kind: 'task' }
	]);

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
		<StandingLine {segments} label="Where {task.id} sits" />
		<!-- The row that held the status and the id is now the status alone: the id
		     moved into the line above and is not printed twice. -->
		<StatusMark status={task.status} size="lead" />
		<h2 class="title">{task.title}</h2>
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

	/* The status mark is inline-flex, so on its own it would stretch to the
	   column's width and put the focus ring and any future affordance across the
	   whole card. It only ever needs to be as wide as the word. */
	.identity :global(.mark) {
		align-self: start;
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
