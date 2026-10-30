<script lang="ts">
	/**
	 * ReadingProgress — the page's only navigation: an accent hairline laid
	 * along the bottom edge of the fixed header, filling as the article is
	 * read. It lives inside the header band, so its box sits where the header
	 * already covers the page and can never land on a line of text.
	 *
	 * Reuses ProgressBar for the role and the value maths, thinned to a
	 * hairline here because the library has no hairline size yet.
	 *
	 * Usage:
	 *   <ReadingProgress target={articleElement} />
	 */
	import { ProgressBar } from '@alfons/design';

	interface Props {
		target?: HTMLElement;
	}

	let { target }: Props = $props();

	let percentRead = $state(0);

	$effect(() => {
		if (!target) return;
		const measured = target;
		let pendingFrame = 0;

		// Progress runs from the article's top reaching the viewport top to its
		// end reaching the viewport bottom, so 100 means the last line is in view.
		function measure() {
			pendingFrame = 0;
			const box = measured.getBoundingClientRect();
			const travel = box.height - window.innerHeight;
			percentRead = travel <= 0 ? 100 : Math.min(100, Math.max(0, (-box.top / travel) * 100));
		}

		function scheduleMeasure() {
			if (!pendingFrame) pendingFrame = requestAnimationFrame(measure);
		}

		measure();
		window.addEventListener('scroll', scheduleMeasure, { passive: true });
		window.addEventListener('resize', scheduleMeasure);
		return () => {
			window.removeEventListener('scroll', scheduleMeasure);
			window.removeEventListener('resize', scheduleMeasure);
			if (pendingFrame) cancelAnimationFrame(pendingFrame);
		};
	});
</script>

<div class="reading-progress">
	<ProgressBar value={percentRead} tone="accent" size="sm" />
</div>

<style>
	/* Straddles the header's own bottom border, inside the header's box. */
	.reading-progress {
		position: fixed;
		top: calc(var(--header-height) - 1px);
		left: 0;
		right: 0;
		z-index: calc(var(--z-widget) + 1);
		pointer-events: none;
	}

	/* ProgressBar's smallest track is 5px; a reading bar wants a hairline
	   with no visible track, and a fill that follows the scroll without lag. */
	.reading-progress :global(.motif-progress-track) {
		height: 2px;
		background: transparent;
	}

	.reading-progress :global(.motif-progress-fill) {
		transition: none;
	}
</style>
