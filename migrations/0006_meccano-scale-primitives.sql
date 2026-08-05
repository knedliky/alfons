-- 0006_meccano-scale-primitives.sql
--
-- The Meccano retune introduces primitive scales — sizes, weights, leading,
-- tracking, radii, surfaces, borders — that components read through role
-- aliases and composites rather than by name. To the manifest that is
-- indistinguishable from an unadopted rung, which is exactly the ambiguity
-- 0002 was written to remove: a definition nothing references reads the same
-- whether it is residue or mechanism.
--
-- These are mechanism. Each row says so, and says through what.
--
-- No decision_id on any of them. Every row here is `live`, and the schema only
-- demands a decision for `deprecated` and `retired` — keeping a token that
-- something uses is not a decision, it is the absence of one. D-179 (the
-- palette) and D-180 (the radius scale) are where the arguments live.
--
-- ---------------------------------------------------------------------------
-- A caveat on the evidence, carried over from D-171
-- ---------------------------------------------------------------------------
-- Several of these ARE referenced in this repository — base.css sets h1 with
-- `font: var(--type-display)` — but referencedBy is computed from .svelte files
-- alone, so a token consumed only from a stylesheet reads as orphaned. That is
-- the same blind spot D-171 recorded as finding 4, and it means the orphan
-- count understates adoption for anything token-layer. Do not read a row here
-- as proof nothing uses it.

begin;

-- ---------------------------------------------------------------------------
-- Type — the ladder, the cuts, the leading, and the composites that join them
-- ---------------------------------------------------------------------------

insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--fs-xs',      'live', 'Size ladder. Read via --text-micro.'),
	('token', '--fs-sm',      'live', 'Size ladder. Read via --text-caption and --type-small.'),
	('token', '--fs-md',      'live', 'Size ladder. Read via --text-ui and --type-body — the UI register.'),
	('token', '--fs-lg',      'live', 'Size ladder. Read via --text-body and --type-prose — the reading register.'),
	('token', '--fs-xl',      'live', 'Size ladder. Read via --type-h3 and the h4 rule in base.css.'),
	('token', '--fs-2xl',     'live', 'Size ladder. Read via --type-h2 and the h3 rule in base.css.'),
	('token', '--fs-3xl',     'live', 'Size ladder. Read via --type-h1 and the h2 rule in base.css.'),
	('token', '--fs-display', 'live', 'Size ladder. Read via --type-display and the h1 rule in base.css.'),
	('token', '--fw-light',   'live', 'Moderat cut. Reserved for rare oversized display moments.'),
	('token', '--fw-regular', 'live', 'Moderat cut. Read via --type-body, --type-small, --type-prose, --type-spec.'),
	('token', '--fw-medium',  'live', 'Moderat cut. The weight above regular that the face actually has.'),
	('token', '--fw-semibold','live', 'Maps to Medium on purpose — Moderat has no 600 cut, so asking for 600 gets a synthesised weight. Read via --type-h2 and --type-h3.'),
	('token', '--fw-bold',    'live', 'Moderat cut. Read via --type-display and --type-h1.'),
	('token', '--fw-black',   'live', 'Moderat cut. Oversized display and the drop cap.'),
	('token', '--lh-tight',   'live', 'Leading for display and h1. Read via the composites.'),
	('token', '--lh-snug',    'live', 'Leading for h3 and the small headings in base.css.'),
	('token', '--lh-body',    'live', 'Leading for running text. Read via --type-body and --type-prose.'),
	('token', '--ls-tight',   'live', 'Negative tracking for display and h1. Applied beside the composite — the font shorthand carries no letter-spacing.'),
	('token', '--ls-caps',    'live', 'Tracking for mono spec labels, which are always uppercase. Also the chart axis tracking.'),
	('token', '--type-display','live','Composite. Sets h1 in base.css.'),
	('token', '--type-h1',    'live', 'Composite. Sets h2 in base.css.'),
	('token', '--type-h2',    'live', 'Composite. Sets h3 in base.css.'),
	('token', '--type-h3',    'live', 'Composite. Sets h4 in base.css.'),
	('token', '--type-body',  'live', 'Composite. The UI register at 15px — controls, nav, list items.'),
	('token', '--type-small', 'live', 'Composite. Dense metadata and card bodies.'),
	('token', '--type-prose', 'live', 'Composite. Long-form reading at 18px. An Alfons addition: Meccano assigns --fs-lg to no composite, and a UI kit''s single body size is not a reading size.'),
	('token', '--type-spec',  'live', 'Composite. The signature annotation — mono, uppercase, tracked. Pair with --ls-caps and text-transform.'),
	('token', '--font-sans',  'live', 'Meccano''s own name for the sans role, aliasing --font-body, so markup authored against the handoff resolves without translation.')
