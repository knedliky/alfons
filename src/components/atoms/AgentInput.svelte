<script lang="ts">
	/**
	 * AgentInput — the canonical surface people use to talk to the agents.
	 *
	 * A prompt field with a custom underscore caret, a body-text field, and a
	 * circular submit affordance. As the field wraps, the box grows downward (eased)
	 * with the skill pill anchored to the top and the submit to the bottom. It is
	 * purely presentational: it owns the look and the input mechanics (keyboard
	 * handling, a hidden mirror that sizes the field to its wrapped text,
	 * accessibility) and emits `oninput`/`onsubmit` — every surface decides what
	 * those mean. A chat surface uses `onsubmit` to send a message; a live-search
	 * surface binds `value`.
	 *
	 * Self-contained and token-only: the frosted-glass surface, the message radius,
	 * and the caption type all come from @motif/design tokens.
	 *
	 * Types and DEFAULT_SKILL live in `./agent-input.ts` — NOT a `<script module>`
	 * here — so this stays a pure component. A runtime value export in a
	 * `<script module>` is silently dropped by Vite's SSR `export *` chain, which
	 * made `AgentInput` unresolvable from the barrel at SSR. See agent-input.ts.
	 */
	import { DEFAULT_SKILL, type AgentInputProps } from './agent-input.js';

	let {
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		autofocus = false,
		ariaLabel = 'Agent input',
		floating = false,
		capToViewport = false,
		skill = DEFAULT_SKILL,
		oninput,
		onsubmit,
		class: className = ''
	}: AgentInputProps = $props();

	let inputElement: HTMLTextAreaElement | undefined = $state();
	let fieldWrapper: HTMLDivElement | undefined = $state();

	// Inline skill pill: its measured width sets how far the first text line is
	// indented so the copy clears the absolutely-positioned pill and then wraps
	// back beneath it (see the markup and the .agent-input-skill rule).
	let skillWidth = $state(0);
	let skillEl: HTMLSpanElement | undefined = $state();
	const SKILL_GAP = 8; // px between the pill and where the first line of text begins
	const skillIndent = $derived(skill && skillWidth ? skillWidth + SKILL_GAP : 0);

	// When the capped field scrolls (long message, or a zoomed-in viewport), the
	// inline pill — absolutely positioned inside the scroll container — rides up
	// with the content and clips to an ugly sliver at the top edge. Fade it out
	// once the field is scrolled away from the top; it returns at the top.
	let scrolledFromTop = $state(false);

	// ── Custom caret ──────────────────────────────────────────────────────────
	// The textarea's native caret is hidden (transparent); we render our own
	// underscore and place it at the real caret index using the mirror-div
	// technique (component/textarea-caret-position): split the mirrored text at
	// the caret, measure a marker's pixel offset, and translate the underscore
	// there. Reusing the already style-matched mirror means no style copying.
	let caretMarker: HTMLSpanElement | undefined = $state();
	let caretEl: HTMLSpanElement | undefined = $state();
	let caretIndex = $state(0);
	let caretFocused = $state(false);
	let lineHeightPx = 0; // cached; cleared on resize
	let fontSizePx = 0; // cached alongside lineHeightPx
	const CARET_HEIGHT = 3; // px — must match .agent-input-caret height

	const beforeCaret = $derived(value.slice(0, caretIndex));
	const afterCaret = $derived(value.slice(caretIndex));
	// The marker carries the after-text so its box begins exactly at the caret and
	// wraps like the textarea; a zero-width space stands in when the caret is at
	// the very end (keeps a measurable position without adding width).
	const caretAnchorText = $derived(afterCaret.length > 0 ? afterCaret : '​');

	function syncCaret() {
		if (inputElement) caretIndex = inputElement.selectionStart ?? 0;
	}

	function positionCaret() {
		if (!caretMarker || !inputElement || !caretEl) return;
		if (!lineHeightPx) {
			const cs = getComputedStyle(inputElement);
			lineHeightPx = parseFloat(cs.lineHeight) || 0;
			fontSizePx = parseFloat(cs.fontSize) || 0;
		}
		// The marker offset is in the wrapper's content coordinates. The caret is an
		// absolute child of that same (scrolling) wrapper, so it scrolls with the
		// content automatically — place it at the content coordinate directly, no
		// scroll subtraction. Sit the bar on the text's bottom edge (em-box bottom
		// within the line box); round so the 3px bar stays crisp, not anti-aliased.
		const textBottom = (lineHeightPx + fontSizePx) / 2;
		const left = Math.round(caretMarker.offsetLeft);
		const top = Math.round(caretMarker.offsetTop + textBottom - CARET_HEIGHT);
		caretEl.style.transform = `translate(${left}px, ${top}px)`;

		// Keep the caret in view on a type/move — mirrors a textarea's native
		// scroll-to-caret. This runs only on caret changes, so it never fights the
		// user wheel-scrolling away (that doesn't re-run positionCaret).
		if (fieldWrapper) {
			const caretTop = caretMarker.offsetTop;
			const caretBottom = caretTop + lineHeightPx;
			if (caretTop < fieldWrapper.scrollTop) {
				fieldWrapper.scrollTop = caretTop;
			} else if (caretBottom > fieldWrapper.scrollTop + fieldWrapper.clientHeight) {
				fieldWrapper.scrollTop = caretBottom - fieldWrapper.clientHeight;
			}
		}

		// Restart the blink so the caret holds solid while moving, then blinks idle.
		caretEl.style.animationName = 'none';
		void caretEl.offsetHeight;
		caretEl.style.animationName = '';
	}

	// Autofocus, or the in-chat input swapping in for a new message, can run the
	// first positionCaret before the inline pill's async width measurement lands —
	// dropping the caret at x=0, in front of the pill. On focus, measure the pill
	// synchronously (which updates the first-line indent), then place the caret on
	// the next frame once that indent has flushed to the DOM. Restores the behaviour
	// of a fresh input.
	function placeCaretAfterPill() {
		if (skillEl) skillWidth = skillEl.offsetWidth;
		requestAnimationFrame(positionCaret);
	}

	// The field grows with its content. Driving an explicit, transitioned height
	// (rather than letting the grid snap to the next line) is what lets the box —
	// and the pill/submit anchored to its top and bottom edges — ease between line
	// counts instead of jumping. When `capToViewport` is set, growth stops a short
	// gap above the viewport bottom and the field scrolls internally instead, so
	// the pill stays in the top corner and the newest text stays in view.
	const VIEWPORT_BOTTOM_GAP = 40; // px kept clear below the box once capped

	function measureField() {
		const el = fieldWrapper;
		if (!el) return;
		el.style.height = 'auto';
		const content = el.scrollHeight;
		let target = content;
		// Cap to a CSS max-height when one is set — an in-chat sticky input uses this
		// to scroll internally past a point rather than grow to fill the screen (its
		// bottom-anchored growth makes capToViewport's top-based maths unusable).
		// Capping the explicit height too, not just leaning on the CSS clamp, keeps
		// the grow/shrink transition — and the snap-back to one line — honest.
		const maxH = parseFloat(getComputedStyle(el).maxHeight);
		if (!Number.isNaN(maxH) && maxH > 0) target = Math.min(target, maxH);
		if (capToViewport) {
			const available = window.innerHeight - el.getBoundingClientRect().top - VIEWPORT_BOTTOM_GAP;
			if (available > 0) target = Math.min(target, available);
		}
		// When capped, the textarea (sized to this height) scrolls itself; the
		// browser keeps the native caret in view, so no manual scroll is needed.
		el.style.height = `${target}px`;
		// Clip (and scroll) only while growth is capped; relaxed to visible
		// otherwise so the floating skill pill can rise a few pixels above the
		// single-line box without being sliced by the wrapper's clip.
		el.style.overflowY = target < content ? 'auto' : 'visible';
	}

	// Height re-measures when the text changes, or when the inline-pill indent
	// shifts (a different first-line width can change how the text wraps).
	$effect(() => {
		void value;
		void skillIndent;
		measureField();
	});

	// The caret repositions on either a text change or a caret move — runs after
	// the measure effect above (definition order) so the height is settled first.
	$effect(() => {
		void value;
		void caretIndex;
		void skillIndent;
		positionCaret();
	});

	// Track caret moves from any source (typing, arrows, click, drag) while focused.
	$effect(() => {
		function onSelectionChange() {
			if (document.activeElement === inputElement) syncCaret();
		}
		document.addEventListener('selectionchange', onSelectionChange);
		return () => document.removeEventListener('selectionchange', onSelectionChange);
	});

	// Re-measure and re-place the caret on viewport resize (cap + line-height).
	$effect(() => {
		const onResize = () => {
			lineHeightPx = 0;
			measureField();
			positionCaret();
		};
		window.addEventListener('resize', onResize);
		return () => window.removeEventListener('resize', onResize);
	});

	function handleSubmit() {
		const trimmed = value.trim();
		if (!trimmed || disabled) return;
		onsubmit?.(trimmed);
	}

	function handleKeydown(event: KeyboardEvent) {
		// Enter submits; Shift+Enter inserts a newline (multi-line prompts).
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}
</script>

