# Alfons — CLAUDE.md

## Project overview

Alfons is the design system: one set of tokens and Svelte 5 components, exposed through
three surfaces over a single generated manifest.

- **The package** — `@alfons/design`, consumed at build time by SvelteKit projects.
- **The MCP server** — what agents call to discover components, scaffold new ones and have
  their markup reviewed. This is the surface that keeps the system consistent, because a
  package can be forked and drifted silently while a service cannot.
- **The catalogue** — Storybook, always live at `https://atlas.localhost/alfons`. Served as
  a static mount by Atlas's local Caddy, not by the gateway (D-170): the gateway's bearer
  token cannot be supplied by a browser for a static site's own asset requests, and
  `*.localhost` resolves to 127.0.0.1 on whichever machine asks, so the name is the
  boundary. `bun run catalogue` republishes — the mount is a bind mount, so there is
  nothing to restart.

All three read the same generated manifest. Change a token or component in `src/`, and the
manifest, the MCP answers and the catalogue follow from it.

## Build Commands

```bash
# Regenerate the manifest, then build the library into dist/
bun run build

# Regenerate alfons.manifest.json alone. Needs the context database: the
# manifest joins authored lifecycle from the alfons schema (D-162).
bun run manifest

# Verify the derived half of the manifest matches the tree. Needs no database,
# which is what CI runs — see "Two halves of the manifest" below.
bun run manifest:check

# Teach the database the token and component names the tree now carries, so a
# lifecycle replacement has something to reference. Needs a writer connection.
# READS THE MANIFEST, NOT THE TREE — see the ordering note below.
ALFONS_DATABASE_URL='postgresql:///context' bun run lifecycle:sync

# Type-check Svelte components and TypeScript
bun run check

# Run Storybook dev server on port 6006
bun run storybook

# Build static Storybook catalogue
bun run build-storybook
```

### The order these run in matters

After changing tokens, run them in exactly this order:

```bash
bun run format                                                    # 1
bun run manifest                                                  # 2
ALFONS_DATABASE_URL='postgresql:///context' bun run lifecycle:sync # 3
psql-18 -d context -f migrations/NNNN_whatever.sql                # 4
```

Both possible inversions fail confusingly rather than loudly, which is why
they are written down.

**format before manifest.** Prettier rewrites multi-line CSS values — a long
`--cap-red` gradient reflows — so formatting after generating leaves the
manifest describing values the tree no longer has. `manifest:check` then fails
in CI on a tree that looks untouched.

**manifest before lifecycle:sync.** `sync-lifecycle-entities.ts` reads
`alfons.manifest.json`, despite its docstring saying it teaches the database
"the names the tree currently carries". Run it first and it teaches the
database the _previous_ build's vocabulary. Nothing complains at the time; the
next migration fails with a foreign-key violation on a token you can see in
the CSS, which sends you looking at the schema rather than at the order.

## Stack surprises

The versions and dependencies are in `package.json`; only the two things that
are not written down anywhere else live here.

- **Tailwind 4 has no `tailwind.config.js`.** It is configured through
  `@tailwindcss/vite` and `@theme` in CSS. Looking for the config file and not
  finding it is not a sign anything is missing.
- **Storybook 10 has no `addon-essentials`.** It was folded into core; adding it
  back breaks the build.

## Conventions

- **Australian English** in all identifiers, comments, and strings
  (`colour`, `initialise`, `behaviour`, `organise`, etc.)
- Component files: `PascalCase.svelte`
- Token files: lowercase with hyphens (`colours.css`, `spacing.css`, `base.css`)
- **Colour is authored once, in hex, and derived in oklab.** The eight part colours and
  `--foundry-black`/`--ink-900` carry exact brand hex; everything else — ramps, surfaces,
  tints, borders — is a `color-mix(in oklab, …)` off those. D-004 chose OKLCH for
  perceptual uniformity and that still holds, because the mixing happens in oklab; what
  changed under D-179 is only the authoring format of the base hues.
- **Dark is the sole colour mode.** There is no light theme and no runtime toggle;
  consumers pin `data-colour-mode="dark"` on `<html>` statically.

## Source of truth

Alfons is canonical. Atlas consumes it as an external dependency and does not carry a copy.

