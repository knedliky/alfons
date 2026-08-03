<script lang="ts">
	/**
	 * The one control that moves between the two scales.
	 *
	 * The very bottom of the screen, full width, below the deck's own rail. It is
	 * the only control present at both scales AND in all three scopes, so it is
	 * the one thing that must not move when either changes — a control that jumps
	 * as you use it makes the reader re-find it every time. That constraint is
	 * why the way back to the running deck is at the top of the page rather than
	 * down here in the thumb's reach: this row is spoken for.
	 *
	 * A segmented control rather than a single toggling button because the
	 * discoverability of the second scale is the whole risk. Both scales are named
	 * on screen at all times, so nothing has to be guessed at.
	 *
	 * The labels are scope-neutral on purpose. "All running" was correct in the
	 * winning approach and is a lie the moment the deck holds a release, so the
	 * two options name the shape rather than the set — "All at once" and "One at a
	 * time" — and the set is named by the heading and the scope bar instead.
	 *
	 * ToggleGroup is the library's segmented control and this is its job. Two
	 * things it does not do, both corrected here and both reported: its segments
	 * are 34px inside a 44px shell, which is under the touch minimum; and it marks
	 * the active option with colour and a sliding thumb but no aria-pressed, so a
	 * screen reader hears two plain buttons. The second is not fixable from
	 * outside the component, so the page's live readout carries the announcement.
	 */
	import { ToggleGroup } from '@alfons/design';
	import type { Scale } from './scale.ts';

	let { scale, onchange }: { scale: Scale; onchange: (next: Scale) => void } = $props();

	const options = [
		{ value: 'grid' as Scale, label: 'All at once' },
		{ value: 'card' as Scale, label: 'One at a time' }
	];
</script>

<div class="scale" role="group" aria-label="Scale">
	<ToggleGroup selected={scale} {options} {onchange} />
</div>

<style>
	.scale {
		flex: none;
		display: flex;
	}

	/* Reaching into ToggleGroup's own class names, which is not something to do
	   lightly. It is here because the atom's segments are 34px tall — the 44px is
	   the shell around them — and a 34px target on a phone page whose whole premise
	   is one-handed use is a defect, not a preference. Recorded as a deviation. */
	.scale :global(.toggle-group) {
		display: flex;
		flex: 1;
		padding: 0;
	}

	.scale :global(.toggle-btn) {
		flex: 1;
		min-height: var(--filter-control-height);
		font-size: var(--text-caption);
	}
</style>