<div class="agent-input {className}" class:is-floating={floating}>
	<div
		class="agent-input-field-wrapper"
		class:is-scrolled={scrolledFromTop}
		bind:this={fieldWrapper}
		onscroll={() => {
			if (fieldWrapper) scrolledFromTop = fieldWrapper.scrollTop > 1;
		}}
		style="--skill-indent: {skillIndent}px"
	>
		<!-- Active-skill pill, laid inline at the head of the text: it is absolutely
		     positioned at the field's top-left and the first text line is indented
		     past it (text-indent: --skill-indent), so the copy starts after the pill
		     and wraps back beneath it. The slot a future slash (/) command menu will
		     drive; for now it is a static label set by the caller. -->
		{#if skill}
			<span
				class="agent-input-skill"
				data-skill={skill.id}
				bind:this={skillEl}
				bind:offsetWidth={skillWidth}
			>
				{#if skill.icon}{@render skill.icon()}{/if}
				{skill.label.replace(/_/g, ' ')}
			</span>
		{/if}
		<!-- svelte-ignore a11y_autofocus — primary interaction point on its surface -->
		<textarea
			bind:this={inputElement}
			bind:value
			oninput={(e) => oninput?.(e.currentTarget.value)}
			onkeydown={handleKeydown}
			onfocus={() => {
				caretFocused = true;
				placeCaretAfterPill();
			}}
			onblur={() => (caretFocused = false)}
			{placeholder}
			{disabled}
			{autofocus}
			rows={1}
			autocomplete="off"
			spellcheck="false"
			class="agent-input-field"
			aria-label={ariaLabel}></textarea>
		<!-- Hidden mirror duplicates the value (split at the caret) so the field
		     grows to the wrapped text height AND the marker pins the caret index. -->
		<div class="agent-input-mirror" aria-hidden="true">
			{beforeCaret}<span class="agent-input-caret-anchor" bind:this={caretMarker}
				>{caretAnchorText}</span
			>
		</div>
		<!-- Custom underscore caret — translated to the marker's position. -->
		<span
			class="agent-input-caret"
			class:is-visible={caretFocused}
			bind:this={caretEl}
			aria-hidden="true"
		></span>
	</div>
	<button
		onclick={handleSubmit}
		disabled={disabled || !value.trim()}
		class="agent-input-submit"
		aria-label="Submit"
	>
		<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<path
				d="M2 8L14 8M14 8L9 3M14 8L9 13"
				stroke="currentColor"
				stroke-width="1.5"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
		</svg>
	</button>
</div>

<style>
	/* Frosted-glass prompt surface. The fill, drop shadow, and corner radius are all
	   shared tokens (the chat bubbles draw from the same ones), so the input and the
	   conversation read as one family. */
	.agent-input {
		/* Uniform gap between the surface edge and its inner controls on every side,
		   so the fully-round pill and submit sit balanced in the corners (even
		   margins — they keep their round identity rather than matching the
		   container's corner). Also the vertical breathing room, so it doubles as the
		   box's height knob — dial it to taste. */
		--surface-inset: 0.85rem;
		/* Anchor for the ::before glass layer, and (with z-index) an own stacking
		   context so that negative-z layer can never slip behind an ancestor's
		   background. A plain z-index context does not become a backdrop root, so the
		   glass still samples the whole page behind it. */
		position: relative;
		z-index: 0;
		display: flex;
		/* Top-anchor the row so the first line of text never shifts as the box grows.
		   With centre alignment, a single line gets centred against the taller submit
		   button, then hops to the top when a second line appears. */
		align-items: flex-start;
		gap: var(--space-2);
		width: 100%;
		/* Shared message radius — the largest radius at which a single-line surface
		   keeps straight edges instead of ballooning into a pill. */
		border-radius: var(--radius-message);
		/* Equal padding on all sides — the uniform corner gap for the inner controls. */
		padding: var(--surface-inset);
		box-shadow: var(--shadow-glass);
		transition: border-color var(--transition-normal, 0.2s ease);
	}

	/* The frosted glass (mode-aware tokens) lives on a static child layer, NOT on the
	   element itself, so animations on the surface (the focus border pulse, any
	   future motion) can never hit Chromium's backdrop-clip bug — an animated
	   backdrop-filter element has its backdrop texture clipped to a rectangle,
	   slicing the rounded corners. inset: 0 keeps the layer inside the border ring
	   so the hairline border paints undisturbed above it. */
	.agent-input::before {
		content: '';
		position: absolute;
		inset: 0;
		z-index: -1;
		border-radius: inherit;
		background: var(--surface-glass-bg);
		backdrop-filter: blur(var(--surface-raised-frost));
		-webkit-backdrop-filter: blur(var(--surface-raised-frost));
	}

	/* The pill top-anchors with the row (align-items above); the submit button
	   overrides to ride the bottom edge as the box grows downward. */
	.agent-input .agent-input-submit {
		align-self: flex-end;
	}

	/* A subtle single edge over the glass. */
	:global([data-colour-mode='dark']) .agent-input {
		border: 1px solid color-mix(in srgb, var(--text-primary) 10%, transparent);
	}

	/* Accent edge when focused — a calm focus affordance for the surface. */
	.agent-input:focus-within {
		border-color: color-mix(in srgb, var(--accent) 45%, transparent);
	}

	/* Optional floating identity — carried by the skill pill, not the container.
	   The container itself deliberately holds still: Chromium re-snaps a slow-moving
	   hairline border to the pixel grid roughly once per CSS pixel of travel, which
	   reads as random flashing along the full-width top and bottom edges (and a
	   `top`-based bob steps in whole pixels instead — no better). The pill is
	   small, filled, and mostly curved, so the same re-snapping is imperceptible
	   on it. */
	.agent-input.is-floating .agent-input-skill {
		/* The shared shimmer must be restated — an animation list replaces the
		   shared rule's, it does not extend it. The float keyframes carry the -50%
		   centring baseline for the same reason: they replace the pill's static
		   centring transform. */
		animation:
			agent-input-shimmer 6s ease-in-out infinite alternate,
			agent-input-skill-float 5s ease-in-out infinite;
		will-change: transform;
	}

	/* The focus pulse is the container's only animation — the surface itself never
	   moves, so the pulse repaints a static border and stays artefact-free. */
	.agent-input.is-floating:focus-within {
		animation: agent-input-border-pulse 5s ease-in-out infinite;
	}

	/* Rise only: above the pill sits the container's padding (the wrapper relaxes
	   to overflow visible while uncapped), while below sits the first wrapped text
	   line — dipping would graze its ascenders. */
	@keyframes agent-input-skill-float {
		0%,
		100% {
			transform: translateY(-50%);
		}
		50% {
			transform: translateY(calc(-50% - 3px));
		}
	}

	/* Subtle focus pulse on the border only — the background stays flat (an
	   animated background wash read as too heavy). */
	@keyframes agent-input-border-pulse {
		0%,
		100% {
			border-color: color-mix(in srgb, var(--accent) 35%, transparent);
		}
		50% {
			border-color: color-mix(in srgb, var(--accent) 50%, transparent);
		}
	}

	/* Animated accent surface shared by the skill pill and the submit button, so the
	   input's two accent affordances read as a matched pair: the same height, the same
	   tint, the same drifting diagonal sheen, and the same border pulse. */
	.agent-input-skill,
	.agent-input-submit {
		background-color: color-mix(in srgb, var(--accent) 16%, transparent);
		background-image: linear-gradient(
			115deg,
			color-mix(in srgb, var(--accent) 8%, transparent) 0%,
			color-mix(in srgb, var(--accent) 34%, transparent) 50%,
			color-mix(in srgb, var(--accent) 8%, transparent) 100%
		);
		background-size: 220% 220%;
		border: 1px solid color-mix(in srgb, var(--accent) 35%, transparent);
		/* Matched size — the pill and the submit share a height so they read as the
		   same control. border-box keeps the 1px border inside the 2rem (the submit is
		   also 2rem), so both render at exactly the same height. */
		box-sizing: border-box;
		height: 2rem;
		/* Always fully round — a true stadium on the label, a circle on the square
		   button — whatever the surface's own corner radius. The accent affordances
		   keep their round identity rather than tracking the container; the clean,
		   balanced look comes from the uniform --surface-inset spacing instead. */
		border-radius: var(--radius);
		animation: agent-input-shimmer 6s ease-in-out infinite alternate;
	}

	.agent-input-skill {
		/* Inline at the head of the text: pinned to the field's top-left, vertically
		   centred on the first line. The first line clears it via the field/mirror
		   text-indent, then lines 2+ wrap back underneath. */
		position: absolute;
		left: 0;
		/* Just past half the field's line box (font-size 1.125rem x line-height 1.7
		   ≈ 1.91rem) so the chunky pill sits centred-to-slightly-low on the first
		   line — settled on the text rather than riding high above it. */
		top: 1rem;
		transform: translateY(-50%);
		z-index: 1;
		/* Clicks fall through to the textarea beneath — the pill is a label today.
		   A future interactive slash-command pill would drop this. */
		pointer-events: none;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		letter-spacing: 0.04em;
		/* Pin an explicit line-height so the pill's height is predictable rather than
		   inherited from the page's body leading. Kept chunky; the field's leading
		   below is opened up to give the wrapped line the room this chunk needs. */
		line-height: 1.4;
		/* White label for legibility against the tinted, animated background. */
		color: white;
		padding: var(--space-1) var(--space-3);
		white-space: nowrap;
		/* No radius of its own: the pill inherits the fully-round --radius-pill from
		   the shared .agent-input-skill/.agent-input-submit rule above, so it reads as
		   a true stadium — the same pill shape as ToggleGroup — instead of the blockish
		   --radius-md inner tier it used before.
		   Fade out (rather than clip to a sliver) when the capped field scrolls. */
		transition: opacity 0.15s ease;
	}

	/* Once the field is scrolled off the top, the inline pill would otherwise clip
	   to a thin bar at the top edge — fade it out cleanly; it returns at the top. */
	.agent-input-field-wrapper.is-scrolled .agent-input-skill {
		opacity: 0;
	}

	/* Slow diagonal drift of the sheen, with a gentle border pulse. `alternate`
	   makes the loop seamless without needing a perfectly tiling gradient. */
	@keyframes agent-input-shimmer {
		0% {
			background-position: 0% 0%;
			border-color: color-mix(in srgb, var(--accent) 30%, transparent);
		}
		100% {
			background-position: 100% 100%;
			border-color: color-mix(in srgb, var(--accent) 55%, transparent);
		}
	}

	/* Never distracting for those who opt out — hold still, hold a static tint. */
	@media (prefers-reduced-motion: reduce) {
		/* The pill-float rule is more specific than the bare .agent-input-skill
		   below, so it must be matched here explicitly or the float survives. */
		.agent-input.is-floating .agent-input-skill,
		.agent-input.is-floating:focus-within,
		.agent-input-skill,
		.agent-input-submit {
			animation: none;
		}

		.agent-input-field-wrapper {
			transition: none;
		}
	}

	/* Grid stacking — the textarea and the hidden measuring mirror share one cell so
	   the field grows to the wrapped text height. */
	.agent-input-field-wrapper {
		display: grid;
		/* Positioning context for the absolutely-placed custom caret. */
		position: relative;
		/* minmax(0, 1fr) pins the text column to the flex-allotted width, so a long
		   run of text can't widen the box — it wraps instead. This is what stops the
		   field nudging the container wider as text approaches the edge. */
		grid-template-columns: minmax(0, 1fr);
		flex: 1;
		min-width: 0;
		/* Floor the wrapper at the pill's own height. A single line of field text is
		   shorter than the 2rem skill pill, so without this the pill — absolutely
		   placed inside this overflow-y:auto scroll container — has its rounded
		   bottom clipped by the wrapper's box (most visible in the tall hero input,
		   where the wrapper stays one line at the top). The JS measure effect sets a
		   larger height for multi-line content, so this only floors the single-line
		   case and never fights the growth animation. */
		min-height: 2rem;
		/* THE scroll container once the box is capped — the textarea is full content
		   height (the grid row sizes to the mirror), so it never scrolls itself; the
		   wrapper must, or nothing is user-scrollable. The absolute caret is a child,
		   so it scrolls with the content for free. Visible by DEFAULT so the floating
		   pill can rise past the single-line box without being sliced by the clip;
		   the measure effect flips this to `auto` (clip + scroll) only while growth
		   is actually capped. Scrollbar hidden for a clean look. */
		overflow-y: visible;
		scrollbar-width: none;
		/* Ease the height between line counts with the reveal easing, so the box grows
		   downward and the top/bottom-anchored pill and submit glide rather than
		   snapping. The height itself is set in pixels by the measure effect. */
		transition: height var(--duration-normal) cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.agent-input-field-wrapper::-webkit-scrollbar {
		display: none;
	}

	.agent-input-field,
	.agent-input-mirror {
		grid-area: 1 / 1;
		/* Fill the grid track exactly rather than the textarea's intrinsic `cols`
		   width. A textarea's cols-derived width acts like an explicit width, so it
		   ignores the track and pushes the box wider as text nears the edge unless we
		   pin it to 100% of the available column. */
		width: 100%;
		max-width: 100%;
		min-width: 0;
		box-sizing: border-box;
		/* Typed text reads as body copy, not the technical mono of the skill pill. */
		font-family: var(--font-body);
		font-size: 1.125rem; /* >= 16px prevents iOS Safari auto-zoom; prominent body copy */
		line-height: 1.7; /* roomier leading; also gives the chunky inline pill room before the wrapped line */
		text-align: left; /* explicit — never inherit centring from a hero ancestor */
		/* Indent only the first line so it clears the inline skill pill; driven by the
		   pill's measured width (0 when there is no pill). Applied to the mirror too so
		   its wrap — and the measured height and caret position — match. */
		text-indent: var(--skill-indent, 0px);
		padding: 0;
	}

	.agent-input-field {
		background: transparent;
		border: none;
		outline: none;
		color: var(--text-primary);
		/* Native caret hidden — we render our own underscore at the caret index (see
		   the script's positionCaret). The textarea still owns selection and scroll,
		   so the underscore tracks real arrow/click/insert/delete moves. */
		caret-color: transparent;
		resize: none;
		/* Full content height (never its own scroll container); the wrapper scrolls.
		   Clip rather than show a second scrollbar. */
		overflow: hidden;
	}

	.agent-input-field::placeholder {
		color: var(--text-muted);
	}

	/* Mirror sets the grid-cell height; hidden but laid out. */
	.agent-input-mirror {
		pointer-events: none;
		white-space: pre-wrap;
		/* Break at spaces like the textarea (only long unbreakable runs break mid-
		   word), so the mirror wraps identically and measures the right height. */
		overflow-wrap: break-word;
		visibility: hidden;
	}

	/* Trailing space keeps the mirror's measured height matching the textarea, which
	   reserves room for its caret at the line end. */
	.agent-input-mirror::after {
		content: ' ';
	}

	/* The marker is invisible (its parent mirror is hidden); it only provides a
	   measurable box at the caret index. No layout footprint of its own. */
	.agent-input-caret-anchor {
		display: inline;
	}

	/* Underscore caret. Positioned via transform by positionCaret(); clipped to the
	   field by the wrapper's overflow when the caret scrolls out of view. */
	.agent-input-caret {
		position: absolute;
		top: 0;
		left: 0;
		width: 12px;
		height: 3px;
		background-color: var(--accent);
		pointer-events: none;
		opacity: 0; /* hidden until focused */
		will-change: transform;
	}

	.agent-input-caret.is-visible {
		opacity: 1;
		animation: agent-input-caret-blink 1.06s step-end infinite;
	}

	@keyframes agent-input-caret-blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.agent-input-caret.is-visible {
			animation: none;
		}
	}

	/* Submit button — surface (tint, gradient, border, radius, shimmer) comes from
	   the shared rule above; this owns only layout, the white glyph, and the hover
	   lift. */
	.agent-input-submit {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
		/* Negative TOP margin only: shrinks the 2rem button's contribution to a
		   single-line row (so it never inflates the box) without pulling its bottom
		   edge below the content box. Keeping the bottom margin at 0 leaves the
		   button's bottom gap equal to its right gap (--surface-inset), so it nests
		   symmetrically in the corner once the box has grown to several lines. */
		margin-block: -0.25rem 0;
		color: white;
		cursor: pointer;
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}

	.agent-input-submit:hover:not(:disabled) {
		transform: scale(1.05);
	}

	.agent-input-submit:disabled {
		opacity: 0.3;
		cursor: default;
	}
</style>
