-- 0001_alfons-lifecycle.sql
--
-- The authored half of the Alfons manifest, per D-162.
--
-- alfons.manifest.json holds facts recomputable from the source tree, and that
-- is the right home for them: the tree is already their authority, so drift is
-- a diff. Lifecycle is the opposite kind of fact. Whether --frost-4 is retired
-- or merely unadopted cannot be recovered from any parse of the CSS, because
-- both look identical — a definition with no consumer. The AL-001 merge is the
-- evidence: light mode, the accent-tinted focus ring and the fourth frost level
-- were all deliberate retirements recorded only as comments, and the first
-- reading of the diff misread all three as accidental loss.
--
-- So lifecycle is authored, it needs history, and a retirement is only
-- meaningful next to the decision that made it. That is a foreign key, and a
-- foreign key is a database.
--
-- ---------------------------------------------------------------------------
-- Why there are two tables
-- ---------------------------------------------------------------------------
-- `lifecycle` alone cannot honour C2's second half — a replacement naming
-- something that does not exist must be refused by the schema, not by
-- convention — because the schema has no idea what names exist. `entities` is
-- that vocabulary: every token and component name Alfons has ever carried.
--
-- It is a build-time mirror of derived data, which looks like the duplication
-- D-162 argues against, and the distinction is that nothing reads it. It is
-- never joined into the manifest and never answers a question; it exists so
-- `replacement_name` has something to point at. Rows are inserted by
-- `bun run lifecycle:sync` and never deleted, because a name deleted from the
-- tree is exactly the name a tombstone still has to reference.
--
-- ---------------------------------------------------------------------------
-- Why `live` is a status a row can hold
-- ---------------------------------------------------------------------------
-- An entity with no row is unannotated, and 110 tokens are in that state today
-- (AL-009 C6). Recording one as `live` is a positive claim — someone looked at
-- an unused token and decided to keep it, with a reason. That is the whole
-- point of the exercise: it turns "110 tokens have no consumer" from a number
-- into a question with an answer per row, and it is why `reason` is NOT NULL
-- for every status rather than only for the removals.

begin;

create schema if not exists alfons;

comment on schema alfons is
	'Authored facts about the Alfons design library. Build-time only: the '
	'generator joins these onto the derived manifest, and no runtime consumer '
	'ever reaches this database (D-162).';

create type alfons.entity_kind as enum ('token', 'component');

create type alfons.lifecycle_status as enum ('live', 'deprecated', 'retired');

-- ---------------------------------------------------------------------------
-- The vocabulary
-- ---------------------------------------------------------------------------

create table alfons.entities (
	kind alfons.entity_kind not null,
	name text not null,
	first_recorded_on date not null default current_date,

	primary key (kind, name),

	-- Shape checks rather than a free text column, so a typo in a hand-written
	-- insert fails here instead of becoming a lifecycle row that annotates
	-- nothing. Token names carry their leading hyphens because that is how they
	-- are both defined and referenced.
	constraint token_is_a_custom_property
		check (kind <> 'token' or name ~ '^--[a-z0-9-]+$'),
	constraint component_is_pascal_case
		check (kind <> 'component' or name ~ '^[A-Z][A-Za-z0-9]*$')
);

comment on table alfons.entities is
	'Every token and component name Alfons has carried, including names since '
	'deleted. Synced from the manifest by bun run lifecycle:sync; append-only '
	'in practice, because a tombstone outlives the thing it marks.';

-- ---------------------------------------------------------------------------
-- The judgements
-- ---------------------------------------------------------------------------

create table alfons.lifecycle (
	kind alfons.entity_kind not null,
	name text not null,
	status alfons.lifecycle_status not null,
	replacement_name text,
	reason text not null,
	decision_id text references ledger.decisions (id),
	recorded_on date not null default current_date,

	primary key (kind, name),

	foreign key (kind, name)
		references alfons.entities (kind, name),

	-- MATCH SIMPLE, so a null replacement skips the check rather than failing
	-- it. Sharing `kind` across both keys is what makes a component unable to
	-- replace a token: there is no column in which to say so.
	foreign key (kind, replacement_name)
		references alfons.entities (kind, name),

	constraint replacement_is_not_itself
		check (replacement_name is distinct from name),

	-- A live entity has nothing to redirect to, and saying it does would make
	-- review_markup suggest a replacement for something still current.
	constraint live_has_no_replacement
		check (status <> 'live' or replacement_name is null),

	-- The rule this table exists to enforce (AL-009 step 1). A removal without
	-- the decision behind it is the state the corpus is already in, and it is
	-- the state that misled the AL-001 reader.
	constraint removal_cites_a_decision
		check (status = 'live' or decision_id is not null),

	constraint reason_is_not_blank
		check (length(btrim(reason)) > 0)
);

comment on table alfons.lifecycle is
	'One authored judgement per token or component. Joined onto the derived '
	'manifest at build time; a row whose subject is no longer in the source '
	'tree is emitted as a tombstone, so an agent naming a retired token is '
	'told what replaced it and which decision said so.';

comment on column alfons.lifecycle.replacement_name is
	'What to reach for instead. Read by review_markup, so the wording that '
	'lands in front of an agent is this column and not prose in a comment.';

-- ---------------------------------------------------------------------------
-- Reads run as the same role the ledger is read with
-- ---------------------------------------------------------------------------
-- The generator only ever selects, so it connects with LEDGER_DATABASE_URL's
-- reader. Writing lifecycle rows needs a writer URL, which is the intended
-- friction: recording a retirement is an act, not a side effect of a build.

grant usage on schema alfons to context_reader;
grant select on all tables in schema alfons to context_reader;
alter default privileges in schema alfons
	grant select on tables to context_reader;

commit;
