/**
 * The shape of alfons.manifest.json.
 *
 * Two classes of fact meet here, and the comments below say which is which.
 *
 * DERIVED facts are recomputable from the source tree, which is why they live in
 * the repo rather than a database and why drift is detectable by regenerating
 * and diffing (D-162). AUTHORED facts — whether a token is retired, what
 * replaced it, which decision said so — cannot be recovered from any parse, and
 * come from the `alfons` schema in Postgres, joined on at build time (AL-009).
 *
 * The join direction matters: `bun run manifest:check` recomputes only the
 * derived fields and compares them, which is how CI gates drift without a
 * database. Anything marked authored below is invisible to that check.
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

/**
 * Where an entity stands. AUTHORED — no parse can distinguish these.
 *
 * `live` is a claim, not a default: an entity with no lifecycle row is
 * unannotated, which is a different and weaker statement than someone having
 * looked at an unused token and decided to keep it.
 */
export type LifecycleStatus = 'live' | 'deprecated' | 'retired';

/** AUTHORED. One row of alfons.lifecycle, as emitted. */
export interface Lifecycle {
	status: LifecycleStatus;
	/** What to reach for instead. Null for `live`, enforced by the schema. */
	replacement: string | null;
	reason: string;
	/** The decision that made the call. Non-null for anything but `live`. */
	decisionId: string | null;
	/** ISO date the judgement was recorded, not the date of the change. */
	recordedOn: string;
}

/**
 * AUTHORED. A lifecycle row whose subject is no longer in the source tree.
 *
 * The reason retirement needs a database and not a comment: --radius-md is gone
 * from spacing.css, so nothing derived can mention it, and an agent writing
 * `var(--radius-md)` would otherwise be told only that it does not exist. A
 * tombstone lets review_markup answer with the replacement and D-160 instead.
 */
export interface Tombstone {
	kind: 'token' | 'component';
	name: string;
	lifecycle: Lifecycle;
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
	/** AUTHORED. Null means unannotated — which, for a token with no consumer,
	 *  is the state AL-009 exists to empty out. */
	lifecycle: Lifecycle | null;
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
	/** AUTHORED. See TokenEntry.lifecycle. */
	lifecycle: Lifecycle | null;
}

export interface Manifest {
	/** Bumped when the shape changes, so a consumer can refuse an old file. */
	schemaVersion: number;
	components: ComponentEntry[];
	tokens: TokenEntry[];
	/** AUTHORED. Names that are gone from the tree but still have an answer. */
	tombstones: Tombstone[];
	/** Components that could not be parsed at all. Non-empty fails the build:
	 *  a component missing from the manifest is worse than a failed build,
	 *  because the MCP would confidently report it does not exist. */
	unparsed: string[];
}
