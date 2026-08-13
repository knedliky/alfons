-- 0010_design-decisions.sql
--
-- The confirmed decisions Alfons should remember as design knowledge (D-182).
--
-- ledger.decisions is the authority for the words and their amendment history;
-- this table only says that a decision belongs in Alfons's read model. Keeping
-- the membership separate prevents a hook from copying mutable prose and lets
-- the manifest always join the current amended form.

begin;

create table alfons.design_decisions (
	decision_id text primary key references ledger.decisions (id),
	recorded_on date not null default current_date
);

comment on table alfons.design_decisions is
	'Confirmed ledger decisions included in Alfons design memory. Membership is '
	'authored; decision content is joined from ledger.decision_current when the '
	'manifest is generated.';

-- Existing Alfons knowledge already names the decisions that justify lifecycle
-- and layout facts. Seed those links, then include D-182: the decision that
-- established the self-updating hook loop itself.
insert into alfons.design_decisions (decision_id)
select decision_id
from alfons.lifecycle
where decision_id is not null
union
select decision_id
from alfons.layout_tiers
union
values ('D-182');

grant select on alfons.design_decisions to context_reader;

commit;
