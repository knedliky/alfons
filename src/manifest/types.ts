/**
 * The shape of alfons.manifest.json.
 *
 * This file holds DERIVED facts only — everything here is recomputable from the
 * source tree, which is why it lives in the repo rather than a database and why
 * drift is detectable by regenerating and diffing (D-162). Authored facts about
 * lifecycle — whether a token is retired, what replaced it, which decision said
 * so — come from Postgres and are joined on at build time by AL-009.
 */

/** Which UI surface a token is legal on. Determined by the file it is defined
 *  in, not by its selector: admin.css and public.css both define into :root. */
export type Surface = 'public' | 'admin';

/**
 * Where a component's props were recovered from.
 *
 * Recorded rather than inferred because the two paths give different fidelity,
 * and a consumer of the manifest should be able to tell which it is looking at.
 * `interface` yields names and types; `destructuring` yields names only;
 * `none` means the component takes no props or could not be read, which is a
 * fact worth surfacing rather than an empty list worth trusting.
 */
export type PropsSource = 'interface' | 'destructuring' | 'none';

export interface PropEntry {
	name: string;
	/** Type as written in the source. Absent when recovered by destructuring. */
	type?: string;
	optional: boolean;
	/** Default from the `$props()` destructuring, when one is written. */
	defaultValue?: string;
}

export interface TokenEntry {
	/** Including the leading double hyphen, as written and as referenced. */
	name: string;
	value: string;
	/** The token file it is defined in, relative to src/tokens. */
	file: string;
	/** Category taken from the filename: colours, spacing, typography, ... */
	category: string;
	surface: Surface;
	/** Components referencing it. */
	referencedBy: string[];
	/** Whether another token or a rule in the token layer references it. A
	 *  token can be load-bearing without any component naming it directly —
	 *  the elevation ladder is consumed entirely by other tokens. */
	usedInTokenLayer: boolean;
	/** Whether a story references it. Kept apart from referencedBy because
	 *  "used only in a demo" is its own smell: --card-radius survives in a
	 *  story after Card itself moved to --radius-surface. Orphaned means none
	 *  of the three (AL-005). */
	usedInStories: boolean;
}

export interface ComponentEntry {
	/** PascalCase, matching the file and the barrel export. */
	name: string;
	/** Directory under src/components: atoms, layouts, forms, ... */
	category: string;
	/** Path relative to the package root, for import resolution. */
	path: string;
	propsSource: PropsSource;
	props: PropEntry[];
	/** Tokens this component references via var(). */
	tokensUsed: string[];
	/** Components this component renders. */
	composes: string[];
	/** Files in this repo importing it. Empty and exported means no in-repo
	 *  consumer, which for a library is expected; empty and NOT exported means
	 *  the component is unreachable. */
	importedBy: string[];
	/** Whether a barrel re-exports it, i.e. whether consumers can import it. */
	exported: boolean;
	/** Storybook story id, derived from the story's title. Null when no story. */
	storyId: string | null;
}

export interface Manifest {
	/** Bumped when the shape changes, so a consumer can refuse an old file. */
	schemaVersion: number;
	components: ComponentEntry[];
	tokens: TokenEntry[];
	/** Components that could not be parsed at all. Non-empty fails the build:
	 *  a component missing from the manifest is worse than a failed build,
	 *  because the MCP would confidently report it does not exist. */
	unparsed: string[];
}
