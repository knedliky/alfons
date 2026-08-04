<script lang="ts" module>
	export interface NothingRunningProps {
		/** When the feed last confirmed the answer. */
		checkedAt: Date;
		/** Releases offered as glances so the empty state is not a dead end. */
		releases: ReleasePeekTarget[];
		onPeekRelease: (slug: string, opener: HTMLElement) => void;
	}
</script>

<script lang="ts">
	/**
	 * NothingRunning — the empty state of a running view, and not a dead end.
	 *
	 * The statement is the primary design: the result, when it was true, and a
	 * beacon that keeps moving, because a broken page has none of those. The
	 * page this serves is empty most of the time, so emptiness must read as
	 * deliberate rather than as a page that failed to load.
	 *
	 * Beneath it the corpus's releases are offered as peeks, so the page's usual
	 * state stops being its only dead end. What that admits is stated rather
	 * than hidden: the moment the empty state lists releases, the page has a
	 * second job — glancing at the corpus — independent of anything running.
	 * The list is kept subordinate (the statement keeps the display type, the
	 * rows are small) and carries no status colour: nothing here is running, so
	 * nothing here may claim the colours of motion.
	 *
	 * EmptyState remains the wrong answer for the statement: wrong icons, a
	 * centred small block, wants a call to action.
	 *
	 * Usage:
	 *   <NothingRunning {checkedAt} {releases} onPeekRelease={raise} />
	 */
	import DestinationRow from '../atoms/DestinationRow.svelte';
	import { clockTime } from './time.js';
	import type { ReleasePeekTarget } from './types.js';

	let { checkedAt, releases, onPeekRelease }: NothingRunningProps = $props();
</script>

<section class="empty" aria-label="Nothing running">
	<div class="answer">
		<p class="statement">No agent is working on anything at this moment.</p>
		<p class="reassurance">
			This is the whole answer. The page is listening, and it will fill itself the moment something
			starts.
		</p>
		<p class="pulse">
			<span class="beacon"></span>
			<span>live &middot; last checked {clockTime(checkedAt)}</span>
		</p>
	</div>

	<nav class="glance" aria-label="Peek at a release">
		<h2 class="glance-heading">Nothing to stand on &middot; glance instead</h2>
		<ul class="rows">
			{#each releases as release (release.slug)}
				<li>
					<DestinationRow
						name={release.slug}
						secondary={release.project}
						cue="peek"
						chevron={false}
						onactivate={(opener) => onPeekRelease(release.slug, opener)}
					/>
				</li>
			{/each}
		</ul>
	</nav>
</section>

<style>
	.empty {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.answer {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding: var(--space-5);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
	}

	.statement {
		margin: 0;
		font-family: var(--font-display);
		/* The empty state is the primary design, so it gets the primary
		   typographic weight rather than a muted apology. The ceiling leaves the
		   glance list its height while the statement still owns the screen. */
		font-size: clamp(var(--text-lead), 6vw, 1.75rem);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	.reassurance {
		margin: 0;
		font-size: var(--text-ui);
		line-height: 1.5;
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

	/* The list scrolls; the statement does not. There is no horizontal gesture
	   in the empty state, so a vertical scroll container costs nothing here. */
	.glance {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.glance-heading {
		margin: 0;
		flex: none;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--card-border);
	}

	.rows {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-height: 0;
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
</style>
