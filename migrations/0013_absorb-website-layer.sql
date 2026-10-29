-- 0013_absorb-website-layer.sql
--
-- AL-033: Alfons absorbs the website's local Meccano layer.
--
-- The website loaded Alfons and then src/lib/styles/meccano/, which re-declared
-- 160 Alfons tokens and added 51, so Alfons did not decide the website's look.
-- D-245 says whose value wins where they disagreed: the website's for
-- typography and fonts, Alfons's for colour, surfaces, elevation and motion.
-- D-246 adds spacing and layout to Alfons's half, and keeps the website's
-- --sp-* ladder as live rungs so its direct reads still render the same.
-- This file records what that meant for each name the layer held that Alfons
-- did not, so the website task (AT-076) can delete the layer and follow the
-- retired-token rule for the rest. scripts/compare-website-layer.ts proves the
-- outcome against the layer itself.
--
-- Two kinds of row:
--
--   live    a token the website reads that Alfons now defines. Five of them
--           were retired under D-181 as speculative (--type-body,
--           --type-small, --led-off, --shade-part and its pair
--           --shadow-part), and D-181's own clause reclassifies a consumed
--           token live. --fw-light and --fw-black come back as rungs of the
--           Moderat cuts fonts.css ships.
--
--   retired a website name for a role Alfons already names, onto the Alfons
--           name that now renders the same value. The website has only ever
--           declared these, so their entity rows are created here.

begin;

insert into alfons.design_decisions (decision_id) values ('D-245'), ('D-246')
on conflict (decision_id) do nothing;

insert into alfons.entities (kind, name) values
	('token', '--font-heading'),
	('token', '--font-serif'),
	('token', '--font-reading')
on conflict (kind, name) do nothing;

insert into alfons.lifecycle (kind, name, status, replacement_name, reason, decision_id) values
	-- Typography the website reads, reclassified live under D-181.
	('token', '--type-body', 'live', null, 'Retired under D-181 as speculative; the website sets <body> with it, and D-181 reclassifies a consumed token live (AL-033).', 'D-181'),
	('token', '--type-small', 'live', null, 'Retired under D-181 as speculative; the website sets its small print with it, and D-181 reclassifies a consumed token live (AL-033).', 'D-181'),
	('token', '--fw-light', 'live', null, 'The Moderat Light cut that fonts.css ships. D-181 retired it before anything read it; a weight ladder names every cut it serves (AL-033).', 'D-245'),
	('token', '--fw-black', 'live', null, 'The Moderat Black cut that fonts.css ships and --font-drop-cap relies on. D-181 retired it before anything read it (AL-033).', 'D-245'),

	-- Redaction, the website's serif, which sets display and headings under D-245.
	('token', '--font-redaction', 'live', null, 'The clean Redaction cut and the fallback stack every grade sits on (AL-033).', 'D-245'),
	('token', '--font-redaction-10', 'live', null, 'Redaction grade 10. A grade of a shipped face, for deliberate use (AL-033).', 'D-245'),
	('token', '--font-redaction-20', 'live', null, 'Redaction grade 20. A grade of a shipped face, for deliberate use (AL-033).', 'D-245'),
	('token', '--font-redaction-35', 'live', null, 'Redaction grade 35, the heading face --font-display resolves to (AL-033).', 'D-245'),
	('token', '--font-redaction-50', 'live', null, 'Redaction grade 50. A grade of a shipped face, for deliberate use (AL-033).', 'D-245'),
	('token', '--font-redaction-70', 'live', null, 'Redaction grade 70. A grade of a shipped face, for deliberate use (AL-033).', 'D-245'),
	('token', '--font-redaction-100', 'live', null, 'Redaction grade 100. A grade of a shipped face, for deliberate use (AL-033).', 'D-245'),

	-- Website names for roles Alfons already names.
	('token', '--font-heading', 'retired', '--font-display', 'The website''s name for the heading face, which --font-display names and now resolves to the same Redaction 35 stack (AL-033).', 'D-245'),
	('token', '--font-serif', 'retired', '--font-redaction-35', 'The website''s name for Redaction grade 35. A name for the face rather than a role; --font-redaction-35 is the face (AL-033).', 'D-245'),
	('token', '--font-reading', 'retired', '--font-body', 'The website''s name for the running-text face, which --font-body names and now resolves to the same Moderat stack (AL-033).', 'D-245'),

	-- Panel material the website reads, reclassified or brought in.
	('token', '--led-off', 'live', null, 'Retired under D-181 as speculative; the website draws its unlit lamps with it, and D-181 reclassifies a consumed token live (AL-033).', 'D-181'),
	('token', '--led-off-face', 'live', null, 'The literal highlight stop --led-off is drawn from (AL-033).', 'D-245'),
	('token', '--led-off-edge', 'live', null, 'The literal rim stop --led-off is drawn from (AL-033).', 'D-245'),
	('token', '--shade-part', 'live', null, 'Retired under D-181 as speculative; the website shades its moulded parts with it, and D-181 reclassifies a consumed token live (AL-033).', 'D-181'),
	('token', '--shadow-part', 'live', null, 'The shadow half of the slab treatment --shade-part is the gradient half of, as --shadow-gloss is to --gloss. Revived with it (AL-033).', 'D-181'),
	('token', '--shadow-rail-lamp', 'live', null, 'The rail-lamp glow the website''s stop rail reads (AL-033).', 'D-245'),
	('token', '--groove-rule', 'live', null, 'The recessed-rule colour the website''s separators read (AL-033).', 'D-245'),
	('token', '--shadow-groove', 'live', null, 'The recessed-rule shadow the website''s separators read (AL-033).', 'D-245'),

	-- The Meccano spacing ladder, live beside --space-N under D-246.
	('token', '--sp-05', 'live', null, 'Meccano ladder, 2px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-1', 'live', null, 'Meccano ladder, 4px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-2', 'live', null, 'Meccano ladder, 8px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-3', 'live', null, 'Meccano ladder, 12px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-4', 'live', null, 'Meccano ladder, 16px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-5', 'live', null, 'Meccano ladder, 20px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-6', 'live', null, 'Meccano ladder, 24px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-8', 'live', null, 'Meccano ladder, 32px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-10', 'live', null, 'Meccano ladder, 40px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-12', 'live', null, 'Meccano ladder, 48px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-16', 'live', null, 'Meccano ladder, 64px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-24', 'live', null, 'Meccano ladder, 96px. The website reads the ladder directly (AL-033).', 'D-246'),
	('token', '--sp-32', 'live', null, 'Meccano ladder, 128px. A rung of a complete ladder, kept though nothing reads it yet (AL-033).', 'D-246')
on conflict (kind, name) do update set
	status = excluded.status, replacement_name = excluded.replacement_name,
	reason = excluded.reason, decision_id = excluded.decision_id, recorded_on = current_date;

commit;
