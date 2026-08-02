---
name: prototype
description: Run a prototyping round — discover the brief one question at a time, provision five distinctly different design approaches at dev/<page-name>, fan out five parallel agents to build them watchably, report honestly on new components required, and promote the winner. Use when the user asks to prototype, explore designs for, or mock up a page or feature.
---

# A prototyping round

A round is five distinctly different answers to one page brief, built in
parallel by five agents, rendered production-accurately at
`https://atlas.localhost/dev/<page-name>`, and watchable live while it happens.
One of the five is promoted into production; the round's release closes with it.

The MCP server provisions and judges; this skill orchestrates. Never hand-write
what `plan_prototype_round` provisions, and never skip the honest-report step.

## 1. Discovery — one question at a time

Interview the user with AskUserQuestion, **strictly one question per call** —
never batch. Each answer shapes the next question; a batch is a form, and forms
collect what you guessed instead of what they know. Cover, adapting as you go:

1. **Goal** — what should a visitor be able to do or feel when this page works?
2. **Audience and entry point** — who arrives, and where from? (First visit or
   returning? Search, a link from another page, a shared URL?)
3. **The core journey** — walk me through the one path that must succeed, from
   landing to done. What is the single most important action?
4. **Success signal** — how would we know this page worked? (A click, a signup,
   a comprehension, time spent?)
5. **Content reality** — what content genuinely exists to put on it? (Real
   inventory beats imagined inventory; ask for real examples.)
6. **Surface** — public or admin? (Decides which tokens are legal.)
7. **Constraints and precedents** — anything it must match, avoid, or that the
   user has seen and liked?

Stop as soon as the brief is genuinely sufficient — usually five to seven
questions. Distil the answers into a written brief in full sentences: the goal,
the journey, the audience, the content. This brief goes verbatim into
`plan_prototype_round` and into every agent's prompt.

## 2. The round is a release

A branch is a release (D-129). Before provisioning:

1. `upsert_release` slug `proto-<page-name>`, project `alfons`, with the brief
   as excerpt.
2. `git checkout -b proto-<page-name>` from `main` (stash or land anything
   pending first).
3. File one ledger task per approach plus one for promotion, all under the
   release, phase 1 for the five builds, phase 2 for promotion.

## 3. Provision

Choose five **distinctly different** directions. Not five shades of one idea:
five positions in the space, each pushing a different constraint of the design
system to its limit. Pick five that genuinely fit the brief, e.g. from angles
like: editorial (typography-led, long-form rhythm), dense-utilitarian
(information density, tables and stats), cinematic (hero-led, motion,
elevation), brutalist-structural (grid exposed, tokens at their extremes),
playful-experimental (the system's playful accents pushed furthest). Name each
direction and write one sentence on which constraint it pushes.

Rules may be broken **rarely and deliberately** to explore unknown space — a
breach must be recorded in the approach's `deviations` array in `round.json`
with what was broken and why. An unrecorded breach is a bug, not an exploration.

Then:

1. Call `plan_prototype_round` with page slug, title, brief, surface, release
   slug and the five directions. Write every returned file exactly as given.
2. Start the surface if it is not running: `bun run dev` (port 6008, serves
   `/dev/`). The public URL needs Atlas's Caddy to reverse-proxy `/dev/*` to
   `localhost:6008` — if `https://atlas.localhost/dev` 404s, that block is
   missing on the Atlas side; fall back to `http://localhost:6008/dev/`.
3. Commit the seeded round before the agents start, so every approach diffs
   from the same base.

## 4. Fan out — five agents, one approach each

Spawn all five agents **in a single message** so they run concurrently. Each
agent's prompt must contain:

- The full brief and the discovery answers.
- Its direction — title, the sentence on which constraint it pushes, and the
  instruction to be distinctly itself rather than a safe middle.
- **Ownership**: it may write only inside `prototypes/<page>/<its-slug>/`.
  Local components (`./Something.svelte`) are allowed and encouraged when the
  library lacks a piece — they are the honest signal of a gap.
- **Build from the base layer up**: shell, then regions, then containers, then
  components. Keep `data-alfons-working="what you are composing"` on the region
  under construction — that is what the live glow renders — and remove it when
  the region is done. Never leave a stale marker.
- **Use the server**: `find_components` before writing anything new,
  `get_tokens` instead of any literal value, `get_layout_recipe` for nesting,
  `review_markup` on the finished page. Deliberate rule breaks go in
  `deviations` in `round.json` (its own approach entry only).
- No emojis; Australian English; Svelte 5 runes only.

While they build, the user can watch every approach at
`/dev/<page-name>`, paging with the floating pill (or the `[` and `]` keys).

## 5. Report honestly

When all five land, review each approach and report per approach:

- What it explored and which constraint it pushed.
- `review_markup` findings, and every recorded deviation with its why.
- **New components required**: every local `.svelte` and every flagged bare
  element, named plainly. A beautiful page that needs six new components is a
  bigger commitment than a plainer one needing none — the user decides with
  that cost visible, never discovered after promotion.

Then ask the user — one AskUserQuestion — to view the round and pick a winner
(or ask for another round; a new round revises directions, it does not mutate
the old approaches).

## 6. Promote and close

1. Call `promote_prototype` with the winning page source and its local
   component sources. Follow the returned checklist in order: scaffold and land
   every required component in `src/components/` with stories; the page itself
   moves to its consumer importing only `@alfons/design`.
2. `bun run manifest && bun run manifest:check && bun run lint && bun run
   mcp:smoke`.
3. Record the losing approaches' reasoning in the release document — what each
   explored and why it lost; that is the round's yield beyond the winner. Then
   delete `prototypes/<page-name>/`.
4. Advance the ledger tasks, write the release document, merge
   `proto-<page-name>` to `main`. The round is closed when the branch is gone
   and the document says what it taught.
