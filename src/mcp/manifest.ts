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
const EXPECTED_SCHEMA_VERSION = 3;

export const ROOT = join(import.meta.dirname, '..', '..');
const MANIFEST_PATH = join(ROOT, 'alfons.manifest.json');
const SOURCE_DIR = join(ROOT, 'src');

/** Newest mtime under a directory, ignoring what the generator never reads. */
function newestModification(dir: string): number {
	let newest = 0;
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		if (entry.name === 'mcp' || entry.name === 'node_modules') continue;
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
	if (existsSync(SOURCE_DIR)) {
		const manifestAge = statSync(MANIFEST_PATH).mtimeMs;
		if (newestModification(SOURCE_DIR) > manifestAge) {
			throw new Error(
				'Manifest is older than the source tree. Run `bun run manifest`. Serving the ' +
					'stale copy would answer confidently about components as they used to be.'
			);
		}
	}

	return manifest;
}

/**
 * Where the catalogue is published, for the story links get_component returns.
 *
 * Defaults to the local Storybook dev server, because that is the one address
 * guaranteed to exist. AL-006 puts the built catalogue behind the gateway at
 * /alfons, and this is the variable that then points at it.
 */
export function storybookBase(): string {
	return (process.env.ALFONS_STORYBOOK_URL ?? 'http://localhost:6006').replace(/\/$/, '');
}

export { dirname };
