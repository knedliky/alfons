/** Behaviour tests for D-182's event adapter, refresh order and hot reload. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { classifyDesignMemoryEvent, type HookInput } from './design-memory-events.ts';
import { refreshDesignMemory, type RefreshDependencies } from './refresh-design-memory.ts';
import { reloadingManifest } from '../src/mcp/manifest.ts';
import type { Manifest } from '../src/manifest/types.ts';

const ROOT = join(import.meta.dirname, '..');
let failures = 0;

function check(description: string, condition: boolean, detail?: unknown): void {
	if (condition) {
		console.log(`  ok    ${description}`);
		return;
	}
	failures++;
	console.error(`  FAIL  ${description}`);
	if (detail !== undefined) console.error(`        ${JSON.stringify(detail)}`);
}

function event(overrides: Partial<HookInput>): HookInput {
	return {
		hook_event_name: 'PostToolUse',
		cwd: ROOT,
		...overrides
	};
}

console.log('event classification');
const component = classifyDesignMemoryEvent(
	event({
		tool_name: 'Write',
		tool_input: { file_path: join(ROOT, 'src/components/cards/NewCard.svelte') },
		tool_response: { success: true }
	}),
	ROOT
);
check('recognises a component write', component?.kind === 'component', component);

check(
	'ignores a non-component write',
	classifyDesignMemoryEvent(
		event({ tool_name: 'Write', tool_input: { file_path: join(ROOT, 'README.md') } }),
		ROOT
	) === null
);

const decision = classifyDesignMemoryEvent(
	event({
		tool_name: 'mcp__ledger__record_decision',
		tool_response: {
			content: [{ type: 'text', text: '{"ok":true,"result":"D-999"}' }]
		}
	}),
	ROOT
);
check(
	'recognises a confirmed decision from an MCP text envelope',
	decision?.kind === 'decision' && decision.decisionId === 'D-999',
	decision
);

check(
	'ignores a failed decision result',
	classifyDesignMemoryEvent(
		event({
			tool_name: 'mcp__ledger__record_decision',
			tool_response: { content: [{ type: 'text', text: '{"ok":false,"result":"D-999"}' }] }
		}),
		ROOT
	) === null
);

check(
	'ignores a matching tool outside PostToolUse',
	classifyDesignMemoryEvent(
		{
			hook_event_name: 'PostToolUseFailure',
			tool_name: 'mcp__ledger__record_decision',
			tool_response: { ok: true, result: 'D-999' }
		},
		ROOT
	) === null
);

console.log('\nrefresh order');
function recordingActions(calls: string[]): RefreshDependencies {
	return {
		registerDecision: (id) => calls.push(`decision:${id}`),
		run: (script) => calls.push(script)
	};
}

const componentCalls: string[] = [];
refreshDesignMemory(
	{ kind: 'component', path: join(ROOT, 'src/components/cards/NewCard.svelte') },
	recordingActions(componentCalls)
);
check(
	'a component refreshes the manifest before entity vocabulary',
	componentCalls.join(',') === 'manifest,lifecycle:sync',
	componentCalls
);

const decisionCalls: string[] = [];
refreshDesignMemory({ kind: 'decision', decisionId: 'D-999' }, recordingActions(decisionCalls));
check(
	'a decision is admitted before the manifest is regenerated',
	decisionCalls.join(',') === 'decision:D-999,manifest',
	decisionCalls
);

const recursionCalls: string[] = [];
process.env.ALFONS_DESIGN_MEMORY_REFRESHING = '1';
refreshDesignMemory({ kind: 'decision', decisionId: 'D-999' }, recordingActions(recursionCalls));
delete process.env.ALFONS_DESIGN_MEMORY_REFRESHING;
check('the recursion guard turns a nested refresh into a no-op', recursionCalls.length === 0);

console.log('\nproject hook');
const settings = JSON.parse(readFileSync(join(ROOT, '.claude/settings.json'), 'utf8')) as Record<
	string,
	unknown
>;
const settingsHooks = settings.hooks as {
	PostToolUse?: Array<{ matcher?: string; hooks?: Array<{ command?: string }> }>;
};
const postToolUse = settingsHooks.PostToolUse?.[0];
check(
	'project settings subscribe to file writes and confirmed ledger decisions',
	postToolUse?.matcher === 'Write|Edit|mcp__ledger__record_decision',
	postToolUse
);
check(
	'the hook delegates to the tested adapter',
	postToolUse?.hooks?.[0]?.command?.includes('scripts/hooks/refresh-design-memory.ts') === true,
	postToolUse?.hooks?.[0]
);

console.log('\nhot reload');
let version = 1;
let generation = 0;
const load = () => ({ schemaVersion: 5, generation: ++generation }) as unknown as Manifest;
const current = reloadingManifest(load, () => version);
const first = current() as Manifest & { generation: number };
const cached = current() as Manifest & { generation: number };
version = 2;
const refreshed = current() as Manifest & { generation: number };
check('reuses one coherent snapshot while the file is unchanged', first === cached);
check(
	'adopts a new snapshot after the manifest version changes',
	refreshed !== first && refreshed.generation === 2,
	{ first: first.generation, refreshed: refreshed.generation }
);

console.log(failures ? `\n${failures} check(s) failed` : '\nall checks passed');
process.exit(failures ? 1 : 0);