This was not always true. Between 2026-07-06 and 2026-08-02 a vendored copy lived at
`atlas/motif` as a Bun workspace, and design work continued there while this repo went
untouched — the copy reached 83 components against this repo's 59 before the fork was
noticed. The reverse-merge is recorded in D-157. **Never vendor Alfons into a consumer**;
depend on it by git URL.

Related: never `bun link` Alfons into Atlas either — it drags Alfons's dev `node_modules`
in and corrupts Atlas's esbuild signature (SIGKILL 137 / EPIPE). Repair by re-fetching
esbuild, which is also the fix if `build-storybook` dies with "the service was stopped".

## Package structure

```
src/
  tokens/
    public.css   — import manifest; order matters (colours before elevation)
    colours.css  — brand hues and semantic aliases
    typography.css, spacing.css, elevation.css, motion.css, fonts.css
    admin.css    — admin UI tokens (requires public.css)
    base.css     — global styles, typography, utilities
    form-states.css
  components/    — atoms, admin, blog, brand, cards, disclosure, feedback, forms,
                   headers, layouts, modals, navigation, overlays, pickers,
                   skeletons, stats, tables
  index.ts       — root barrel export
```

## Exports map

```json
{
	".": { "types": "./src/index.ts", "svelte": "./src/index.ts", "import": "./dist/index.js" },
	"./public": "./src/tokens/public.css",
	"./admin": "./src/tokens/admin.css",
	"./base": "./src/tokens/base.css",
	"./form-states": "./src/tokens/form-states.css"
}
```

**Types resolve from source, not from `dist`.** Both the `types` and `svelte`
conditions point at `src/index.ts`, so a consumer reads the components and
derives prop types through its own svelte2tsx. Every component is fully typed at
the consumer without the library shipping a single `.d.ts`.

Note that `dist/` is gitignored and consumers install from git, so the package
they receive has no `dist` at all — the `import` condition resolves to nothing.
That is harmless for Svelte consumers, which take the `svelte` condition, but a
non-Svelte importer would fail.

## The MCP surface

Nine tools over the manifest, in `src/mcp/`. `bun run mcp` starts the server;
`bun run mcp:smoke` exercises every tool and then the server over real stdio.

| Tool                            | For                                             |
| ------------------------------- | ----------------------------------------------- |
| `find_components`               | Ranked search in plain language                 |
| `get_component`                 | Props, slots, variants, usage, story link       |
| `get_tokens`                    | Tokens legal on a surface                       |
| `get_layout_recipe`             | Composition order by tier                       |
| `list_surfaces`                 | What is legal where, before picking a component |
| `scaffold_component`            | A new component that already passes the rules   |
| `review_markup` / `apply_fixes` | The rules, over source text                     |
| `review_library`                | Findings about Alfons itself, not about markup  |

The server **refuses to start** on a manifest that is missing, stale, of the wrong
schema version, or carrying unparsed components. Silence from a lookup service is
indistinguishable from a true negative: an agent that gets an empty `find_components`
concludes the component does not exist and writes its own.

## Review Checklist

These are no longer prose. Each is a rule in `src/rules/`, with a fixture proving it
fires and a fixture proving it does not fire on correct code — `bun run test:rules`.
Advisory in v1 (D-159); promotion to blocking waits on a measured false-positive rate,
which `bun run rules:baseline` records against Atlas.

Advisory for consumers, that is. Inside this repo the three `svelte5-runes` cases are
already blocking: `eslint.config.js` expresses them as `no-restricted-syntax` selectors,
so `bun run lint` fails on `export let`, `$:` or `createEventDispatcher` here regardless
of D-159. Note the selector for `$:` is `SvelteReactiveStatement` — `LabeledStatement`
is what you would reach for and it matches nothing, failing silently.

| Rule                    | Catches                                                      |
| ----------------------- | ------------------------------------------------------------ |
| `raw-value`             | A literal colour or length where a token holds that value    |
| `admin-token-on-public` | An `--admin-*` token on a public surface                     |
| `unknown-token`         | A `var()` naming neither a token nor a local property        |
| `retired-token`         | A retired or deprecated token, with replacement and decision |
| `tailwind-shadow`       | A token name Tailwind v4's default `@theme` also defines     |
| `raw-element`           | A bare `<button>`/`<input>`/`<select>` where an atom exists  |
| `layout-nesting`        | A layout containing one from an outer tier                   |
| `svelte5-runes`         | `export let`, `$:`, `createEventDispatcher`                  |

