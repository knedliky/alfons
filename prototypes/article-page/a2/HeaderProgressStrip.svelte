<script lang="ts">
	/**
	 * HeaderProgressStrip — the outside rail laid flat for screens with no
	 * gutter to hold it.
	 *
	 * One segment per section, each in the lamp colour it has on the rail,
	 * filling as that section is read. It docks into the bottom edge of the
	 * site header so it travels inside the band the reader already accepts as
	 * chrome, and never sits over a line of text. The dock is a prototype
	 * stand-in for a Header snippet that does not exist yet: in production the
	 * Header would render this in a `below` slot.
	 */
	import type { ReadingPosition, SectionStop } from './readingProgress';

	interface Props {
		stops: SectionStop[];
		position: ReadingPosition;
	}

	let { stops, position }: Props = $props();

	const sectionsRead = $derived(position.sectionProgress.filter((progress) => progress >= 1).length);
	const activeKicker = $derived(
		position.activeIndex >= 0 ? stops[position.activeIndex]?.kicker : undefined
	);
	const progressText = $derived(
		activeKicker
			? `Section ${position.activeIndex + 1} of ${stops.length}: ${activeKicker}`
			: 'Opening, before the first section'
	);

	/** Move the strip into the fixed header so it shares the header's band. */
	function dockInHeader(strip: HTMLElement) {
		// PageFrame wraps the Header in a static <header> of its own; the strip
		// belongs in the fixed bar inside it, so pick the header that is fixed.
		const fixedHeader = [...document.querySelectorAll('header')].find(
			(header) => getComputedStyle(header).position === 'fixed'
		);
		fixedHeader?.appendChild(strip);
		return {
			destroy() {
				strip.remove();
			}
		};
	}
</script>

<div
	class="header-progress-strip"
	use:dockInHeader
	role="progressbar"
	aria-label="Reading progress"
	aria-valuemin={0}
	aria-valuemax={stops.length}
	aria-valuenow={sectionsRead}
	aria-valuetext={progressText}
>
	{#each stops as stop, index (stop.id)}
		<span
			class="strip-segment"
			class:strip-segment-active={position.activeIndex === index}
			style:--lamp-colour={stop.lampColour}
			style:--segment-progress={position.sectionProgress[index] ?? 0}
		></span>
	{/each}
</div>

<style>
	/* Pinned to the header's bottom edge, over its hairline, so it reads as the
	   header's own lower rule turned into a gauge. */
	.header-progress-strip {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		display: flex;
		gap: var(--sp-05);
		height: var(--space-1);
		padding: 0 var(--sp-05);
		background: var(--surface-sunken);
		pointer-events: none;
	}

	/* Lamp colour and read share arrive inline per segment; these are the
	   resting values before the first measurement lands. */
	.strip-segment {
		--lamp-colour: var(--accent);
		--segment-progress: 0;
		flex: 1;
		background:
			linear-gradient(var(--lamp-colour), var(--lamp-colour)) left / calc(var(--segment-progress) * 100%) 100% no-repeat,
			var(--steel-150);
	}

	.strip-segment-active {
		box-shadow: var(--shadow-rail-lamp);
	}

	/* From wide screens up the outside rail owns this job. */
	@media (min-width: 80rem) {
		.header-progress-strip {
			display: none;
		}
	}
</style>
