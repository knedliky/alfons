<script lang="ts" module>
	export interface LongreadSectionInfo {
		/** Short section handle shown in the progress rail flyout, e.g. 'The
		    council'. Must be unique within the article — it doubles as the
		    render key. */
		kicker: string;
	}
</script>

<script lang="ts">
	/**
	 * LongreadArticle — orchestrator for the editorial longread template.
	 *
	 * Owns the scroll-position model for its LongreadSection children: one
	 * IntersectionObserver tracks which section holds focus, driving the
	 * left-edge progress rail and per-section dimming. The rail is a vertical
	 * run of brand squares — hover one for its section title, click to scroll
	 * there. Sections register themselves through context; the article only
	 * needs the section list for the rail labels. Template selected via
	 * prototype-explorer rounds 1-3 (Centre Folio → Folio Motion → Motion
	 * Glow).
	 */
	import type { Snippet } from 'svelte';
	import { setLongreadContext } from './context';

	interface Props {
		sections: LongreadSectionInfo[];
		/** Hide the progress rail (single-section or plain prose pieces). */
		showProgress?: boolean;
		children: Snippet;
	}

	let { sections, showProgress = true, children }: Props = $props();

	/** Whether the rail renders — also gates the narrow-viewport gutter the
	    article reserves so prose never slides underneath it. */
	const showRail = $derived(showProgress && sections.length > 1);

	let activeIndex = $state(0);
	const sectionElements: HTMLElement[] = [];
	let observer: IntersectionObserver | null = null;

	function register(element: HTMLElement): number {
		const index = sectionElements.length;
		sectionElements.push(element);
		observer?.observe(element);
		return index;
	}

	setLongreadContext({
		register,
		isActive: (index) => activeIndex === index
	});

	$effect(() => {
		// The focus band sits in the upper-middle of the viewport, matching the
		// reading eye line rather than the viewport edges.
		observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const index = sectionElements.indexOf(entry.target as HTMLElement);
						if (index >= 0) {
							activeIndex = index;
						}
					}
				}
			},
			{ rootMargin: '-30% 0px -50% 0px' }
		);
		for (const element of sectionElements) observer.observe(element);
		return () => {
			observer?.disconnect();
			observer = null;
		};
	});

	/**
	 * The full chromatic brand palette, ordered as a walk around the OKLCH
	 * hue wheel (red 28° → sunset 44° → amber 70° → olive 130° → sky 229° →
	 * navy 260° → aubergine 319° → blush 340°) so the rail reads as a
	 * spectrum. The two neutral brand tokens are deliberately absent:
	 * --powder-sand is the primary-text neutral and --charcoal-ember the
	 * page background, so as squares they would vanish against the surfaces
	 * they define. `squareColour` wraps with a modulo, so longreads with
	 * more sections than colours simply repeat the sequence.
	 */
	const brandPalette = [
		'var(--girder-red)',
		'var(--gantry-orange)',
		'var(--brass-amber)',
		'var(--toolbox-olive)',
		'var(--pulley-blue)',
		'var(--boiler-navy)',
		'var(--flange-plum)',
		'var(--pinion-pink)'
	];

	/** Brand colour for the progress square at `index`, cycling the palette. */
	function squareColour(index: number): string {
		return brandPalette[index % brandPalette.length];
	}

	/** The flyout label's leading + trailing pill padding, measured in
	    character cells (6ch start + 2ch end — keep in sync with .rail-label's
	    paddings). The label is set in the mono face, where 1ch is exactly one
	    character, so folding the padding into the step count makes every step
	    of the clip reveal exactly one character wide — that alignment is what
	    turns the slide into a typewriter. */
	const labelPaddingSteps = 8;

	/** Inverse of quadratic ease-in-out — the time at which the eased curve
	    reaches `value`. Quadratic rather than cubic keeps the lead-in short
	    enough that hover still feels responsive, while the middle of the
	    reveal runs at twice the average cadence. */
	function easeInOutQuadInverse(value: number): number {
		if (value < 0.5) return Math.sqrt(value / 2);
		return 1 - Math.sqrt((1 - value) / 2);
	}

	/** Builds a linear() timing function that types `steps` character cells
	    on an S-shaped cadence — slow into the reveal, fast through the
	    middle, slow to land. Each plateau holds a whole-cell clip position
	    (the pair of stops at one position is the instant jump between
	    cells), so the reveal stays glyph-aligned; only the rhythm changes.
	    CSS steps() cannot do this — its cadence is always uniform. */
	function typewriterEasing(steps: number): string {
		const stops: string[] = ['0 0%'];
		for (let cell = 1; cell <= steps; cell += 1) {
			const position = (easeInOutQuadInverse(cell / steps) * 100).toFixed(2);
			const previousValue = ((cell - 1) / steps).toFixed(4);
			const nextValue = (cell / steps).toFixed(4);
			stops.push(`${previousValue} ${position}%`, `${nextValue} ${position}%`);
		}
		return `linear(${stops.join(', ')})`;
	}

	/** Rail click — animate the page to the chosen section. Sections carry
	    scroll-margin-top, so the smooth scroll lands clear of the fixed
	    header; readers who prefer reduced motion get an instant jump. */
	function scrollToSection(index: number): void {
		const target = sectionElements[index];
		if (!target) return;
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
	}
