<script lang="ts">
	/**
	 * AgentInput — the canonical surface people use to talk to the agents.
	 *
	 * A pill-shaped prompt field with a blinking underscore cursor that tracks
	 * the typed text, a monospace field, and a circular submit affordance. It is
	 * purely presentational: it owns the look and the input mechanics (keyboard
	 * handling, cursor mirror, accessibility) and emits `oninput`/`onsubmit` —
	 * every surface decides what those mean. The homepage hero uses `onsubmit`
	 * to send a chat message; the Merlin explorer binds `value` for live search.
	 *
	 * Self-contained by design (no FloatingPill dependency) and token-only, so
	 * it can be promoted into @motif/design without rework.
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
		skill = DEFAULT_SKILL,
		oninput,
		onsubmit,
		class: className = ''
	}: AgentInputProps = $props();

	let inputElement: HTMLTextAreaElement | undefined = $state();

	// Inline skill pill: its measured width sets how far the first text line is
	// indented so the copy clears the absolutely-positioned pill and wraps back
	// beneath it (see the markup and the .agent-input-skill rule).
	let skillWidth = $state(0);
	const SKILL_GAP = 8; // px between the pill and where the first line of text begins
	const skillIndent = $derived(skill && skillWidth ? skillWidth + SKILL_GAP : 0);

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
	<div class="agent-input-field-wrapper" style="--skill-indent: {skillIndent}px">
		<!-- Active-skill pill, laid inline at the head of the text: absolutely
		     positioned at the field's top-left, with the first text line indented
		     past it (text-indent: --skill-indent) so the copy starts after the pill
		     and wraps back beneath it. A future slash (/) command menu will drive
		     this slot; for now it is a static label set by the caller. -->
		{#if skill}
			<span class="agent-input-skill" data-skill={skill.id} bind:offsetWidth={skillWidth}>
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
			{placeholder}
			{disabled}
			{autofocus}
			rows={1}
			autocomplete="off"
			spellcheck="false"
			class="agent-input-field"
			aria-label={ariaLabel}
		></textarea>
		<!-- Hidden mirror duplicates the value so the cursor tracks text width. -->
		<div class="agent-input-mirror" aria-hidden="true">{value}<span class="agent-input-cursor"></span></div>
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
	/* Pill surface. Radius and padding match the chat message bubbles so the
	   input looks consistent when text wraps. Surface treatment (glass, border,
	   shadow) is replicated from the FloatingPill primitive in token form so
	   this component carries no Atlas-only dependency. */
	.agent-input {
		/* Container corner radius. Tuned to the largest value at which a single-line
		   surface keeps straight edges instead of clamping to a pill, so it matches
		   the chat message bubbles that share this radius in Atlas. */
		--surface-radius: 1.25rem;
		/* Uniform gap between the surface edge and its inner controls on every side,
		   so the fully-round pill and submit sit balanced in the corners (even
		   margins — they keep their round identity rather than matching the
		   container's corner). This is also the vertical breathing room, so it
		   doubles as the box's height knob — dial it to taste. */
		--surface-inset: 0.85rem;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		border-radius: var(--surface-radius);
		/* Equal padding on all sides — this is the uniform corner gap that lets the
		   pill and submit nest concentrically. */
		padding: var(--surface-inset);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		transition: border-color var(--transition-normal, 0.2s ease);
	}

	/* Dark mode — translucent glass with a subtle edge and floaty shadow. */
	:global([data-colour-mode='dark']) .agent-input {
		background: color-mix(in srgb, var(--bg-glass-solid) 85%, transparent);
		border: 1px solid color-mix(in srgb, var(--text-primary) 10%, transparent);
		box-shadow:
			0 4px 16px rgba(0, 0, 0, 0.2),
			0 2px 4px rgba(0, 0, 0, 0.1);
	}

	/* Light mode — warm glass with directional borders for a raised feel. */
	:global([data-colour-mode='light']) .agent-input {
		background: color-mix(in srgb, var(--card-bg) 90%, transparent);
		border-top: 1px solid var(--card-border-top);
		border-left: 1px solid var(--card-border-left);
		border-right: 1px solid var(--card-border-right);
		border-bottom: 1px solid var(--card-border-bottom);
		box-shadow:
			var(--card-shadow-hover),
			0 6px 20px rgba(201, 193, 181, 0.3);
	}

	/* Accent edge when focused — a calm focus affordance for either surface. */
	.agent-input:focus-within {
		border-color: color-mix(in srgb, var(--accent) 45%, transparent);
	}

	/* Optional floating motion — a gentle vertical bob, with a soft accent wash
	   layered on while focused. Opted into via the `floating` prop. */
	.agent-input.is-floating {
		animation: agent-input-float 4s ease-in-out infinite;
	}

	.agent-input.is-floating:focus-within {
		animation:
			agent-input-float 4s ease-in-out infinite,
			agent-input-bg-pulse 5s ease-in-out infinite;
	}

	@keyframes agent-input-float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-3px);
		}
	}

	@keyframes agent-input-bg-pulse {
		0%,
		100% {
		}
		50% {
			background-color: color-mix(in srgb, var(--accent) 12%, transparent);
		}
	}

	/* Active-skill pill — accent-tinted chip on the left, matching the page's
	   weighted-mode indicator so the agent surfaces read as one family. */
	/* Animated accent surface shared by the skill pill and the submit button,
	   so the input's two accent affordances read as a matched pair: the same
	   tint, the same drifting diagonal sheen, the same border pulse, and the
	   same full radius (a true pill on the label, a circle on the square
	   button). */
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
		/* Always fully round — a true stadium on the label, a circle on the square
		   button — whatever the surface's own corner radius. The accent affordances
		   keep their round identity rather than tracking the container (a deliberate
		   break from concentric nesting, which would square them off); the clean,
		   balanced look comes from the uniform --surface-inset spacing instead. */
		border-radius: var(--radius-pill, 999px);
		animation: agent-input-shimmer 6s ease-in-out infinite alternate;
	}

	/* Light mode — the faint tint that reads as deep red over the dark glass
	   turns pale pink over the warm light surface, washing out the white label
	   and glyph. Use a saturated accent fill so white stays legible; the sheen
	   becomes a darker travelling band rather than a lighter one. */
	:global([data-colour-mode='light']) .agent-input-skill,
	:global([data-colour-mode='light']) .agent-input-submit {
		background-color: var(--accent);
		background-image: linear-gradient(
			115deg,
			color-mix(in srgb, var(--accent) 75%, black) 0%,
			var(--accent) 50%,
			color-mix(in srgb, var(--accent) 75%, black) 100%
		);
		border-color: color-mix(in srgb, var(--accent) 70%, white);
	}

	.agent-input-skill {
		/* Inline at the head of the text: pinned to the field's top-left, vertically
		   centred on the first line. The first line clears it via the field/mirror
		   text-indent, then lines 2+ wrap back underneath. */
		position: absolute;
		left: 0;
		/* Just past half the field's line box (font-size 1rem x line-height 1.7 =
		   1.7rem) so the chunky pill sits centred-to-slightly-low on the first line —
		   settled on the text rather than riding high above it. */
		top: 0.9rem;
		transform: translateY(-50%);
		z-index: 1;
		/* Clicks fall through to the textarea beneath — the pill is a label today. */
		pointer-events: none;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.04em;
		/* Pin an explicit line-height so the pill's height is predictable rather than
		   inherited from the page's body leading. Kept chunky (taller than the slim
		   variant); the field's leading below is opened up to give the wrapped line
		   the room this chunk needs. */
		line-height: 1.4;
		/* White label for legibility against the tinted, animated background. */
		color: white;
		padding: 0.25rem 0.75rem;
		white-space: nowrap;
		/* Rounded-rectangle corners that join the inputs' family rather than the
		   full stadium it would otherwise share with the submit button. A literal
		   1.25rem (the container radius) would clamp to a stadium at this height, so
		   it's scaled to the same proportional roundness instead. */
		border-radius: 0.6rem;
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
		.agent-input.is-floating,
		.agent-input.is-floating:focus-within,
		.agent-input-skill,
		.agent-input-submit {
			animation: none;
		}
	}

	/* Grid stacking — textarea and mirror share one cell for pixel-perfect
	   cursor alignment. */
	.agent-input-field-wrapper {
		display: grid;
		/* Positioning context for the inline skill pill. */
		position: relative;
		flex: 1;
		min-width: 0;
	}

	.agent-input-field,
	.agent-input-mirror {
		grid-area: 1 / 1;
		font-family: var(--font-mono);
		font-size: 1rem; /* >= 16px prevents iOS Safari auto-zoom on focus */
		line-height: 1.7; /* roomier leading; also gives the chunky inline pill room before the wrapped line */
		/* Indent only the first line so it clears the inline skill pill; driven by
		   the pill's measured width (0 when there is no pill). Applied to the mirror
		   too so its wrap matches. */
		text-indent: var(--skill-indent, 0px);
		padding: 0;
	}

	.agent-input-field {
		background: transparent;
		border: none;
		outline: none;
		color: var(--text-primary);
		caret-color: transparent;
		resize: none;
		overflow: hidden;
	}

	.agent-input-field::placeholder {
		color: var(--text-muted);
	}

	/* Mirror sets the grid-cell height; hidden but laid out. */
	.agent-input-mirror {
		pointer-events: none;
		white-space: pre-wrap;
		word-break: break-word;
		visibility: hidden;
	}

	/* Trailing space ensures the cell accounts for the cursor at line end. */
	.agent-input-mirror::after {
		content: ' ';
	}

	/* Underscore cursor — mirrors the Motivka logo's bar. */
	.agent-input-cursor {
		display: inline-block;
		width: 12px;
		height: 2px;
		background-color: var(--accent);
		vertical-align: text-bottom;
		visibility: visible;
		opacity: 1;
	}

	/* Blink only when focused — signals the field is active. */
	.agent-input:focus-within .agent-input-cursor {
		animation: agent-input-blink 0.8s step-end infinite;
	}

	@keyframes agent-input-blink {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0;
		}
	}

	/* Submit button — surface (tint, gradient, border, radius, shimmer) comes
	   from the shared rule above; this owns only layout, the white glyph, and
	   the hover lift. */
	.agent-input-submit {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2rem;
		height: 2rem;
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
