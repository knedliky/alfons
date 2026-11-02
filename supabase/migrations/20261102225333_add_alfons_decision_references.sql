-- AL-037: a layout tier, a deprecation and a retirement each cite a real
-- ledger decision, as they did in context (migrations 0001, 0003 and 0010).
--
-- Kept apart from the schema because ledger.decisions reaches this project
-- under TM-113. Apply it after TM-113 has created the ledger and copied its
-- rows, and after alfons's own rows are copied, so each constraint is checked
-- against the full set of decisions once.

alter table alfons.lifecycle
  add constraint lifecycle_decision_id_fkey
  foreign key (decision_id) references ledger.decisions (id);

alter table alfons.layout_tiers
  add constraint layout_tiers_decision_id_fkey
  foreign key (decision_id) references ledger.decisions (id);

alter table alfons.design_decisions
  add constraint design_decisions_decision_id_fkey
  foreign key (decision_id) references ledger.decisions (id);
