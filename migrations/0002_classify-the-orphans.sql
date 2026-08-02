-- 0002_classify-the-orphans.sql
--
-- AL-009 C6: the 110 tokens with no consumer each get an answer.
--
-- The count was never the problem. The problem was that every entry in it read
-- the same — a definition nothing referenced — whether it was residue from an
-- unfinished retirement, a rung of a scale kept whole on purpose, or a token
-- some consumer outside this repository depends on. Three different states,
-- one indistinguishable symptom, and no way to tell them apart from any parse.
--
-- Data, not schema. Kept as a numbered migration anyway because the
-- classification is reproducible and because a reader asking "who decided
-- --space-9 was deprecated" should find the answer next to the table it went
-- into, not only in a psql history.
--
-- ---------------------------------------------------------------------------
-- How the 110 divided
-- ---------------------------------------------------------------------------
--   27  live        consumed by Atlas. Not a judgement — a grep. The manifest's
--                   referencedBy is repo-local, so it cannot see a consumer in
--                   another repository, and 27 tokens were being counted as
--                   orphans purely because of where the reader was standing.
--    3  deprecated  the American spellings, aliased to Australian ones (D-167).
--   44  deprecated  unused rungs of adopted scales, and abstractions that never
--                   landed (D-166).
--   36  retired     deleted from the tree in this same change (D-165), so their
--                   rows are what the manifest emits as tombstones.
--
-- The 27 are worth dwelling on, because they are the failure this table is for
-- in miniature: the evidence was a grep away the whole time, and nothing in the
-- repository recorded that anyone had run it.

begin;

-- ---------------------------------------------------------------------------
-- Live — a consumer exists, it is just not in this repository
-- ---------------------------------------------------------------------------
-- No decision_id: keeping a token that something uses is not a decision, it is
-- the absence of one. The reason still has to be written, because "Atlas reads
-- it" is exactly the fact that was missing.

insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--accent-depth',          'live', 'Consumed by Atlas. Repo-local referencedBy cannot see it.'),
	('token', '--accent-depth-bg',       'live', 'Consumed by Atlas. Repo-local referencedBy cannot see it.'),
	('token', '--accent-secondary-bg',   'live', 'Consumed by Atlas. Repo-local referencedBy cannot see it.'),
	('token', '--accent-secondary-border','live','Consumed by Atlas. Repo-local referencedBy cannot see it.'),
	('token', '--admin-bg-page',         'live', 'Consumed by Atlas. Repo-local referencedBy cannot see it.'),
	('token', '--card-blur',             'live', 'Consumed by Atlas. Repo-local referencedBy cannot see it.'),
	('token', '--card-border-bottom',    'live', 'Consumed by Atlas, which borders cards on one edge at a time.'),
	('token', '--card-border-left',      'live', 'Consumed by Atlas, which borders cards on one edge at a time.'),
	('token', '--card-border-right',     'live', 'Consumed by Atlas, which borders cards on one edge at a time.'),
	('token', '--card-border-top',       'live', 'Consumed by Atlas, which borders cards on one edge at a time.'),
	('token', '--font-drop-cap',         'live', 'Consumed by Atlas editorial pages. Rock Salt ships as a dependency for it.'),
	('token', '--gradient-warmth',       'live', 'Consumed by Atlas. Repo-local referencedBy cannot see it.'),
	('token', '--hex-dark',              'live', 'Consumed by Atlas. Raw hex, needed where oklch() cannot be used.'),
	('token', '--hex-light',             'live', 'Consumed by Atlas. Raw hex, needed where oklch() cannot be used.'),
	('token', '--section-padding-x',     'live', 'Consumed by Atlas page sections.'),
	('token', '--section-padding-y',     'live', 'Consumed by Atlas page sections.'),
	('token', '--state-active-opacity',  'live', 'Consumed by Atlas. The interaction-state opacity ladder is used there, not here.'),
	('token', '--state-disabled-opacity','live', 'Consumed by Atlas. The interaction-state opacity ladder is used there, not here.'),
	('token', '--state-hover-opacity',   'live', 'Consumed by Atlas. The interaction-state opacity ladder is used there, not here.'),
	('token', '--surface-dark-subtle',   'live', 'Consumed by Atlas. Repo-local referencedBy cannot see it.'),
	('token', '--text-micro',            'live', 'Consumed by Atlas. Smallest step of the type scale.'),
	('token', '--text-ui',               'live', 'Consumed by Atlas. Interface-text step of the type scale.'),
	('token', '--widget-icon-size',      'live', 'Consumed by the Atlas dashboard widgets, which have no counterpart component here.'),
	('token', '--widget-pulse-duration', 'live', 'Consumed by the Atlas dashboard widgets, which have no counterpart component here.'),
	('token', '--widget-spring-duration','live', 'Consumed by the Atlas dashboard widgets, which have no counterpart component here.'),
	('token', '--widget-spring-easing',  'live', 'Consumed by the Atlas dashboard widgets, which have no counterpart component here.'),
	('token', '--z-base',                'live', 'Consumed by Atlas. Floor of the z-index ladder.');

