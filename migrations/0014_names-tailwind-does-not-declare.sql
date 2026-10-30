-- 0014_names-tailwind-does-not-declare.sql
--
-- AL-035: the mono face and the base corner take names Tailwind does not
-- declare.
--
-- Tailwind v4's default @theme declares --font-mono and --radius, the names
-- Alfons used for the GT America Mono stack and the base machined corner. A
-- consumer that loads both gets whichever stylesheet came last, and nothing
-- says so: that is how the brand face was replaced across four Atlas surfaces
-- (D-171). The tailwind-shadow rule reported every read, 83 in Alfons and 87
-- in the website on 2026-10-30, and AL-034's three new reads made the
-- pre-push ratchet refuse Alfons main. D-247 renames both, with the same
-- values, and retires the old names onto the new ones.
--
-- Alfons's components, stories, dev surface and prototypes moved in the same
-- change. The website still reads both names; the retired-token rule flags
-- each read with its replacement, which is what AT-095 works from.
--
-- Run after `bun run lifecycle:sync`, which teaches alfons.entities the two
-- new names from the manifest.

begin;

insert into alfons.design_decisions (decision_id) values ('D-247')
on conflict (decision_id) do nothing;

insert into alfons.lifecycle (kind, name, status, replacement_name, reason, decision_id) values
	('token', '--font-mono', 'retired', '--font-monospace', 'Tailwind v4''s default @theme declares --font-mono, so which stack a consumer got depended on stylesheet order. Renamed with the same value (AL-035).', 'D-247'),
	('token', '--radius', 'retired', '--radius-base', 'Tailwind v4''s default @theme declares --radius, so which corner a consumer got depended on stylesheet order. Renamed with the same value (AL-035).', 'D-247')
on conflict (kind, name) do update set
	status = excluded.status,
	replacement_name = excluded.replacement_name,
	reason = excluded.reason,
	decision_id = excluded.decision_id;

commit;
