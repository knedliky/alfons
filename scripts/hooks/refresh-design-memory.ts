/** Project PostToolUse adapter. Reads one JSON hook envelope from stdin. */
import { join } from 'node:path';
import { classifyDesignMemoryEvent, type HookInput } from '../design-memory-events.ts';
import { refreshDesignMemory } from '../refresh-design-memory.ts';

const ROOT = join(import.meta.dirname, '..', '..');
const input = (await Bun.stdin.json()) as HookInput;
const event = classifyDesignMemoryEvent(input, ROOT);

if (!event || process.env.ALFONS_DESIGN_MEMORY_REFRESHING === '1') process.exit(0);

try {
	refreshDesignMemory(event);
	const subject = event.kind === 'component' ? event.path : event.decisionId;
	console.log(
		JSON.stringify({
			hookSpecificOutput: {
				hookEventName: 'PostToolUse',
				additionalContext: `Alfons design memory refreshed for ${subject}.`
			}
		})
	);
} catch (cause) {
	console.error(`Alfons design-memory refresh failed: ${(cause as Error).message}`);
	// PostToolUse cannot undo the successful tool, but exit 2 feeds the failure
	// back to the agent so it repairs the stale read model before continuing.
	process.exit(2);
}
