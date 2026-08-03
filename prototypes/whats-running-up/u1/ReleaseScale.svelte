<script lang="ts">
	/**
	 * The third rung: the release the task on screen belongs to.
	 *
	 * This is where the axis is asked to keep meaning what it meant. Card to grid
	 * is the same content at less zoom. Grid to release is not — a release is an
	 * ancestor, not four tasks seen smaller. The one device holding the move
	 * together is the invariant the winning approach already used between its two
	 * scales, applied a rung further out: the thing you were reading is still on
	 * screen, marked, smaller, with more neighbours than it had before. AL-014 was
	 * the card; it was the marked cell; it is the marked entry here, one of four
	 * across three phases. Nothing you were looking at disappeared, it only got
	 * quieter and gained company. Whether that is enough is the finding, not the
	 * claim — see the report.
	 *
	 * The frame is the same frame. Same background, same border, same one-screen
	 * box as a card, because a rung that arrived in different chrome would read as
	 * a different page rather than a wider view.
	 *
	 * The roster carries every task, including the four fifths of them that are
	 * not running. A release showing only its runners would be the grid filtered
	 * by project, which the reader already had. This is the honest cost of the
	 * relaxation and it is confined here: nothing on this rung is a way back down,
	 * so a task that is not building or verifying still cannot be opened, and the
	 * running view stays exactly as narrow as it was.
	 */
	import { Pill } from '@alfons/design';
	import {
		documentedLine,
		phasesOf,
		runningIn,
		type Release,
		type RosterTask
	} from './hierarchy.ts';

	let { release, currentTaskId }: { release: Release; currentTaskId: string } = $props();

	let element = $state<HTMLElement | null>(null);
	let roster = $state<HTMLDivElement | null>(null);
	let entries = $state<Record<string, HTMLLIElement | null>>({});

	// The page moves focus here when the reader arrives by keyboard, the same
	// contract the grid and the deck already honour.
	export function focus() {
		element?.focus();
	}

	const phases = $derived(phasesOf(release));
	const running = $derived(runningIn(release));

	// The marked entry is the whole reason the rung reads as a wider view rather
	// than a different page, and on a 370px phone a release of seven tasks puts
	// it below the fold. So the roster positions on it, and instantly — for the
	// same reason the deck does not animate on arrival, a scroll that travels
	// past the other phases reads as the page finding its place rather than
	// having kept it.
	$effect(() => {
		const box = roster;
		const target = entries[currentTaskId];
		if (!box || !target) return;
		const boxRect = box.getBoundingClientRect();
		const targetRect = target.getBoundingClientRect();
		if (targetRect.top >= boxRect.top && targetRect.bottom <= boxRect.bottom) return;
		box.scrollTop +=
			targetRect.top - boxRect.top - (boxRect.height - targetRect.height) / 2;
	});

	// Only these two are motion, so only these two may take a colour.
	function isRunning(task: RosterTask): boolean {
		return task.status === 'building' || task.status === 'verifying';
	}
</script>

<section
	class="release"
	bind:this={element}
	tabindex="-1"
	aria-label="Release {release.slug}, holding {release.taskCount} tasks"
>
	<header class="identity">
		<p class="eyebrow">Release</p>
		<h2 class="slug">{release.slug}</h2>
		<p class="title">{release.title}</p>
		<p class="facts">
			<span>{release.project}</span>
			<span class="sep" aria-hidden="true">/</span>
			<span>{release.taskCount} tasks</span>
			<span class="sep" aria-hidden="true">/</span>
			<span>{running} running</span>
			<span class="sep" aria-hidden="true">/</span>
			<span>{documentedLine(release)}</span>
		</p>
		<ul class="tags">
			{#each release.tags as tag (tag)}
				<li>
					<!-- Neutral tint on purpose. Pill's canonical warmth sits next to
					     --amber, and a tag borrowing a colour near the one that means
					     "building" is exactly the decoration this page forbids. -->
					<Pill label={tag} fill="outline" tint="var(--text-muted)" size="sm" />
				</li>
			{/each}
		</ul>
	</header>

	<!-- Scrolls when a long release outgrows the screen. Safe here in a way it
	     would not be on the card: there is no horizontal gesture at this rung, so
	     a scroll container cannot eat one. -->
	<div class="roster" bind:this={roster}>
		{#each phases as group (group.phase)}
			<div class="phase">
				<h3 class="phase-name">Phase {group.phase}</h3>
				<ul class="entries">
					{#each group.tasks as task (task.id)}
						<li
							class="entry"
							data-status={task.status}
							aria-current={task.id === currentTaskId ? 'true' : undefined}
							bind:this={entries[task.id]}
						>
							<span class="entry-id">{task.id}</span>
							<span class="entry-status" data-running={isRunning(task) ? 'true' : undefined}>
								{task.status}
							</span>
							{#if task.id === currentTaskId}
								<!-- The thread out of the grid. Without it the reader has to
								     remember which task they came from. -->
								<span class="entry-here">here</span>
							{/if}
						</li>
					{/each}
				</ul>
			</div>
		{/each}
	</div>
</section>

<style>
	.release {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding: var(--space-5);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		overflow: clip;
	}

	.release:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: calc(var(--space-1) * -1);
	}

	.identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		flex: none;
	}

	.eyebrow {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* The slug is the release's name in the corpus and the thing the control
	   promised on the way here, so it is the heading rather than the prose title. */
	.slug {
		margin: 0;
		font-family: var(--font-mono);
		/* The type scale stops at --text-lead, which is a caption on a rung that
		   owns the screen. The floor is the token; the ceiling is a literal and no
		   token exists that would have prevented it. */
		font-size: clamp(var(--text-lead), min(6vw, 3.5vh), 1.75rem);
		line-height: 1.15;
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}

	/* Two lines and no more. The release title is prose in a panel whose point is
	   the roster below it, and at 370px an unclamped title took three lines and
	   pushed the marked entry off the screen. The task card one rung down gives
	   its own title the whole width and height it deserves; this is the release's
	   subtitle, not its name — the slug above is its name. */
	.title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-caption);
		line-height: 1.35;
		color: var(--text-secondary);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}

	.facts {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.sep {
		color: var(--text-muted);
	}

	.tags {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.roster {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-top: var(--space-4);
		border-top: 1px solid var(--card-border);
		overflow-y: auto;
		overflow-x: hidden;
	}

	.phase {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.phase-name {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.entries {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.entry {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-3);
		border-left: 2px solid var(--border-glass);
	}

	/* Neutral, like the current cell in the grid. Being the task the reader came
	   from is not a status and must not tint like one. */
	.entry[aria-current='true'] {
		background: var(--surface-hover-subtle);
		border-left-color: var(--text-primary);
	}

	.entry-id {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-primary);
	}

	/* Muted by default: pending, triaged, blocked and done are not motion and get
	   no colour at all. Only the two that are running are lit, from the same two
	   variables the grid and the card read. */
	.entry-status {
		flex: 1;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.entry[data-status='building'] .entry-status[data-running='true'] {
		color: var(--status-building);
	}

	.entry[data-status='verifying'] .entry-status[data-running='true'] {
		color: var(--status-verifying);
	}

	.entry-here {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-primary);
	}
</style>
