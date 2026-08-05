-- 0005_meccano-part-names.sql
--
-- D-179: the Meccano retune renames the eight brand hues after the parts they
-- resemble, and the part name becomes the definition. This file records what
-- happened to the names it displaced.
--
-- Nothing is deleted. Every previous name survives as an alias of its part
-- colour, so Alfons and Atlas keep building through the retune; these rows are
-- what make the aliases legible as a migration path rather than as residue.
-- An agent reaching for --fire-engine-red is told it is deprecated and that
-- --girder-red replaces it, which is the whole point of the table.
--
-- ---------------------------------------------------------------------------
-- Why the --hex-* family is in here too
-- ---------------------------------------------------------------------------
-- Those eleven were never a naming problem, they were a duplication one.
-- colours.css defined each brand hue twice — once in OKLCH under the brand
-- name, once in hex under --hex-* — with a comment asserting the pair was 1:1.
-- The pair was not exactly equal and nothing checked it. They are now aliases
-- of the single hex definition, so the two cannot disagree.
--
-- They are deprecated rather than retired because the reason they exist has
-- not gone away: SVG and illustration contexts sometimes cannot read a derived
-- value, and Atlas consumes --hex-dark and --hex-light for exactly that. The
-- deprecation says "prefer the part name", not "this will stop working".

begin;

-- ---------------------------------------------------------------------------
-- The eight part colours and the two ground/ink names — now the definitions
-- ---------------------------------------------------------------------------

insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--girder-red',    'live', 'Hero accent. The definition; --fire-engine-red aliases it.'),
	('token', '--gantry-orange', 'live', 'The definition; --burnt-sunset aliases it.'),
	('token', '--flange-plum',   'live', 'The definition; --aubergine aliases it.'),
	('token', '--pulley-blue',   'live', 'Functional blue — links, focus, selection. --sky-blue aliases it.'),
	('token', '--pinion-pink',   'live', 'The definition; --blush-pink aliases it.'),
	('token', '--toolbox-olive', 'live', 'The definition; --olive-green aliases it.'),
	('token', '--boiler-navy',   'live', 'The definition; --navy-royal aliases it.'),
	('token', '--brass-amber',   'live', 'The definition; --amber aliases it.'),
	('token', '--foundry-black', 'live', 'The ground every neutral derives off. --charcoal-ember aliases it.'),
	('token', '--ink-900',       'live', 'Bone. Primary text and the bright pole of the neutral ramp.')
on conflict (kind, name) do update set
	status           = excluded.status,
	replacement_name = excluded.replacement_name,
	reason           = excluded.reason,
	decision_id      = excluded.decision_id,
	recorded_on      = current_date;

-- The derived ramps. No consumer names them directly yet — components read the
-- semantic aliases — but they are the mechanism the retune is built on, not
-- unadopted rungs, so they are live with the reason said out loud.

insert into alfons.lifecycle (kind, name, status, reason) values
	('token', '--ink-700',   'live', 'Neutral ramp, derived off --foundry-black. Read through semantic aliases.'),
	('token', '--ink-500',   'live', 'Secondary text, via --text-secondary.'),
	('token', '--ink-400',   'live', 'Muted text, via --text-muted.'),
	('token', '--ink-300',   'live', 'Neutral ramp, derived. Read through semantic aliases.'),
	('token', '--steel-200', 'live', 'Surface ramp, derived. The machined card edge.'),
	('token', '--steel-150', 'live', 'Surface ramp, derived.'),
	('token', '--steel-100', 'live', 'Surface ramp. Input fill and the neutral hover wash.'),
	('token', '--steel-50',  'live', 'Surface ramp. Sunken zones — footers, wells.')
on conflict (kind, name) do update set
	status           = excluded.status,
	replacement_name = excluded.replacement_name,
	reason           = excluded.reason,
	decision_id      = excluded.decision_id,
	recorded_on      = current_date;

-- ---------------------------------------------------------------------------
-- Deprecated — the previous brand names, still live as aliases
-- ---------------------------------------------------------------------------

