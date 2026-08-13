import { isAbsolute, relative, resolve, sep } from 'node:path';

export interface HookInput {
	hook_event_name?: string;
	tool_name?: string;
	tool_input?: unknown;
	tool_response?: unknown;
	cwd?: string;
}

export type DesignMemoryEvent =
	{ kind: 'component'; path: string } | { kind: 'decision'; decisionId: string };

const DECISION_TOOL = 'mcp__ledger__record_decision';
const FILE_TOOLS = new Set(['Write', 'Edit']);
const DECISION_ID = /^D-\d+$/;

function record(value: unknown): Record<string, unknown> | null {
	return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
}

function parseJson(value: unknown): unknown {
	if (typeof value !== 'string') return value;
	try {
		return JSON.parse(value) as unknown;
	} catch {
		return value;
	}
}

/** Search MCP's possible text and structured response envelopes. */
function successfulDecisionId(value: unknown): string | null {
	const parsed = parseJson(value);
	if (Array.isArray(parsed)) {
		for (const item of parsed) {
			const found = successfulDecisionId(item);
			if (found) return found;
		}
		return null;
	}

	const object = record(parsed);
	if (!object) return null;
	if (object.ok === false || object.isError === true) return null;
	if (object.ok === true && typeof object.result === 'string' && DECISION_ID.test(object.result)) {
		return object.result;
	}

	for (const key of ['structuredContent', 'content', 'text', 'result']) {
		const found = successfulDecisionId(object[key]);
		if (found) return found;
	}
	return null;
}

function componentPath(input: HookInput, root: string): string | null {
	if (!input.tool_name || !FILE_TOOLS.has(input.tool_name)) return null;
	const toolInput = record(input.tool_input);
	const raw = toolInput?.file_path ?? toolInput?.filePath;
	if (typeof raw !== 'string') return null;

	const absolute = isAbsolute(raw) ? resolve(raw) : resolve(input.cwd ?? root, raw);
	const local = relative(root, absolute);
	if (local.startsWith(`..${sep}`) || isAbsolute(local)) return null;
	if (!/^src\/components\/.+\.svelte$/.test(local.replaceAll(sep, '/'))) return null;
	return absolute;
}

/**
 * Turn a successful PostToolUse envelope into one observable Alfons event.
 * Nothing fuzzy belongs here: unknown shapes are ignored rather than guessed.
 */
export function classifyDesignMemoryEvent(
	input: HookInput,
	root: string
): DesignMemoryEvent | null {
	if (input.hook_event_name !== 'PostToolUse') return null;

	const path = componentPath(input, root);
	if (path) return { kind: 'component', path };

	if (input.tool_name !== DECISION_TOOL) return null;
	const decisionId = successfulDecisionId(input.tool_response);
	return decisionId ? { kind: 'decision', decisionId } : null;
}