on conflict (kind, name) do update set
	status = excluded.status, reason = excluded.reason, recorded_on = current_date;

-- ---------------------------------------------------------------------------
-- Radius — the machined rungs behind the role names (D-180)
-- ---------------------------------------------------------------------------

insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--radius-2',     'live', 'Machined 6px — the workhorse. Read via --radius, --radius-surface and --card-radius.'),
	('token', '--radius-3',     'live', 'Machined 10px — dialogs and chat. Read via --radius-message.'),
	('token', '--radius-round', 'live', 'True round for pills and switch tracks. Read via --radius-pill.')
on conflict (kind, name) do update set
	status = excluded.status, reason = excluded.reason, recorded_on = current_date;

-- ---------------------------------------------------------------------------
-- Surfaces, borders and the workbench ground
-- ---------------------------------------------------------------------------

insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--surface-page',    'live', 'The page ground. Read via --bg-primary and every tint that mixes over it.'),
	('token', '--surface-card',    'live', 'Plate face. Read via --card-bg and --surface-glass-bg.'),
	('token', '--surface-sunken',  'live', 'Recessed zones — footers, wells, the card control tray.'),
	('token', '--surface-inverse', 'live', 'Bone surface for inverted regions.'),
	('token', '--border-hairline', 'live', 'The 9% bone line that does most of the separating. Read via --border-glass and --card-border.'),
	('token', '--border-default',  'live', 'The 17% line for hover and emphasis. Read via --border-glass-hover.'),
	('token', '--border-strong',   'live', 'Full-bone edge for secondary buttons and emphasis.'),
	('token', '--bench-bg',        'live', 'Workbench ground. Composed by .mcn-bench in base.css.'),
	('token', '--bench-line',      'live', 'Workbench 40px grid line. Read via --grid-colour.'),
	('token', '--bench-line-major','live', 'Workbench 160px accent line. Read via --grid-colour-accent.'),
	('token', '--bench-rake',      'live', 'The warm gantry rake light grazing from the upper left.'),
	('token', '--grid-size-major', 'live', 'The 160px accent pitch, formalising a value the ground already drew.'),
	('token', '--white',           'live', 'Mixing primitive for lifting dark hues. Not a surface — the system has no white page.')
on conflict (kind, name) do update set
	status = excluded.status, reason = excluded.reason, recorded_on = current_date;

-- ---------------------------------------------------------------------------
-- Semantic colour — the short names, beside the --colour-* ones already live
-- ---------------------------------------------------------------------------
-- Meccano names these --info/--success/--warning/--danger; Alfons and Atlas
-- read --colour-info and friends. Both exist, the short name is the
-- definition, and neither is deprecated: the --colour-* spelling is the
-- Australian-English house convention and is not going anywhere.

insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--info',          'live', 'Pulley blue. --colour-info aliases it.'),
	('token', '--info-tint',     'live', 'Wash over the page. --colour-info-bg aliases it.'),
	('token', '--success',       'live', 'Toolbox olive. --colour-success aliases it.'),
	('token', '--success-tint',  'live', 'Wash over the page. --colour-success-bg aliases it.'),
	('token', '--warning',       'live', 'Brass amber. --colour-warning aliases it.'),
	('token', '--warning-tint',  'live', 'Wash over the page. --colour-warning-bg aliases it.'),
	('token', '--danger',        'live', 'Girder red. --colour-error aliases it.'),
	('token', '--danger-deep',   'live', 'Pressed and hover state for danger surfaces.'),
	('token', '--danger-tint',   'live', 'Wash over the page. --colour-error-bg aliases it.'),
	('token', '--accent-deep',   'live', 'Girder red darkened 16%. Read via --accent-hover.'),
	('token', '--accent-tint',   'live', 'Accent wash over the page.'),
	('token', '--accent-contrast','live','Text colour on an accent cap.'),
	('token', '--focus',         'live', 'Functional blue for focus, never the accent. Read via --focus-ring-color.'),
	('token', '--focus-tint',    'live', 'Focus wash for selection controls.'),
	('token', '--text-inverse',  'live', 'Foundry black — the text light plastics take.'),
	('token', '--text-link',     'live', 'Pulley blue. Links are functional blue, not accent red.')
on conflict (kind, name) do update set
	status = excluded.status, reason = excluded.reason, recorded_on = current_date;

commit;
