-- AL-037: the alfons schema moves from the local context database into the
-- cloud project (D-251), as it stood in context after migration 0014.
--
-- The shape is copied unchanged: alfons is grandfathered (D-249 rule 12,
-- MKA-047), so its composite and text natural keys and its recorded_on dates
-- stay as they are. A reshape to rule 6 would be a task of its own.
--
-- The three foreign keys into ledger.decisions are not here. The ledger moves
-- under TM-113, and they arrive in the next migration once ledger.decisions
-- exists in this project.

create schema alfons;
comment on schema alfons is
  'Authored facts about the Alfons design library, owned by the design-system '
  'domain. Build-time only: the generator joins these onto the derived '
  'manifest, and no runtime consumer ever reaches this database (D-162). Not '
  'exposed to the Data API; reached through psql.';

-- Rule 7: closed lists whose values carry no data, so enums.
create type alfons.entity_kind as enum ('token', 'component');
comment on type alfons.entity_kind is
  'What an Alfons name denotes: a CSS custom property or a Svelte component.';

create type alfons.layout_tier as enum ('shell', 'region', 'container', 'primitive');
comment on type alfons.layout_tier is
  'Outermost first. shell frames the page, region divides it, container '
  'arranges within a region, primitive is a leaf arrangement helper.';

create type alfons.lifecycle_status as enum ('live', 'deprecated', 'retired');
comment on type alfons.lifecycle_status is
  'Where a token or component stands: live, deprecated (still defined, do not '
  'adopt) or retired (deleted, answered as a tombstone).';

create table alfons.entities (
  kind              alfons.entity_kind not null,
  name              text not null,
  first_recorded_on date not null default current_date,
  constraint entities_pkey primary key (kind, name),
  constraint component_is_pascal_case
    check (kind <> 'component' or name ~ '^[A-Z][A-Za-z0-9]*$'),
  constraint token_is_a_custom_property
    check (kind <> 'token' or name ~ '^--[a-z0-9-]+$')
);
comment on table alfons.entities is
  'Every token and component name Alfons has carried, including names since '
  'deleted. Synced from the manifest by bun run lifecycle:sync; append-only in '
  'practice, because a tombstone outlives the thing it marks. Server-only; '
  'reached through psql. RLS on with no policies.';
alter table alfons.entities enable row level security;

create table alfons.lifecycle (
  kind             alfons.entity_kind not null,
  name             text not null,
  status           alfons.lifecycle_status not null,
  replacement_name text,
  reason           text not null,
  decision_id      text,
  recorded_on      date not null default current_date,
  constraint lifecycle_pkey primary key (kind, name),
  constraint lifecycle_kind_name_fkey
    foreign key (kind, name) references alfons.entities (kind, name),
  constraint lifecycle_kind_replacement_name_fkey
    foreign key (kind, replacement_name) references alfons.entities (kind, name),
  constraint live_has_no_replacement
    check (status <> 'live' or replacement_name is null),
  constraint reason_is_not_blank check (length(btrim(reason)) > 0),
  constraint removal_cites_a_decision
    check (status = 'live' or decision_id is not null),
  constraint replacement_is_not_itself
    check (replacement_name is distinct from name)
);
comment on table alfons.lifecycle is
  'One authored judgement per token or component. Joined onto the derived '
  'manifest at build time; a row whose subject is no longer in the source tree '
  'is emitted as a tombstone, so an agent naming a retired token is told what '
  'replaced it and which decision said so. Server-only; reached through psql. '
  'RLS on with no policies.';
comment on column alfons.lifecycle.replacement_name is
  'What to reach for instead. Read by review_markup, so the wording that lands '
  'in front of an agent is this column and not prose in a comment.';
alter table alfons.lifecycle enable row level security;

create table alfons.layout_tiers (
  name        text not null,
  tier        alfons.layout_tier not null,
  reason      text not null,
  decision_id text not null,
  recorded_on date not null default current_date,
  kind        alfons.entity_kind not null default 'component',
  constraint layout_tiers_pkey primary key (name),
  constraint layout_tiers_kind_name_fkey
    foreign key (kind, name) references alfons.entities (kind, name),
  constraint kind_is_component check (kind = 'component'),
  constraint reason_is_not_blank check (length(btrim(reason)) > 0)
);
comment on table alfons.layout_tiers is
  'Composition order for layout components, joined into the manifest at build '
  'time. Read by both get_layout_recipe and the layout-nesting rule, so the '
  'order an agent is told and the order it is judged against are one fact. '
  'Server-only; reached through psql. RLS on with no policies.';
alter table alfons.layout_tiers enable row level security;

create table alfons.design_decisions (
  decision_id text not null,
  recorded_on date not null default current_date,
  constraint design_decisions_pkey primary key (decision_id)
);
comment on table alfons.design_decisions is
  'Confirmed ledger decisions included in Alfons design memory. Membership is '
  'authored; decision content is joined from ledger_api.decisions_v1 when the '
  'manifest is generated. Server-only; reached through psql. RLS on with no '
  'policies.';
alter table alfons.design_decisions enable row level security;
