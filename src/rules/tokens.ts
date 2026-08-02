/**
 * Rules about token use in a style block.
 *
 * Every one of these walks postcss nodes and parsed values. That is not
 * fastidiousness — it is the four things a grep got wrong during AL-001
 * verification, each of which is a fixture in scripts/test-rules.ts:
 *
 *   tabs             indentation is not part of a declaration
 *   greedy prefixes  --border must not match --border-glass
 *   local properties a component defining --dp-bg is not using a design token
 *   fallbacks        var(--x, 1rem) is legal when --x is unknown
 */
import type { Declaration } from 'postcss';
import { tokenReferencesIn, tokenReferencesOutsideStyle, violation } from './parse.js';
import type { TokenReference } from './parse.js';
import type { Rule, RuleContext, Violation } from './types.js';

/** Every custom property the reviewed source defines for itself. */
function localProperties(context: RuleContext): Set<string> {
	const local = new Set<string>();
	context.css?.walkDecls((decl) => {
		if (decl.prop.startsWith('--')) local.add(decl.prop);
	});
	return local;
}

/** Absolute offset of a declaration's value within the reviewed source. */
function valueOffset(decl: Declaration, cssOffset: number): number {
	const declStart = decl.source?.start?.offset ?? 0;
	return cssOffset + declStart + decl.toString().indexOf(decl.value);
}

/**
 * Run a visitor over every var() reference in the component.
 *
 * Both the style block and everywhere else a token can be named — script string
 * literals and attribute values. Restricting this to the style block made
 * retired-token report zero across all of Atlas while three components were
 * referencing a deprecated token from a script literal, which is the kind of
 * clean result that looks like success.
 */
function eachReference(context: RuleContext, visit: (reference: TokenReference) => void): void {
	context.css?.walkDecls((decl) => {
		for (const reference of tokenReferencesIn(decl.value, valueOffset(decl, context.cssOffset))) {
			visit(reference);
		}
	});
	if (context.ast) {
		for (const reference of tokenReferencesOutsideStyle(context.ast)) visit(reference);
	}
}

// ---------------------------------------------------------------------------

/**
 * Colour and length literals where a token says the same thing.
 *
 * Reports every raw value, but only names a replacement when a token holds
 * exactly that value — and only then is a fix offered, because only then is
 * the substitution provably output-identical (C7).
 */
export const rawValue: Rule = {
	id: 'raw-value',
	description:
		'A literal colour or length in a style block. Tokens exist so a value is stated once; ' +
		'a literal is how two surfaces drift apart without either changing.',
	run(context) {
		const violations: Violation[] = [];

		// Value -> token, for the exact-match lookup. Built once per review.
		const byValue = new Map<string, string>();
		for (const token of context.manifest.tokens) {
			const normalised = normalise(token.value);
			if (normalised && !byValue.has(normalised)) byValue.set(normalised, token.name);
		}

		context.css?.walkDecls((decl) => {
			const offset = valueOffset(decl, context.cssOffset);

			for (const literal of literalsIn(decl.value)) {
				const equivalent = byValue.get(normalise(literal.text));
				const start = offset + literal.index;
				const end = start + literal.text.length;

				violations.push(
					equivalent
						? violation(
								context.source,
								'raw-value',
								`${literal.text} is exactly ${equivalent}. Use var(${equivalent}).`,
								start,
								end,
								{ start, end, replacement: `var(${equivalent})` }
							)
						: violation(
								context.source,
								'raw-value',
								`${literal.text} is a literal ${literal.kind} and no token holds that ` +
									`value. Add one, or use the nearest existing token.`,
								start,
								end
							)
				);
			}
		});

		return violations;
	}
};

