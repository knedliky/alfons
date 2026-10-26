/**
 * List semantic tokens whose whole value is a var() of another semantic token.
 *
 * Under D-238 a theme author sets semantic tokens, and a role with two names
 * defeats that: the author cannot tell which name to set, and a theme that
 * sets one leaves the other pointing at the default. AL-026 gave each role one
 * name and retired the rest. This script keeps it that way.
 *
 * An alias that survives must say why it is a different role, with a comment
 * that starts `@role`. Such a comment covers either the declaration on the
 * same line before it, or every declaration after it up to the next comment
 * on a line of its own, so one comment can introduce a family:
 *
 *   /* @role component tokens: a theme restyles Card plates here *\/
 *   --card-bg: var(--surface-card);
 *   --card-border: var(--border-hairline);
 *
 *   --radius: var(--radius-2); /* @role form controls *\/
 *
 * An alias of a primitive is not listed: mapping a role onto the palette is
 * what a semantic token is for. Nor is a var() with a fallback, which is more
 * than a second name.
 *
 * Layers come from alfons.manifest.json, so run `bun run manifest` after
 * adding a token file. Values come from the tree, parsed with postcss and
 * postcss-value-parser rather than matched as text.
 *
 * Run: bun run scripts/find-token-aliases.ts          unjustified aliases; exit 1 if any
 *      bun run scripts/find-token-aliases.ts --all    every alias, with its stated role
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import postcss, { type Container, type Declaration } from 'postcss';
import valueParser from 'postcss-value-parser';
import type { Manifest, TokenLayer } from '../src/manifest/types.ts';

const ROOT = join(import.meta.dirname, '..');
const TOKENS_DIR = join(ROOT, 'src', 'tokens');
const ROLE_MARKER = /^@role\b\s*([\s\S]*)$/;

interface TokenAlias {
	name: string;
	target: string;
	location: string;
	role: string | null;
}

function cssFiles(directory: string): string[] {
	return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
		const path = join(directory, entry.name);
		if (entry.isDirectory()) return cssFiles(path);
		return entry.name.endsWith('.css') ? [path] : [];
	});
}

/** The token a value names, when the value is nothing but `var(--x)`. */
function bareVarTarget(value: string): string | null {
	const isMeaningful = (node: valueParser.Node) => node.type !== 'space' && node.type !== 'comment';
	const nodes = valueParser(value).nodes.filter(isMeaningful);
	if (nodes.length !== 1) return null;

	const [node] = nodes;
	if (node.type !== 'function' || node.value !== 'var') return null;

	const args = node.nodes.filter(isMeaningful);
	if (args.length !== 1 || args[0].type !== 'word') return null;
	return args[0].value;
}

function roleText(text: string): string | null {
	const marker = text.trim().match(ROLE_MARKER);
	return marker ? marker[1].replace(/\s+/g, ' ').trim() : null;
}

/**
 * Pair every custom-property declaration in a container with the `@role`
 * comment that covers it, recursing into nested rules and at-rules with their
 * own scope, so a role never leaks out of the block that states it.
 */
function declarationsWithRoles(
	container: Container,
	found: { decl: Declaration; role: string | null }[] = []
): { decl: Declaration; role: string | null }[] {
	let familyRole: string | null = null;
	let previous: { decl: Declaration; role: string | null } | null = null;

	for (const node of container.nodes ?? []) {
		if (node.type === 'comment') {
			const isTrailing =
				previous !== null && node.source?.start?.line === previous.decl.source?.end?.line;
			if (isTrailing) {
				previous!.role = roleText(node.text) ?? previous!.role;
				continue;
			}
			familyRole = roleText(node.text);
			continue;
		}
		if (node.type === 'decl' && node.prop.startsWith('--')) {
			previous = { decl: node, role: familyRole };
			found.push(previous);
			continue;
		}
		if (node.type === 'rule' || node.type === 'atrule') declarationsWithRoles(node, found);
	}
	return found;
}

function findTokenAliases(): TokenAlias[] {
	const manifest = JSON.parse(readFileSync(join(ROOT, 'alfons.manifest.json'), 'utf8')) as Manifest;
	const layers = new Map<string, TokenLayer>(
		manifest.tokens.map((token) => [token.name, token.layer])
	);
	const aliases = new Map<string, TokenAlias>();

	for (const file of cssFiles(TOKENS_DIR)) {
		const root = postcss.parse(readFileSync(file, 'utf8'), { from: file });
		for (const { decl, role } of declarationsWithRoles(root)) {
			const target = bareVarTarget(decl.value);
			if (!target) continue;

			const nameLayer = layers.get(decl.prop);
			if (nameLayer === undefined) {
				throw new Error(
					`${decl.prop} is defined in src/tokens but missing from the manifest. ` +
						'Run `bun run manifest`, then this script again.'
				);
			}
			if (nameLayer !== 'semantic' || layers.get(target) !== 'semantic') continue;

			const location = `${relative(TOKENS_DIR, file)}:${decl.source?.start?.line ?? 0}`;
			// The same alias in a narrower scope (reduced motion, an overlay
			// theme) is one role, not two; report the first definition.
			const key = `${decl.prop}->${target}`;
			if (!aliases.has(key)) aliases.set(key, { name: decl.prop, target, location, role });
		}
	}
	return [...aliases.values()].sort((a, b) => a.name.localeCompare(b.name));
}

const showAll = process.argv.includes('--all');
const aliases = findTokenAliases();
const unjustified = aliases.filter((alias) => alias.role === null);

for (const alias of showAll ? aliases : unjustified) {
	const role = alias.role === null ? 'NO @role COMMENT' : alias.role;
	console.log(`${alias.location.padEnd(26)} ${alias.name} -> ${alias.target}  [${role}]`);
}
if (showAll) {
	console.log(`\n${aliases.length} aliases, ${unjustified.length} without a stated role.`);
}
process.exit(unjustified.length === 0 ? 0 : 1);