</script>

<article class="longread-article" class:longread-article-railed={showRail}>
	{#if showRail}
		<!-- Vertical progress rail, fixed to the left edge at mid-viewport.
		     Idle state shows only the squares; hovering (or keyboard-focusing)
		     a square flies its section title out to the right; clicking scrolls
		     to that section. -->
		<nav class="progress-rail" aria-label="Section progress">
			{#each sections as section, i (section.kicker)}
				<button
					type="button"
					class="rail-item"
					class:rail-item-active={activeIndex === i}
					style:--dot-colour={squareColour(i)}
					style:--label-steps={section.kicker.length + labelPaddingSteps}
					style:--label-ease={typewriterEasing(section.kicker.length + labelPaddingSteps)}
					aria-label={section.kicker}
					aria-current={activeIndex === i ? 'true' : undefined}
					onclick={() => scrollToSection(i)}
				>
					<span class="rail-square"></span>
					<span class="rail-label" aria-hidden="true">{section.kicker}</span>
				</button>
			{/each}
		</nav>
	{/if}
	{@render children()}
</article>

<style>
	.longread-article {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Below the width where the centred 42rem measure would slide under the
	   rail, the text takes a narrower lane beside it: a --space-4 breath
	   between the rail and the text's left edge (the rail's right edge is a
	   constant 46px here — 16px gutter + 30px capsule), with the host
	   PageSection's own inline padding giving the matching breath on the
	   right. The section padding is subtracted from the left inset so the
	   total stays exact; the second block re-states it for the section's
	   narrower mobile padding token. Only applied when a rail renders. */
	@media (max-width: 50rem) {
		.longread-article-railed {
			padding-left: calc(46px + var(--space-4) - var(--page-padding-x));
		}
	}

	@media (max-width: 48rem) {
		.longread-article-railed {
			padding-left: calc(46px + var(--space-4) - var(--page-padding-x-mobile));
		}
	}

	/* Vertical progress rail — a slim solid capsule, vertically centred in
	   the viewport. Horizontally it anchors to the left edge of the same
	   centred 64rem column the header logo and the BackLink use (50% - 32rem
	   is that column's left edge), so the rail sits beneath them instead of
	   drifting to the viewport edge on wide screens; the max() keeps a small
	   gutter once the viewport is narrower than the column.

	   The rail and its flyout tabs form one composite shape (a perfect L at
	   the ends, a crossing at middle rows), so the elevation treatment lives
	   here on the parent: no per-element borders or box-shadows — those
	   would draw seam lines across the union — and a drop-shadow filter
	   that follows the combined silhouette instead. The two shadows mirror
	   --elevation-2's geometry (drop-shadow blurs at half box-shadow
	   values). The capsule surface itself is painted by the ::before below,
	   layered ABOVE the tabs so a tab genuinely slides out from underneath.

	   --rail-thickness is the shared cross-section: the capsule's width and
	   every tab's height, which is what makes the vertical and horizontal
	   containers exactly the same. */
	.progress-rail {
		--rail-thickness: 1.75rem;
		/* End padding equals the side padding, so the capsule hugs the squares
		   uniformly — and, critically, an end-anchored tab (flush with the
		   capsule's end, --rail-thickness tall) then shares its centreline
		   with its row's square: (thickness - button) / 2 = this pad. That is
		   what keeps the square and the tab text aligned at the L corners. */
		--rail-end-pad: var(--space-1);
		/* Typewriter cadence — AVERAGE time per character cell of the flyout
		   reveal. Total flyout duration is (label length + 8 padding cells)
		   × this, so longer titles take proportionally longer, like real
		   typing. The S-shaped easing (--label-ease) redistributes the time:
		   the middle of the reveal runs about twice this fast, the ends
		   about half. */
		--rail-type-step: 32ms;
		position: fixed;
		left: max(var(--space-4), calc(50% - 32rem));
		top: 50%;
		transform: translateY(-50%);
		z-index: var(--z-sticky);
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: var(--rail-thickness);
		padding: var(--rail-end-pad) var(--space-1);
		/* The rail casts its own shadow because it is an irregular shape and
		   box-shadow would trace its bounding box. Matches --shadow-2, which
		   is where a floating rail sits on the ladder; drop-shadow takes no
		   spread, so it is written out rather than composed from the token.

		   Was two stacked drop-shadows built from --el-cast-spread and
		   --el-cast-depth, scalars the Meccano retune removed with the old
		   elevation ladder. calc() against an undefined custom property is
		   invalid at computed-value time, which discards the whole filter
		   silently — the rail had no shadow at all and nothing reported it. */
		filter: drop-shadow(0 2px 12px rgba(var(--shade-rgb), 0.5));
	}

	/* The capsule surface — a separate layer above the tabs (z-index 1 beats
	   the tabs' auto) so an emerging tab passes beneath it, with the squares
	   riding above both. */
	.progress-rail::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: 1;
		border-radius: var(--radius-pill);
		background: var(--bg-glass-solid);
	}

	/* One rail stop — a real button for keyboard and screen-reader users.
	   The 6px square is far too small a target on its own, so the ::after
	   below supplies a larger invisible hit area around it. */
	.rail-item {
		position: relative;
		display: grid;
		place-items: center;
		width: 1.25rem;
		height: 1.25rem;
		padding: 0;
		margin: 0;
		background: none;
		border: none;
		cursor: pointer;
	}

	/* Invisible hit halo. The button's own box is useless as a target: the
	   capsule surface (.progress-rail::before, z 1) paints above it, so the
	   pointer only ever reached the square itself (z 2). This pseudo sits at
	   z 2 as well, restoring the button as the hit target and widening it to
	   a 44px touch-friendly lane centred on the capsule. Vertically it grows
	   by half the rail gap each way, so adjacent halos tile edge-to-edge
	   without overlapping or fighting for the pointer. */
	.rail-item::after {
		content: '';
		position: absolute;
		z-index: 2;
		inset: calc(var(--space-1) / -2) calc(-1 * var(--space-3));
	}

	.rail-item:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
		border-radius: 0;
	}

	/* Square progress markers, echoing the Motivka logo square. Three-step
	   colour ladder: idle is neutral grey, hover shows the square's brand
	   colour at half strength (the in-between), and scroll focus turns it
	   all the way up with a glow. */
	.rail-square {
		/* Above the capsule surface (z 1) and the tabs beneath it, so the
		   square stays visible when a tab crosses its row. */
		position: relative;
		z-index: 2;
		width: 6px;
		height: 6px;
		border-radius: 0;
		background-color: var(--text-muted);
		opacity: 0.5;
		transition:
			background-color var(--transition-slow),
			opacity var(--transition-slow),
			box-shadow var(--transition-slow),
			transform var(--transition-slow);
	}

	/* The in-between: a hovered stop previews its own brand colour at half
	   strength, so the target reads as live before the label flies out. The
	   scale is paint-only (centre-origin, no layout), so the square grows
	   in place without nudging its neighbours or the flyout. */
	.rail-item:hover .rail-square {
		background-color: var(--dot-colour, var(--text-muted));
		opacity: 0.6;
		transform: scale(1.5);
	}

	/* The focused section's square animates from the neutral grey to its own
	   brand colour, lifting to full opacity with a glow tinted to match.
	   Doubled class keeps this state above the hover preview, so hovering
	   the active stop never dims it back to the in-between. */
	.rail-item.rail-item-active .rail-square {
		background-color: var(--dot-colour, var(--accent));
		opacity: 1;
		box-shadow: 0 0 8px color-mix(in oklch, var(--dot-colour, var(--accent)) 60%, transparent);
	}

	/* Section-title flyout — the horizontal container of the L. Exactly the
	   same cross-section as the vertical capsule: --rail-thickness tall,
	   full pill radius, same solid surface. Its left edge is buried at the
	   capsule's left edge, so its left pill cap coincides with the capsule's
	   own curvature — at the first and last stops the two containers stack
	   flush into a perfect L with a single shared rounded corner and no
	   overhangs. It paints beneath the capsule surface (::before, z 1), so
	   it slides out from underneath rather than over the top, and with no
	   per-element border or shadow there is no seam line where it emerges.

	   Visibility is a clip reveal, not a fade: the tab stays fully opaque
	   (overlay text always readable); hidden clips it away entirely, hover
	   unveils it left-to-right so it appears to slide out from beneath the
	   capsule. The clip edge alone carries the motion — the tab itself
	   never moves, which keeps its buried left cap from poking out the
	   capsule's far side mid-animation.

	   The reveal is a typewriter: the paddings are set in ch so the pill's
	   total width is an exact multiple of the mono face's character cell
	   ((--label-steps) × 1ch), and the clip transition steps through those
	   cells one character at a time on an S-shaped cadence — --label-ease
	   is a generated linear() curve (see typewriterEasing) that places the
	   per-cell jumps slow-fast-slow. One stepped transition drives both
	   directions: hovering types the title out, leaving types it back in
	   reverse from wherever it got to, so an interrupted hover unwinds
	   cleanly instead of snapping. */
	.rail-label {
		position: absolute;
		left: calc(-1 * var(--space-1));
		top: 50%;
		--tab-shift-y: -50%;
		height: var(--rail-thickness);
		display: flex;
		align-items: center;
		transform: translateY(var(--tab-shift-y));
		clip-path: inset(-24px 100% -24px 0);
		white-space: nowrap;
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		line-height: 1.2;
		/* Inherited tracking would break the 1ch-per-character alignment the
		   typewriter steps depend on — ch ignores letter-spacing. */
		letter-spacing: normal;
		color: var(--text-secondary);
		/* Text clears the capsule lying over the tab's buried left end. Both
		   paddings are whole character cells — keep in sync with
		   labelPaddingSteps in the script block. */
		padding-left: 6ch;
		padding-right: 2ch;
		border-radius: var(--radius-pill);
		background: var(--bg-glass-solid);
		pointer-events: none;
		transition: clip-path calc(var(--label-steps) * var(--rail-type-step)) var(--label-ease);
	}

	/* End stops anchor flush with the capsule's ends instead of centring on
	   their row — this is what closes the L without an overhang: the tab's
	   outer edge and the capsule's end cap land on the same line, and their
	   identical pill curvature merges into one corner. */
	.rail-item:first-child .rail-label {
		top: calc(-1 * var(--rail-end-pad));
		--tab-shift-y: 0%;
	}

	.rail-item:last-child .rail-label {
		top: auto;
		bottom: calc(-1 * var(--rail-end-pad));
		--tab-shift-y: 0%;
	}

	/* The open clip's right edge is 0% — not an overshoot — so the total
	   travel is exactly the pill's width and every steps() increment stays
	   one character cell. The transition itself lives on the base rule. */
	.rail-item:hover .rail-label,
	.rail-item:focus-visible .rail-label {
		clip-path: inset(-24px 0% -24px 0);
	}

	/* Reduced motion — the flyout appears without its typewriter, the
	   square's hover growth snaps instead of animating, and the click
	   scroll falls back to an instant jump in scrollToSection. */
	@media (prefers-reduced-motion: reduce) {
		.rail-label,
		.rail-square {
			transition: none;
		}
	}
</style>
