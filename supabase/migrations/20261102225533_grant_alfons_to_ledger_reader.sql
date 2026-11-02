-- AL-037: the manifest build reads alfons with ledger_reader.
--
-- scripts/generate-manifest.ts joins alfons.design_decisions onto
-- ledger_api.decisions_v1 in one query, so it reads over the connection that
-- already sees ledger_api: LEDGER_DATABASE_URL, which is ledger_reader since
-- TM-113's cutover. That role owns nothing here, so row-level security hides
-- every row from it unless a policy admits it, and the generator would build
-- a manifest with no lifecycle without an error. Each table gets one policy
-- for that role, and select only; the role's sessions are read-only anyway.

grant usage on schema alfons to ledger_reader;
grant select on alfons.entities, alfons.lifecycle, alfons.layout_tiers,
  alfons.design_decisions to ledger_reader;

create policy ledger_reader_reads_entities on alfons.entities
  for select to ledger_reader using (true);
create policy ledger_reader_reads_lifecycle on alfons.lifecycle
  for select to ledger_reader using (true);
create policy ledger_reader_reads_layout_tiers on alfons.layout_tiers
  for select to ledger_reader using (true);
create policy ledger_reader_reads_design_decisions on alfons.design_decisions
  for select to ledger_reader using (true);

-- Rule 8: the comments said "no policies"; say who reads now.
comment on table alfons.entities is
  'Every token and component name Alfons has carried, including names since '
  'deleted. Synced from the manifest by bun run lifecycle:sync; append-only in '
  'practice, because a tombstone outlives the thing it marks. Server-only: '
  'written by alfons_writer, read by ledger_reader for the manifest build. RLS '
  'on; one select policy, for ledger_reader.';
comment on table alfons.lifecycle is
  'One authored judgement per token or component. Joined onto the derived '
  'manifest at build time; a row whose subject is no longer in the source tree '
  'is emitted as a tombstone, so an agent naming a retired token is told what '
  'replaced it and which decision said so. Server-only: written by '
  'alfons_writer, read by ledger_reader for the manifest build. RLS on; one '
  'select policy, for ledger_reader.';
comment on table alfons.layout_tiers is
  'Composition order for layout components, joined into the manifest at build '
  'time. Read by both get_layout_recipe and the layout-nesting rule, so the '
  'order an agent is told and the order it is judged against are one fact. '
  'Server-only: written by alfons_writer, read by ledger_reader for the '
  'manifest build. RLS on; one select policy, for ledger_reader.';
comment on table alfons.design_decisions is
  'Confirmed ledger decisions included in Alfons design memory. Membership is '
  'authored; decision content is joined from ledger_api.decisions_v1 when the '
  'manifest is generated. Server-only: written by alfons_writer, read by '
  'ledger_reader for the manifest build. RLS on; one select policy, for '
  'ledger_reader.';
