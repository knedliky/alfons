---
name: design-system
description: >-
  Knows the Motivka user-interface design system (Alfons): colour and type
  tokens, Svelte 5 components, page layout recipes, and review of UI markup
  against the system's rules. Route here to find or build a component, pick a
  token, scaffold a new component, check or fix Svelte markup, or prototype a
  page design.
provides:
  - id: find_components
    summary: Find and describe components, and confirmed design decisions, from a plain-language need
    via: mcp
    status: live
  - id: get_tokens
    summary: List the colour, spacing, type and elevation tokens legal on a public or admin surface
    via: mcp
    status: live
  - id: get_layout_recipe
    summary: Give the composition order of layouts by tier for a page
    via: mcp
    status: live
  - id: scaffold_component
    summary: Create a new Svelte component that already passes the markup rules
    via: mcp
    status: live
  - id: review_markup
    summary: Review Svelte source against the design rules, and apply the safe fixes
    via: mcp
    status: live
  - id: prototype_page
    summary: Run a round of five distinct design approaches for a page and promote the winner
    via: skill
    status: live
  - id: design_package
    summary: Tokens and components, installed by git URL as @alfons/design into SvelteKit projects
    via: surface
    status: live
  - id: component_catalogue
    summary: Storybook catalogue of every component, live at https://atlas.localhost/alfons
    via: surface
    status: live
consumes: []
---

# Design system

The one set of tokens and Svelte 5 components behind Motivka's user
interfaces (project name Alfons). Agents reach it through an MCP server over a
generated manifest, so a lookup always matches the tree.

## Owns

- Tokens, components, layout tiers and the markup review rules.
- The component catalogue and the `/dev` prototyping surface.
- The manifest, and the token lifecycle (live, deprecated, retired) with its reasons.

## Does not own

- Diagrams, illustration and explainers: visualisation.
- The pages and apps that consume the system: website for the web, ios-app for mobile.
- Reading the context database for other domains: context-gateway.
- Decisions as records: planning keeps them; this domain only learns from them.

## Start here

- Tools: `src/mcp/server.ts` (twelve tools, `find_components` first).
- Package and exports: `package.json`; components in `src/components/`, tokens in `src/tokens/`.
- Catalogue: `.storybook/`, published with `bun run catalogue`.
- Prototyping: `.claude/skills/prototype/SKILL.md`.
- Commands, conventions and gotchas: `AGENTS.md`, imported below.

@AGENTS.md
