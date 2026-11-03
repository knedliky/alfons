/**
 * Run SQL against the alfons schema in the cloud project through psql.
 *
 * Two connections, because two roles reach alfons (AL-037). Reads go through
 * ledger_reader, the one role that sees both alfons and ledger_api, which the
 * manifest joins in a single query. Writes go through alfons_writer, which
 * sees alfons alone. There is no fallback to the local context database: its
 * copy is frozen, and a manifest built from it would look correct while
 * missing every later change.
 *
 * Not a native client on purpose. Going through psql delegates authentication
 * to libpq, which honours .pgpass, PGSERVICE and the rest, so a URL with no
 * password still works for a local database in a test.
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

/**
 * A connection string kept in the login Keychain, as TM-113 keeps the ledger's.
 * The project hook runs in whatever environment the app gave Claude Code,
 * which need not have sourced ~/.zshrc, so an environment variable alone
 * cannot be relied on.
 */
function keychainItem(service: string): string | undefined {
	const result = spawnSync('security', ['find-generic-password', '-s', service, '-w'], {
		encoding: 'utf8'
	});
	if (result.status !== 0) return undefined;
	return result.stdout.trim() || undefined;
}

function requireUrl(url: string | undefined, role: string, sources: string): string {
	if (!url) throw new Error(`No connection string for ${role}: set ${sources}.`);
	return url;
}

/** ledger_reader: alfons through one select policy per table, and ledger_api. */
export function readerUrl(): string {
	return requireUrl(
		process.env.LEDGER_DATABASE_URL ?? keychainItem('ledger-reader-database-url'),
		'ledger_reader',
		'LEDGER_DATABASE_URL or the Keychain item ledger-reader-database-url'
	);
}

/** alfons_writer: alfons alone. */
export function writerUrl(): string {
	return requireUrl(
		process.env.ALFONS_DATABASE_URL ?? keychainItem('alfons-database-url'),
		'alfons_writer',
		'ALFONS_DATABASE_URL or the Keychain item alfons-database-url'
	);
}

// The URL reaches psql as an argument, so it is visible to `ps` on this
// machine while psql runs; the shared apply script accepts the same.
// --quiet, because -At still prints a command tag such as `INSERT 0 0` after
// an insert ... returning that matched nothing, and a caller counting
// returned lines would count the tag as a row.
function run(url: string, sql: string): string {
	const result = spawnSync(
		resolvePsql(),
		[url, '--quiet', '-At', '-v', 'ON_ERROR_STOP=1', '-c', sql],
		{ encoding: 'utf8' }
	);
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(`psql exited ${result.status}: ${result.stderr.trim()}`);
	}
	return result.stdout.trim();
}

/**
 * Run a write as alfons_writer and return whatever single value it selects,
 * unparsed.
 */
export function query(sql: string): string {
	return run(writerUrl(), sql);
}

/**
 * Run a read as ledger_reader, expected to return rows as JSON.
 *
 * `json_agg` over an empty set yields NULL rather than `[]`, which is the one
 * case worth normalising here — an empty lifecycle table is a legitimate state,
 * not a failure.
 */
export function rows<T>(sql: string): T[] {
	const output = run(readerUrl(), sql);
	if (!output || output === 'null') return [];
	return JSON.parse(output) as T[];
}
