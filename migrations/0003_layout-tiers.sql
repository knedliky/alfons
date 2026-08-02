-- 0003_layout-tiers.sql
--
-- Where a layout component sits in the composition order (D-168).
--
-- The second authored fact to earn a table, and it earned it the hard way.
-- AL-004 derived this ordering from the compose graph, which sounds right
-- until you look at the graph: eight of nine layout components render no other
-- layout, so there is one edge in it. Sorting that produced a "recipe" listing
-- PageFrame — the outermost shell — last, and the tests passed, because they
-- asked whether the derivation was self-consistent rather than whether the
-- answer was true.
--
-- A derived field with nothing to derive from does not come out empty. It
-- comes out confident.
--
-- ---------------------------------------------------------------------------
-- Why tiers and not a total order
-- ---------------------------------------------------------------------------
-- Container, Grid, Stack, Inline and Center are mutually interchangeable: a
-- Stack inside a Grid is as correct as a Grid inside a Stack, and both are
-- ordinary. A total order would have to invent a precedence between them, and
-- the nesting rule would then enforce that invention on every consumer. Tiers
-- state only the constraint that is real — a container does not wrap a shell —
-- and stay silent where the design is silent.

begin;

create type alfons.layout_tier as enum ('shell', 'region', 'container', 'primitive');

comment on type alfons.layout_tier is
	'Outermost first. shell frames the page, region divides it, container '
	'arranges within a region, primitive is a leaf arrangement helper.';

create table alfons.layout_tiers (
	name text primary key,
	tier alfons.layout_tier not null,
	reason text not null,
	decision_id text not null references ledger.decisions (id),
	recorded_on date not null default current_date,

	-- The same vocabulary lifecycle uses, so a tier cannot be recorded for a
	-- component that does not exist, and a renamed component surfaces here as
	-- a foreign key failure rather than as a rule that silently stops firing.
	--
	-- `kind` is pinned rather than literal because a foreign key references
	-- columns, not expressions. The check is what keeps it honest: without it
	-- the default could be overridden and a token could acquire a layout tier.
	kind alfons.entity_kind not null default 'component',
	constraint kind_is_component check (kind = 'component'),
	foreign key (kind, name) references alfons.entities (kind, name),

	constraint reason_is_not_blank check (length(btrim(reason)) > 0)
);

comment on table alfons.layout_tiers is
	'Composition order for layout components, joined into the manifest at build '
	'time. Read by both get_layout_recipe and the layout-nesting rule, so the '
	'order an agent is told and the order it is judged against are one fact.';

insert into alfons.layout_tiers (name, tier, reason, decision_id) values
	('PageFrame',   'shell',     'Frames the whole page: header, sidebar, main, footer.', 'D-168'),
	('MainLayout',  'shell',     'Frames the whole page for the admin context.', 'D-168'),
	('PageLayout',  'shell',     'Frames the whole page; renders PageFrame beneath it.', 'D-168'),
	('PageSection', 'region',    'Divides a framed page into bands.', 'D-168'),
	('Container',   'container', 'Constrains measure within a region.', 'D-168'),
	('Grid',        'container', 'Arranges children in two dimensions within a region.', 'D-168'),
	('Stack',       'container', 'Arranges children in one dimension within a region.', 'D-168'),
	('Inline',      'container', 'Arranges children along the text direction.', 'D-168'),
	('Center',      'container', 'Centres a single child within a region.', 'D-168');

grant select on alfons.layout_tiers to context_reader;

commit;
