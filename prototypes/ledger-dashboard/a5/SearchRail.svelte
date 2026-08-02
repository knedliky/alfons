<script lang="ts">
	/**
	 * The front door.
	 *
	 * Simon arrives with a vague memory of a title, so the field is the largest
	 * control on the page rather than a corner of a toolbar, and every result
	 * carries the context needed to recognise the right one on sight: id,
	 * project, release, phase and status, each in its own ruled column.
	 *
	 * The rows are ruled, not carded. A result is a line in a ledger.
	 */
	import { Input } from '@alfons/design';
	import { searchTasks, type Task } from './ledger-corpus';
	import StatusMark from './StatusMark.svelte';

	interface Props {
		query: string;
		selectedId: string | null;
		onQuery: (next: string) => void;
		onSelect: (task: Task) => void;
	}

	let { query, selectedId, onQuery, onSelect }: Props = $props();

	const results = $derived(searchTasks(query));
</script>

<div class="rail">
	<label class="field-label" for="ledger-search">Search the corpus</label>
	<Input
		id="ledger-search"
		class="ledger-search-field"
		value={query}
		placeholder="a few words from the title"
		autocomplete="off"
		spellcheck="false"
		oninput={(event: Event) => onQuery((event.currentTarget as HTMLInputElement).value)}
	/>

	<p class="tally" aria-live="polite">
		<strong>{results.length}</strong>
		{results.length === 1 ? 'task' : 'tasks'} matching
		<span class="needle">{query || 'everything'}</span>
	</p>

	{#if results.length}
		<div class="results">
			<div class="row head" aria-hidden="true">
				<span>Task</span>
				<span>Title</span>
				<span>Project</span>
				<span>Release</span>
				<span>Phase</span>
				<span>Status</span>
			</div>
			{#each results as task (task.id)}
				<!-- A row is the control: the whole line is the target, which no
				     library atom covers — Button is a pill, not a ledger line. -->
				<button
					type="button"
					class="row result"
					class:is-selected={task.id === selectedId}
					aria-pressed={task.id === selectedId}
					onclick={() => onSelect(task)}
				>
					<span class="cell id">{task.id}</span>
					<span class="cell title">{task.title}</span>
					<span class="cell project">{task.project}</span>
					<span class="cell release">{task.release}</span>
					<span class="cell phase">{String(task.phase).padStart(2, '0')}</span>
					<span class="cell status"><StatusMark status={task.status} /></span>
				</button>
			{/each}
		</div>
	{:else}
		<p class="empty">
			Nothing matches. The corpus indexes titles, ids, projects and release slugs.
		</p>
	{/if}
</div>

<style>
	.field-label {
		display: block;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-muted);
		padding-block-end: var(--space-3);
	}

	/* The library Input tops out at 3rem with a 1rem face — right for a form,
	   wrong for the primary journey of the page. Overridden globally because
	   the element is inside the component. */
	.rail :global(.ledger-search-field) {
		block-size: auto;
		padding: var(--space-4) var(--space-5);
		border: none;
		border-block-start: var(--space-1) solid var(--text-primary);
		border-block-end: 1px solid var(--border-glass);
		background: var(--surface-rest-bg);
		font-family: var(--font-body);
		font-size: 2rem;
		font-weight: 600;
		letter-spacing: -0.02em;
	}

	.rail :global(.ledger-search-field:focus) {
		background: var(--surface-hover-subtle);
		border-block-end-color: var(--text-primary);
	}

	.tally {
		margin: var(--space-3) 0 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.tally strong {
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.needle {
		color: var(--text-secondary);
		text-transform: none;
		letter-spacing: 0;
	}

	.results {
		margin-block-start: var(--space-5);
	}

	.row {
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr) 7rem 12rem 3rem 8.5rem;
		align-items: baseline;
		gap: var(--space-4);
		inline-size: 100%;
		text-align: start;
	}

	.head {
		padding-block: var(--space-2);
		border-block-end: calc(var(--stroke-normal) * 1px) solid var(--text-secondary);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.result {
		appearance: none;
		border: none;
		border-block-end: 1px solid var(--border-glass);
		background: transparent;
		/* Generous row height is what makes a dense ledger readable — the rule
		   does the containing, so the row can afford the air. */
		padding-block: var(--space-4);
		color: inherit;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.result:hover {
		background: var(--surface-hover-subtle);
	}

	/* Selection is a fill and a heavy left rule. No card, no shadow. */
	.result.is-selected {
		background: var(--elevation-1-bg);
		box-shadow: inset var(--space-1) 0 0 0 var(--text-primary);
	}

	.cell {
		min-inline-size: 0;
		overflow-wrap: anywhere;
	}

	.id,
	.phase {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.title {
		font-family: var(--font-body);
		font-size: var(--text-body);
		font-weight: 500;
		line-height: 1.35;
		color: var(--text-primary);
	}

	.result.is-selected .title {
		font-weight: 700;
	}

	.project,
	.release {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		color: var(--text-secondary);
	}

	.empty {
		margin: var(--space-5) 0 0;
		padding-block: var(--space-5);
		border-block-start: 1px solid var(--border-glass);
		font-family: var(--font-body);
		font-size: var(--text-ui);
		color: var(--text-secondary);
	}

	@media (max-width: 1023px) {
		.row {
			grid-template-columns: 5.5rem minmax(0, 1fr) 8.5rem;
		}

		.head span:nth-child(4),
		.head span:nth-child(5),
		.result .release,
		.result .phase {
			display: none;
		}

		.head span:nth-child(3),
		.result .project {
			display: none;
		}
	}
</style>