-- ---------------------------------------------------------------------------
-- Deprecated under D-167 — the American spellings
-- ---------------------------------------------------------------------------
-- Atlas consumes all three, so they stay defined as aliases of the Australian
-- names rather than being renamed out from under it.

insert into alfons.lifecycle (kind, name, status, replacement_name, reason, decision_id) values
	('token', '--color-full',    'deprecated', '--colour-full',    'American spelling. Alias of --colour-full; retires when Atlas migrates.', 'D-167'),
	('token', '--color-partial', 'deprecated', '--colour-partial', 'American spelling. Alias of --colour-partial; retires when Atlas migrates.', 'D-167'),
	('token', '--color-human',   'deprecated', '--colour-human',   'American spelling. Alias of --colour-human; retires when Atlas migrates.', 'D-167');

-- ---------------------------------------------------------------------------
-- Deprecated under D-166 — unused rungs, and abstractions that did not land
-- ---------------------------------------------------------------------------
-- These keep their definitions. The status is the record that non-adoption was
-- noticed rather than tolerated, and review_markup steers new markup away from
-- them so the set can only shrink.
--
-- The surface-* ladder is the clearest case and the reason D-166 exists. Its
-- -bg rungs are consumed and its -shadow and -frost rungs are not, because
-- components reach past the semantic name to the --elevation-* and --frost-*
-- primitives underneath. The replacement column says so explicitly: the primitive
-- IS what to use today, and that is an admission, not an endorsement.

