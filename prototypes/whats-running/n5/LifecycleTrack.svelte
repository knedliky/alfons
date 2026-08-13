<script lang="ts">
	/**
	 * How far along a task has got, drawn as the lifecycle itself rather than as
	 * a percentage: three moves separate a triaged task from a done one, and the
	 * head sits on the move it has reached.
	 *
	 * The head is what makes this an instrument rather than a bar. When a task
	 * advances, the head travels; when it finishes, it runs to the end and the
	 * track fills; when it blocks, it stops where it is and the remaining track
	 * is struck out. A finish and a block therefore differ in shape, not only in
	 * colour and word.
	 */
	import type { RunningStatus } from './feed.svelte.ts';

	let {
		status,
		departing = null
	}: { status: RunningStatus; departing?: 'done' | 'blocked' | null } = $props();

	/** Stage 1 is building, 2 is verifying, 3 is done — three moves in all. */
	const stage = $derived(departing === 'done' ? 3 : status === 'verifying' ? 2 : 1);
	const stageLabel = $derived(
		departing === 'blocked' ? 'halted at stage ' + stage + ' of 3' : `stage ${stage} of 3`
	);
</script>

<div
	class="track"
	data-status={status}
	data-departing={departing ?? 'no'}
	role="img"
	aria-label={stageLabel}
>
	<div class="rail">
		{#each [1, 2, 3] as position (position)}
			<span class="segment" class:filled={position <= stage}></span>
		{/each}
		<span class="head" style:--head-stage={stage}></span>
	</div>
	<span class="caption">{stageLabel}</span>
</div>

<style>
	.track[data-status='building'] {
		--track-colour: var(--status-building);
	}

	.track[data-status='verifying'] {
		--track-colour: var(--status-verifying);
	}

	/* A finish leaves the lifecycle behind, so it stops being a status colour
	   and settles to plain text. Neutral is the point: nothing is running. */
	.track[data-departing='done'] {
		--track-colour: var(--text-secondary);
	}

	.track[data-departing='blocked'] {
		--track-colour: var(--colour-error);
	}

	.track {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.rail {
		position: relative;
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-1);
		height: var(--space-1);
	}

	.segment {
		background: var(--border-glass);
		transition: background var(--duration-slow) ease;
	}

	.segment.filled {
		background: var(--track-colour);
	}

	/* The head sits on the boundary the task has reached; moving stage moves it. */
	.head {
		position: absolute;
		top: calc(var(--space-1) * -1);
		left: calc((100% + var(--space-1)) / 3 * var(--head-stage) - var(--space-1) * 1.5);
		width: var(--space-1);
		height: var(--space-3);
		background: var(--track-colour);
		transition: left var(--widget-spring-duration) var(--widget-spring-easing);
	}

	/* A block is drawn, not tinted: the track it did not reach is struck out. */
	.track[data-departing='blocked'] .segment:not(.filled) {
		background: repeating-linear-gradient(
			135deg,
			var(--colour-error) 0 var(--space-1),
			transparent var(--space-1) var(--space-2)
		);
	}

	.caption {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		letter-spacing: 0.04em;
	}

	.track[data-departing='blocked'] .caption {
		color: var(--colour-error);
	}

	/* Reduced motion: the head still moves, because its position IS the reading —
	   it just arrives rather than travels. Nothing slides across the viewport. */
	@media (prefers-reduced-motion: reduce) {
		.head,
		.segment {
			transition: none;
		}
	}
</style>
