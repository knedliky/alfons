/**
 * Generate alfons.manifest.json from the source tree.
 *
 * The manifest is what the MCP server answers from. Serving it from a generated
 * file rather than parsing .svelte on every call keeps a tool call a lookup, and
 * keeps the source tree the single authority — regenerating against an unchanged
 * tree must produce a byte-identical file, so drift is a diff (AL-003 C7).
 *
 * Props are read from the components themselves, never from dist/. The
 * declarations there are hand-typed literals in vite.config.ts covering 13 of 83
 * components (AL-011), so reading them would make the manifest a copy of a copy.
 *
 * Two entry points, because the manifest has two kinds of fact in it (D-162):
 *
 *   bun run manifest        parse the tree, join authored lifecycle from the
 *                           context database, write the file. Needs Postgres.
 *   bun run manifest:check  parse the tree and compare only the derived fields
 *                           against the committed file. Needs nothing, which is
 *                           what CI runs — a runner has no database, and a
 *                           gate that silently emitted an unannotated manifest
 *                           would report drift on every build.
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';
import postcss from 'postcss';
import ts from 'typescript';
import { rows } from './psql.ts';
import type {
	Manifest,
	ComponentEntry,
	TokenEntry,
	PropEntry,
	PropsSource,
	Surface,
	Lifecycle,
	Tombstone
} from '../src/manifest/types.ts';

const ROOT = join(import.meta.dirname, '..');
const COMPONENTS_DIR = join(ROOT, 'src/components');
const TOKENS_DIR = join(ROOT, 'src/tokens');
const STORIES_DIR = join(ROOT, 'src/stories');
const OUT = join(ROOT, 'alfons.manifest.json');

const SCHEMA_VERSION = 2;

/** Aggregates rather than defines, so its @import lines are not definitions. */
const TOKEN_ENTRY_MANIFEST = 'public.css';

function walk(dir: string, predicate: (path: string) => boolean): string[] {
	const found: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) found.push(...walk(full, predicate));
		else if (predicate(full)) found.push(full);
	}
	return found.sort();
}

// ---------------------------------------------------------------------------
// Tokens
// ---------------------------------------------------------------------------

/**
 * Surface is decided by the defining file, not by the selector. Both admin.css
 * and the public token files define into `:root` under `@layer base`, so there
 * is nothing in the rule itself to distinguish them.
 */
function surfaceForFile(file: string): Surface {
	return basename(file) === 'admin.css' ? 'admin' : 'public';
}

/**
 * Parse the token layer with a real CSS parser rather than by line.
 *
 * Line-based scanning silently dropped seven tokens whose values span multiple
 * lines — --elevation-1 through -3, --ease-spring and --ease-spring-wobbly,
 * whose linear() easing curve runs to twenty lines. They were not reported as
 * failures; they were simply absent, which is the worst way for a manifest to
 * be wrong. postcss joins a declaration's value regardless of how it is wrapped.
 */
