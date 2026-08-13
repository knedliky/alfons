/**
 * Load alfons.manifest.json, or refuse to start.
 *
 * AL-004 C6. The failure this guards against is specific: an MCP server that
 * answers from a missing or stale manifest does not look broken, it looks
 * authoritative. `find_components` returns nothing and the calling agent
 * concludes the library has no such component — then writes its own. Silence
 * from a lookup service is indistinguishable from a true negative, so every
 * doubt has to become a refusal to start instead.
 */
import { readFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import type { Manifest } from '../manifest/types.js';

/** Must match SCHEMA_VERSION in scripts/generate-manifest.ts. */
const EXPECTED_SCHEMA_VERSION = 5;

export const ROOT = join(import.meta.dirname, '..', '..');
export const MANIFEST_PATH = join(ROOT, 'alfons.manifest.json');
/**
 * The directories the generator reads, and therefore the only ones whose
 * mtimes can make the manifest stale.
 *
 * A whitelist rather than a blacklist, because the first version excluded
 * src/mcp by name and then reported the manifest stale the moment src/rules
 * appeared — the manifest was fine, and the check was wrong. Listing what is
 * read cannot go wrong that way: a new directory is not a source of staleness
 * until the generator is taught to read it, and teaching it means editing this
 * list too.
 */
const WATCHED = ['components', 'tokens', 'stories'].map((name) => join(ROOT, 'src', name));

/** Newest mtime under a directory. */
function newestModification(dir: string): number {
	let newest = 0;
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const full = join(dir, entry.name);
		newest = Math.max(
			newest,
			entry.isDirectory() ? newestModification(full) : statSync(full).mtimeMs
		);
	}
	return newest;
}

export function loadManifest(): Manifest {
	if (!existsSync(MANIFEST_PATH)) {
		throw new Error(
			`No manifest at ${MANIFEST_PATH}. Run \`bun run manifest\`, which needs the ` +
				`context database — see D-162 for why half of it cannot come from the tree.`
		);
	}

	let manifest: Manifest;
	try {
		manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Manifest;
	} catch (cause) {
		throw new Error(`Manifest at ${MANIFEST_PATH} is not valid JSON.`, { cause });
	}

	if (manifest.schemaVersion !== EXPECTED_SCHEMA_VERSION) {
		throw new Error(
			`Manifest is schema version ${manifest.schemaVersion}, this server expects ` +
				`${EXPECTED_SCHEMA_VERSION}. Regenerate it rather than serving fields that moved.`
		);
	}

	if (!manifest.components?.length || !manifest.tokens?.length) {
		throw new Error('Manifest has no components or no tokens, which cannot be right.');
	}
	if (!Array.isArray(manifest.designDecisions)) {
		throw new Error('Manifest has no designDecisions array for schema version 5.');
	}

	// A component that failed to parse is absent from the manifest, and absent
	// is exactly what an agent reads as "does not exist". The generator already
	// exits non-zero on this; refusing here too covers a manifest committed
	// from a build where that exit was ignored.
	if (manifest.unparsed?.length) {
		throw new Error(
			`Manifest records ${manifest.unparsed.length} unparsed component(s): ` +
				`${manifest.unparsed.join(', ')}. Answering while these are missing would ` +
				`report them as nonexistent.`
		);
	}

	// Staleness by mtime rather than by re-parsing. The tools deliberately never
	// read a .svelte file — a call is a lookup, not a parse — but a stat is
	// cheap and turns "stale" from a schema check into a real one. Skipped when
	// the source tree is absent, which is legitimate: a consumer may have only
	// the published files.
	const manifestAge = statSync(MANIFEST_PATH).mtimeMs;
	for (const dir of WATCHED.filter(existsSync)) {
		if (newestModification(dir) <= manifestAge) continue;
		throw new Error(
			`Manifest is older than ${dir}. Run \`bun run manifest\`. Serving the stale copy ` +
				'would answer confidently about components as they used to be.'
		);
	}

	return manifest;
}

/**
 * Keep one coherent snapshot per call, but adopt an atomically replaced
 * manifest between calls. A failed reload is thrown and retried next time;
 * serving the previous snapshot as though it were current would recreate the
 * silent-staleness failure this loader exists to prevent.
 *
 * Dependency injection keeps the state transition directly testable without
 * rewriting the real generated file.
 */
export function reloadingManifest(
	load: () => Manifest = loadManifest,
	version: () => number = () => statSync(MANIFEST_PATH).mtimeMs
): () => Manifest {
	let current = load();
	let loadedVersion = version();

	return () => {
		const availableVersion = version();
		if (availableVersion === loadedVersion) return current;

		const replacement = load();
		current = replacement;
		loadedVersion = availableVersion;
		return current;
	};
}

/**
 * Where the catalogue is published, for the story links get_component returns.
 *
 * The always-live catalogue, served as a static mount by Atlas's local Caddy
 * (D-170) — not by the gateway, whose bearer token a browser cannot supply for
 * a static site's own subresources, and whose 0.0.0.0 bind would have put the
 * catalogue on the network for reach nobody wanted.
 *
 * `*.localhost` resolves to 127.0.0.1 on whichever machine asks, so this
 * address is meaningful only here. That is the intended reach: the catalogue is
 * read from this workstation and nowhere else.
 *
 * Override with ALFONS_STORYBOOK_URL to point at `bun run storybook` on :6006
 * while iterating on a story.
 */
export function storybookBase(): string {
	return (process.env.ALFONS_STORYBOOK_URL ?? 'https://atlas.localhost/alfons').replace(/\/$/, '');
}

export { dirname };
