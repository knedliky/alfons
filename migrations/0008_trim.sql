-- 0008_trim.sql
--
-- D-181: 100 tokens retired and deleted, 5 reclassified live.
--
-- The rule was one line — a token survives only if something reads it, or if
-- something that is read derives from it — and applying it took three passes,
-- because the first two audits were wrong in ways worth recording here. The
-- next person to run this will make the same mistakes.
--
-- Pass one treated src/tokens as definitions and everything outside it as
-- consumption. base.css lives in src/tokens and defines nothing: it sets h1
-- from --type-display and paints the workbench from --bench-*. The audit
-- proposed deleting the heading scale and the ground.
--
-- Pass two stripped every custom-property declaration before looking for
-- reads. That hid `--pill-tint: var(--category-agents)` and with it all six
-- --category-* tokens, because a component-local property is a CONSUMER of a
-- token, not a derivation of one. Definition and consumption are properties of
-- a declaration, not of a file.
--
-- Pass three still missed two classes no var() analysis can reach: --input-bg,
-- read from a TypeScript string literal, and --space-9, whose name does not
-- exist until resolveGap builds it at runtime. Both are in the live block.
--
-- The general lesson: a token vocabulary has consumers a grep cannot see. An
-- audit has to look for the name as a var(), then as text anywhere, then for
-- the machinery that assembles it — and the third pass is the one that would
-- have shipped a silent break.

begin;

