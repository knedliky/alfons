/**
 * Teach the database the names the tree currently carries.
 *
 * alfons.lifecycle refuses a replacement naming something that does not exist,
 * and it can only do that against a vocabulary — alfons.entities. This is the
 * one place derived data is copied into Postgres, and the copy is defensible
 * because nothing reads it: it is never joined into the manifest and never
 * answers a question, it only gives `replacement_name` something to reference.
 *
 * Inserts only. A name deleted from the tree stays, because that is precisely
 * the name a tombstone still has to point at — dropping --radius-md here would
 * delete the row that tells an agent to use --radius instead.
 *
 * Needs a writer connection, unlike the generator. Recording what exists is an
 * act on the same footing as recording a retirement, not a build side effect.
 *
 * Run: bun run lifecycle:sync
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { query } from './psql.ts';
import type { Manifest } from '../src/manifest/types.ts';

const MANIFEST = join(import.meta.dirname, '..', 'alfons.manifest.json');

const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8')) as Manifest;
const names = [
	...manifest.tokens.map((token) => ({ kind: 'token', name: token.name })),
	...manifest.components.map((component) => ({ kind: 'component', name: component.name }))
];

// Passed as one JSON literal rather than interpolated per row: the names are
// derived from the tree and cannot contain a quote, but a script that builds
// SQL by concatenation teaches the next one to do the same.
const inserted = query(`
	with incoming as (
		select (entry->>'kind')::alfons.entity_kind as kind, entry->>'name' as name
		from json_array_elements(${literal(JSON.stringify(names))}::json) as entry
	)
	insert into alfons.entities (kind, name)
	select kind, name from incoming
	on conflict (kind, name) do nothing
	returning 1
`);

const count = inserted ? inserted.split('\n').length : 0;
console.log(`entities: ${names.length} in the tree, ${count} newly recorded`);

/** Postgres dollar quoting, so the payload needs no escaping at all. */
function literal(value: string): string {
	let suffix = 0;
	let tag = '$json$';
	while (value.includes(tag)) tag = `$json${++suffix}$`;
	return `${tag}${value}${tag}`;
}
