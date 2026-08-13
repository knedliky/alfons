<script lang="ts">
	/**
	 * One task status, drawn three ways at once.
	 *
	 * Colour is reserved for state, and with a near-monochrome page the few
	 * coloured marks carry more weight than they would anywhere else — so the
	 * mark never relies on hue alone. Shape separates the lifecycle (square)
	 * from the exceptional exits (diamond), fill height encodes how far through
	 * the lifecycle the task is, and the label is always available to a reader.
	 *
	 * The colour itself comes from a custom property set once at the page root,
	 * so no region can invent its own encoding.
	 */
	import { STATUS_META, type TaskStatus } from './ledger-corpus';

	interface Props {
		status: TaskStatus;
		/** Hidden visually for dense rows, still read out to assistive tech. */
		labelled?: boolean;
	}

	let { status, labelled = true }: Props = $props();

	const meta = $derived(STATUS_META[status]);
</script>

<span class="status" data-shape={meta.shape}>
	<span
		class="mark"
		aria-hidden="true"
		style="--mark-colour: var({meta.custom}); --mark-fill: {meta.fill * 100}%"
	></span>
	<span class="label" class:visually-hidden={!labelled}>{meta.label}</span>
</span>

<style>
	.status {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		white-space: nowrap;
	}

	.mark {
		position: relative;
		flex: none;
		inline-size: var(--space-3);
		block-size: var(--space-3);
		border: calc(var(--stroke-normal) * 1px) solid var(--mark-colour);
		/* The fill grows from the baseline up, so a glance down a column reads
		   as a rising staircase from pending to done without reading a word. */
		background: linear-gradient(
			to top,
			var(--mark-colour) 0 var(--mark-fill),
			transparent var(--mark-fill) 100%
		);
	}

	.status[data-shape='diamond'] .mark {
		rotate: 45deg;
		/* A rotated square reads smaller than an upright one at the same edge
		   length, so it is scaled back to match optically. */
		scale: 0.82;
	}

	.label {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 500;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.visually-hidden {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
