<script lang="ts">
	/**
	 * ReadingFloor — the phone's reading dock: a band reserved at the foot of
	 * the screen that the article never scrolls into, shared with the site's
	 * agent pill.
	 *
	 * The pill already claims the bottom-left corner on every page, so a band
	 * that tall is the price of keeping text out from under it. The dock moves
	 * into the rest of that band rather than adding a second floating layer:
	 * the back link and the contents control sit to the right of the pill, and
	 * the reading progress runs as a hairline along the band's top edge.
	 *
	 * While the reader scrolls forward the controls sink out of the band and
	 * only the hairline stays; scrolling back, reaching the top or reaching the
	 * end raises them again. Hidden controls are inert, so they leave the tab
	 * order with the picture.
	 *
	 * Expects --floor-height and --pill-clearance from the page, which measures
	 * the pill rather than trusting its documented size.
	 */
	import { BackLink, Button, Icon, ProgressBar } from '@alfons/design';

	interface Props {
		progress: number;
		positionLabel: string;
		positionDescription: string;
		raised: boolean;
		contentsOpen: boolean;
		backHref: string;
		onOpenContents: () => void;
	}

	let {
		progress,
		positionLabel,
		positionDescription,
		raised,
		contentsOpen,
		backHref,
		onOpenContents
	}: Props = $props();
</script>

<div class="reading-floor" data-reading-floor>
	<div class="floor-progress">
		<ProgressBar value={Math.round(progress * 100)} size="sm" />
	</div>

	<nav class="floor-dock" class:floor-dock-sunk={!raised} inert={!raised} aria-label="Reading dock">
		<BackLink href={backHref} label="Blog" />
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
	.reading-floor {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		/* Beneath the agent pill (z 40) so the pill stays on top of the band it
		   shares, and above the reading viewport. */
		z-index: var(--z-sticky);
		height: var(--floor-height, var(--space-8));
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
		left: var(--pill-clearance, var(--space-3));
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

	/* From the width where the margin dock fits beside the measure, the page
	   scrolls normally and the floor has nothing left to do. Keep in step with
	   the page's margin-dock breakpoint. */
	@media (min-width: 80rem) {
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