insert into alfons.lifecycle (kind, name, status, replacement_name, reason, decision_id) values
	-- The elevation ladder, half-adopted
	('token', '--surface-rest-shadow',   'deprecated', '--elevation-1',   'Semantic alias nothing adopted; components read --elevation-1 directly.', 'D-166'),
	('token', '--surface-rest-frost',    'deprecated', '--frost-1',       'Semantic alias nothing adopted; components read --frost-1 directly.', 'D-166'),
	('token', '--surface-raised-shadow', 'deprecated', '--elevation-2',   'Semantic alias nothing adopted; components read --elevation-2 directly.', 'D-166'),
	('token', '--surface-float-shadow',  'deprecated', '--elevation-3',   'Semantic alias nothing adopted; components read --elevation-3 directly.', 'D-166'),
	('token', '--surface-float-bg',      'deprecated', '--elevation-3-bg','Semantic alias nothing adopted; components read --elevation-3-bg directly.', 'D-166'),
	('token', '--toast-shadow',          'deprecated', '--shadow-toast',  'Duplicate name for --shadow-toast, which Toast actually reads. Two names, one honoured.', 'D-166'),
	('token', '--shadow-header',         'deprecated', null,              'Unused member of the --shadow-* family; Header casts no shadow.', 'D-166'),

	-- Series palettes: rung 1 is consumed, the rest never were
	('token', '--chart-series-6',        'deprecated', null, 'Unused rung. Only series 1 reaches a component, via --chart-admin-series-1.', 'D-166'),
	('token', '--chart-series-7',        'deprecated', null, 'Unused rung. Only series 1 reaches a component, via --chart-admin-series-1.', 'D-166'),
	('token', '--chart-series-8',        'deprecated', null, 'Unused rung. Only series 1 reaches a component, via --chart-admin-series-1.', 'D-166'),
	('token', '--chart-admin-series-2',  'deprecated', null, 'Unused rung. BarChart and LineChart plot a single series and read only -1.', 'D-166'),
	('token', '--chart-admin-series-3',  'deprecated', null, 'Unused rung. BarChart and LineChart plot a single series and read only -1.', 'D-166'),
	('token', '--chart-admin-series-4',  'deprecated', null, 'Unused rung. BarChart and LineChart plot a single series and read only -1.', 'D-166'),
	('token', '--chart-admin-series-5',  'deprecated', null, 'Unused rung. BarChart and LineChart plot a single series and read only -1.', 'D-166'),

	-- Scales where exactly one step is adopted
	('token', '--stroke-thin',           'deprecated', '--stroke-normal',   'Unused rung; Icon reads --stroke-normal and nothing varies stroke weight.', 'D-166'),
	('token', '--stroke-medium',         'deprecated', '--stroke-normal',   'Unused rung; Icon reads --stroke-normal and nothing varies stroke weight.', 'D-166'),
	('token', '--stroke-thick',          'deprecated', '--stroke-normal',   'Unused rung; Icon reads --stroke-normal and nothing varies stroke weight.', 'D-166'),
	('token', '--opacity-primary',       'deprecated', '--opacity-tertiary','Unused rung; only --opacity-tertiary is read, by the skeleton components.', 'D-166'),
	('token', '--opacity-secondary',     'deprecated', '--opacity-tertiary','Unused rung; only --opacity-tertiary is read, by the skeleton components.', 'D-166'),
	('token', '--opacity-background',    'deprecated', '--opacity-tertiary','Unused rung; only --opacity-tertiary is read, by the skeleton components.', 'D-166'),
	('token', '--opacity-line',          'deprecated', '--opacity-tertiary','Unused rung; only --opacity-tertiary is read, by the skeleton components.', 'D-166'),
	('token', '--hex-sand',              'deprecated', null, 'Rung of the raw hex palette, orphaned when --heatmap-cold went under D-165.', 'D-166'),

	-- Motion: the widget family is Atlas-side, but these five never crossed
	('token', '--widget-transition-duration','deprecated', null, 'Unused rung; Atlas reads the four widget tokens marked live and not this one.', 'D-166'),
	('token', '--widget-transition-easing',  'deprecated', null, 'Unused rung; Atlas reads the four widget tokens marked live and not this one.', 'D-166'),
	('token', '--widget-reorganise-duration','deprecated', null, 'Unused rung; Atlas reads the four widget tokens marked live and not this one.', 'D-166'),
	('token', '--widget-reorganise-stagger', 'deprecated', null, 'Unused rung; Atlas reads the four widget tokens marked live and not this one.', 'D-166'),
	('token', '--widget-spring-easing-wobbly','deprecated','--widget-spring-easing','Unused rung; the wobbly curve reaches nothing, though --ease-spring-wobbly under it is live.', 'D-166'),
	('token', '--duration-instant',      'deprecated', null, 'Unused rung of the --duration-* scale.', 'D-166'),
	('token', '--duration-spring',       'deprecated', null, 'Unused rung of the --duration-* scale; --ease-spring carries the spring feel.', 'D-166'),

	-- Accent roles: the family exists to surface the whole brand palette, and
	-- these are the members no surface reaches for
	('token', '--accent-playful',        'deprecated', null, 'Accent role no surface adopted; --blush-pink is reached directly where wanted.', 'D-166'),
	('token', '--accent-depth-border',   'deprecated', null, 'Unused rung; Atlas reads --accent-depth and --accent-depth-bg but never the border.', 'D-166'),
	('token', '--accent-secondary-hover-subtle','deprecated', null, 'Unused rung; Atlas reads the -bg and -border of this pair, not the hover tint.', 'D-166'),

	-- Form and layout tokens nothing grew into
	('token', '--input-bg',              'deprecated', null, 'Fields set their own background; no component reads the shared one.', 'D-166'),
	('token', '--input-height-lg',       'deprecated', null, 'Unused rung; no field offers a large size.', 'D-166'),
	('token', '--select-selected-bg',    'deprecated', null, 'Select scopes its own --select-* variables locally and never reads these.', 'D-166'),
	('token', '--select-selected-highlighted-bg','deprecated', null, 'Select scopes its own --select-* variables locally and never reads these.', 'D-166'),
	('token', '--shimmer-highlight-bright','deprecated', null, 'Unused rung; the skeletons shimmer with the standard highlight only.', 'D-166'),
	('token', '--space-9',               'deprecated', null, 'Unused rung of the spacing scale; nothing needs 96px.', 'D-166'),
	('token', '--layout-hero-min-height','deprecated', null, 'No hero layout in this repository sets a minimum height.', 'D-166'),
	('token', '--admin-header-size',     'deprecated', null, 'Admin type scale nothing adopted; admin headers use the shared --text-* steps.', 'D-166'),
	('token', '--admin-header-weight',   'deprecated', null, 'Admin type scale nothing adopted; admin headers use the shared --text-* steps.', 'D-166'),
	('token', '--admin-subheader-size',  'deprecated', null, 'Admin type scale nothing adopted; admin headers use the shared --text-* steps.', 'D-166'),

	-- The four button hover tokens are the sharpest illustration of why this
	-- table exists. colours.css labels them "retained (dark defaults)", so the
	-- comment asserts a deliberate keep — but every value is transparent or
	-- none, and no component reads any of them. The retention is inert: they
	-- were neutralised when light mode went and then left behind. Deprecated
	-- rather than retired, because the comment is evidence that someone meant
	-- to keep them and the reason for that has not survived.
	('token', '--button-secondary-hover-bg',    'deprecated', null, 'Neutralised to transparent when light mode was retired; no component reads it, so the "retained" comment above it is inert.', 'D-166'),
	('token', '--button-secondary-hover-border','deprecated', null, 'Neutralised to transparent when light mode was retired; no component reads it, so the "retained" comment above it is inert.', 'D-166'),
	('token', '--button-ghost-hover-bg',        'deprecated', null, 'Neutralised to transparent when light mode was retired; no component reads it, so the "retained" comment above it is inert.', 'D-166'),
	('token', '--button-outline-hover-shadow',  'deprecated', null, 'Neutralised to none when light mode was retired; no component reads it, so the "retained" comment above it is inert.', 'D-166');

