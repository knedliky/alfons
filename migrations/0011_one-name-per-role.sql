-- 0011_one-name-per-role.sql
--
-- AL-026: one token name per semantic role.
--
-- A theme under D-238 is a set of values for the semantic tokens, and a role
-- with two names defeats that. The author cannot tell which name to set, and a
-- theme that sets one leaves the other pointing at Meccano. So every second
-- name below is retired and deleted, and its row names the survivor.
--
-- The status family is the case D-181 already decided. It chose the
-- Australian --colour-* spelling over the short --info/--success/--warning/
-- --danger names, but the short names survived as the source --colour-*
-- pointed at, and 0006 recorded them live on that basis. The survivors now
-- carry the values themselves. --status-*-text was a third name, read only by
-- StatusBadge.
--
-- The rest came out of scripts/find-token-aliases.ts, which lists every
-- semantic token whose whole value is var() of another semantic token. Each
-- alias it found was either retired here or kept with an `@role` comment in
-- the token file saying why it is a different role. That comment is the
-- record for the kept ones; this file is the record for the retired ones.
--
-- Alfons's components, stories, dev chrome and prototypes moved to the
-- survivors in the same change. The website pins Alfons at a commit and still
-- reads some of these names; the retired-token rule flags each read with its
-- replacement, which is what its migration task works from.

begin;

-- Lifecycle rows cite D-238, so Alfons's design memory carries it too (D-182).
insert into alfons.design_decisions (decision_id) values ('D-238')
on conflict (decision_id) do nothing;

insert into alfons.lifecycle (kind, name, status, replacement_name, reason, decision_id) values
	('token', '--success', 'retired', '--colour-success', 'Short status name that lost to the --colour-* spelling under D-181; it survived only as the value --colour-success pointed at (AL-026).', 'D-181'),
	('token', '--warning', 'retired', '--colour-warning', 'Short status name that lost to the --colour-* spelling under D-181; it survived only as the value --colour-warning pointed at (AL-026).', 'D-181'),
	('token', '--danger', 'retired', '--colour-error', 'Short status name that lost to the --colour-* spelling under D-181; it survived only as the value --colour-error pointed at (AL-026).', 'D-181'),
	('token', '--info', 'retired', '--colour-info', 'Short status name that lost to the --colour-* spelling under D-181; it survived only as the value --colour-info pointed at (AL-026).', 'D-181'),
	('token', '--success-tint', 'retired', '--colour-success-bg', 'Short status wash that lost to the --colour-* spelling under D-181; it survived only as the value --colour-success-bg pointed at (AL-026).', 'D-181'),
	('token', '--warning-tint', 'retired', '--colour-warning-bg', 'Short status wash that lost to the --colour-* spelling under D-181; it survived only as the value --colour-warning-bg pointed at (AL-026).', 'D-181'),
	('token', '--danger-tint', 'retired', '--colour-error-bg', 'Short status wash that lost to the --colour-* spelling under D-181; it survived only as the value --colour-error-bg pointed at (AL-026).', 'D-181'),
	('token', '--info-tint', 'retired', '--colour-info-bg', 'Short status wash that lost to the --colour-* spelling under D-181; it survived only as the value --colour-info-bg pointed at (AL-026).', 'D-181'),
	('token', '--status-success-text', 'retired', '--colour-success', 'A third name for the success colour, read only by StatusBadge (AL-026).', 'D-181'),
	('token', '--status-warning-text', 'retired', '--colour-warning', 'A third name for the warning colour, read only by StatusBadge (AL-026).', 'D-181'),
	('token', '--status-error-text', 'retired', '--colour-error', 'A third name for the error colour, read only by StatusBadge (AL-026).', 'D-181'),
	('token', '--status-info-text', 'retired', '--colour-info', 'A third name for the info colour, read only by StatusBadge (AL-026).', 'D-181'),
	('token', '--admin-bg-page', 'retired', '--admin-bg', 'A second name for --admin-bg with no reader in Alfons; a theme setting one would leave the other behind (AL-026).', 'D-238'),
	('token', '--section-padding-x', 'retired', '--page-padding-x', 'A second name for --page-padding-x with no reader in Alfons; a theme setting one would leave the other behind (AL-026).', 'D-238'),
	('token', '--card-radius', 'retired', '--radius-surface', 'A third name for --radius-2, documented as form fields and read only by a story drawing a card. Cards take --radius-surface, form controls --radius (AL-026).', 'D-238'),
	('token', '--focus-ring-color', 'retired', '--focus', 'A second, American-spelled name for the focus hue, which --focus already names (AL-026).', 'D-238'),
	('token', '--border-glass', 'retired', '--border-hairline', 'A second name for the hairline, kept from before the Meccano retune removed glass (AL-026).', 'D-238'),
	('token', '--border-glass-hover', 'retired', '--border-default', 'A second name for the default border, kept from before the Meccano retune removed glass (AL-026).', 'D-238'),
	('token', '--surface-glass-bg', 'retired', '--surface-card', 'A second name for the card fill, kept from before the Meccano retune removed glass (AL-026).', 'D-238'),
	('token', '--duration-fast', 'retired', '--dur-med', 'A second name for the 200ms step. The replacement is --dur-med, not --dur-fast, because that is the step it resolved to (AL-026).', 'D-238'),
	('token', '--duration-normal', 'retired', '--dur-slow', 'A second name for the 320ms step (AL-026).', 'D-238'),
	('token', '--duration-slow', 'retired', '--dur-slow', 'A second name for the 320ms step (AL-026).', 'D-238')
on conflict (kind, name) do update set
	status = excluded.status, replacement_name = excluded.replacement_name,
	reason = excluded.reason, decision_id = excluded.decision_id, recorded_on = current_date;

commit;