**No rule matches source text.** The Svelte compiler parses markup and scripts, postcss
parses style blocks, postcss-value-parser reads values. This is not fastidiousness: a
hand-rolled scanner for the same job was wrong twice during AL-001, and all four of its
failures — tabs, `--border` matching `--border-glass`, component-local properties, and
`var(--x, 1rem)` fallbacks — are fixtures.

`bun run test:scaffold` scaffolds a component and then reviews it, which is what keeps
the fast path and the compliant path the same path.

## Two halves of the manifest

`alfons.manifest.json` carries two classes of fact, and they have opposite failure modes
(D-162).

**Derived** — components, props, tokens, values, story ids, importers. Recomputable from
the tree, so the tree is their authority and drift is a diff. `bun run manifest:check`
recomputes these alone and compares; it needs no database, which is why CI runs it.

**Authored** — whether a token is `live`, `deprecated` or `retired`, what replaced it, and
the decision that said so. Nothing can recover this from a parse: a retired token and an
unadopted one look identical. These live in the `alfons` schema in the context database,
under `migrations/`, and `bun run manifest` joins them on at build time.

Postgres is therefore a **build-time dependency and never a runtime one**. The MCP server
and every consumer read the emitted file. Never make a consumer reach the database.

A lifecycle row whose subject is gone from the tree is emitted as a **tombstone**, which is
what makes deletion safe: `var(--chart-tooltip-bg)` gets answered with "retired, use
`--chart-tooltip-bg-admin`, see D-165" rather than with silence.

## Retiring a token or component

Removing something is a decision, and the reason has to survive the removal. Three
retirements — light mode, the accent-tinted focus ring, and the fourth frost level — were
recorded only as comments in CSS, and a later reader misread all three as accidental loss.

The schema now enforces the rule the prose used to only ask for: `alfons.lifecycle` refuses
a `deprecated` or `retired` row without a foreign key to `ledger.decisions`. So record the
decision first, then write the row. Do not leave the definition behind unannotated.

All 110 tokens that once had no consumer are now classified, along with the 2 the deletions
orphaned in turn — 27 were live all along and consumed by Atlas, 49 are deprecated, 36 were
retired and deleted. Note the first group:
`referencedBy` is **repo-local**, so a token used only by a consumer repository looks
orphaned here. Grep the consumers before concluding anything is dead.

`referencedBy` is also **.svelte-only**, which is the sharper edge of the same knife (D-171,
finding 4). A token consumed from `base.css`, from Atlas's `app.css` or from a `.ts` module
reads as orphaned no matter which repository you stand in. Every `--type-*` composite is in
this position: `base.css` sets `h1` with `font: var(--type-display)` and the manifest still
counts it unreferenced. Do not treat a zero as evidence.

## The Meccano retune (D-179, D-180)

The current visual language. Alfons was retuned to it on 2026-08-05, and the thing worth
knowing before reading the token files is that **Meccano is not a foreign system** — it is
this palette, renamed and re-tuned. `--girder-red` is `--fire-engine-red`; `--pulley-blue`
is `--sky-blue`; `--foundry-black` is byte-identical to the old `--hex-dark`. That is why
the whole retune is a value swap at the primitive layer and Atlas re-skinned without a
component change.

Three rules that are easy to breach because nothing enforces them:

- **A hue is defined once.** The part name carries the hex; the old brand name and the
  `--hex-*` name are aliases of it. Never reintroduce a second literal for a colour that
  already has one — that pairing is what D-157 spent a release undoing.
- **Text on plastic is not a free choice.** Light and mid plastics (pulley, pinion, brass,
  gantry, toolbox) take `--foundry-black`; girder, flange and boiler take `--ink-900`.
  Getting it backwards is the most legible way to look off-brand.
- **Focus is `--focus` (pulley blue), never the accent.** Red is reserved for the thing
  that acts.

Buttons are panel caps and cards are riveted plates; the material tokens for both live in
`elevation.css` with the reasoning beside them. There is no glassmorphism outside the dialog
overlay, so the frost scale is pinned to `0px` rather than retired — see the note on it,
which is the same argument D-160 made for the radii before D-180 brought them back.
