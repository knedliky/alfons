/**
 * The shape of a design rule.
 *
 * Uniform on purpose: D-159 makes every rule advisory in v1, with promotion to
 * blocking deferred until each has a measured false-positive rate. That
 * promotion is only cheap if rules are interchangeable, so a rule declares its
 * id, its message and its position and decides nothing about what happens next.
 */
import type { Root as CssRoot } from 'postcss';
import type { Manifest, Surface } from '../manifest/types.js';

/** A svelte AST node. The compiler's types are not exported in a usable form. */
export type SvelteNode = Record<string, unknown> & { type: string; start: number; end: number };

export interface Fix {
	/** Absolute offsets into the reviewed source. */
	start: number;
	end: number;
	replacement: string;
}

export interface Violation {
	/** Stable rule id, e.g. `raw-value`. Stable because D-159 promotes rules
	 *  individually, and a promotion list is written in terms of these. */
	rule: string;
	message: string;
	line: number;
	column: number;
	start: number;
	end: number;
	/** Present when the correction is unambiguous. A rule that can name the
	 *  right answer offers a fix; one that can only say something is wrong
	 *  does not, and apply_fixes leaves it alone. */
	fix?: Fix;
}

export interface RuleContext {
	source: string;
	surface: Surface;
	manifest: Manifest;
	/** Parsed markup. Null only if the source failed to parse, in which case
	 *  no markup rule runs — reporting violations against a guessed structure
	 *  is exactly what C12 forbids. */
	ast: SvelteNode | null;
	/** Parsed contents of the <style> block, if any. */
	css: CssRoot | null;
	/** Absolute offset of the style block's content, for mapping postcss
	 *  positions back onto the original source. */
	cssOffset: number;
	/** Every token name the manifest knows, for membership tests. */
	tokenNames: Set<string>;
}

export interface Rule {
	id: string;
	/** What the rule is for, in one line. Surfaced by review_markup so a caller
	 *  can tell why a finding matters without reading the source. */
	description: string;
	run(context: RuleContext): Violation[];
}
