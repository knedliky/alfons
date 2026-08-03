<script lang="ts" module>
	export type RunningStatus = 'building' | 'verifying';

	export interface RunningTask {
		id: string;
		title: string;
		project: string;
		release: string;
		phase: number;
		status: RunningStatus;
		criterionCount: number;
		latestAttempt: number;
		latestVerdict: string | null;
	}
</script>

<script lang="ts">
	/**
	 * One row of the bare list: the whole row is the disclosure trigger.
	 *
	 * Bare <button> rather than the Button atom because the trigger is the row
	 * itself — full-bleed, two-line, carrying aria-expanded — and none of that is
	 * what an atom shaped around a label and a variant is for.
	 */
	import { slide } from 'svelte/transition';
	import { Icon } from '@alfons/design';

	interface Props {
		task: RunningTask;
		open: boolean;
		onToggle: (id: string) => void;
	}

	let { task, open, onToggle }: Props = $props();

	const panelId = $derived(`running-detail-${task.id}`);

	// A task in building has been through no verification attempt yet, and the
	// absence is worth saying rather than leaving the reader to infer it.
	const verification = $derived(
		task.latestAttempt > 0
			? `Attempt ${task.latestAttempt} — ${task.latestVerdict}`
			: 'Not yet attempted'
	);
</script>

<!-- A task leaving the list collapses rather than vanishing, so the reader sees
     the departure instead of finding the page silently rearranged. -->
<li class="row" out:slide={{ duration: 220 }}>
	<button
		class="row__trigger"
		type="button"
		aria-expanded={open}
		aria-controls={panelId}
		onclick={() => onToggle(task.id)}
	>
		<span class="row__status" data-status={task.status}>{task.status}</span>
		<span class="row__title">{task.title}</span>
		<span class="row__chevron" data-open={open}><Icon name="chevron-down" size="sm" /></span>
	</button>

	<div class="row__panel" id={panelId} data-open={open} inert={!open}>
		<div class="row__panel-inner">
			<p class="row__origin">{task.id} · {task.project}</p>
			<dl class="row__facts">
				<dt>Release</dt>
				<dd>{task.release}</dd>
				<dt>Phase</dt>
				<dd>{task.phase}</dd>
				<dt>Criteria</dt>
				<dd>{task.criterionCount}</dd>
				<dt>Verification</dt>
				<dd>{verification}</dd>
			</dl>
		</div>
	</div>
</li>

<style>
	/* Separators between rows only — the list needs no frame of its own. */
	.row {
		border-top: 1px solid var(--card-border);
	}

	.row:first-child {
		border-top: 0;
	}

	.row__trigger {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: start;
		gap: var(--space-1) var(--space-4);
		width: 100%;
		min-height: 44px;
		padding: var(--space-4) 0;
		border: 0;
		background: none;
		font-family: var(--font-body);
		text-align: left;
		cursor: pointer;
	}

	.row__status {
		grid-column: 1;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		line-height: 1;
	}

	/* Status colour encodes state and nothing else; the word carries the meaning
	   on its own for anyone the colour does not reach. */
	.row__status[data-status='building'] {
		color: var(--status-building);
	}

	.row__status[data-status='verifying'] {
		color: var(--status-verifying);
	}

	.row__title {
		grid-column: 1;
		color: var(--text-primary);
		font-size: var(--text-body);
		line-height: 1.35;
		text-wrap: pretty;
	}

	.row__chevron {
		grid-column: 2;
		grid-row: 1 / span 2;
		align-self: center;
		display: flex;
		color: var(--text-muted);
		transition: transform var(--transition-fast);
	}

	.row__chevron[data-open='true'] {
		transform: rotate(180deg);
	}

	/* 0fr → 1fr is the only way to transition to an auto height; inert keeps the
	   collapsed panel out of the tab order and away from assistive technology. */
	.row__panel {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--transition-fast);
	}

	.row__panel[data-open='true'] {
		grid-template-rows: 1fr;
	}

	.row__panel-inner {
		overflow: hidden;
	}

	.row__origin {
		margin: var(--space-1) 0 var(--space-3);
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
	}

	.row__facts {
		display: grid;
		grid-template-columns: 6rem 1fr;
		gap: var(--space-2) var(--space-4);
		margin: 0 0 var(--space-5);
		font-size: var(--text-ui);
	}

	.row__facts dt {
		color: var(--text-muted);
	}

	.row__facts dd {
		margin: 0;
		color: var(--text-secondary);
	}

	@media (prefers-reduced-motion: reduce) {
		.row__panel,
		.row__chevron {
			transition: none;
		}
	}
</style>