insert into alfons.lifecycle (kind, name, status, replacement_name, reason, decision_id) values
	('token', '--fire-engine-red', 'deprecated', '--girder-red',    'Renamed for the part it resembles and re-tuned to poppy vermilion. Still defined as an alias; 52 files in Atlas read it.', 'D-179'),
	('token', '--burnt-sunset',    'deprecated', '--gantry-orange', 'Renamed and re-tuned to persimmon. Still defined as an alias.', 'D-179'),
	('token', '--aubergine',       'deprecated', '--flange-plum',   'Renamed and re-tuned to girard purple. Still defined as an alias.', 'D-179'),
	('token', '--sky-blue',        'deprecated', '--pulley-blue',   'Renamed and re-tuned to clear sky. Still defined as an alias.', 'D-179'),
	('token', '--blush-pink',      'deprecated', '--pinion-pink',   'Renamed and re-tuned to hot magenta. Still defined as an alias.', 'D-179'),
	('token', '--olive-green',     'deprecated', '--toolbox-olive', 'Renamed and re-tuned to leaf olive. Still defined as an alias.', 'D-179'),
	('token', '--navy-royal',      'deprecated', '--boiler-navy',   'Renamed and re-tuned to cobalt. Still defined as an alias.', 'D-179'),
	('token', '--amber',           'deprecated', '--brass-amber',   'Renamed and re-tuned to mustard ochre. Still defined as an alias.', 'D-179'),
	('token', '--powder-sand',     'deprecated', '--ink-900',       'The bone text tone is now the top of a derived neutral ramp rather than a standalone brand hue.', 'D-179'),
	('token', '--charcoal-ember',  'deprecated', '--foundry-black', 'The ground is now the pole every neutral derives off, and is named for that role.', 'D-179')
on conflict (kind, name) do update set
	status           = excluded.status,
	replacement_name = excluded.replacement_name,
	reason           = excluded.reason,
	decision_id      = excluded.decision_id,
	recorded_on      = current_date;

-- ---------------------------------------------------------------------------
-- Deprecated — the hex duplicates, now aliases of the one definition
-- ---------------------------------------------------------------------------
-- Three of these already carry rows. --hex-dark and --hex-light were recorded
-- live by 0002 because Atlas reads them for SVG fills, and --hex-sand was
-- deprecated by D-166 as an unused rung with nowhere to point. All three now
-- have a replacement to name, which is a refinement of those rows rather than
-- a reversal of them, so this upserts instead of asserting a clean table.

insert into alfons.lifecycle (kind, name, status, replacement_name, reason, decision_id) values
	('token', '--hex-red',       'deprecated', '--girder-red',    'Was a second literal for the same hue. Now an alias. Prefer the part name unless the context genuinely cannot read a derived value.', 'D-179'),
	('token', '--hex-sunset',    'deprecated', '--gantry-orange', 'Was a second literal for the same hue. Now an alias.', 'D-179'),
	('token', '--hex-aubergine', 'deprecated', '--flange-plum',   'Was a second literal for the same hue. Now an alias.', 'D-179'),
	('token', '--hex-sky',       'deprecated', '--pulley-blue',   'Was a second literal for the same hue. Now an alias.', 'D-179'),
	('token', '--hex-blush',     'deprecated', '--pinion-pink',   'Was a second literal for the same hue. Now an alias.', 'D-179'),
	('token', '--hex-olive',     'deprecated', '--toolbox-olive', 'Was a second literal for the same hue. Now an alias.', 'D-179'),
	('token', '--hex-navy',      'deprecated', '--boiler-navy',   'Was a second literal for the same hue. Now an alias.', 'D-179'),
	('token', '--hex-amber',     'deprecated', '--brass-amber',   'Was a second literal for the same hue. Now an alias.', 'D-179'),
	('token', '--hex-sand',      'deprecated', '--ink-500',       'Was a second literal for the sand tone. Now an alias of the ramp step that carries it.', 'D-179'),
	('token', '--hex-dark',      'deprecated', '--foundry-black', 'Was a second literal for the ground. Now an alias. Atlas reads it for SVG fills.', 'D-179'),
	('token', '--hex-light',     'deprecated', '--ink-900',       'Was a second literal for bone. Now an alias. Atlas reads it for SVG fills.', 'D-179')
on conflict (kind, name) do update set
	status           = excluded.status,
	replacement_name = excluded.replacement_name,
	reason           = excluded.reason,
	decision_id      = excluded.decision_id,
	recorded_on      = current_date;

-- ---------------------------------------------------------------------------
-- Corrections to 0002, which the retune has overtaken
-- ---------------------------------------------------------------------------
-- --font-drop-cap's row said Rock Salt ships as a dependency for it. It no
-- longer does: the Meccano type system is Moderat and GT America Mono, and the
-- @fontsource packages left with the faces they loaded. The token is still
-- live and Atlas still reads it — only the face behind it changed.

update alfons.lifecycle
set reason = 'Consumed by Atlas editorial pages. Resolves to Moderat Black since the Meccano retune; Rock Salt is gone.',
    recorded_on = current_date
where kind = 'token' and name = '--font-drop-cap';

commit;
