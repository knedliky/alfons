-- 0015_alfons-moved-to-supabase.sql
--
-- AL-037: alfons now lives in the cloud project (D-251), so context's copy
-- stops taking writes and stops answering readers. This is the last context
-- migration for alfons; later ones are cloud migrations in supabase/migrations/.
--
-- A REVOKE alone would not stop the writes: the local role that wrote alfons
-- is a superuser, and a superuser ignores grants. A statement-level trigger
-- fires for superusers too, so every insert, update, delete and truncate is
-- refused with the reason.
--
-- context_reader also loses select. A session whose LEDGER_DATABASE_URL still
-- names context would otherwise build a manifest from this frozen copy, which
-- reads as correct while missing every later change. A refused read fails the
-- build out loud instead.
--
-- Run before copying the rows to the cloud, so nothing written after the copy
-- is left behind here.

begin;

create function alfons.refuse_writes_after_move() returns trigger
language plpgsql as $$
begin
	raise exception 'alfons moved to the Supabase project motivka on 2026-11-02 (AL-037, D-251); % on %.% is refused here',
		tg_op, tg_table_schema, tg_table_name
		using hint = 'Write through scripts/psql.ts, which connects as alfons_writer.';
end;
$$;
comment on function alfons.refuse_writes_after_move() is
	'Refuses every write to context''s frozen copy of alfons, superusers included (AL-037).';

create trigger refuse_writes_after_move
	before insert or update or delete or truncate on alfons.entities
	for each statement execute function alfons.refuse_writes_after_move();
create trigger refuse_writes_after_move
	before insert or update or delete or truncate on alfons.lifecycle
	for each statement execute function alfons.refuse_writes_after_move();
create trigger refuse_writes_after_move
	before insert or update or delete or truncate on alfons.layout_tiers
	for each statement execute function alfons.refuse_writes_after_move();
create trigger refuse_writes_after_move
	before insert or update or delete or truncate on alfons.design_decisions
	for each statement execute function alfons.refuse_writes_after_move();

revoke select on alfons.entities, alfons.lifecycle, alfons.layout_tiers,
	alfons.design_decisions from context_reader;
revoke usage on schema alfons from context_reader;

comment on schema alfons is
	'Frozen copy. alfons moved to the Supabase project motivka on 2026-11-02 '
	'(AL-037, D-251); every write here is refused.';

commit;
