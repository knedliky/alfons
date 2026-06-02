# Motif Design Library

`@motif/design` is a standalone Svelte 5 design library providing CSS design tokens and component atoms for all externally-facing SvelteKit projects.

## Installation

```bash
# Via local path (development)
bun add ../motif

# Via git URL (CI / production)
bun add git+https://github.com/knedliky/motif
```

## Usage

### Tokens

```svelte
<script>
  import '@motif/design/public'; // public UI tokens
  import '@motif/design/admin';  // admin tokens (requires public)
  import '@motif/design/base';   // global styles and typography
</script>
```

### Components

```svelte
<script>
  import { Button, Input, Label, Select, Textarea, Toggle, Tooltip, Pill, Portrait } from '@motif/design';
</script>
```

## Package structure

```
src/
  tokens/
    public.css        — public UI design tokens
    admin.css         — admin UI tokens (requires public.css)
    base.css          — global styles, typography, utilities
  components/
    atoms/            — public atom components
      Button.svelte
      Input.svelte
      Label.svelte
      Portrait.svelte
      Pill.svelte
      Select.svelte
      Textarea.svelte
      Toggle.svelte
      Tooltip.svelte
    admin/            — admin atom components
      BulkActionModal.svelte
      DeleteConfirmModal.svelte
      Modal.svelte
      StatusBadge.svelte
  index.ts            — root barrel export
```

## Development

```bash
# Install dependencies
bun install

# Run Storybook dev server (port 6006)
bun run storybook

# Build the library
bun run build

# Type-check
bun run check

# Build static Storybook catalogue
bun run build-storybook
```

## Tech stack

- **Svelte 5** — runes-only (`$props`, `$state`, `$derived`, `$effect`)
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
