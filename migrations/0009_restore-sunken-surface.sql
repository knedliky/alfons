-- 0009_restore-sunken-surface.sql
--
-- The D-181 audit correctly found no direct consumer when it retired this
-- token, but Meccano's reference makes its role explicit: --surface-sunken is
-- the dark tray beneath a raised control plate. It belongs to the language
-- even while Card does not yet expose a footer tray slot.
--
-- This is a live design primitive, not a deprecated alias. Keeping the
-- lifecycle record in step with the restored definition ensures the manifest
-- never reports a source token as retired.

begin;

insert into alfons.lifecycle (kind, name, status, reason) values
	(
		'token',
		'--surface-sunken',
		'live',
		'Meccano control-plate tray surface. Restored after the fidelity audit showed the D-181 retirement misread a reference primitive as speculative.'
	)
on conflict (kind, name) do update set
	status = excluded.status,
	replacement_name = null,
	reason = excluded.reason,
	decision_id = null,
	recorded_on = current_date;

commit;
