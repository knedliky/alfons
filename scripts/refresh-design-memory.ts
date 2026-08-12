/**
 * Refresh Alfons's generated memory after an observed design event (D-182).
 *
 * The PostToolUse adapter is intentionally thin. This command owns ordering,
 * locking and database changes so it can be invoked and tested directly.
 *
 * Run:
 *   bun run design-memory:refresh --component src/components/cards/Card.svelte
 *   bun run design-memory:refresh --decision D-182
 */
import { closeSync, openSync, readFileSync, unlinkSync, writeSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { query } from './psql.ts';
import type { DesignMemoryEvent } from './design-memory-events.ts';

const ROOT = join(import.meta.dirname, '..');
const LOCK = join(ROOT, '.design-memory-refresh.lock');
const DECISION_ID = /^D-\d+$/;

function wait(milliseconds: number): void {
	Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, milliseconds);
}

function acquireLock(): number {
	const deadline = Date.now() + 30_000;
	while (true) {
		try {
			const descriptor = openSync(LOCK, 'wx');
			writeSync(descriptor, String(process.pid));
			return descriptor;
		} catch (cause) {
			const error = cause as NodeJS.ErrnoException;
			if (error.code !== 'EEXIST' || Date.now() >= deadline) throw cause;

			// A killed hook cannot run finally. Recover its lock only when the
			// recorded process provably no longer exists; uncertainty means wait.
			let ownerText: string;
			try {
				ownerText = readFileSync(LOCK, 'utf8');
			} catch (readError) {
				if ((readError as NodeJS.ErrnoException).code === 'ENOENT') continue;
				throw readError;
			}
			const owner = Number.parseInt(ownerText, 10);
			if (Number.isInteger(owner)) {
				try {
					process.kill(owner, 0);
				} catch (probe) {
					if ((probe as NodeJS.ErrnoException).code === 'ESRCH') {
						unlinkSync(LOCK);
						continue;
					}
				}
			}
			wait(50);
		}
	}
}

function run(script: 'manifest' | 'lifecycle:sync'): void {
	const result = spawnSync('bun', ['run', script], {
		cwd: ROOT,
		encoding: 'utf8',
		env: { ...process.env, ALFONS_DESIGN_MEMORY_REFRESHING: '1' }
	});
	if (result.error) throw result.error;
	if (result.status !== 0) {
		throw new Error(
			`${script} exited ${result.status}: ${(result.stderr || result.stdout).trim()}`
		);
	}
}

function registerDecision(decisionId: string): void {
	if (!DECISION_ID.test(decisionId)) throw new Error(`Invalid decision id: ${decisionId}`);
	const inserted = query(`
		insert into alfons.design_decisions (decision_id)
		values ('${decisionId}')
		on conflict (decision_id) do nothing
		returning decision_id
	`);
	if (!inserted) {
		// Idempotence is success: the manifest may still need a refresh after an
		// amendment or an earlier interrupted invocation.
		return;
	}
}

export interface RefreshDependencies {
	registerDecision: (decisionId: string) => void;
	run: (script: 'manifest' | 'lifecycle:sync') => void;
}

const dependencies: RefreshDependencies = { registerDecision, run };

export function refreshDesignMemory(
	event: DesignMemoryEvent,
	actions: RefreshDependencies = dependencies
): void {
	if (process.env.ALFONS_DESIGN_MEMORY_REFRESHING === '1') return;
	const lock = acquireLock();
	try {
		if (event.kind === 'decision') actions.registerDecision(event.decisionId);
		// The manifest must see the new component before entities are synced:
		// sync-lifecycle-entities reads the manifest, not the source tree.
		actions.run('manifest');
		if (event.kind === 'component') actions.run('lifecycle:sync');
	} finally {
		closeSync(lock);
		unlinkSync(LOCK);
	}
}

function argumentEvent(args: string[]): DesignMemoryEvent | null {
	const component = args.indexOf('--component');
	if (component !== -1 && args[component + 1]) {
		return { kind: 'component', path: args[component + 1]! };
	}
	const decision = args.indexOf('--decision');
	if (decision !== -1 && args[decision + 1]) {
		return { kind: 'decision', decisionId: args[decision + 1]! };
	}
	return null;
}

if (import.meta.main) {
	const event = argumentEvent(process.argv.slice(2));
	if (!event) throw new Error('Expected --component <path> or --decision <D-n>.');
	refreshDesignMemory(event);
	console.log(
		event.kind === 'component'
			? `design memory refreshed for ${event.path}`
			: `design memory refreshed with ${event.decisionId}`
	);
}
