/**
 * The rule set, and the two operations over it.
 *
 * Advisory in v1 (D-159): review returns findings and applyFixes offers
 * corrections, and nothing here fails a build or blocks a commit. Promotion of
 * individual rules to blocking waits until each has been run over real Atlas
 * and Field Notes source and its false-positive rate is known — which is what
 * `bun run rules:baseline` measures.
 *
 * Both operations take and return text, never paths. The server therefore never
 * touches a consumer's filesystem, which is what lets a consumer call it at all.
 */
import { parseSource } from './parse.js';
import { componentRules, libraryFindings } from './components.js';
import { svelte5Rules } from './svelte5.js';
import { tokenRules } from './tokens.js';
import type { Rule, Violation } from './types.js';
import type { Manifest, Surface } from '../manifest/types.js';

export const rules: Rule[] = [...tokenRules, ...componentRules, ...svelte5Rules];

export { libraryFindings };
export type { Rule, Violation };
export type { LibraryFinding } from './components.js';

export interface ReviewResult {
	surface: Surface;
	violations: Violation[];
	/** Non-null when the source could not be parsed. No rule runs in that case:
	 *  reporting against a guessed structure is what C12 rules out. */
	parseError: string | null;
	/** Rules that ran, so a caller can tell an empty result from an inert one. */
	rulesRun: string[];
	advisory: true;
}

export function review(
	source: string,
	manifest: Manifest,
	surface: Surface = 'public'
): ReviewResult {
	const { ast, css, cssOffset, parseError } = parseSource(source);

	if (parseError && !ast) {
		return { surface, violations: [], parseError, rulesRun: [], advisory: true };
	}

	const context = {
		source,
		surface,
		manifest,
		ast,
		css,
		cssOffset,
		tokenNames: new Set(manifest.tokens.map((token) => token.name))
	};

	const violations = rules
		.flatMap((rule) => rule.run(context))
		.sort((a, b) => a.start - b.start || a.rule.localeCompare(b.rule));

	return {
		surface,
		violations,
		parseError,
		rulesRun: rules.map((rule) => rule.id),
		advisory: true
	};
}

export interface FixResult {
	source: string;
	applied: Violation[];
	/** Findings with no mechanical fix. Returned rather than dropped, so the
	 *  caller knows the file is corrected but not clean. */
	remaining: Violation[];
}

/**
 * Apply every fix a rule was willing to prove.
 *
 * Only rules that can show the substitution is value-identical attach a fix —
 * raw-value does when a token holds exactly that literal, and nothing else
 * does. Swapping a retired token for its replacement, or `export let` for
 * `$props()`, changes behaviour or requires a judgement, so those are reported
 * and left alone. That is what makes C7's "rendered output unchanged" a
 * property of the design rather than a hope.
 *
 * Edits are applied last-first so earlier offsets stay valid, and overlapping
 * fixes are dropped rather than composed.
 */
export function applyFixes(
	source: string,
	manifest: Manifest,
	surface: Surface = 'public'
): FixResult {
	const { violations } = review(source, manifest, surface);

	const fixable = violations
		.filter((entry) => entry.fix)
		.sort((a, b) => b.fix!.start - a.fix!.start);

	const applied: Violation[] = [];
	let output = source;
	let lastStart = Number.POSITIVE_INFINITY;

	for (const entry of fixable) {
		const { start, end, replacement } = entry.fix!;
		if (end > lastStart) continue;
		output = output.slice(0, start) + replacement + output.slice(end);
		lastStart = start;
		applied.push(entry);
	}

	const appliedSet = new Set(applied);
	return {
		source: output,
		applied: applied.reverse(),
		remaining: violations.filter((entry) => !appliedSet.has(entry))
	};
}
