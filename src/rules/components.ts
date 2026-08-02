/**
 * Rules about which components are used and how they nest.
 *
 * These read the Svelte AST rather than the text, which is what lets the
 * nesting rule ask a question about ancestry at all. `<Stack><PageFrame/></Stack>`
 * and `<PageFrame><Stack/></PageFrame>` differ only in structure; as text they
 * contain exactly the same tokens.
 */
import { violation, walkSvelte } from './parse.js';
import { LAYOUT_TIER_ORDER } from '../manifest/types.js';
import type { Rule, RuleContext, Violation } from './types.js';

/**
 * Raw elements a library atom already covers.
 *
 * Kept as a map rather than inferred, because the connection between `<button>`
 * and Button is a design decision, not a naming coincidence — and the value
 * side is checked against the manifest at run time, so this cannot outlive the
 * component it names.
 */
const ATOM_FOR_ELEMENT: Record<string, string> = {
	button: 'Button',
	input: 'Input',
	select: 'Select',
	textarea: 'Textarea'
};

export const rawElement: Rule = {
	id: 'raw-element',
	description: 'A bare HTML control where a library atom exists, which loses the token styling.',
	run(context) {
		if (!context.ast) return [];

		const available = new Set(
			context.manifest.components.filter((entry) => entry.exported).map((entry) => entry.name)
		);
		const violations: Violation[] = [];

		walkSvelte(context.ast, (node) => {
			if (node.type !== 'RegularElement') return;
			const atom = ATOM_FOR_ELEMENT[String(node.name)];
			if (!atom || !available.has(atom)) return;

			violations.push(
				violation(
					context.source,
					'raw-element',
					`<${String(node.name)}> is styled from scratch here. ${atom} carries the token ` +
						`styling, the focus behaviour and the admin/public theming.`,
					node.start,
					node.end
				)
			);
		});

		return violations;
	}
};

// ---------------------------------------------------------------------------

/**
 * A layout component nested inside one that belongs further in.
 *
 * The order comes from the same compose-graph depth get_layout_recipe returns,
 * so the rule and the recipe cannot disagree — there is one derivation, not a
 * rule restating a convention. A shell (depth 0) inside a Stack (depth 2) is
 * inverted; the reverse is correct.
 */
export const layoutNesting: Rule = {
	id: 'layout-nesting',
	description: 'A page-level layout nested inside a component that belongs further in.',
	run(context) {
		if (!context.ast) return [];

		// Authored tiers, not the compose graph (D-168). Deriving this from what
		// components render produced an ordering that put PageFrame innermost,
		// because eight of nine layouts render no other layout and a graph with
		// one edge sorts to nonsense rather than to nothing.
		const tier = new Map(
			context.manifest.components
				.filter((entry) => entry.layoutTier)
				.map((entry) => [entry.name, LAYOUT_TIER_ORDER.indexOf(entry.layoutTier!)])
		);

		const violations: Violation[] = [];

		walkSvelte(context.ast, (node, ancestors) => {
			if (node.type !== 'Component') return;
			const own = tier.get(String(node.name));
			if (own === undefined) return;

			for (const ancestor of ancestors) {
				if (ancestor.type !== 'Component') continue;
				const outer = tier.get(String(ancestor.name));
				if (outer === undefined) continue;

				// Outer tiers sort earlier, so an ancestor with a LARGER index is
				// further in than the thing it contains. Equal tiers are fine: a
				// Stack inside a Grid is as ordinary as the reverse, which is the
				// reason D-168 chose tiers over a total order.
				if (outer <= own) continue;

				violations.push(
					violation(
						context.source,
						'layout-nesting',
						`${String(node.name)} is a ${context.manifest.components.find((entry) => entry.name === String(node.name))!.layoutTier} ` +
							`and sits inside ${String(ancestor.name)}, which is a ${context.manifest.components.find((entry) => entry.name === String(ancestor.name))!.layoutTier} — ` +
							`further in. Composition runs outermost first; call get_layout_recipe.`,
						node.start,
						node.end
					)
				);
				break;
			}
		});

		return violations;
	}
};

export const componentRules: Rule[] = [rawElement, layoutNesting];

// ---------------------------------------------------------------------------
// Library-scope checks
// ---------------------------------------------------------------------------

export interface LibraryFinding {
	rule: string;
	subject: string;
	message: string;
}

/**
 * Findings about the library itself rather than about a piece of markup.
 *
 * C9's orphan half and C10 cannot be answered from a snippet — they are
 * questions about the whole manifest — so they are reported here and served by
 * review_library. The markup rules above answer the half of C9 that a snippet
 * can raise, which is a reference to something already retired.
 *
 * `consumers` is passed in rather than discovered, because "no importer across
 * the consuming repos" needs the consuming repos, and this module has no
 * business reading a filesystem. review_library does the walking.
 */
export function libraryFindings(
	manifest: RuleContext['manifest'],
	consumerReferences: { tokens: Set<string>; components: Set<string> } = {
		tokens: new Set(),
		components: new Set()
	}
): LibraryFinding[] {
	const findings: LibraryFinding[] = [];

	for (const token of manifest.tokens) {
		const usedHere = token.referencedBy.length > 0 || token.usedInTokenLayer || token.usedInStories;
		if (usedHere || consumerReferences.tokens.has(token.name)) continue;

		// A lifecycle row is the difference between residue and a decision, so
		// an annotated orphan is not a finding — it is an answered question.
		if (token.lifecycle) continue;

		findings.push({
			rule: 'orphan-token',
			subject: token.name,
			message:
				`${token.name} has no consumer here or in any checked repository, and no lifecycle ` +
				`row. Either record why it is kept, or retire it with a decision.`
		});
	}

	for (const component of manifest.components) {
		if (component.importedBy.length > 0) continue;
		if (consumerReferences.components.has(component.name)) continue;
		if (component.lifecycle) continue;
		// An exported component with no in-repo importer is the normal state for
		// a library, so this only fires once the consumers have been checked too.
		if (!consumerReferences.components.size) continue;

		findings.push({
			rule: 'orphan-component',
			subject: component.name,
			message:
				`${component.name} is exported but imported by nothing, here or in any checked ` +
				`repository. A failed promotion is as worth knowing as a failed retirement.`
		});
	}

	for (const name of manifest.tailwindShadowed) {
		findings.push({
			rule: 'tailwind-shadow',
			subject: name,
			message:
				`${name} is defined by both Alfons and Tailwind v4's default @theme. Whichever is ` +
				`imported last wins, and nothing reports the substitution.`
		});
	}

	return findings;
}
