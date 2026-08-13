<script lang="ts" module>
	export interface ScaleControlProps {
		scale: TaskScale;
		onchange: (next: TaskScale) => void;
	}
</script>

<script lang="ts">
	/**
	 * ScaleControl — the one control that moves between the running view's two
	 * scales.
	 *
	 * Place it at the very bottom of the screen, full width: it is the only
	 * control present at both scales, so it is the one thing that must not move
	 * when the scale changes — a control that jumps as you use it makes the
	 * reader re-find it every time — and the bottom edge is the only part of a
	 * phone a thumb reaches without regripping.
	 *
	 * It is a segmented control rather than a single toggling button because the
	 * discoverability of the second scale is the whole risk: both scales are
	 * named on screen at all times, so nothing has to be guessed at, and there
	 * is no hidden mode. Both labels name a way of reading, not a shape.
	 *
	 * Note for screen readers: ToggleGroup marks the active option with colour
	 * and a sliding thumb but no aria-pressed, so the page should carry the
	 * announcement in a live readout of its own.
	 *
	 * Usage:
	 *   <ScaleControl {scale} onchange={changeScale} />
	 */
	import ToggleGroup from '../atoms/ToggleGroup.svelte';
	import type { TaskScale } from './types.js';

	let { scale, onchange }: ScaleControlProps = $props();

	const options = [
		{ value: 'grid' as TaskScale, label: 'All running' },
		{ value: 'card' as TaskScale, label: 'One at a time' }
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
	   lightly. It is here because the atom's segments are 34px tall — the 44px
	   is the shell around them — and a 34px target on a phone page whose whole
	   premise is one-handed use is a defect, not a preference. */
	.scale :global(.toggle-group) {
		display: flex;
		flex: 1;
		padding: 0;
	}

	.scale :global(.toggle-btn) {
		flex: 1;
		/* Not --filter-control-height: measured, that token is 2.75rem on a phone
		   and 2.25rem from 640px up, so the segments came out 41px at 1280px —
		   under the touch minimum at exactly the width where a touchscreen laptop
		   reads this. --space-7 is 48px at every width. */
		min-height: var(--space-7);
		font-size: var(--text-caption);
	}
</style>