function collectTokens(): { tokens: TokenEntry[]; usedInTokenLayer: Set<string> } {
	const files = walk(TOKENS_DIR, (path) => path.endsWith('.css'));
	const tokens = new Map<string, TokenEntry>();
	const usedInTokenLayer = new Set<string>();

	for (const file of files) {
		const filename = basename(file);
		if (filename === TOKEN_ENTRY_MANIFEST) continue;

		const root = postcss.parse(readFileSync(file, 'utf8'), { from: file });

		root.walkDecls((decl) => {
			// Every var() in the token layer is a consumer. A token used only by
			// another token is used — treating it as orphaned reported --frost-1
			// and the whole elevation ladder as dead.
			for (const match of decl.value.matchAll(/var\((--[a-z0-9-]+)/g)) {
				usedInTokenLayer.add(match[1]);
			}

			if (!decl.prop.startsWith('--')) return;
			// First definition wins; later ones are overrides in narrower scopes.
			if (tokens.has(decl.prop)) return;
			tokens.set(decl.prop, {
				name: decl.prop,
				// Collapse whitespace: a multi-line value carries its source
				// indentation, so a purely cosmetic reformat of the token files
				// would otherwise churn the manifest and trip the drift gate for
				// no semantic change.
				value: decl.value.replace(/\s+/g, ' ').trim(),
				file: relative(TOKENS_DIR, file),
				category: filename.replace(/\.css$/, ''),
				surface: surfaceForFile(file),
				referencedBy: [],
				usedInTokenLayer: false,
				usedInStories: false,
				lifecycle: null
			});
		});
	}
	return { tokens: [...tokens.values()], usedInTokenLayer };
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

/** Pull the contents of a <script> block, optionally the `module` one. */
function scriptBlock(source: string, module: boolean): string | null {
	const pattern = module
		? /<script[^>]*\bmodule\b[^>]*>([\s\S]*?)<\/script>/
		: /<script(?![^>]*\bmodule\b)[^>]*>([\s\S]*?)<\/script>/;
	return source.match(pattern)?.[1] ?? null;
}

/**
 * Read props from an exported `*Props` interface using the TypeScript parser.
 *
 * Deliberately not a regular expression. A union type containing a semicolon or
 * a nested object literal defeats line-splitting, and the AL-001 verification
 * established what happens when structure is guessed from text.
 */
function propsFromInterface(moduleScript: string): PropEntry[] | null {
	const file = ts.createSourceFile('m.ts', moduleScript, ts.ScriptTarget.Latest, true);
	let props: PropEntry[] | null = null;

	file.forEachChild((node) => {
		if (!ts.isInterfaceDeclaration(node) || !node.name.text.endsWith('Props')) return;
		props = node.members.filter(ts.isPropertySignature).map((member) => ({
			name: member.name.getText(file),
			type: member.type?.getText(file),
			optional: Boolean(member.questionToken)
		}));
	});
	return props;
}

/**
 * Fall back to the `$props()` destructuring when no interface is declared.
 *
 * Ten components take this path. It recovers names and defaults but no types,
 * which is why propsSource is recorded — an absent type here means "not stated
 * in a form this can read", not "untyped".
 */
function propsFromDestructuring(instanceScript: string): PropEntry[] | null {
	const file = ts.createSourceFile('i.ts', instanceScript, ts.ScriptTarget.Latest, true);
	let props: PropEntry[] | null = null;

	const visit = (node: ts.Node): void => {
		if (
			ts.isVariableDeclaration(node) &&
			ts.isObjectBindingPattern(node.name) &&
			node.initializer &&
			ts.isCallExpression(node.initializer) &&
			node.initializer.expression.getText(file) === '$props'
		) {
			props = node.name.elements
				.filter((element) => !element.dotDotDotToken)
				.map((element) => ({
					name: (element.propertyName ?? element.name).getText(file),
					optional: Boolean(element.initializer),
					defaultValue: element.initializer?.getText(file)
				}));
		}
		ts.forEachChild(node, visit);
	};
	visit(file);
	return props;
}

/** Storybook derives an id by kebab-casing the title and joining its segments. */
function storyIdFromTitle(title: string): string {
	return title
		.toLowerCase()
		.replace(/[/\s]+/g, '-')
		.replace(/[^a-z0-9-]/g, '');
}

function collectStoryIds(): Map<string, string> {
	const byComponent = new Map<string, string>();
	const files = walk(STORIES_DIR, (path) => /\.stories\.(svelte|ts|js)$/.test(path));

	for (const file of files) {
		const source = readFileSync(file, 'utf8');
		const title = source.match(/title:\s*['"]([^'"]+)['"]/)?.[1];
		if (!title) continue;

		// Prefer the declared subject over the first import. Radio.stories
		// imports both Radio and RadioGroup but declares `component: RadioGroup`,
		// so first-import-wins only agreed with it by accident of ordering.
		const declared = source.match(/component:\s*(\w+)/)?.[1];
		const imported = source.match(
			/import\s+(\w+)\s+from\s+['"][^'"]*\/components\/[^'"]+\.svelte['"]/
		)?.[1];

		const subject = declared ?? imported;
		if (!subject) continue;
		if (!byComponent.has(subject)) byComponent.set(subject, storyIdFromTitle(title));
	}
	return byComponent;
}

function collectComponents(): { components: ComponentEntry[]; unparsed: string[] } {
	const files = walk(COMPONENTS_DIR, (path) => path.endsWith('.svelte'));
	const storyIds = collectStoryIds();
	const barrels = walk(COMPONENTS_DIR, (path) => path.endsWith('index.ts'))
		.map((path) => readFileSync(path, 'utf8'))
		.join('\n');

	const components: ComponentEntry[] = [];
	const unparsed: string[] = [];

	for (const file of files) {
		const source = readFileSync(file, 'utf8');
		const name = basename(file, '.svelte');
		const moduleScript = scriptBlock(source, true);
		const instanceScript = scriptBlock(source, false);

		// A component with no script block at all is not "props: []" — it is
		// unread, and saying so is the point of C5.
		if (!moduleScript && !instanceScript) {
			unparsed.push(relative(ROOT, file));
			continue;
		}

		let props: PropEntry[] | null = null;
		let propsSource: PropsSource = 'none';

		if (moduleScript) props = propsFromInterface(moduleScript);
		if (props) propsSource = 'interface';
		else if (instanceScript) {
			props = propsFromDestructuring(instanceScript);
			if (props) propsSource = 'destructuring';
		}

		const tokensUsed = [
			...new Set([...source.matchAll(/var\((--[a-z0-9-]+)/g)].map((match) => match[1]))
		].sort();

		const composes = [
			...new Set(
				[...source.matchAll(/import\s+(\w+)\s+from\s+['"][^'"]*\.svelte['"]/g)].map(
					(match) => match[1]
				)
			)
		].sort();

		components.push({
			name,
			category: relative(COMPONENTS_DIR, dirname(file)),
			path: relative(ROOT, file),
			propsSource,
			props: (props ?? []).sort((a, b) => a.name.localeCompare(b.name)),
			tokensUsed,
			composes,
			importedBy: [],
			exported: new RegExp(`\\b${name}\\b`).test(barrels),
			storyId: storyIds.get(name) ?? null,
			lifecycle: null
		});
	}
	return { components, unparsed };
}

// ---------------------------------------------------------------------------
// Reverse indexes — who consumes what
// ---------------------------------------------------------------------------

/**
 * Built from the same parse rather than a second pass, so the forward and
 * reverse views cannot disagree. An entry with no consumer is the signal the
 * orphan rules read: 111 tokens had none at the time this was written.
 */
function linkConsumers(components: ComponentEntry[], tokens: TokenEntry[]): void {
	const tokenIndex = new Map(tokens.map((token) => [token.name, token]));
	const componentIndex = new Map(components.map((component) => [component.name, component]));

	for (const component of components) {
		for (const token of component.tokensUsed) {
			tokenIndex.get(token)?.referencedBy.push(component.name);
		}
		for (const child of component.composes) {
			componentIndex.get(child)?.importedBy.push(component.name);
		}
	}

	for (const token of tokens) token.referencedBy.sort();
	for (const component of components) component.importedBy.sort();
}

// ---------------------------------------------------------------------------
// Derived facts — everything above, assembled
// ---------------------------------------------------------------------------

/** Sorted throughout and carrying no timestamp, so an unchanged tree yields an
 *  identical file and CI can fail on the diff (C7). */
function buildDerived(): Manifest {
	const { tokens, usedInTokenLayer } = collectTokens();
	const { components, unparsed } = collectComponents();
	linkConsumers(components, tokens);

	const usedInStories = new Set(
		walk(STORIES_DIR, (path) => /\.stories\.(svelte|ts|js)$/.test(path))
			.flatMap((path) => [...readFileSync(path, 'utf8').matchAll(/var\((--[a-z0-9-]+)/g)])
			.map((match) => match[1])
	);

	for (const token of tokens) {
		token.usedInTokenLayer = usedInTokenLayer.has(token.name);
		token.usedInStories = usedInStories.has(token.name);
	}

	return {
		schemaVersion: SCHEMA_VERSION,
		components: components.sort((a, b) => a.name.localeCompare(b.name)),
		tokens: tokens.sort((a, b) => a.name.localeCompare(b.name)),
		tombstones: [],
		unparsed: unparsed.sort()
	};
}

// ---------------------------------------------------------------------------
// Authored facts — the alfons schema in the context database (D-162)
// ---------------------------------------------------------------------------

/**
 * Read every lifecycle row, keyed `kind:name`.
 *
 * Postgres is a BUILD-time dependency and never a runtime one. Nothing that
 * consumes the manifest — the MCP server, Atlas, Field Notes — opens a
 * connection; they read the emitted file, which is the same reason the gateway
 * exists. That is also why this throws rather than degrading: a manifest
 * missing its lifecycle annotations is indistinguishable from one where nothing
 * has been retired, and would quietly tell an agent that --radius-md is simply
 * unknown rather than replaced by --radius under D-160.
 */
function readLifecycle(): Map<string, Lifecycle> {
	// recorded_on is a date, and ::text keeps it one — casting through a
	// timestamp would let a timezone shift churn the manifest by a day.
	const records = rows<{ kind: string; name: string } & Lifecycle>(`
		select coalesce(json_agg(row order by row.kind, row.name), '[]')
		from (
			select kind::text,
			       name,
			       status::text,
			       replacement_name as replacement,
			       reason,
			       decision_id as "decisionId",
			       recorded_on::text as "recordedOn"
			from alfons.lifecycle
		) as row
	`);

	return new Map(
		records.map(({ kind, name, ...lifecycle }) => [`${kind}:${name}`, lifecycle as Lifecycle])
	);
}

/**
 * Attach each judgement to its subject, and tombstone the ones with none.
 *
 * A lifecycle row with no derived counterpart is not an error: it is the normal
 * end state of a retirement that finished cleaning up. Emitting it keeps the
 * answer available after the definition is gone.
 */
function applyLifecycle(manifest: Manifest, lifecycle: Map<string, Lifecycle>): void {
	const claimed = new Set<string>();

	for (const token of manifest.tokens) {
		const key = `token:${token.name}`;
		token.lifecycle = lifecycle.get(key) ?? null;
		if (token.lifecycle) claimed.add(key);
	}
	for (const component of manifest.components) {
		const key = `component:${component.name}`;
		component.lifecycle = lifecycle.get(key) ?? null;
		if (component.lifecycle) claimed.add(key);
	}

	manifest.tombstones = [...lifecycle]
		.filter(([key]) => !claimed.has(key))
		.map(([key, entry]) => {
			const [kind, ...rest] = key.split(':');
			return { kind: kind as Tombstone['kind'], name: rest.join(':'), lifecycle: entry };
		})
		.sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// Entry points
// ---------------------------------------------------------------------------

/**
 * Strip the authored half back out.
 *
 * `manifest:check` compares this projection of the committed file against a
 * fresh parse of the tree, which is what lets CI gate drift on a runner with no
 * database. It catches a component or token added without regenerating; it
 * cannot catch a lifecycle row edited in Postgres without regenerating, which
 * is caught instead by the full run that wrote the row.
 */
function derivedOnly(manifest: Manifest): Manifest {
	return {
		schemaVersion: manifest.schemaVersion,
		components: manifest.components.map((entry) => ({ ...entry, lifecycle: null })),
		tokens: manifest.tokens.map((entry) => ({ ...entry, lifecycle: null })),
		tombstones: [],
		unparsed: manifest.unparsed
	};
}

function reportUnparsed(manifest: Manifest): void {
	if (!manifest.unparsed.length) return;
	console.error(`\n${manifest.unparsed.length} component(s) could not be parsed:`);
	for (const path of manifest.unparsed) console.error(`  ${path}`);
	process.exit(1);
}

const derived = buildDerived();

if (process.argv.includes('--check')) {
	const committed = JSON.parse(readFileSync(OUT, 'utf8')) as Manifest;
	const expected = JSON.stringify(derivedOnly(derived), null, 2);
	const actual = JSON.stringify(derivedOnly(committed), null, 2);

	if (expected !== actual) {
		console.error(
			'alfons.manifest.json is stale: its derived facts do not match the source tree.\n' +
				'Run `bun run manifest` (which needs the context database) and commit the result.'
		);
		process.exit(1);
	}
	console.log(
		`manifest: derived facts current — ${derived.components.length} components, ` +
			`${derived.tokens.length} tokens`
	);
	reportUnparsed(derived);
} else {
	applyLifecycle(derived, readLifecycle());
	writeFileSync(OUT, `${JSON.stringify(derived, null, 2)}\n`);

	const unannotatedOrphans = derived.tokens.filter(
		(token) =>
			token.referencedBy.length === 0 &&
			!token.usedInTokenLayer &&
			!token.usedInStories &&
			!token.lifecycle
	).length;
	const noProps = derived.components.filter((entry) => entry.propsSource === 'none').length;

	console.log(
		`manifest: ${derived.components.length} components, ${derived.tokens.length} tokens ` +
			`(${unannotatedOrphans} with no consumer and no lifecycle row), ` +
			`${derived.tombstones.length} tombstones, ${noProps} with no readable props`
	);
	reportUnparsed(derived);
}
