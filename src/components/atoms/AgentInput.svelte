<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/** A skill/tool/action the input is operating under, rendered as a pill on
	 *  the left of the field. Structured (not a bare string) so it slots into
	 *  the future slash-command registry of selectable skills.
	 *
	 *  `label` is stored in command form (snake_case, e.g. `search_occupations`);
	 *  underscores render as spaces in the pill. */
	export interface AgentSkill {
		id: string;
		label: string;
		/** Optional leading glyph rendered before the label. */
		icon?: Snippet;
	}

	/** The default skill — what the input shows when the caller specifies none
	 *  (this is the HeroChatInput's skill). Pass `skill={null}` to hide the pill. */
	export const DEFAULT_SKILL: AgentSkill = { id: 'ask_me_anything', label: 'ask_me_anything' };

	export interface AgentInputProps {
		/** Current field value. Bindable — the parent owns the value lifecycle
		 *  (live filtering binds it; chat surfaces clear it after submit). */
		value?: string;
		placeholder?: string;
		disabled?: boolean;
		/** Focus the field on mount — useful where the input is the primary action. */
		autofocus?: boolean;
		ariaLabel?: string;
		/** Apply the gentle floating bob and the focus-glow pulse. Owned by the
		 *  component, opted into per surface (the homepage hero floats; the
		 *  Merlin search sits still). */
		floating?: boolean;
		/** Active skill pill, shown on the left. Defaults to DEFAULT_SKILL; pass
		 *  `null` to hide the pill entirely. Today the caller sets it (Merlin
		 *  locks it to `search_occupations`); a future slash (/) command menu
		 *  will let users switch the active skill in this same slot. */
		skill?: AgentSkill | null;
		/** Fires on every keystroke with the new value (for live-filter surfaces). */
		oninput?: (value: string) => void;
		/** Fires when the user submits (Enter without Shift, or the arrow button). */
		onsubmit?: (value: string) => void;
		/** Applied to the pill root so callers can layer surface treatments
		 *  (e.g. the homepage hero's floating animation). */
		class?: string;
	}
</script>

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
	 */

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
	<!-- Active-skill pill. The slot a future slash (/) command menu will drive;
	     for now it is a static label set by the caller. -->
	{#if skill}
		<span class="agent-input-skill" data-skill={skill.id}>
			{#if skill.icon}{@render skill.icon()}{/if}
			{skill.label.replace(/_/g, ' ')}
		</span>
	{/if}
	<div class="agent-input-field-wrapper">
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
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		border-radius: var(--radius-bubble);
		padding: 0.75rem 1.25rem;
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
		border-radius: 999px;
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
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		/* Breathing room between the pill and where the typed text begins. */
		margin-right: 0.4rem;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		letter-spacing: 0.04em;
		/* White label for legibility against the tinted, animated background. */
		color: white;
		padding: 0.2rem 0.6rem;
		white-space: nowrap;
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
		flex: 1;
		min-width: 0;
	}

	.agent-input-field,
	.agent-input-mirror {
		grid-area: 1 / 1;
		font-family: var(--font-mono);
		font-size: 1rem; /* >= 16px prevents iOS Safari auto-zoom on focus */
		line-height: 1.5;
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
