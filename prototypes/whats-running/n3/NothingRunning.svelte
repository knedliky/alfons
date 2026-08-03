<script lang="ts">
	/**
	 * The state this page is in most of the time, and the primary design.
	 *
	 * Three decisions worth stating:
	 *
	 * 1. It is a sentence, not an empty container. "Nothing is running" is the
	 *    complete answer to the page's only question, so it is set in the same
	 *    display voice the lead task gets. The page is not missing its lead; it
	 *    is telling you there is no lead to have.
	 * 2. It carries proof of life. The one way this state can lie is by looking
	 *    identical to a page that failed to load, so the feed's own state is on
	 *    screen — connected, and when it last delivered anything.
	 * 3. It has no colour at all. Status colour means "this is happening now",
	 *    and nothing is. Colour appearing on this page is itself the signal that
	 *    something started.
	 *
	 * Left-aligned on the same spine as the running state, so the two read as
	 * one page in two conditions rather than as two screens.
	 */
	import { describeAge } from './runners.ts';

	let {
		connected,
		lastEventSecondsAgo
	}: { connected: boolean; lastEventSecondsAgo: number } = $props();
</script>

<section class="nothing" aria-labelledby="nothing-heading">
	<h2 id="nothing-heading">Nothing is running.</h2>
	<p class="detail">No task is building or verifying.</p>

	<p class="feed" data-connected={connected}>
		<span class="mark" aria-hidden="true"></span>
		{#if connected}
			Live · last change {describeAge(lastEventSecondsAgo)}
		{:else}
			Not connected · this page may be out of date
		{/if}
	</p>
</section>

<style>
	.nothing {
		padding: var(--space-7) 0 var(--space-8);
	}

	h2 {
		margin: 0 0 var(--space-3);
		font-family: var(--font-display);
		font-size: 1.75rem;
		font-weight: 500;
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	.detail {
		margin: 0 0 var(--space-6);
		font-family: var(--font-body);
		font-size: var(--text-body);
		color: var(--text-secondary);
	}

	.feed {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		color: var(--text-muted);
	}

	.mark {
		width: var(--space-2);
		height: var(--space-2);
		flex: none;
		background: var(--text-muted);
		animation: breathing var(--widget-pulse-duration) ease-in-out infinite;
	}

	/* A dropped feed is the one thing here that is not merely absence, so it is
	   the one thing allowed to raise its voice. */
	.feed[data-connected='false'] {
		color: var(--status-warning-text);
	}

	.feed[data-connected='false'] .mark {
		background: var(--status-warning-text);
		animation: none;
	}

	@keyframes breathing {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: var(--opacity-tertiary);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.mark {
			animation: none;
		}
	}

	@media (min-width: 640px) {
		h2 {
			font-size: 2.25rem;
		}
	}
</style>