-- ---------------------------------------------------------------------------
-- Retired under D-165 — deleted from the tree in this same change
-- ---------------------------------------------------------------------------
-- These rows outlive their definitions, which is the whole argument of D-162.
-- Nothing derived can mention --chart-tooltip-bg any more; a grep of the tree
-- returns nothing and an agent writing var(--chart-tooltip-bg) would be told
-- only that it is unknown. The tombstone answers properly: retired, use
-- --chart-tooltip-bg-admin, see D-165.

insert into alfons.lifecycle (kind, name, status, replacement_name, reason, decision_id) values
	-- Chart chrome, superseded by the -admin family the components actually read
	('token', '--chart-axis-colour',   'retired', '--chart-axis-colour-admin',   'Public chart vocabulary no component read; BarChart and LineChart use the -admin family.', 'D-165'),
	('token', '--chart-grid-colour',   'retired', '--chart-grid-colour-admin',   'Public chart vocabulary no component read; BarChart and LineChart use the -admin family.', 'D-165'),
	('token', '--chart-bg',            'retired', '--chart-bg-admin',            'Public chart vocabulary no component read; BarChart and LineChart use the -admin family.', 'D-165'),
	('token', '--chart-border',        'retired', '--chart-border-admin',        'Public chart vocabulary no component read; BarChart and LineChart use the -admin family.', 'D-165'),
	('token', '--chart-tooltip-bg',    'retired', '--chart-tooltip-bg-admin',    'Public chart vocabulary no component read; BarChart and LineChart use the -admin family.', 'D-165'),
	('token', '--chart-tooltip-border','retired', '--chart-tooltip-border-admin','Public chart vocabulary no component read; BarChart and LineChart use the -admin family.', 'D-165'),
	('token', '--chart-tooltip-text',  'retired', '--chart-tooltip-text-admin',  'Public chart vocabulary no component read; BarChart and LineChart use the -admin family.', 'D-165'),
	('token', '--chart-positive',      'retired', null, 'Public chart vocabulary no component read, with no -admin counterpart to redirect to.', 'D-165'),
	('token', '--chart-negative',      'retired', null, 'Public chart vocabulary no component read, with no -admin counterpart to redirect to.', 'D-165'),
	('token', '--chart-neutral',       'retired', null, 'Public chart vocabulary no component read, with no -admin counterpart to redirect to.', 'D-165'),
	('token', '--chart-warning',       'retired', null, 'Public chart vocabulary no component read, with no -admin counterpart to redirect to.', 'D-165'),
	('token', '--chart-margin-top',    'retired', null, 'Unitless D3 margin convention; the charts that shipped set their own margins.', 'D-165'),
	('token', '--chart-margin-right',  'retired', null, 'Unitless D3 margin convention; the charts that shipped set their own margins.', 'D-165'),
	('token', '--chart-margin-bottom', 'retired', null, 'Unitless D3 margin convention; the charts that shipped set their own margins.', 'D-165'),
	('token', '--chart-margin-left',   'retired', null, 'Unitless D3 margin convention; the charts that shipped set their own margins.', 'D-165'),

	-- Data science: designed against components nobody wrote
	('token', '--heatmap-cold',        'retired', null, 'No heatmap component exists in this repository or any consumer.', 'D-165'),
	('token', '--heatmap-neutral',     'retired', null, 'No heatmap component exists in this repository or any consumer.', 'D-165'),
	('token', '--heatmap-hot',         'retired', null, 'No heatmap component exists in this repository or any consumer.', 'D-165'),
	('token', '--matrix-true-positive','retired', null, 'No confusion-matrix component exists in this repository or any consumer.', 'D-165'),
	('token', '--matrix-true-negative','retired', null, 'No confusion-matrix component exists in this repository or any consumer.', 'D-165'),
	('token', '--matrix-false-positive','retired',null, 'No confusion-matrix component exists in this repository or any consumer.', 'D-165'),
	('token', '--matrix-false-negative','retired',null, 'No confusion-matrix component exists in this repository or any consumer.', 'D-165'),
	('token', '--matrix-diagonal-opacity','retired',null,'No confusion-matrix component exists in this repository or any consumer.', 'D-165'),
	('token', '--matrix-off-diagonal-opacity','retired',null,'No confusion-matrix component exists in this repository or any consumer.', 'D-165'),
	('token', '--experiment-baseline', 'retired', null, 'No A/B experiment component exists in this repository or any consumer.', 'D-165'),
	('token', '--experiment-variant-a','retired', null, 'No A/B experiment component exists in this repository or any consumer.', 'D-165'),
	('token', '--experiment-variant-b','retired', null, 'No A/B experiment component exists in this repository or any consumer.', 'D-165'),
	('token', '--experiment-variant-c','retired', null, 'No A/B experiment component exists in this repository or any consumer.', 'D-165'),

	-- Industry gradients: the stated identity of each group, rendered by nothing
	('token', '--industry-finance-gradient',       'retired', '--industry-finance',       'Gradient no component rendered; the solid hue is what the occupation explorer reads.', 'D-165'),
	('token', '--industry-technology-gradient',    'retired', '--industry-technology',    'Gradient no component rendered; the solid hue is what the occupation explorer reads.', 'D-165'),
	('token', '--industry-healthcare-education-gradient','retired','--industry-healthcare-education','Gradient no component rendered; the solid hue is what the occupation explorer reads.', 'D-165'),
	('token', '--industry-legal-gradient',         'retired', '--industry-legal',         'Gradient no component rendered; the solid hue is what the occupation explorer reads.', 'D-165'),
	('token', '--industry-engineering-trades-gradient','retired','--industry-engineering-trades','Gradient no component rendered; the solid hue is what the occupation explorer reads.', 'D-165'),
	('token', '--industry-marketing-communications-gradient','retired','--industry-marketing-communications','Gradient no component rendered; the solid hue is what the occupation explorer reads.', 'D-165'),
	('token', '--industry-operations-admin-gradient','retired','--industry-operations-admin','Gradient no component rendered; the solid hue is what the occupation explorer reads.', 'D-165'),

	-- Cascade: orphaned by the deletions above, in the same change
	('token', '--ind-navy', 'retired', '--ind-aubergine', 'Existed only as a gradient stop for the retired --industry-*-gradient set.', 'D-165');

commit;
