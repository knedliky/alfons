/**
 * Turn source text into the structures the rules read.
 *
 * The whole of C12 lives here. During AL-001 verification a hand-rolled grep
 * for token references was wrong twice — first on tabs, then on greedy prefix
 * matching, where `--border` matched `--border-glass` — and it could not tell
 * a component-local custom property from a design token, a fallback argument
 * from a reference, or a `style:` directive from either. None of those are
 * regex bugs that a better regex fixes; they are all the same bug, which is
 * that the text does not carry the structure.
 *
 * So: the Svelte compiler parses the markup, postcss parses the style block,
 * and rules walk nodes.
 */
import { parse } from 'svelte/compiler';
import postcss, { type Root as CssRoot } from 'postcss';
import valueParser from 'postcss-value-parser';
import type { SvelteNode, Violation } from './types.js';

/**
 * A `var()` reference recovered from a parsed value.
 *
 * `fallback` matters because `var(--x, 1rem)` is legal when --x is unknown —
 * the author has supplied the default deliberately — so the unknown-token rule
 * must not fire on it. Text scanning cannot see the difference.
 */
export interface TokenReference {
	name: string;
	/** Absolute offset of the name within the reviewed source. */
	start: number;
	end: number;
	hasFallback: boolean;
}

/**
 * Walk a parsed CSS value and collect every var() reference.
 *
 * Recursive because var() nests: `var(--a, var(--b))` has two references, and
 * only the outer one has a fallback.
 */
export function tokenReferencesIn(value: string, offset: number): TokenReference[] {
	const found: TokenReference[] = [];

	const walk = (nodes: valueParser.Node[]): void => {
		for (const node of nodes) {
			if (node.type === 'function' && node.value === 'var') {
				const [first, ...rest] = node.nodes;
				if (first?.type === 'word' && first.value.startsWith('--')) {
					found.push({
						name: first.value,
						start: offset + first.sourceIndex,
						end: offset + first.sourceIndex + first.value.length,
						// A comma separator followed by anything is a fallback.
						hasFallback: rest.some((argument) => argument.type !== 'div')
					});
				}
				walk(node.nodes);
			} else if ('nodes' in node && Array.isArray(node.nodes)) {
				walk(node.nodes as valueParser.Node[]);
			}
		}
	};

	walk(valueParser(value).nodes);
	return found;
}

/** Line and column for an absolute offset, both 1-based. */
export function positionAt(source: string, offset: number): { line: number; column: number } {
	const before = source.slice(0, offset);
	const line = before.split('\n').length;
	const column = offset - (before.lastIndexOf('\n') + 1) + 1;
	return { line, column };
}

/** Build a violation, filling in the position from the offset. */
export function violation(
	source: string,
	rule: string,
	message: string,
	start: number,
	end: number,
	fix?: Violation['fix']
): Violation {
	return { rule, message, ...positionAt(source, start), start, end, ...(fix ? { fix } : {}) };
}

/**
 * Depth-first walk over the Svelte AST, parents first.
 *
 * `ancestors` is handed to the visitor because the layout-nesting rule is
 * entirely a question about ancestry, and reconstructing it from offsets after
 * the fact would be guesswork.
 */
export function walkSvelte(
	node: SvelteNode,
	visit: (node: SvelteNode, ancestors: SvelteNode[]) => void,
	ancestors: SvelteNode[] = []
): void {
	visit(node, ancestors);

	const nested = [...ancestors, node];
	for (const value of Object.values(node)) {
		if (Array.isArray(value)) {
			for (const item of value) {
				if (item && typeof item === 'object' && 'type' in item) {
					walkSvelte(item as SvelteNode, visit, nested);
				}
			}
		} else if (value && typeof value === 'object' && 'type' in value) {
			walkSvelte(value as SvelteNode, visit, nested);
		}
	}
}

/**
 * Token references living outside the `<style>` block.
 *
 * The baseline run found this gap by returning zero for retired-token while
 * Atlas had three components referencing the deprecated --color-full. They were
 * invisible because a style block is not the only place a token is named:
 *
 *     accent: 'var(--color-full)'          a string in the instance script
 *     <div style="color: var(--x)">        an attribute value
 *
 * Still structural, not textual. The Svelte and ESTree parsers find the string
 * and the attribute; the value parser reads what is inside them. The rule that
 * matters for C12 is that nothing guesses where a value begins — and here
 * nothing does, because a Literal node knows exactly where it starts.
 */
export function tokenReferencesOutsideStyle(ast: SvelteNode): TokenReference[] {
	const found: TokenReference[] = [];

	walkSvelte(ast, (node) => {
		// `value` on a Literal, `data` on a Text node. Read through the index
		// signature rather than asserted to a shape, because SvelteNode carries
		// neither and TypeScript is right to object to the pretence.
		const carrier = node.type === 'Literal' ? node.value : node.type === 'Text' ? node.data : null;
		if (typeof carrier !== 'string' || !carrier.includes('var(--')) return;

		// A Literal's offset points at the opening quote, so the string's own
		// first character is one further in. A Text node has no delimiter.
		found.push(...tokenReferencesIn(carrier, node.start + (node.type === 'Literal' ? 1 : 0)));
	});

	return found;
}

export interface ParsedSource {
	ast: SvelteNode | null;
	css: CssRoot | null;
	cssOffset: number;
	/** Set when the source could not be parsed. Reported to the caller rather
	 *  than thrown: unparseable markup is a fact about the input, and a review
	 *  tool that throws on it is less useful than one that says so. */
	parseError: string | null;
}

export function parseSource(source: string): ParsedSource {
	let ast: SvelteNode;

	try {
		ast = parse(source, { modern: true }) as unknown as SvelteNode;
	} catch (error) {
		return {
			ast: null,
			css: null,
			cssOffset: 0,
			parseError: error instanceof Error ? error.message : String(error)
		};
	}

	// The style block's content carries its own absolute offset, so postcss
	// positions can be mapped back onto the original source rather than onto
	// the extracted fragment.
	const style = (ast as { css?: { content?: { start: number; styles: string } } }).css?.content;
	if (!style) return { ast, css: null, cssOffset: 0, parseError: null };

	try {
		return {
			ast,
			css: postcss.parse(style.styles),
			cssOffset: style.start,
			parseError: null
		};
	} catch (error) {
		return {
			ast,
			css: null,
			cssOffset: 0,
			parseError: `style block: ${error instanceof Error ? error.message : String(error)}`
		};
	}
}
