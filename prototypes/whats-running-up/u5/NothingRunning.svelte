<script lang="ts">
	/**
	 * A deck with nothing in it — the state this page lives in most of the time.
	 *
	 * The whole risk here is that it reads as a page that failed. Three things
	 * answer that, and they are the first three things on it: a sentence that
	 * states the result rather than the absence, a clock time saying when that was
	 * true, and an indicator that keeps moving. A broken page has none of those.
	 *
	 * EmptyState was the obvious library answer and is the wrong one: its icons
	 * are users/messages/posts/search/data, it centres a small block inside
	 * whatever box it is given, and it wants a call to action.
	 *
	 * What this approach adds, and it only makes sense in this approach: an empty
	 * running deck is the one place where going up has nothing to start from.
	 * Everywhere else the reader reaches a release through a task they are already
	 * reading. With no tasks there is no card, no project-and-release line, and
	 * therefore no way up at all — the page's new ability would vanish exactly
	 * when the reader has time to use it. So the empty state names the releases
	 * whose work stopped most recently, and each one fills the deck.
	 *
	 * It is deliberately not framed as a remedy. "Last in motion" is a statement
	 * about the corpus, in the same voice as the sentence above it; it is not
	 * "try one of these instead", and it does not appear when something IS
	 * running, because then it would be a distraction from the answer.
	 */
	import { clockTime } from './tasks.ts';
	import type { Scope } from './scope.ts';
	import { releasesLastInMotion } from './scope.ts';

	let { checkedAt, onup }: { checkedAt: Date; onup: (next: Scope) => void } = $props();

	const recent = releasesLastInMotion();
</script>

<section class="empty" aria-label="Nothing running">
	<div class="answer">
		<p class="statement">No agent is working on anything at this moment.</p>
		<p class="reassurance">
			The page is listening, and it will fill itself the moment something starts.
		</p>
		<p class="pulse">
			<span class="beacon"></span>
			<span>live &middot; last checked {clockTime(checkedAt)}</span>
		</p>
	</div>

	<div class="recent">
		<h2 class="recent-title">Last in motion</h2>
		<ul class="releases">
			{#each recent as entry (entry.release.slug)}
				<li>
					<button
						type="button"
						class="release"
						onclick={() => onup({ kind: 'release', key: entry.release.slug })}
						aria-label="Fill the deck with the release {entry.release.slug}, {entry.count} tasks"
					>
						<span class="slug">{entry.release.slug}</span>
						<!-- The count and nothing else. The project was here and it cost the
					     slug five characters at 370px, and a truncated slug is the one
					     thing on this row that has to be readable. -->
						<span class="count">{entry.count} tasks</span>
					</button>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.empty {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: var(--space-5);
		padding: var(--space-5);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		overflow: clip;
	}

	.answer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-4);
		min-height: 0;
		flex: 1;
		/* A guard, not a plan. The block is sized to fit a 667px phone; this stops a
		   shorter one from overflowing upward into the release list below, which is
		   what it did before the sizing was measured. */
		overflow: clip;
	}

	.statement {
		margin: 0;
		font-family: var(--font-display);
		/* Matches the card title. The empty state is the primary design, so it gets
		   the primary typographic weight rather than a muted apology. */
		font-size: clamp(var(--text-lead), min(6.5vw, 3vh), 1.875rem);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	.reassurance {
		margin: 0;
		font-size: var(--text-ui);
		line-height: 1.4;
		color: var(--text-secondary);
		max-width: var(--section-header-max-width);
	}

	.pulse {
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* Neutral, not status-coloured: nothing has a status, so nothing may take a
	   status colour. It moves because a still page is what a broken page looks
	   like. */
	.beacon {
		width: var(--space-2);
		height: var(--space-2);
		flex: none;
		background: var(--text-muted);
		animation: breathe var(--widget-pulse-duration) ease-in-out infinite;
	}

	@keyframes breathe {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: var(--opacity-tertiary);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.beacon {
			animation: none;
		}
	}

	.recent {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-top: var(--space-3);
		border-top: 1px solid var(--card-border);
	}

	.recent-title {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.releases {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	/* A bare button. Each of these is a full-width plate at the touch minimum,
	   which is every part of Button's centred pill removed. Named plainly in the
	   report. One line rather than two: stacked, three of them plus the answer
	   above overflowed a 667px phone and collided. */
	.release {
		appearance: none;
		width: 100%;
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		min-height: var(--filter-control-height);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		font-family: var(--font-mono);
		background: var(--surface-hover-subtle);
		border: 1px solid var(--card-border);
		cursor: pointer;
	}

	.slug {
		font-size: var(--text-caption);
		line-height: 1.2;
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.count {
		flex: none;
		font-size: var(--text-micro);
		line-height: 1.2;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.release:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}
</style>
