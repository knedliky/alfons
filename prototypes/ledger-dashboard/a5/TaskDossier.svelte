<script lang="ts">
	/**
	 * The found task, stated flat.
	 *
	 * Everything the ledger records about one task, set as a ruled definition
	 * grid rather than a panel of cards: the figures align on their columns and
	 * the rules do the containing. The verdict is deliberately monochrome —
	 * pass, fail and partial are outcomes, not statuses, and status colour is
	 * reserved for state.
	 */
	import { taskById, type Task } from './ledger-corpus';
	import StatusMark from './StatusMark.svelte';

	interface Props {
		task: Task;
	}

	let { task }: Props = $props();

	const dependencies = $derived(
		task.dependsOn.map(taskById).filter((row): row is Task => row !== undefined)
	);

	const facts = $derived([
		{ term: 'Type', value: task.type },
		{ term: 'Risk', value: task.risk },
		{ term: 'Steps', value: String(task.stepCount) },
		{ term: 'Criteria', value: String(task.criterionCount) },
		{ term: 'File changes', value: String(task.fileChangeCount) },
		{ term: 'Attempt', value: task.latestAttempt ? String(task.latestAttempt) : 'none' },
		{ term: 'Verdict', value: task.latestVerdict ?? 'unsealed' },
		{ term: 'Sealed', value: task.latestSealedOn ?? '—' },
		{ term: 'Created', value: task.createdOn },
		{ term: 'Completed', value: task.completedOn ?? 'open' }
	]);
</script>

<section class="dossier" aria-label="Task {task.id}">
	<p class="kicker">The task you found</p>

	<div class="identity">
		<p class="id">{task.id}</p>
		<h3 class="title">{task.title}</h3>
		<div class="state"><StatusMark status={task.status} /></div>
	</div>

	<p class="location">
		<span class="location-part"><span class="term">Project</span> {task.project}</span>
		<span class="location-part"><span class="term">Release</span> {task.release}</span>
		<span class="location-part"><span class="term">Phase</span> {task.phase}</span>
	</p>

	<dl class="facts">
		{#each facts as fact (fact.term)}
			<div class="fact">
				<dt>{fact.term}</dt>
				<dd>{fact.value}</dd>
			</div>
		{/each}
	</dl>

	<div class="dependencies">
		<h4 class="sub">Depends on</h4>
		{#if dependencies.length}
			<ul>
				{#each dependencies as dependency (dependency.id)}
					<li>
						<span class="dep-id">{dependency.id}</span>
						<span class="dep-title">{dependency.title}</span>
						<StatusMark status={dependency.status} />
					</li>
				{/each}
			</ul>
		{:else}
			<p class="none">Nothing. This task can move on its own.</p>
		{/if}
	</div>
</section>

<style>
	.dossier {
		border-block-start: var(--space-1) solid var(--text-primary);
		padding-block-start: var(--space-4);
		/* The one filled ground on the page, and it is a fill on a rule rather
		   than a floating card: no radius, no shadow, no four-sided border. */
		background: var(--surface-rest-bg);
	}

	.kicker {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.identity {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: start;
		gap: var(--space-4);
		padding-block: var(--space-3) var(--space-5);
	}

	.id {
		grid-column: 1;
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-weight: 600;
		letter-spacing: 0.1em;
		color: var(--text-secondary);
	}

	.title {
		grid-column: 1;
		margin: var(--space-2) 0 0;
		font-family: var(--font-body);
		font-size: 2rem;
		font-weight: 800;
		line-height: 1.05;
		letter-spacing: -0.035em;
		color: var(--text-primary);
	}

	.state {
		grid-column: 2;
		grid-row: 1 / span 2;
	}

	.location {
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		margin: 0;
		border-block: 1px solid var(--border-glass);
		padding: 0;
	}

	.location-part {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		padding: var(--space-3) var(--space-5) var(--space-3) 0;
		margin-inline-end: var(--space-5);
		border-inline-end: 1px solid var(--border-glass);
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-weight: 600;
		color: var(--text-primary);
	}

	.location-part:last-child {
		border-inline-end: none;
		margin-inline-end: 0;
	}

	.term {
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8rem, 1fr));
		gap: 0;
		margin: 0;
	}

	.fact {
		padding: var(--space-4) var(--space-4) var(--space-4) 0;
		border-block-end: 1px solid var(--border-glass);
	}

	dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 500;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* Weight, not size, does the work here: an ISO date is ten monospaced
	   characters and at the lead step it broke across two lines in a column
	   this narrow, which reads as a wrapping bug rather than as emphasis. */
	dd {
		margin: var(--space-1) 0 0;
		font-family: var(--font-mono);
		font-size: var(--text-ui);
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
		color: var(--text-primary);
	}

	.dependencies {
		padding-block: var(--space-5);
	}

	.sub {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	li {
		display: grid;
		grid-template-columns: 5.5rem minmax(0, 1fr) auto;
		align-items: baseline;
		gap: var(--space-4);
		padding-block: var(--space-3);
		border-block-start: 1px solid var(--border-glass);
	}

	.dep-id {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-weight: 600;
		color: var(--text-primary);
	}

	.dep-title {
		font-family: var(--font-body);
		font-size: var(--text-ui);
		color: var(--text-secondary);
		overflow-wrap: anywhere;
	}

	.none {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-ui);
		color: var(--text-secondary);
	}

	@media (max-width: 767px) {
		.title {
			font-size: 1.5rem;
		}

		li {
			grid-template-columns: 1fr;
			gap: var(--space-1);
		}
	}
</style>
