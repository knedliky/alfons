<script lang="ts" module>
	import type { AttemptOutcome } from './corpus.ts';

	export interface VerificationTrailProps {
		/** Every attempt in order, oldest first. Empty means never verified. */
		attempts: AttemptOutcome[];
	}

	/**
	 * One geometry for every trail on the page, so 87 of them share a scale and
	 * an origin and can be compared down the column. The widest trail in the
	 * corpus is four attempts; a fifth would extend the axis rather than rescale
	 * it, because a rescaled small multiple is no longer a small multiple.
	 */
	const MAX_ATTEMPTS = 4;
	const BAR_WIDTH = 4;
	const BAR_GAP = 2;
	const UNIT = 4;
	const HEIGHT = 3 * UNIT;
	const WIDTH = MAX_ATTEMPTS * BAR_WIDTH + (MAX_ATTEMPTS - 1) * BAR_GAP;
</script>

<script lang="ts">
	/**
	 * VerificationTrail — one task's verification attempts as a sparkline.
	 *
	 * Written locally because nothing in the library draws a mark inside a table
	 * cell: DataTable formatters return a string, so a glyph cannot go in a cell
	 * at all, and neither chart component has a form this small.
	 *
	 * Form before colour, and the form settles the colour question. An attempt's
	 * outcome is ordinal — a failed attempt got less far than a partial one,
	 * which got less far than a pass — so height encodes it and hue does not.
	 * That is also the only encoding available: red, amber and olive are all
	 * spoken for as status, and a verdict is not a status. What the eye is meant
	 * to catch is the staircase of a task that failed twice before it passed.
	 *
	 * An attempt that has been started and not sealed is drawn hollow. Shape,
	 * not a fourth tone, because at four pixels wide a tone is not readable and
	 * a hollow column is.
	 */
	import { ATTEMPT_HEIGHT } from './corpus.ts';

	let { attempts }: VerificationTrailProps = $props();

	const bars = $derived(
		attempts.slice(0, MAX_ATTEMPTS).map((outcome, index) => ({
			outcome,
			x: index * (BAR_WIDTH + BAR_GAP),
			height: ATTEMPT_HEIGHT[outcome] * UNIT,
			/* The last sealed attempt is the verdict that currently stands, so it
			   is the one mark drawn at full ink. */
			current: index === attempts.length - 1
		}))
	);

	const sentence = $derived(
		attempts.length === 0
			? 'no verification attempts'
			: attempts.map((outcome, index) => `attempt ${index + 1} ${outcome}`).join(', ')
	);
</script>

<span class="trail">
	<svg
		viewBox="0 0 {WIDTH} {HEIGHT}"
		width={WIDTH}
		height={HEIGHT}
		role="img"
		aria-label={sentence}
	>
		<!-- The axis: a baseline the columns stand on, recessive enough to read as
		     ground rather than as data. An empty trail is this line and nothing
		     else, which is what no attempts actually looks like. -->
		<line
			x1="0"
			y1={HEIGHT - 0.5}
			x2={WIDTH}
			y2={HEIGHT - 0.5}
			stroke="var(--border-glass)"
			stroke-width="1"
		/>
		{#each bars as bar, index (index)}
			{#if bar.outcome === 'open'}
				<rect
					x={bar.x + 0.5}
					y={HEIGHT - bar.height + 0.5}
					width={BAR_WIDTH - 1}
					height={bar.height}
					rx="1.5"
					fill="none"
					stroke="var(--text-muted)"
					stroke-width="1"
				/>
			{:else}
				<!-- Drawn two pixels past the baseline so the rounded corners fall
				     outside the viewport: a rounded data end, a square anchor. -->
				<rect
					x={bar.x}
					y={HEIGHT - bar.height}
					width={BAR_WIDTH}
					height={bar.height + 2}
					rx="2"
					fill={bar.current ? 'var(--text-primary)' : 'var(--text-secondary)'}
				/>
			{/if}
		{/each}
	</svg>
</span>

<style>
	.trail {
		display: inline-flex;
		align-items: flex-end;
		vertical-align: middle;
	}

	svg {
		display: block;
		overflow: hidden;
	}
</style>
