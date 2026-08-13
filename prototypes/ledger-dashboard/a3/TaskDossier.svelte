<script lang="ts">
	/**
	 * The detail pane. Never an overlay — it holds a column of the page, so the
	 * release it belongs to and its sibling tasks stay visible beside it. That is
	 * the whole bet of this approach: the payoff is the neighbours, and a drawer
	 * covers exactly the thing you came to see.
	 */
	import { Pill } from '@alfons/design';
	import StatusMark from './StatusMark.svelte';
	import type { Task } from './corpus.ts';

	interface Props {
		task: Task | null;
		siblings: Task[];
		dependencies: Task[];
		dependents: Task[];
		onSelect: (id: string) => void;
	}

	const { task, siblings, dependencies, dependents, onSelect }: Props = $props();

	const verdictTone: Record<string, string> = {
		pass: 'var(--status-done)',
		fail: 'var(--status-blocked)',
		partial: 'var(--status-building)'
	};
</script>

<!-- MainLayout already supplies the <aside> landmark; this is a section within it. -->
<section class="dossier" aria-label="Task dossier">
	{#if !task}
		<div class="empty">
			<p class="empty-heading">No task in focus</p>
			<p class="empty-body">
				Search by title, or pick a task from the release beside this pane. The dossier fills here
				rather than over the page, so the release stays readable while you read the task.
			</p>
		</div>
	{:else}
		<header class="head">
			<div class="head-top">
				<span class="task-id">{task.id}</span>
				<StatusMark status={task.status} />
			</div>
			<h2 class="task-title">{task.title}</h2>
			<div class="tags">
				<Pill label={task.type} size="sm" fill="soft" tint="var(--text-secondary)" />
				<Pill label="risk {task.risk}" size="sm" fill="outline" tint="var(--text-muted)" />
				<Pill label="phase {task.phase}" size="sm" fill="outline" tint="var(--text-muted)" />
			</div>
		</header>

		<dl class="facts">
			<div>
				<dt>Release</dt>
				<dd>{task.release}</dd>
			</div>
			<div>
				<dt>Project</dt>
				<dd>{task.project}</dd>
			</div>
			<div>
				<dt>Created</dt>
				<dd>{task.createdOn}</dd>
			</div>
			<div>
				<dt>Completed</dt>
				<dd>{task.completedOn ?? '—'}</dd>
			</div>
			<div>
				<dt>Latest seal</dt>
				<dd>
					{#if task.latestVerdict}
						<span class="verdict" style="--verdict-colour: {verdictTone[task.latestVerdict]};">
							{task.latestVerdict}
						</span>
						<span class="verdict-detail">
							attempt {task.latestAttempt} · {task.latestSealedOn}
						</span>
					{:else}
						<span class="verdict-detail">unsealed</span>
					{/if}
				</dd>
			</div>
		</dl>

		<section class="block">
			<h3 class="block-heading">
				Criteria <span class="block-count">{task.criteria.length}</span>
			</h3>
			<ul class="criteria">
				{#each task.criteria as criterion (criterion.id)}
					<li>
						<span
							class="criterion-verdict"
							style="--verdict-colour: {criterion.verdict
								? verdictTone[criterion.verdict]
								: 'var(--text-muted)'};"
						>
							{criterion.id}
						</span>
						<span class="criterion-body">{criterion.body}</span>
						<span class="criterion-state">{criterion.verdict ?? 'unjudged'}</span>
					</li>
				{/each}
			</ul>
		</section>

		{#if task.steps.length > 0}
			<section class="block">
				<h3 class="block-heading">Steps <span class="block-count">{task.steps.length}</span></h3>
				<ol class="steps">
					{#each task.steps as step, index (step)}
						<li><span class="step-index">{index + 1}</span><span>{step}</span></li>
					{/each}
				</ol>
			</section>
		{/if}

		{#if task.fileChanges.length > 0}
			<section class="block">
				<h3 class="block-heading">
					File changes <span class="block-count">{task.fileChanges.length}</span>
				</h3>
				<ul class="paths">
					{#each task.fileChanges as path (path)}
						<li>{path}</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if dependencies.length > 0 || dependents.length > 0}
			<section class="block">
				<h3 class="block-heading">Dependencies</h3>
				{#if dependencies.length > 0}
					<p class="relation-label">Waits on</p>
					<ul class="relations">
						{#each dependencies as dependency (dependency.id)}
							<li>
								<button type="button" class="relation" onclick={() => onSelect(dependency.id)}>
									<StatusMark status={dependency.status} showLabel={false} size="sm" />
									<span class="relation-id">{dependency.id}</span>
									<span class="relation-title">{dependency.title}</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
				{#if dependents.length > 0}
					<p class="relation-label">Blocks</p>
					<ul class="relations">
						{#each dependents as dependent (dependent.id)}
							<li>
								<button type="button" class="relation" onclick={() => onSelect(dependent.id)}>
									<StatusMark status={dependent.status} showLabel={false} size="sm" />
									<span class="relation-id">{dependent.id}</span>
									<span class="relation-title">{dependent.title}</span>
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</section>
		{/if}

		<section class="block">
			<h3 class="block-heading">
				Siblings in this phase <span class="block-count">{siblings.length}</span>
			</h3>
			{#if siblings.length === 0}
				<p class="relation-label">Alone in phase {task.phase}.</p>
			{:else}
				<ul class="relations">
					{#each siblings as sibling (sibling.id)}
						<li>
							<button type="button" class="relation" onclick={() => onSelect(sibling.id)}>
								<StatusMark status={sibling.status} showLabel={false} size="sm" />
								<span class="relation-id">{sibling.id}</span>
								<span class="relation-title">{sibling.title}</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	{/if}
</section>

<style>
	.dossier {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding: var(--space-5);
		/* Real fill and real elevation: the current page's alpha-border cards float. */
		background: var(--surface-raised-bg);
		box-shadow: var(--elevation-2);
		border: 1px solid var(--card-border);
		max-height: calc(100vh - var(--header-height) - var(--space-8));
		overflow-y: auto;
	}

	.empty {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.empty-heading {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lead);
		color: var(--text-primary);
	}

	.empty-body {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-caption);
		line-height: 1.6;
		color: var(--text-muted);
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--card-border);
	}

	.head-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.task-id {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		letter-spacing: 0.08em;
		color: var(--text-secondary);
	}

	.task-title {
		margin: 0;
		/* The display voice the brief asks for, at the size the detail deserves. */
		font-family: var(--font-display);
		font-size: 1.5rem;
		line-height: 1.25;
		color: var(--text-primary);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.facts {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-3) var(--space-4);
		margin: 0;
	}

	.facts div {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.facts dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-muted);
	}

	.facts dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}

	.verdict {
		color: var(--verdict-colour);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.verdict-detail {
		display: block;
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.block {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.block-heading {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-secondary);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--card-border);
	}

	.block-count {
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.criteria,
	.paths,
	.steps,
	.relations {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.criteria li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-1) var(--space-3);
		align-items: baseline;
	}

	.criterion-verdict {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--verdict-colour);
		border-left: 2px solid var(--verdict-colour);
		padding-left: var(--space-2);
	}

	.criterion-body {
		font-family: var(--font-body);
		font-size: var(--text-caption);
		line-height: 1.5;
		color: var(--text-primary);
	}

	.criterion-state {
		grid-column: 2;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.steps li {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--space-3);
		font-family: var(--font-body);
		font-size: var(--text-caption);
		line-height: 1.5;
		color: var(--text-secondary);
	}

	.step-index {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.paths {
		gap: var(--space-2);
	}

	.paths li {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
		overflow-wrap: anywhere;
	}

	.relations {
		gap: 0;
	}

	.relation-label {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.relation {
		display: grid;
		grid-template-columns: auto auto 1fr;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		padding: var(--space-2) 0;
		background: transparent;
		border: 0;
		border-bottom: 1px solid var(--card-border);
		text-align: left;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.relation:hover {
		background: var(--surface-hover-subtle);
	}

	.relation:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: -2px;
	}

	.relation-id {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.relation-title {
		font-family: var(--font-body);
		font-size: var(--text-micro);
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
