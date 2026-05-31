/**
 * AgentInput types and constants.
 *
 * These live in a plain `.ts` module (not AgentInput.svelte's `<script module>`)
 * on purpose: Vite's SSR `export *` re-export chain silently drops a `.svelte`
 * module's exports when that module carries a runtime *value* export in
 * `<script module>`. Keeping the runtime `DEFAULT_SKILL` here — and leaving
 * AgentInput.svelte as a pure component (default export only) — lets both the
 * component and these symbols propagate through `@motif/design`'s barrel at SSR.
 */
import type { Snippet } from 'svelte';

/** A skill/tool/action the input is operating under, rendered as a pill on the
 *  left of the field. Structured (not a bare string) so it slots into the
 *  future slash-command registry of selectable skills.
 *
 *  `label` is stored in command form (snake_case, e.g. `search_occupations`);
 *  underscores render as spaces in the pill. */
export interface AgentSkill {
	id: string;
	label: string;
	/** Optional leading glyph rendered before the label. */
	icon?: Snippet;
}

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
	 *  component, opted into per surface (the homepage hero floats; the Merlin
	 *  search sits still). */
	floating?: boolean;
	/** Active skill pill, shown on the left. Defaults to DEFAULT_SKILL; pass
	 *  `null` to hide the pill entirely. Today the caller sets it (Merlin locks
	 *  it to `search_occupations`); a future slash (/) command menu will let
	 *  users switch the active skill in this same slot. */
	skill?: AgentSkill | null;
	/** Fires on every keystroke with the new value (for live-filter surfaces). */
	oninput?: (value: string) => void;
	/** Fires when the user submits (Enter without Shift, or the arrow button). */
	onsubmit?: (value: string) => void;
	/** Applied to the pill root so callers can layer surface treatments (e.g.
	 *  the homepage hero's floating animation). */
	class?: string;
}

/** The default skill — what the input shows when the caller specifies none
 *  (this is the HeroChatInput's skill). Pass `skill={null}` to hide the pill. */
export const DEFAULT_SKILL: AgentSkill = { id: 'ask_me_anything', label: 'ask_me_anything' };
