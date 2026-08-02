-- 0004_mainlayout-is-not-a-shell.sql
--
-- MainLayout is a content primitive, not a page shell.
--
-- 0003 assigned it to `shell` on the strength of its name. Reading it settles
-- the question the other way: it takes `aside` and `main` snippets, sticks the
-- aside to the viewport while main scrolls, and stacks vertically on mobile.
-- That is a two-column arrangement of content within a region — the same tier
-- as Grid and Stack — and it frames nothing.
--
-- Found by AL-007, on first contact with the consumer. Atlas's CLAUDE.md has
-- carried a layout tier table since long before D-168 and puts MainLayout in
-- 4d, Content Primitives, next to Container and Grid. Nobody consulted it.
--
-- The uncomfortable part is what the error survived. It survived the migration,
-- the manifest join, get_layout_recipe, the layout-nesting rule, the scaffold's
-- wrapper selection, and every test across all of them — because every one of
-- those reads the tier rather than judging it, and a wrong value is still a
-- value. The tier was authored precisely because it could not be derived, and
-- an authored fact is only as good as the reading behind it.
--
-- The practical damage was small and specific: layout-nesting would have
-- reported MainLayout inside a Container as inverted, when that is the
-- documented way to build a two-column page.

begin;

update alfons.layout_tiers
set tier = 'container',
    reason = 'Two-column aside/main arrangement within a region; frames no page.',
    recorded_on = current_date
where name = 'MainLayout';

commit;
