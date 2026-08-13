<script lang="ts">
	/**
	 * Nothing is running — the state this page lives in most of the time, and
	 * the one an instrument answers better than a list can.
	 *
	 * An empty list has to prove it is not broken. An instrument does not: it is
	 * visibly watching, and it says what it last saw. So the emptiness carries
	 * three things a blank page cannot — that the feed is connected, how long
	 * the quiet has lasted, and what stopped. "Nothing is running because
	 * LDG-041 finished four minutes ago" is a complete answer; "no results" is
	 * not.
	 *
	 * Colour is deliberately absent here. Status colour encodes status, and
	 * nothing has one.
	 */
	import { clockTime, departureWord, elapsed, type Transition } from './feed.svelte.ts';

	let { lastMovement, now }: { lastMovement: Transition | null; now: number } = $props();

	const quietFor = $derived(lastMovement ? elapsed(lastMovement.at, now) : null);
	const departure = $derived(
		lastMovement && (lastMovement.to === 'done' || lastMovement.to === 'blocked')
			? departureWord(lastMovement.to)
			: null
	);
</script>

<section class="idle" aria-label="Nothing running">
	<!-- The watch line. Under full motion the sweep says "watching"; under
	     reduced motion the rule holds still and the readout below says it in
	     words and a number that changes. Neither is the other with a piece
	     removed. -->
	<div class="watch" aria-hidden="true">
		<span class="rule"></span>
		<span class="sweep"></span>
	</div>

	<p class="readout">
		<span class="state">Watching</span>
		{#if quietFor}
			<span class="quiet">quiet for <span class="figure">{quietFor}</span></span>
		{/if}
	</p>

	{#if lastMovement}
		<div class="last">
			<p class="last-label">Last movement</p>
			<p class="last-line">
				<span class="id">{lastMovement.taskId}</span>
				<span class="verb" data-departure={departure ?? 'moved'}>
					{departure ?? `${lastMovement.from} → ${lastMovement.to}`}
				</span>
				<span class="at">at {clockTime(lastMovement.at)}</span>
			</p>
			<p class="last-title">{lastMovement.title}</p>
		</div>
	{/if}
</section>

<style>
	.idle {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.watch {
		position: relative;
		height: var(--space-1);
		overflow: hidden;
	}

	.rule {
		position: absolute;
		inset: calc(50% - 1px) 0 auto 0;
		height: 1px;
		background: var(--border-glass);
	}

	/* One travelling glint, slower than anything a reader is asked to track, so
	   it registers in peripheral vision without pulling the eye off the words. */
	.sweep {
		position: absolute;
		inset: 0 auto 0 0;
		width: 40%;
		background: linear-gradient(
			90deg,
			transparent,
			var(--shimmer-highlight-dim),
			var(--text-muted),
			transparent
		);
		animation: sweep var(--sweep-duration) linear infinite;
	}

	@keyframes sweep {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(250%);
		}
	}

	.readout {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-3);
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.state {
		color: var(--text-secondary);
	}

	.figure {
		font-variant-numeric: tabular-nums;
		color: var(--text-secondary);
	}

	.last-label,
	.last-line,
	.last-title {
		margin: 0;
	}

	.last {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-left: var(--space-4);
		border-left: 1px solid var(--border-glass);
	}

	.last-label {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.last-line {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
		letter-spacing: 0.06em;
	}

	.verb[data-departure='blocked'] {
		color: var(--colour-error);
	}

	.at {
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.last-title {
		font-size: var(--text-ui);
		line-height: 1.35;
		color: var(--text-muted);
	}

	/*
	 * The reduced-motion instrument. The sweep goes and something takes its
	 * place: the rule becomes solid rather than a ghost, and the readout is
	 * promoted from microtype to the page's lead size. Liveness is then carried
	 * by a figure that visibly changes every second — the quiet lengthening —
	 * rather than by anything travelling across the screen. It says the same
	 * thing louder, in numerals.
	 */
	@media (prefers-reduced-motion: reduce) {
		.sweep {
			display: none;
		}

		.rule {
			background: var(--border-glass-hover);
		}

		.readout {
			font-size: var(--text-lead);
			letter-spacing: 0.02em;
			text-transform: none;
			color: var(--text-secondary);
		}

		.readout .figure {
			color: var(--text-primary);
		}
	}
</style>
