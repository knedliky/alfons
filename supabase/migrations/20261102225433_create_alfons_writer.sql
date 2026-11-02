-- AL-037: the one role that writes alfons in the cloud.
--
-- In context, alfons was written by the local superuser. Here the writers are
-- bun run lifecycle:sync and the project hook that admits a recorded decision
-- (scripts/refresh-design-memory.ts), both through scripts/psql.ts, which
-- reads this role's connection string from the Keychain item
-- alfons-database-url. The role has no password here: a migration is plain
-- text in a repository, so the password is set as a SCRAM verifier at cutover.

-- BYPASSRLS, because every alfons table has row-level security on: without it
-- the writer sees no rows, and an upsert that should find a row inserts or
-- matches nothing without an error. The role reaches only the schema granted
-- below, so bypassing RLS opens nothing else (the TM-113 ledger_writer
-- pattern).
create role alfons_writer login bypassrls;
comment on role alfons_writer is
  'The design-system''s write path into alfons: lifecycle:sync and the design '
  'memory hook (AL-037). No other schema.';

grant usage on schema alfons to alfons_writer;
grant select, insert, update, delete on all tables in schema alfons to alfons_writer;

-- A table a later alfons migration creates is written through the same role,
-- so it is granted when it is created rather than remembered.
alter default privileges for role postgres in schema alfons
  grant select, insert, update, delete on tables to alfons_writer;

alter role alfons_writer set search_path = alfons;
