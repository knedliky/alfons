<script lang="ts">
	/**
	 * The one control that moves between the two camera distances.
	 *
	 * Fixed to the bottom edge with the runner rail, because it is the only
	 * control present at both distances and the bottom edge is the only part of
	 * a phone a thumb reaches without regripping. The labels are the settled
	 * ones — they name what the reader gets, not a shape — and here they are
	 * also camera altitudes: "All running" lifts the camera until every lit
	 * task is in frame, "One at a time" drops it onto the runner being read.
	 *
	 * ToggleGroup is the library's segmented control and this is its job. Two
	 * things it does not do, both corrected or worked around here and both
	 * re-reported: its segments are 34px inside a 44px shell, under the touch
	 * minimum; and it marks the active option with colour and a sliding thumb
	 * but no aria-pressed, so a screen reader hears two plain buttons. The
	 * second is not fixable from outside the component, so the page's live
	 * readout carries the announcement instead — see Page.svelte.
	 */
	import { ToggleGroup } from '@alfons/design';
	import type { CameraDistance } from './scale.ts';

	let {
		distance,
		onchange
	}: { distance: CameraDistance; onchange: (next: CameraDistance) => void } = $props();

	const options = [
		{ value: 'map' as CameraDistance, label: 'All running' },
		{ value: 'task' as CameraDistance, label: 'One at a time' }
	];
</script>

<div class="scale" role="group" aria-label="Camera distance">
	<ToggleGroup selected={distance} {options} {onchange} />
</div>

<style>
	.scale {
		flex: none;
		display: flex;
	}

	/* Reaching into ToggleGroup's own class names, which is not something to do
	   lightly. The atom's segments are 34px tall — the 44px is the shell around
	   them — and a 34px target on a phone page whose whole premise is one-handed
	   use is a defect, not a preference. Inherited finding, re-reported. */
	.scale :global(.toggle-group) {
		display: flex;
		flex: 1;
		padding: 0;
	}

	.scale :global(.toggle-btn) {
		flex: 1;
		/* Not --filter-control-height: that token drops to 2.25rem from 640px up
		   and lands under the 44px touch minimum. --space-7 is 48px everywhere.
		   Inherited finding, re-reported. */
		min-height: var(--space-7);
		font-size: var(--text-caption);
	}
</style>