insert into alfons.lifecycle (kind, name, status, replacement_name, reason, decision_id) values
	('token', '--accent-depth', 'retired', '--flange-plum', 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--accent-depth-bg', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--accent-depth-border', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--accent-playful', 'retired', '--pinion-pink', 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--accent-secondary-bg', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--accent-secondary-border', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--accent-secondary-hover', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--accent-secondary-hover-subtle', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--accent-tint', 'retired', '--accent-bg', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--admin-header-size', 'retired', null, 'Admin header typography nothing has read since that header was rebuilt.', 'D-181'),
	('token', '--admin-header-weight', 'retired', null, 'Admin header typography nothing has read since that header was rebuilt.', 'D-181'),
	('token', '--admin-subheader-size', 'retired', null, 'Admin header typography nothing has read since that header was rebuilt.', 'D-181'),
	('token', '--amber', 'retired', '--brass-amber', 'Pre-retune brand name, kept as an alias through the migration so both repositories could keep building. Consumers have migrated.', 'D-181'),
	('token', '--aubergine', 'retired', '--flange-plum', 'Pre-retune brand name, kept as an alias through the migration so both repositories could keep building. Consumers have migrated.', 'D-181'),
	('token', '--blush-pink', 'retired', '--pinion-pink', 'Pre-retune brand name, kept as an alias through the migration so both repositories could keep building. Consumers have migrated.', 'D-181'),
	('token', '--burnt-sunset', 'retired', '--gantry-orange', 'Pre-retune brand name, kept as an alias through the migration so both repositories could keep building. Consumers have migrated.', 'D-181'),
	('token', '--button-outline-hover-shadow', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--button-secondary-hover-bg', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--button-secondary-hover-border', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--card-border-bottom', 'retired', '--card-border', 'Per-edge alias of --card-border. 0002 recorded Atlas as the consumer; Atlas no longer borders cards one edge at a time.', 'D-181'),
	('token', '--card-border-left', 'retired', '--card-border', 'Per-edge alias of --card-border. 0002 recorded Atlas as the consumer; Atlas no longer borders cards one edge at a time.', 'D-181'),
	('token', '--card-border-right', 'retired', '--card-border', 'Per-edge alias of --card-border. 0002 recorded Atlas as the consumer; Atlas no longer borders cards one edge at a time.', 'D-181'),
	('token', '--card-border-top', 'retired', '--card-border', 'Per-edge alias of --card-border. 0002 recorded Atlas as the consumer; Atlas no longer borders cards one edge at a time.', 'D-181'),
	('token', '--charcoal-ember', 'retired', '--foundry-black', 'Pre-retune brand name, kept as an alias through the migration so both repositories could keep building. Consumers have migrated.', 'D-181'),
	('token', '--chart-admin-series-2', 'retired', '--chart-admin-series-1', 'BarChart and LineChart plot a single series and read only --chart-admin-series-1. An eight-colour scale for a one-line chart.', 'D-181'),
	('token', '--chart-admin-series-3', 'retired', '--chart-admin-series-1', 'BarChart and LineChart plot a single series and read only --chart-admin-series-1. An eight-colour scale for a one-line chart.', 'D-181'),
	('token', '--chart-admin-series-4', 'retired', '--chart-admin-series-1', 'BarChart and LineChart plot a single series and read only --chart-admin-series-1. An eight-colour scale for a one-line chart.', 'D-181'),
	('token', '--chart-admin-series-5', 'retired', '--chart-admin-series-1', 'BarChart and LineChart plot a single series and read only --chart-admin-series-1. An eight-colour scale for a one-line chart.', 'D-181'),
	('token', '--chart-series-2', 'retired', '--chart-admin-series-1', 'BarChart and LineChart plot a single series and read only --chart-admin-series-1. An eight-colour scale for a one-line chart.', 'D-181'),
	('token', '--chart-series-3', 'retired', '--chart-admin-series-1', 'BarChart and LineChart plot a single series and read only --chart-admin-series-1. An eight-colour scale for a one-line chart.', 'D-181'),
	('token', '--chart-series-4', 'retired', '--chart-admin-series-1', 'BarChart and LineChart plot a single series and read only --chart-admin-series-1. An eight-colour scale for a one-line chart.', 'D-181'),
	('token', '--chart-series-5', 'retired', '--chart-admin-series-1', 'BarChart and LineChart plot a single series and read only --chart-admin-series-1. An eight-colour scale for a one-line chart.', 'D-181'),
	('token', '--chart-series-6', 'retired', '--chart-admin-series-1', 'BarChart and LineChart plot a single series and read only --chart-admin-series-1. An eight-colour scale for a one-line chart.', 'D-181'),
	('token', '--chart-series-7', 'retired', '--chart-admin-series-1', 'BarChart and LineChart plot a single series and read only --chart-admin-series-1. An eight-colour scale for a one-line chart.', 'D-181'),
	('token', '--chart-series-8', 'retired', '--chart-admin-series-1', 'BarChart and LineChart plot a single series and read only --chart-admin-series-1. An eight-colour scale for a one-line chart.', 'D-181'),
	('token', '--color-full', 'retired', '--colour-full', 'American spelling, deprecated by D-167 pending an Atlas migration. That migration landed with D-181.', 'D-181'),
	('token', '--color-human', 'retired', '--colour-human', 'American spelling, deprecated by D-167 pending an Atlas migration. That migration landed with D-181.', 'D-181'),
	('token', '--color-partial', 'retired', '--colour-partial', 'American spelling, deprecated by D-167 pending an Atlas migration. That migration landed with D-181.', 'D-181'),
	('token', '--danger-deep', 'retired', '--accent-deep', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--duration-instant', 'retired', '--dur-fast', 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--duration-spring', 'retired', '--dur-slow', 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--ease-out', 'retired', '--ease-machined', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--ease-spring-wobbly', 'retired', '--ease-spring', 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--fire-engine-red', 'retired', '--girder-red', 'Pre-retune brand name, kept as an alias through the migration so both repositories could keep building. Consumers have migrated.', 'D-181'),
	('token', '--focus-tint', 'retired', '--focus', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--font-sans', 'retired', '--font-body', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--fw-black', 'retired', null, 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--fw-light', 'retired', null, 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--gradient-warmth', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--hex-amber', 'retired', '--brass-amber', 'A second literal for a hue that already had one. D-179 made it an alias; D-181 removed the alias, so a hue is written exactly once.', 'D-181'),
	('token', '--hex-aubergine', 'retired', '--flange-plum', 'A second literal for a hue that already had one. D-179 made it an alias; D-181 removed the alias, so a hue is written exactly once.', 'D-181'),
	('token', '--hex-blush', 'retired', '--pinion-pink', 'A second literal for a hue that already had one. D-179 made it an alias; D-181 removed the alias, so a hue is written exactly once.', 'D-181'),
	('token', '--hex-dark', 'retired', '--foundry-black', 'A second literal for a hue that already had one. D-179 made it an alias; D-181 removed the alias, so a hue is written exactly once.', 'D-181'),
	('token', '--hex-light', 'retired', '--ink-900', 'A second literal for a hue that already had one. D-179 made it an alias; D-181 removed the alias, so a hue is written exactly once.', 'D-181'),
	('token', '--hex-navy', 'retired', '--boiler-navy', 'A second literal for a hue that already had one. D-179 made it an alias; D-181 removed the alias, so a hue is written exactly once.', 'D-181'),
	('token', '--hex-olive', 'retired', '--toolbox-olive', 'A second literal for a hue that already had one. D-179 made it an alias; D-181 removed the alias, so a hue is written exactly once.', 'D-181'),
	('token', '--hex-red', 'retired', '--girder-red', 'A second literal for a hue that already had one. D-179 made it an alias; D-181 removed the alias, so a hue is written exactly once.', 'D-181'),
	('token', '--hex-sand', 'retired', '--ink-500', 'A second literal for a hue that already had one. D-179 made it an alias; D-181 removed the alias, so a hue is written exactly once.', 'D-181'),
	('token', '--hex-sky', 'retired', '--pulley-blue', 'A second literal for a hue that already had one. D-179 made it an alias; D-181 removed the alias, so a hue is written exactly once.', 'D-181'),
	('token', '--hex-sunset', 'retired', '--gantry-orange', 'A second literal for a hue that already had one. D-179 made it an alias; D-181 removed the alias, so a hue is written exactly once.', 'D-181'),
	('token', '--layout-hero-min-height', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--led-off', 'retired', null, 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--navy-royal', 'retired', '--boiler-navy', 'Pre-retune brand name, kept as an alias through the migration so both repositories could keep building. Consumers have migrated.', 'D-181'),
	('token', '--olive-green', 'retired', '--toolbox-olive', 'Pre-retune brand name, kept as an alias through the migration so both repositories could keep building. Consumers have migrated.', 'D-181'),
	('token', '--opacity-background', 'retired', null, 'A scale authored whole and adopted at one rung. The adopted rung stays.', 'D-181'),
	('token', '--opacity-line', 'retired', null, 'A scale authored whole and adopted at one rung. The adopted rung stays.', 'D-181'),
	('token', '--opacity-primary', 'retired', null, 'A scale authored whole and adopted at one rung. The adopted rung stays.', 'D-181'),
	('token', '--opacity-secondary', 'retired', null, 'A scale authored whole and adopted at one rung. The adopted rung stays.', 'D-181'),
	('token', '--powder-sand', 'retired', '--ink-900', 'Pre-retune brand name, kept as an alias through the migration so both repositories could keep building. Consumers have migrated.', 'D-181'),
	('token', '--section-padding-y', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--select-selected-highlighted-bg', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--shade-part', 'retired', null, 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--shadow-header', 'retired', '--shadow-1', 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--shadow-part', 'retired', null, 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--sheen', 'retired', '--sheen-rgb', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--shimmer-highlight-bright', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--sky-blue', 'retired', '--pulley-blue', 'Pre-retune brand name, kept as an alias through the migration so both repositories could keep building. Consumers have migrated.', 'D-181'),
	('token', '--state-hover-opacity', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--stroke-medium', 'retired', null, 'A scale authored whole and adopted at one rung. The adopted rung stays.', 'D-181'),
	('token', '--stroke-thick', 'retired', null, 'A scale authored whole and adopted at one rung. The adopted rung stays.', 'D-181'),
	('token', '--stroke-thin', 'retired', null, 'A scale authored whole and adopted at one rung. The adopted rung stays.', 'D-181'),
	('token', '--surface-dark-subtle', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--surface-float-bg', 'retired', '--elevation-3-bg', 'Surface-tier bundle no component composed; the tiers are read through their parts.', 'D-181'),
	('token', '--surface-float-shadow', 'retired', '--shadow-2', 'Surface-tier bundle no component composed; the tiers are read through their parts.', 'D-181'),
	('token', '--surface-inverse', 'retired', '--ink-900', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--surface-raised-shadow', 'retired', '--shadow-1', 'Surface-tier bundle no component composed; the tiers are read through their parts.', 'D-181'),
	('token', '--surface-rest-frost', 'retired', '--frost-1', 'Surface-tier bundle no component composed; the tiers are read through their parts.', 'D-181'),
	('token', '--surface-rest-shadow', 'retired', '--shadow-1', 'Surface-tier bundle no component composed; the tiers are read through their parts.', 'D-181'),
	('token', '--surface-sunken', 'retired', '--foundry-black', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--toast-shadow', 'retired', '--shadow-2', 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181'),
	('token', '--type-body', 'retired', '--text-ui', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--type-prose', 'retired', '--text-body', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--type-small', 'retired', '--text-caption', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--white', 'retired', '--ink-900', 'Authored during the Meccano retune against a component that does not exist. The same speculative-token argument D-165 made, applied to that work.', 'D-181'),
	('token', '--widget-reorganise-duration', 'retired', null, 'Widget-bar motion the FLIP reorganisation never read.', 'D-181'),
	('token', '--widget-reorganise-stagger', 'retired', null, 'Widget-bar motion the FLIP reorganisation never read.', 'D-181'),
	('token', '--widget-spring-easing-wobbly', 'retired', '--ease-spring', 'Widget-bar motion the FLIP reorganisation never read.', 'D-181'),
	('token', '--widget-transition-duration', 'retired', '--dur-slow', 'Widget-bar motion the FLIP reorganisation never read.', 'D-181'),
	('token', '--widget-transition-easing', 'retired', '--ease-machined', 'Widget-bar motion the FLIP reorganisation never read.', 'D-181'),
	('token', '--z-base', 'retired', null, 'No rule in either repository reads it, and nothing that is read derives from it (D-181).', 'D-181')
on conflict (kind, name) do update set
	status = excluded.status, replacement_name = excluded.replacement_name,
	reason = excluded.reason, decision_id = excluded.decision_id, recorded_on = current_date;

-- Reclassified live: a consumer reads them, so the deprecation was a stale
-- judgement. Deprecation is a claim about adoption, and adoption can come back.
insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--button-ghost-hover-bg', 'live', 'Read by Button since the Meccano retune gave ghost a steel wash.'),
	('token', '--input-height-lg', 'live', 'Read by Button size=lg, which is the 44px touch target.'),
	('token', '--select-selected-bg', 'live', 'Read by Select for the highlighted option.'),
	('token', '--input-bg', 'live', 'Read by Select.svelte through getThemeToken(''--input-bg'', …) — a string literal, invisible to a var() audit.'),
	('token', '--space-9', 'live', 'Rung of a programmatically indexed scale: resolveGap builds the name at runtime from a Gap type permitting 1 through 10.')
on conflict (kind, name) do update set
	status = excluded.status, replacement_name = null,
	reason = excluded.reason, decision_id = null, recorded_on = current_date;

commit;
