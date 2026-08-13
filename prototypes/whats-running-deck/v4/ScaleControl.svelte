<script lang="ts">
	/**
	 * The one control that moves between the two scales.
	 *
	 * Where and why: the very bottom of the screen, full width, below the deck's
	 * own pager. It is the only control present at both scales, so it is the one
	 * thing that must not move when the scale changes — a control that jumps as you
	 * use it makes the reader re-find it every time. Bottom edge is also the only
	 * part of a phone a thumb reaches without regripping, and the pager, which only
	 * exists at card scale, sits above it rather than under it.
	 *
	 * It is a segmented control rather than a single toggling button because the
	 * discoverability of the second scale is the whole risk of this approach. Both
	 * scales are named on screen at all times, so nothing has to be guessed at, and
	 * there is no hidden mode. No pinch gesture: undiscoverable, and unavailable to
	 * a keyboard.
	 *
	 * ToggleGroup is the library's segmented control and this is its job. Two
	 * things it does not do, both corrected here and both reported:
	 * its segments are 34px inside a 44px shell, which is under the touch minimum;
	 * and it marks the active option with colour and a sliding thumb but no
	 * aria-pressed, so a screen reader hears two plain buttons. The second is not
	 * fixable from outside the component, so the page's live readout carries the
	 * announcement instead — see Page.svelte.
	 */
	import { ToggleGroup } from '@alfons/design';
	import type { Scale } from './scale.ts';

	let { scale, onchange }: { scale: Scale; onchange: (next: Scale) => void } = $props();

	// Both labels name a way of reading, not a shape. "Grid" and "Card" describe
	// the layout; these describe what the reader gets.
	const options = [
		{ value: 'grid' as Scale, label: 'All running' },
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
