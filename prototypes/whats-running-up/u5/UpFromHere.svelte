<script lang="ts">
	/**
	 * The upward move, on the card, in the line that already said where the task
	 * lives.
	 *
	 * The winning approach printed `project / release` under the title as plain
	 * text. This approach makes those two words the whole of going up: tapping
	 * either one refills the deck with that set. Nothing new appeared on the
	 * card — a line that was already there became reachable — which is as simple
	 * as "very simple" gets.
	 *
	 * One rule, no special cases: a segment always means "make the deck this
	 * task's project" or "make the deck this task's release". From the running
	 * deck both widen. From a release deck, project widens again and release is
	 * where you already are. From a project deck, release narrows to this task's
	 * own release, which is still upward from the task even though it is inward
	 * from the project. Getting a second mechanism for that case would have cost
	 * more than it bought.
	 *
	 * The segment naming the current scope is not a button. It renders at the
	 * same size in the same place carrying `aria-current`, so the row never
	 * reflows and the reader is told rather than shown that they are already
	 * there. A disabled button would have been the other option and reads as
	 * temporarily unavailable, which is not what "you are here" means.
	 *
	 * Bare <button>, and named plainly in the report. Button is a centred pill
	 * sized to its label; these are two half-width plates each carrying a kind
	 * over a name, and every part of Button's shape would have to be removed.
	 * Only these two segments are here, and no project or release ever takes a
	 * status colour — the hierarchy is neutral by construction.
	 */
	import type { Task } from './tasks.ts';
	import type { Scope, ScopeKind } from './scope.ts';

	let { task, scope, onup }: { task: Task; scope: Scope; onup: (next: Scope) => void } = $props();

	interface Segment {
		kind: Exclude<ScopeKind, 'running'>;
		value: string;
	}

	const segments: Segment[] = $derived([
		{ kind: 'project', value: task.project },
		{ kind: 'release', value: task.release }
	]);

	function isHere(segment: Segment): boolean {
		return scope.kind === segment.kind && scope.key === segment.value;
	}
</script>

<div class="up" role="group" aria-label="Show this task's release or project in the deck">
	{#each segments as segment (segment.kind)}
		{#if isHere(segment)}
			<p class="segment" data-here="true" aria-current="true">
				<!-- "shown" alone, not "release · shown". At 370px a segment is 152px
				     wide and the pair did not fit: it wrapped to two lines, which took
				     16px off the title, and clamping it to one line ellipsised the word
				     that carries the meaning. The kind is not lost — the denominator
				     line directly above says "of 16 tasks in project alfons", and the
				     page's live announcement says it too. -->
				<span class="kind">shown</span>
				<span class="value">{segment.value}</span>
			</p>
		{:else}
			<button
				type="button"
				class="segment"
				onclick={() => onup({ kind: segment.kind, key: segment.value })}
				aria-label="Fill the deck with the {segment.kind} {segment.value}"
			>
				<span class="kind">{segment.kind}</span>
				<span class="value">{segment.value}</span>
			</button>
		{/if}
	{/each}
</div>

<style>
	.up {
		display: flex;
		gap: var(--space-2);
		min-width: 0;
	}

	.segment {
		appearance: none;
		margin: 0;
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-1);
		/* The touch minimum, honoured by the plate rather than by a shell around
		   it. Both segments take it whether or not they are interactive, so the
		   row keeps its height when the scope changes under the reader. */
		min-height: var(--filter-control-height);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		font-family: var(--font-mono);
		background: var(--surface-hover-subtle);
		border: 1px solid var(--card-border);
		cursor: pointer;
	}

	.segment[data-here='true'] {
		cursor: default;
		background: transparent;
		border-style: dashed;
	}

	/* One line, always. The row's height is load-bearing: everything it gains
	   comes off the title. */
	.kind {
		font-size: var(--text-micro);
		line-height: 1.2;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.value {
		font-size: var(--text-caption);
		line-height: 1.2;
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.segment[data-here='true'] .value {
		color: var(--text-secondary);
	}

	.segment:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}
</style>
