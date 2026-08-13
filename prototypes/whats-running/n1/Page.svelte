<script lang="ts">
	/**
	 * What's running — approach 1 of 5: The bare list.
	 *
	 * The round's minimum. One vertical list of what is building or verifying,
	 * and nothing else: no page title, no count, no footer, no filter, no chrome.
	 * Depth is one tap, in place. Everything absent was removed deliberately, to
	 * find out whether the page still answers its question without it.
	 */
	import { Header, PageFrame } from '@alfons/design';
	import RunningRow, { type RunningTask } from './RunningRow.svelte';

	const inMotion: RunningTask[] = [
		{
			id: 'AL-014',
			title: 'Skill: /prototype — the one-question-at-a-time journey and the five-agent fan-out',
			project: 'alfons',
			release: 'prototype-loop-v1',
			phase: 2,
			status: 'verifying',
			criterionCount: 4,
			latestAttempt: 1,
			latestVerdict: 'partial'
		},
		{
			id: 'LDG-041',
			title: 'One release-document check, four callers',
			project: 'ledger',
			release: 'hooks-that-actually-run',
			phase: 1,
			status: 'building',
			criterionCount: 3,
			latestAttempt: 0,
			latestVerdict: null
		},
		{
			id: 'ATL-118',
			title: 'Rank corpus search by recency when the query names no project',
			project: 'atlas',
			release: 'search-that-answers-v2',
			phase: 3,
			status: 'building',
			criterionCount: 6,
			latestAttempt: 0,
			latestVerdict: null
		},
		{
			id: 'GW-072',
			title: 'Refuse a request whose token budget the upstream model cannot honour',
			project: 'gateway',
			release: 'token-budget-v1',
			phase: 2,
			status: 'verifying',
			criterionCount: 5,
			latestAttempt: 2,
			latestVerdict: 'fail'
		}
	];

	// ?empty pins the zero state for review. Without it the simulated feed shows
	// both, because the page has to survive emptying while it is being read.
	const startEmpty = new URLSearchParams(location.search).has('empty');

	let running = $state<RunningTask[]>(startEmpty ? [] : [...inMotion]);
	let expandedId = $state<string | null>(null);

	const announcement = $derived(
		running.length === 0
			? 'Nothing is running.'
			: `${running.length} ${running.length === 1 ? 'task is' : 'tasks are'} running.`
	);

	function toggle(id: string) {
		expandedId = expandedId === id ? null : id;
	}

	// Stands in for the SSE feed. A task reaching done leaves the list under the
	// reader rather than waiting for a reload, which is the behaviour being tried.
	$effect(() => {
		const tick = setInterval(() => {
			if (running.length > 0) {
				const finished = running[0];
				if (expandedId === finished.id) expandedId = null;
				running = running.slice(1);
			} else {
				running = [...inMotion];
			}
		}, 7000);
		return () => clearInterval(tick);
	});
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	<div class="running">
		<div class="running__column">
			<p class="running__announcement" aria-live="polite">{announcement}</p>

			{#if running.length > 0}
				<ul class="running__list">
					{#each running as task (task.id)}
						<RunningRow {task} open={expandedId === task.id} onToggle={toggle} />
					{/each}
				</ul>
			{:else}
				<div class="running__nothing">
					<p class="running__nothing-line">Nothing is running.</p>
					<p class="running__nothing-note">This list fills itself the moment something starts.</p>
				</div>
			{/if}
		</div>
	</div>
</PageFrame>

<style>
	.running {
		/* Status colour, declared once, reserved for state. */
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);

		display: flex;
		flex-direction: column;
		min-height: 100svh;

		/* The library's PageSection would put a 64px band above a list whose whole
		   job is to be read in a second. The column is written out instead, on the
		   same page tokens, so the list starts just under the header. */
		padding: var(--space-5) var(--page-padding-x-mobile) var(--space-7);
	}

	@media (min-width: 769px) {
		.running {
			padding-left: var(--page-padding-x);
			padding-right: var(--page-padding-x);
		}
	}

	.running__column {
		display: flex;
		flex: 1;
		flex-direction: column;
		width: 100%;
		max-width: 38rem;
		margin: 0 auto;
	}

	.running__list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* The zero state is where this page spends most of its life, so it holds the
	   optical centre rather than sitting at the top of an otherwise blank column. */
	.running__nothing {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		padding-bottom: var(--space-8);
		text-align: center;
	}

	.running__nothing-line {
		margin: 0;
		color: var(--text-primary);
		font-family: var(--font-display);
		font-size: var(--text-lead);
	}

	.running__nothing-note {
		margin: 0;
		max-width: 22rem;
		color: var(--text-muted);
		font-size: var(--text-caption);
	}

	/* No visually-hidden utility is exported, so the live region carries its own. */
	.running__announcement {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
