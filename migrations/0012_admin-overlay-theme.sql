-- 0012_admin-overlay-theme.sql
--
-- AL-027: admin is an overlay theme, so the admin token namespace retires.
--
-- Under D-238 a theme is token values applied with data-theme, and admin is an
-- overlay: themes/admin.css restates only the roles that differ on an admin
-- surface. Every --admin-* name resolved to a value a general role already
-- held (--admin-text was --ink-900, exactly --text-primary), so each retires
-- with that role as its replacement and the components that read it moved in
-- the same change with no pixel moving. What genuinely differed on admin is
-- now a component role in themes/meccano.css that the overlay restates.
--
-- The chart chrome reverses D-165. D-165 retired --chart-axis-colour and its
-- six siblings in favour of -admin forms, because the charts read only those.
-- With admin a theme, a chart reads the plain name and the theme sets it, so
-- the plain names are live again and the -admin forms retire onto them. The
-- chains that pointed through the -admin forms (--chart-series-2..8,
-- --chart-admin-series-2..5, --admin-bg-page) are repointed at the end of the
-- chain, so a reader is never sent to a tombstone.
--
-- The website pins Alfons at a commit and reads most of these; the
-- retired-token rule names each replacement, which is what its migration task
-- works from.

begin;

insert into alfons.lifecycle (kind, name, status, replacement_name, reason, decision_id) values
	-- The admin core: second names for general roles.
	('token', '--admin-bg', 'retired', '--bg-primary', 'The admin ground, which was --foundry-black: the value --bg-primary already gives a surface sitting flush with the page. Admin is an overlay theme now (AL-027).', 'D-238'),
	('token', '--admin-bg-elevated', 'retired', '--bg-glass-solid', 'The raised admin fill, which was --steel-50: the value --bg-glass-solid already gives Tooltip, Menu and Popover on public pages. Admin is an overlay theme now (AL-027).', 'D-238'),
	('token', '--admin-border', 'retired', '--border-hairline', 'The admin hairline, which resolved to --border-hairline itself. The overlay sets the component edges that differ instead (AL-027).', 'D-238'),
	('token', '--admin-text', 'retired', '--text-primary', 'Admin primary text, which was --ink-900, as --text-primary is. Admin is an overlay theme now (AL-027).', 'D-238'),
	('token', '--admin-text-secondary', 'retired', '--text-secondary', 'Admin secondary text, which was --ink-500, as --text-secondary is. Admin is an overlay theme now (AL-027).', 'D-238'),
	('token', '--admin-text-muted', 'retired', '--text-muted', 'Admin muted text, which was --ink-400, as --text-muted is. Admin is an overlay theme now (AL-027).', 'D-238'),
	('token', '--admin-shadow', 'retired', '--card-shadow', 'The first shadow rung under an admin name, read only by Card, which reads --card-shadow on every theme now (AL-027).', 'D-238'),
	('token', '--admin-shadow-elevated', 'retired', '--card-shadow-hover', 'The second shadow rung under an admin name, read only by Card. Card reads --card-shadow-hover, which the admin overlay sets to the resting rung because admin cards do not lift (AL-027).', 'D-238'),
	('token', '--admin-header-size-mobile', 'retired', '--fs-xl', 'The admin PageHeader title on a phone, 1.5rem, which is --fs-xl (AL-027).', 'D-238'),
	('token', '--admin-subheader-size-mobile', 'retired', null, 'The admin PageHeader subtitle on a phone, 1rem. The type scale steps from 15px to 18px and no token holds 16px, so PageHeader writes the length itself (AL-027).', 'D-238'),

	-- The admin chart chrome retires onto the plain names, which revive below.
	('token', '--chart-admin-series-1', 'retired', '--chart-series-1', 'The admin first series, which was var(--chart-series-1). A theme sets --chart-series-1 itself (AL-027).', 'D-238'),
	('token', '--chart-axis-colour-admin', 'retired', '--chart-axis-colour', 'The admin form of the chart axis, which the charts now read under its plain name (AL-027).', 'D-238'),
	('token', '--chart-grid-colour-admin', 'retired', '--chart-grid-colour', 'The admin form of the chart grid, which the charts now read under its plain name (AL-027).', 'D-238'),
	('token', '--chart-grid-subtle-admin', 'retired', '--chart-grid-subtle', 'The admin form of the faint LineChart grid, which LineChart now reads under a plain name (AL-027).', 'D-238'),
	('token', '--chart-bg-admin', 'retired', '--chart-bg', 'The admin form of the chart ground, which the charts now read under its plain name (AL-027).', 'D-238'),
	('token', '--chart-border-admin', 'retired', '--chart-border', 'The admin form of the chart frame, which the charts now read under its plain name (AL-027).', 'D-238'),
	('token', '--chart-tooltip-bg-admin', 'retired', '--chart-tooltip-bg', 'The admin form of the chart tooltip fill, which the charts now read under its plain name (AL-027).', 'D-238'),
	('token', '--chart-tooltip-border-admin', 'retired', '--chart-tooltip-border', 'The admin form of the chart tooltip edge, which the charts now read under its plain name (AL-027).', 'D-238'),
	('token', '--chart-tooltip-text-admin', 'retired', '--chart-tooltip-text', 'The admin form of the chart tooltip text, which the charts now read under its plain name (AL-027).', 'D-238'),

	-- D-165's retirements, reversed: the plain chart chrome names are live.
	('token', '--chart-axis-colour', 'live', null, 'Revived by AL-027: BarChart and LineChart read it, and a theme sets it. D-165 retired it only because the charts read the -admin form.', null),
	('token', '--chart-grid-colour', 'live', null, 'Revived by AL-027: BarChart reads it, and a theme sets it. D-165 retired it only because the chart read the -admin form.', null),
	('token', '--chart-bg', 'live', null, 'Revived by AL-027: BarChart and LineChart read it, and a theme sets it. D-165 retired it only because the charts read the -admin form.', null),
	('token', '--chart-border', 'live', null, 'Revived by AL-027: BarChart and LineChart read it, and a theme sets it. D-165 retired it only because the charts read the -admin form.', null),
	('token', '--chart-tooltip-bg', 'live', null, 'Revived by AL-027: BarChart and LineChart read it, and a theme sets it. D-165 retired it only because the charts read the -admin form.', null),
	('token', '--chart-tooltip-border', 'live', null, 'Revived by AL-027: LineChart reads it, and a theme sets it. D-165 retired it only because the chart read the -admin form.', null),
	('token', '--chart-tooltip-text', 'live', null, 'Revived by AL-027: LineChart reads it, and a theme sets it. D-165 retired it only because the chart read the -admin form.', null)
on conflict (kind, name) do update set
	status = excluded.status, replacement_name = excluded.replacement_name,
	reason = excluded.reason, decision_id = excluded.decision_id, recorded_on = current_date;

-- Repoint the chains that ran through a name retired above. Their reasons and
-- decisions stand; only the end of the chain moved.
update alfons.lifecycle set replacement_name = '--chart-series-1', recorded_on = current_date
where kind = 'token' and replacement_name = '--chart-admin-series-1';

update alfons.lifecycle set replacement_name = '--bg-primary', recorded_on = current_date
where kind = 'token' and name = '--admin-bg-page' and replacement_name = '--admin-bg';

commit;
