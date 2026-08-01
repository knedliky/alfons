# Alfons

Alfons is the design system for externally-facing SvelteKit projects: Svelte 5 components,
CSS design tokens, and the rules that keep them coherent.

It is exposed through three surfaces over one generated manifest — a package consumed at
build time, an MCP server agents call to discover and check their work, and a Storybook
catalogue served at `/alfons`.

## Installation

```bash
# Via git URL
bun add git+https://github.com/knedliky/motif
```

Do not vendor Alfons into a consuming repository. A copy diverges silently; a dependency
cannot.

## Usage

### Tokens

Import order matters — `public.css` defines what `admin.css` and `base.css` reference.

```css
@import '@alfons/design/public';
@import '@alfons/design/admin';
@import '@alfons/design/base';
```

Dark is the sole colour mode. Pin it statically on `<html>`:

```html
<html lang="en" data-colour-mode="dark">
```

### Components

```svelte
<script>
  import { Button, Input, Card, PageLayout, PageSection } from '@alfons/design';
</script>
```

## Package structure

```
src/
  tokens/       — public.css (import manifest), colours, typography, spacing,
                  elevation, motion, fonts, admin, base, form-states
  components/   — atoms, admin, blog, brand, cards, disclosure, feedback, forms,
                  headers, layouts, modals, navigation, overlays, pickers,
                  skeletons, stats, tables
  stories/      — Storybook catalogue, mirroring components/
  index.ts      — root barrel export
```

## Development

```bash
bun install
bun run storybook        # dev server on port 6006
bun run build            # library build, emits dist/ with declarations
bun run check            # svelte-check
bun run build-storybook  # static catalogue
```

If `build-storybook` fails with "the service was stopped", esbuild's signature is corrupt.
Re-fetch it — `rm -rf node_modules/esbuild && bun install --force`.

## Tech stack

- **Svelte 5** — runes only (`$props`, `$state`, `$derived`, `$effect`)
- **TypeScript** — strict mode; all props typed
- **Tailwind CSS 4** — via `@tailwindcss/vite`
- **Vite** — library mode with `preserveModules: true`
- **Storybook 10** — `@storybook/svelte-vite` framework
- **Bun** — package manager

## Conventions

- Australian English in all identifiers and strings (`colour`, `initialise`, `behaviour`)
- All CSS colour values use OKLCH
- Component files: `PascalCase.svelte`
- Token files: `lowercase-with-hyphens.css`
