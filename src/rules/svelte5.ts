/**
 * Svelte 4 idioms that Svelte 5 replaced.
 *
 * Read from the instance script's ESTree body, not matched in text. `export let`
 * appears inside strings and comments; `$:` appears in template literals and in
 * any CSS containing a `$` (a jQuery-ish class name is enough). The parser
 * knows the difference between a LabeledStatement and the characters `$:`.
 *
 * None of these carry a fix. `export let a, b;` becomes one destructuring in a
 * `$props()` call that may already exist, `$:` becomes `$derived` or `$effect`
 * depending on whether the body has side effects, and `createEventDispatcher`
 * becomes a callback prop that has to be named. Each is a judgement, and
 * apply_fixes only makes changes it can prove are equivalent (C7).
 */
import { violation } from './parse.js';
import type { Rule, RuleContext, SvelteNode, Violation } from './types.js';

interface EstreeNode {
	type: string;
	start: number;
	end: number;
	[key: string]: unknown;
}

/** The instance script's top-level statements, or nothing. */
function instanceBody(context: RuleContext): EstreeNode[] {
	const instance = (context.ast as { instance?: { content?: { body?: EstreeNode[] } } } | null)
		?.instance;
	return instance?.content?.body ?? [];
}

/** Walk every node of an ESTree subtree. */
function walkEstree(node: EstreeNode, visit: (node: EstreeNode) => void): void {
	visit(node);
	for (const value of Object.values(node)) {
		if (Array.isArray(value)) {
			for (const item of value) {
				if (item && typeof item === 'object' && 'type' in item)
					walkEstree(item as EstreeNode, visit);
			}
		} else if (value && typeof value === 'object' && 'type' in value) {
			walkEstree(value as EstreeNode, visit);
		}
	}
}

export const svelte5Runes: Rule = {
	id: 'svelte5-runes',
	description: 'Svelte 4 reactivity in a Svelte 5 codebase: export let, $:, createEventDispatcher.',
	run(context) {
		const violations: Violation[] = [];

		for (const statement of instanceBody(context)) {
			// `export let x` — an ExportNamedDeclaration wrapping a declaration.
			// `export const` is a legitimate Svelte 5 module export, so the check
			// is on the declaration kind, not on the export.
			if (
				statement.type === 'ExportNamedDeclaration' &&
				(statement.declaration as EstreeNode | undefined)?.type === 'VariableDeclaration' &&
				(statement.declaration as { kind?: string }).kind === 'let'
			) {
				violations.push(
					violation(
						context.source,
						'svelte5-runes',
						'`export let` declares a prop the Svelte 4 way. Use `$props()`.',
						statement.start,
						statement.end
					)
				);
			}

			if (
				statement.type === 'LabeledStatement' &&
				(statement.label as { name?: string })?.name === '$'
			) {
				violations.push(
					violation(
						context.source,
						'svelte5-runes',
						'`$:` is Svelte 4 reactivity. Use `$derived()` for a value, `$effect()` for ' +
							'a side effect — the distinction `$:` left implicit.',
						statement.start,
						statement.end
					)
				);
			}
		}

		// createEventDispatcher can be imported and never called, or called via
		// an alias, so both the import and the call site are worth reporting.
		for (const statement of instanceBody(context)) {
			walkEstree(statement, (node) => {
				const isImport =
					node.type === 'ImportSpecifier' &&
					(node.imported as { name?: string })?.name === 'createEventDispatcher';
				const isCall =
					node.type === 'CallExpression' &&
					(node.callee as { name?: string })?.name === 'createEventDispatcher';
				if (!isImport && !isCall) return;

				violations.push(
					violation(
						context.source,
						'svelte5-runes',
						'`createEventDispatcher` is removed in Svelte 5. Pass a callback prop, or use ' +
							'a plain DOM event.',
						node.start,
						node.end
					)
				);
			});
		}

		return violations.sort((a, b) => a.start - b.start);
	}
};

export const svelte5Rules: Rule[] = [svelte5Runes];

export type { SvelteNode };
