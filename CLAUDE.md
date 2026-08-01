# Alfons — CLAUDE.md

## Project overview

Alfons is the design system: one set of tokens and Svelte 5 components, exposed through
three surfaces over a single generated manifest.

- **The package** — `@alfons/design`, consumed at build time by SvelteKit projects.
- **The MCP server** — what agents call to discover components, scaffold new ones and have
  their markup reviewed. This is the surface that keeps the system consistent, because a
  package can be forked and drifted silently while a service cannot.
- **The catalogue** — Storybook, served to humans at `/alfons` behind the gateway.

All three read the same generated manifest. Change a token or component in `src/`, and the
manifest, the MCP answers and the catalogue follow from it.

## Build Commands

```bash
# Build the library (emits dist/ with JS + .d.ts declarations)
bun run build

# Type-check Svelte components and TypeScript
bun run check

# Run Storybook dev server on port 6006
bun run storybook

# Build static Storybook catalogue
bun run build-storybook
```

## Tech stack

- **Svelte 5** — components use `$props()`, `$state()`, `$derived()`, `$effect()` runes only
- **TypeScript** — strict mode; all component props typed
- **Tailwind CSS 4** — via `@tailwindcss/vite`, no `tailwind.config.js`
- **Vite library mode** — `preserveModules: true`, ES format only
- **vite-plugin-dts** — generates `dist/index.d.ts` for TypeScript consumers
- **Storybook 10** — `@storybook/svelte-vite` framework; no `addon-essentials` (bundled in core)
- **Bun** — package manager for all installs and scripts

## Conventions

- **Australian English** in all identifiers, comments, and strings
  (`colour`, `initialise`, `behaviour`, `organise`, etc.)
- Svelte 5 runes only — no `export let`, no `$:`, no `createEventDispatcher`
- Component files: `PascalCase.svelte`
- Token files: lowercase with hyphens (`colours.css`, `spacing.css`, `base.css`)
- All CSS custom properties use OKLCH for colour values
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
  ".":            { "import": "./dist/index.js", "types": "./dist/index.d.ts" },
  "./public":     "./src/tokens/public.css",
  "./admin":      "./src/tokens/admin.css",
  "./base":       "./src/tokens/base.css",
  "./form-states": "./src/tokens/form-states.css"
}
```

## Review Checklist

These are the rules the MCP rule engine enforces. Where a rule is listed here and not yet
implemented, the prose is a placeholder for a check, not a substitute for one.

- No `export let` syntax — must use `$props()` rune
- No `$:` reactive statements — must use `$derived()` or `$effect()`
- No `createEventDispatcher` — use callback props or Svelte 5 events
- All colour values in OKLCH format in CSS files
- No `--admin-*` tokens in `public.css`
- No CSS custom property definitions in `base.css`
- No `var(--name)` reference without a definition or a fallback
- No token defined without a consumer — retire it explicitly, with a reason, or use it
- `bun run build` exits 0 with `dist/index.d.ts` present after build
- `bun run check` exits 0 with no type errors

## Retiring a token or component

Removing something is a decision, and the reason has to survive the removal. Three
retirements — light mode, the accent-tinted focus ring, and the fourth frost level — were
recorded only as comments in CSS, and a later reader misread all three as accidental loss.

Record the decision in the ledger, then reference it where the thing used to be. Do not
leave the tokens behind: 111 of 320 currently have no consumer, largely as residue from
retirements that were never finished.