/** Lower-case, expand three-digit hex, collapse whitespace. */
function normalise(value: string): string {
	const trimmed = value.trim().toLowerCase();
	const short = trimmed.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
	return short ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}` : trimmed;
}

interface Literal {
	text: string;
	index: number;
	kind: string;
}

/**
 * Colour and length literals in a declaration value.
 *
 * Scanning the value string is safe in a way scanning the source is not: by
 * this point the CSS parser has already established that this IS a value, so
 * there is no question of matching inside a selector, a comment or a
 * `style:` directive. The structural work is done; this is lexing what remains.
 *
 * Hairlines are exempt. 1px and 2px borders are everywhere, no token holds
 * them, and reporting each one would bury the findings that matter — the sort
 * of noise D-159's calibration period exists to catch, caught up front.
 */
function literalsIn(value: string): Literal[] {
	const found: Literal[] = [];

	const push = (pattern: RegExp, kind: string, keep: (text: string) => boolean = () => true) => {
		for (const match of value.matchAll(pattern)) {
			if (keep(match[0])) found.push({ text: match[0], index: match.index, kind });
		}
	};

	push(/#[0-9a-fA-F]{3,8}\b/g, 'colour');
	push(/\brgba?\([^)]*\)/g, 'colour');
	push(/\bhsla?\([^)]*\)/g, 'colour');
	push(/\b\d*\.?\d+px\b/g, 'length', (text) => {
		const size = Number.parseFloat(text);
		return size > 2;
	});

	return found.sort((a, b) => a.index - b.index);
}

// ---------------------------------------------------------------------------

/**
 * An --admin-* token on a public surface.
 *
 * Nothing in the CSS stops this: admin.css and public.css both define into
 * :root, so both sets are present at runtime and the browser resolves either
 * happily. The manifest's surface field is the only place the distinction
 * exists, which is what makes this a rule rather than a type error.
 */
export const adminTokenLeak: Rule = {
	id: 'admin-token-on-public',
	description: 'An admin-only token used on a public surface, which the cascade will not catch.',
	run(context) {
		if (context.surface !== 'public') return [];

		const bySurface = new Map(context.manifest.tokens.map((token) => [token.name, token.surface]));
		const violations: Violation[] = [];

		eachReference(context, (reference) => {
			if (bySurface.get(reference.name) !== 'admin') return;
			violations.push(
				violation(
					context.source,
					'admin-token-on-public',
					`${reference.name} is defined for admin surfaces only. It resolves here because ` +
						`admin.css and public.css both define into :root, not because it is legal.`,
					reference.start,
					reference.end
				)
			);
		});

		return violations;
	}
};

// ---------------------------------------------------------------------------

/**
 * A var() naming nothing.
 *
 * Three exemptions, and each one is a case the AL-001 grep got wrong: a
 * property the component defines for itself, a reference carrying a fallback,
 * and a name the lifecycle table knows about (which retiredToken reports
 * properly instead).
 */
export const unknownToken: Rule = {
	id: 'unknown-token',
	description:
		'A var() reference to a custom property that is neither a token nor locally defined.',
	run(context) {
		const local = localProperties(context);
		const tombstoned = new Set(
			context.manifest.tombstones
				.filter((entry) => entry.kind === 'token')
				.map((entry) => entry.name)
		);
		const violations: Violation[] = [];

		eachReference(context, (reference) => {
			if (context.tokenNames.has(reference.name)) return;
			if (local.has(reference.name)) return;
			if (reference.hasFallback) return;
			if (tombstoned.has(reference.name)) return;

			violations.push(
				violation(
					context.source,
					'unknown-token',
					`${reference.name} is not a design token and is not defined in this component. ` +
						`It will resolve to nothing.`,
					reference.start,
					reference.end
				)
			);
		});

		return violations;
	}
};

// ---------------------------------------------------------------------------

/**
 * A token that was retired.
 *
 * The payoff of the lifecycle table (AL-009 C5). Without it this name is simply
 * unknown, and the advice an agent gets is "that does not exist" — which is
 * true and useless. With it, the answer is what to use instead and which
 * decision said so.
 */
export const retiredToken: Rule = {
	id: 'retired-token',
	description: 'A token that was deliberately retired, reported with its replacement and decision.',
	run(context) {
		const tombstones = new Map(
			context.manifest.tombstones
				.filter((entry) => entry.kind === 'token')
				.map((entry) => [entry.name, entry.lifecycle])
		);
		const deprecated = new Map(
			context.manifest.tokens
				.filter((token) => token.lifecycle && token.lifecycle.status !== 'live')
				.map((token) => [token.name, token.lifecycle!])
		);
		const violations: Violation[] = [];

		eachReference(context, (reference) => {
			const lifecycle = tombstones.get(reference.name) ?? deprecated.get(reference.name);
			if (!lifecycle) return;

			const advice = lifecycle.replacement ? ` Use ${lifecycle.replacement}.` : '';
			const provenance = lifecycle.decisionId ? ` (${lifecycle.decisionId})` : '';

			violations.push(
				violation(
					context.source,
					'retired-token',
					`${reference.name} is ${lifecycle.status}: ${lifecycle.reason}${advice}${provenance}`,
					reference.start,
					reference.end
				)
			);
		});

		return violations;
	}
};

// ---------------------------------------------------------------------------

/**
 * A token Tailwind also defines.
 *
 * Reproduces the --font-mono case: Tailwind v4's default @theme defines it,
 * Alfons defines it, and which one a surface gets depends on import order.
 * Nothing errors, nothing warns, and the brand face is quietly replaced —
 * which is how it survived across four Atlas surfaces until someone saw it.
 */
export const tailwindShadow: Rule = {
	id: 'tailwind-shadow',
	description: 'A token whose name collides with a Tailwind v4 @theme default.',
	run(context) {
		const shadowed = new Set(context.manifest.tailwindShadowed);
		if (!shadowed.size) return [];

		const violations: Violation[] = [];
		eachReference(context, (reference) => {
			if (!shadowed.has(reference.name)) return;
			violations.push(
				violation(
					context.source,
					'tailwind-shadow',
					`${reference.name} is also defined by Tailwind v4's default @theme. Which one ` +
						`applies depends on import order, so this may not resolve to the Alfons value.`,
					reference.start,
					reference.end
				)
			);
		});
		return violations;
	}
};

export const tokenRules: Rule[] = [
	rawValue,
	adminTokenLeak,
	unknownToken,
	retiredToken,
	tailwindShadow
];
