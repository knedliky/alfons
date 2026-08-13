<script lang="ts">
	/**
	 * The state this page lives in most of the time, designed first.
	 *
	 * Alfons has EmptyState, and it was the wrong fit here: it renders an h3 in a
	 * bordered panel with an icon, which is the grammar of "your filter matched
	 * nothing" — a dead end inside a page that has other content. This page has
	 * no other content, and emptiness is the answer rather than the failure of
	 * one. So the answer is set as the page's own heading, at display size, with
	 * no box around it — it is the page's h1, not a notice inside one.
	 *
	 * The watching line is the only element here that is not the answer itself,
	 * and it earns its place: without it a still page is indistinguishable from
	 * a page that never loaded.
	 */
</script>

<div class="nothing">
	<h1 class="answer">Nothing is running.</h1>
	<p class="elaboration">No task is building or verifying. That is the whole answer.</p>
	<p class="watching">
		<span class="pulse" aria-hidden="true"></span>
		watching the corpus — this page fills itself
	</p>
</div>

<style>
	.nothing {
		display: flex;
		flex-direction: column;
		/* Room rather than centring: the shell has a sticky header above and a
		   footer below, so vertical centring only fights them. */
		padding-block: 0 var(--space-8);
	}

	.answer {
		margin: 0;
		font-family: var(--font-display);
		font-size: 2.25rem;
		line-height: 1.1;
		color: var(--text-primary);
	}

	.elaboration {
		margin: var(--space-4) 0 0;
		font-size: var(--text-body);
		line-height: 1.5;
		color: var(--text-secondary);
		max-width: 24ch;
	}

	.watching {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: var(--space-7) 0 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.pulse {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--text-muted);
		animation: breathe var(--widget-pulse-duration) ease-in-out infinite;
	}

	@keyframes breathe {
		0%,
		100% {
			opacity: var(--opacity-tertiary);
		}
		50% {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.pulse {
			animation: none;
		}
	}
</style>
