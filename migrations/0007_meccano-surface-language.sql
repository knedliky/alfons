-- 0007_meccano-surface-language.sql
--
-- The material half of the retune: the plastic, the panel caps, the three-step
-- shadow ladder and the machined easings. Same argument as 0006 — these are
-- mechanism read through aliases and composites, not unadopted rungs, and a
-- definition nothing names reads identically to residue unless a row says
-- otherwise.
--
-- All `live`, so no decision_id: keeping a token something uses is not a
-- decision. The argument for the surface language is in the elevation.css
-- header, which is where a reader looking at --cap-red will actually be.
--
-- The primitive channels deserve a note. --sheen-rgb and --shade-rgb exist
-- because rgba() cannot take a custom property as its colour, so every alpha
-- effect in the system would otherwise have to inline a literal. Tokenising the
-- channel is what lets the token-discipline rule stay true — a component
-- composing a sheen still contains no raw colour of its own.

begin;

-- ---------------------------------------------------------------------------
-- Primitive channels and recurring atoms
-- ---------------------------------------------------------------------------

insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--sheen',      'live', 'Warm white — the light itself, never a surface. The system has no white page.'),
	('token', '--sheen-rgb',  'live', 'Channel for sheen alphas. rgba() cannot take a custom property, so the channel is the token and the alpha is the literal.'),
	('token', '--shade-rgb',  'live', 'Channel for shade alphas, matching --foundry-black.'),
	('token', '--led-off',    'live', 'The unlit status lamp. Tokenised so it cannot be redrawn per component.'),
	('token', '--rivet-face', 'live', 'Rivet head on a card plate.'),
	('token', '--rivet-edge', 'live', 'Rivet shadow on a card plate.')
on conflict (kind, name) do update set
	status = excluded.status, reason = excluded.reason, recorded_on = current_date;

-- ---------------------------------------------------------------------------
-- Shadow ladder — three steps, and the eleven aliases now resolving to them
-- ---------------------------------------------------------------------------
-- Before the retune those aliases were eleven independently-authored shadows
-- (8px 32px at 20%, 10px 40px at 50%, 25px 50px -12px at 50%, …), which is how
-- a system ends up with four subtly different popovers. They all point at a
-- rung now, so the ladder is the only thing to tune.

insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--shadow-1', 'live', 'Raised. Read via --card-shadow, --shadow-subtle, --shadow-header and the rest tier.'),
	('token', '--shadow-2', 'live', 'Popovers, toasts, dropdowns, tooltips. Read via seven aliases.'),
	('token', '--shadow-3', 'live', 'Dialogs only. Read via --shadow-modal.')
on conflict (kind, name) do update set
	status = excluded.status, reason = excluded.reason, recorded_on = current_date;

-- ---------------------------------------------------------------------------
-- Plastic and panel caps — the material that replaced the frosted glass
-- ---------------------------------------------------------------------------

insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--gloss',           'live', 'Top sheen for small coloured chips. Layer over a plastic background-colour. Neutrals never get it.'),
	('token', '--shadow-gloss',    'live', 'The seated edge that pairs with --gloss.'),
	('token', '--shade-part',      'live', 'Stronger moulded shading for larger plastic strips and slabs.'),
	('token', '--shadow-part',     'live', 'Inset-only depth for moulded parts — inset so it survives the .mcn-perf mask.'),
	('token', '--cap-red',         'live', 'Anodized dome for primary and danger buttons. Derives from --accent, so a palette move carries it.'),
	('token', '--cap-chrome',      'live', 'Chrome dome for secondary buttons.'),
	('token', '--shadow-cap',      'live', 'The dark bezel a cap is seated in. Read via --button-shadow.'),
	('token', '--shadow-cap-press','live', 'The cap pressed 2px into its collar. Read via --button-shadow-active.'),
	('token', '--focus-ring',      'live', 'The backlit lamp — pulley blue escaping from beneath the element in layered halos.')
on conflict (kind, name) do update set
	status = excluded.status, reason = excluded.reason, recorded_on = current_date;

-- ---------------------------------------------------------------------------
-- Motion — the machined easings and the three durations behind the five names
-- ---------------------------------------------------------------------------

insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--ease-machined', 'live', 'The system easing: short, precise, no overshoot. Read via every --transition-* and the widget bar.'),
	('token', '--ease-out',      'live', 'Decelerating companion to --ease-machined, for entries.'),
	('token', '--dur-fast',      'live', '120ms. Read via --duration-instant and --transition-fast.'),
	('token', '--dur-med',       'live', '200ms. Read via --duration-fast and --transition-normal.'),
	('token', '--dur-slow',      'live', '320ms. Read via --duration-normal, --duration-slow and --transition-slow.')
on conflict (kind, name) do update set
	status = excluded.status, reason = excluded.reason, recorded_on = current_date;

commit;
