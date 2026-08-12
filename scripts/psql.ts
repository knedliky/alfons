/**
 * Run SQL against the context database through psql.
 *
 * Not a native client on purpose. Bun's SQL driver does not read ~/.pgpass, and
 * LEDGER_DATABASE_URL carries no password because that is where the password
 * lives — so a native connection fails with "password authentication failed"
 * on the one machine this is meant to run on. Going through psql delegates
 * authentication to libpq, which honours .pgpass, PGSERVICE and the rest.
 *
 * Homebrew keeps postgresql@18 keg-only, so a bare `psql` resolves only in an
 * interactive shell. A script that assumes it is on PATH concludes Postgres is
 * absent, which here would mean silently emitting an unannotated manifest.
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const CANDIDATES = [
	'psql',
	'psql-18',
	'/opt/homebrew/opt/postgresql@18/bin/psql',
	'/opt/homebrew/bin/psql-18'
];

function resolvePsql(): string {
	for (const candidate of CANDIDATES) {
		if (candidate.includes('/')) {
			if (existsSync(candidate)) return candidate;
		} else if (spawnSync('command', ['-v', candidate], { shell: true }).status === 0) {
			return candidate;
		}
	}
	throw new Error(
		`No psql on PATH or at any known Homebrew location (tried ${CANDIDATES.join(', ')}).`
	);
}

export function databaseUrl(): string {
	return (
		process.env.ALFONS_DATABASE_URL ?? process.env.LEDGER_DATABASE_URL ?? 'postgresql:///context'
	);
}

/** Run `sql` and return whatever single value it selects, unparsed. */
export function query(sql: string): string {
	const result = spawnSync(
		resolvePsql(),
		[databaseUrl(), '-At', '-v', 'ON_ERROR_STOP=1', '-c', sql],
		{
			encoding: 'utf8'
		}
	);
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(`psql exited ${result.status}: ${result.stderr.trim()}`);
	}
	return result.stdout.trim();
}

/**
 * Run a statement expected to return rows as JSON.
 *
 * `json_agg` over an empty set yields NULL rather than `[]`, which is the one
 * case worth normalising here — an empty lifecycle table is a legitimate state,
 * not a failure.
 */
export function rows<T>(sql: string): T[] {
	const output = query(sql);
	if (!output || output === 'null') return [];
	return JSON.parse(output) as T[];
}
