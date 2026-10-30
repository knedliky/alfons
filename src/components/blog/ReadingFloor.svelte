<script lang="ts" module>
	import type { LongreadSectionInfo } from './LongreadArticle.svelte';

	export interface ReadingFloorProps {
		/** Reading progress, 0 to 1: bind it from LongreadArticle. */
		progress: number;
		/** Current section, -1 before the first: bind it from LongreadArticle. */
		activeIndex: number;
		/** The article's sections, for the position label and its description. */
		sections: LongreadSectionInfo[];
		/** Where the back link goes, e.g. '/blog'. */
		backHref: string;
		/** The back link's text. Defaults to 'Blog'. */
		backLabel?: string;
		/** Whether the contents sheet this floor opens is showing. */
		contentsOpen?: boolean;
		/** Open the contents sheet (a PeekSheet holding a SectionList). */
		onOpenContents: () => void;
	}
</script>

<script lang="ts">
	/**
	 * ReadingFloor — the phone's reading dock: a band fixed to the foot of
	 * the viewport, shared with the site's agent pill, holding the reading
	 * progress, the way back and the contents control.
	 *
	 * Promoted from the article-page round (AL-034, approach a5's dock as
	 * Simon chose it in a6), on normal page scrolling: the document scrolls,
	 * the band stays fixed, and an in-flow reserve where the floor is placed
	 * holds the band's height, so the last line of the page can scroll clear
	 * of it. Place it last in the page. No element becomes the scroll
	 * container, so the browser's toolbar still collapses and scroll
	 * restoration still works, which the prototype's inner reading viewport
	 * broke.
	 *
	 * The pill already claims the band's bottom-left corner on every page, so
	 * the controls start to the right of it and the progress runs as a
	 * hairline along the band's top edge. While the reader scrolls forward
	 * the controls sink and only the hairline stays; scrolling back, the top
	 * and the end raise them again. Sunk controls are inert, so they leave
	 * the tab order with the picture.
	 *
	 * Geometry comes from two custom properties the page sets on an ancestor:
	 *   --reading-floor-height     the band's height (default --space-8)
	 *   --reading-floor-clearance  where the controls start from the left,
	 *                              past the pill (default --space-3)
	 *
	 * From 80rem up the floor and its reserve are gone: LongreadArticle's
	 * sheet rail takes over there, at the same breakpoint.
	 *
	 * Usage:
	 *   <ReadingFloor {progress} {activeIndex} {sections} backHref="/blog"
	 *     {contentsOpen} onOpenContents={() => (contentsOpen = true)} />
	 */
	import BackLink from '../navigation/BackLink.svelte';
	import Button from '../atoms/Button.svelte';
	import Icon from '../atoms/Icon.svelte';
	import ProgressBar from '../feedback/ProgressBar.svelte';

	let {
		progress,
		activeIndex,
		sections,
		backHref,
		backLabel = 'Blog',
		contentsOpen = false,
		onOpenContents
	}: ReadingFloorProps = $props();

	/** Scroll movement below this many pixels is a resting thumb, not intent. */
	const scrollDeadBand = 6;
	/** Within this many pixels of the top the controls always show. */
	const openingZone = 96;
	/** Within this many pixels of the end the controls always show. */
	const endZone = 24;

	let raisedByScroll = $state(true);
	let lastScrollTop = 0;
	let scrollFrame = 0;

	const raised = $derived(raisedByScroll || contentsOpen);

	const positionLabel = $derived(
		activeIndex < 0 ? 'Start' : `${activeIndex + 1}/${sections.length}`
	);
	const positionDescription = $derived(
		activeIndex < 0
			? `opening, ${sections.length} sections`
			: `section ${activeIndex + 1} of ${sections.length}, ${sections[activeIndex]?.kicker ?? ''}`
	);

	function followScroll(): void {
		scrollFrame = 0;
		const top = window.scrollY;
		const end = document.documentElement.scrollHeight - window.innerHeight;
		const delta = top - lastScrollTop;
		if (Math.abs(delta) > scrollDeadBand) {
			raisedByScroll = delta < 0;
			lastScrollTop = top;
		}
		if (top < openingZone || top >= end - endZone) raisedByScroll = true;
	}

	function scheduleFollow(): void {
		if (!scrollFrame) scrollFrame = requestAnimationFrame(followScroll);
	}

	$effect(() => {
		lastScrollTop = window.scrollY;
		window.addEventListener('scroll', scheduleFollow, { passive: true });
		return () => {
			window.removeEventListener('scroll', scheduleFollow);
			if (scrollFrame) cancelAnimationFrame(scrollFrame);
			scrollFrame = 0;
		};
	});
</script>

<div class="reading-floor-reserve" aria-hidden="true"></div>

<div class="reading-floor" data-reading-floor>
	<div class="floor-progress">
		<ProgressBar value={Math.round(progress * 100)} size="sm" />
	</div>

	<nav class="floor-dock" class:floor-dock-sunk={!raised} inert={!raised} aria-label="Reading dock">
		<BackLink href={backHref} label={backLabel} />
		<Button
			variant="secondary"
			size="sm"
			type="button"
			aria-haspopup="dialog"
			aria-expanded={contentsOpen}
			aria-label="Contents, {positionDescription}"
			onclick={onOpenContents}
		>
			<span class="contents-label">
				<Icon name="menu" size="sm" />
				{positionLabel}
			</span>
		</Button>
	</nav>
</div>

<style>
	/* In flow where the floor is placed (last in the page), so the document
	   is exactly one band taller and its last line scrolls clear of it. */
	.reading-floor-reserve {
		height: var(--reading-floor-height, var(--space-8));
	}

	.reading-floor {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		/* Beneath the agent pill (--z-widget) so the pill stays on top of the
		   band it shares, and above the page that scrolls behind it. */
		z-index: var(--z-sticky);
		height: var(--reading-floor-height, var(--space-8));
		overflow: hidden;
		background: var(--bg-primary);
	}

	/* The hairline doubles as the band's top edge, so the floor needs no
	   border of its own and progress is visible even with the dock sunk. */
	.floor-progress {
		position: absolute;
		inset: 0 0 auto 0;
	}

	.floor-dock {
		position: absolute;
		top: 0;
		bottom: 0;
		right: var(--space-3);
		left: var(--reading-floor-clearance, var(--space-3));
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: var(--space-3);
		transition:
			transform var(--transition-normal),
			opacity var(--transition-normal);
	}

	.floor-dock-sunk {
		transform: translateY(100%);
		opacity: 0;
	}

	.contents-label {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
	}

	/* LongreadArticle's sheet rail takes over at this width; keep the two
	   breakpoints in step. */
	@media (min-width: 80rem) {
		.reading-floor-reserve,
		.reading-floor {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.floor-dock {
			transition: opacity var(--transition-fast);
		}

		.floor-dock-sunk {
			transform: none;
		}
	}
</style>
