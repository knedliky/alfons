<script lang="ts">
	/**
	 * Ledger — the corpus dashboard — approach 3 of 5: Release dossier
	 *
	 * Direction: the journey rendered literally as master-detail. A persistent
	 * release index down one side; the selected release's phases, tasks, siblings
	 * and dependencies filling the rest. No modal drawer anywhere — the detail is
	 * never an overlay, so the answer to "what else is in this release" is on the
	 * page at the moment the question occurs, not one dismissal away.
	 *
	 * Layout is three panes composed from two nested MainLayouts: the outer aside
	 * carries the release index on the left, the inner aside carries the task
	 * dossier on the right. Both are container tier, so the nesting is legal.
	 */
	import {
		Footer,
		Header,
		LongreadStatBand,
		MainLayout,
		PageFrame,
		PageSection
	} from '@alfons/design';
	import LiveTicker from './LiveTicker.svelte';
	import ReleaseBody from './ReleaseBody.svelte';
	import ReleaseIndex from './ReleaseIndex.svelte';
	import TaskDossier from './TaskDossier.svelte';
	import {
		headlineStats,
		releases,
		tasks,
		transitionFeed,
		type Task,
		type TaskStatus,
		type TransitionEvent
	} from './corpus.ts';

	let query = $state('');
	let selectedRelease = $state('prototype-loop-v1');
	let selectedTaskId = $state<string | null>('AL-014');

	// The SSE feed, simulated: statuses are corrected underneath the view, which
	// is the behaviour the page has to survive rather than merely describe.
	let liveStatuses = $state<Record<string, TaskStatus>>({});
	let feed = $state<TransitionEvent[]>(transitionFeed);
	let connected = $state(true);

	$effect(() => {
		const pending: TransitionEvent[] = [
			{
				taskId: 'GW-023',
				title: 'Token exchange for the agent fleet',
				from: 'pending',
				to: 'triaged',
				at: '14:31'
			},
			{
				taskId: 'AL-011',
				title: 'Storybook: a story per component',
				from: 'building',
				to: 'verifying',
				at: '14:36'
			},
			{
				taskId: 'LDG-052',
				title: 'Search the corpus by title fragment',
				from: 'building',
				to: 'verifying',
				at: '14:44'
			}
		];
		let index = 0;
		const timer = setInterval(() => {
			if (index >= pending.length) {
				clearInterval(timer);
				return;
			}
			const event = pending[index];
			index += 1;
			liveStatuses = { ...liveStatuses, [event.taskId]: event.to };
			feed = [event, ...feed];
		}, 6000);
		return () => clearInterval(timer);
	});

	/** The corpus as the page sees it, with live corrections already applied. */
	const liveTasks = $derived(
		tasks.map((task) =>
			liveStatuses[task.id] ? ({ ...task, status: liveStatuses[task.id] } as Task) : task
		)
	);

	const results = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return [];
		return liveTasks
			.filter(
				(task) =>
					task.title.toLowerCase().includes(needle) || task.id.toLowerCase().includes(needle)
			)
			.sort((a, b) => a.id.localeCompare(b.id));
	});

	const release = $derived(releases.find((item) => item.slug === selectedRelease) ?? null);

	const releaseTasks = $derived(liveTasks.filter((task) => task.release === selectedRelease));

	const phases = $derived.by(() => {
		// A plain record rather than a Map: this is a grouping intermediate rebuilt
		// on every derivation, and the reactivity lint rightly reserves Map for state.
		const byPhase: Record<number, Task[]> = {};
		for (const task of releaseTasks) {
			(byPhase[task.phase] ??= []).push(task);
		}
		return Object.keys(byPhase)
			.map(Number)
			.sort((a, b) => a - b)
			.map((phase) => ({ phase, tasks: byPhase[phase] }));
	});

	const statusCounts = $derived.by(() => {
		const counts: Partial<Record<TaskStatus, number>> = {};
		for (const task of releaseTasks) {
			counts[task.status] = (counts[task.status] ?? 0) + 1;
		}
		return counts;
	});

	const selectedTask = $derived(liveTasks.find((task) => task.id === selectedTaskId) ?? null);

	const siblings = $derived(
		selectedTask
			? liveTasks.filter(
					(task) =>
						task.release === selectedTask.release &&
						task.phase === selectedTask.phase &&
						task.id !== selectedTask.id
				)
			: []
	);

	const dependencies = $derived(
		selectedTask ? liveTasks.filter((task) => selectedTask.dependsOn.includes(task.id)) : []
	);

	const dependents = $derived(
		selectedTask ? liveTasks.filter((task) => task.dependsOn.includes(selectedTask.id)) : []
	);

	/** Selecting a task moves the release index with it, so context never lies. */
	function selectTask(id: string) {
		selectedTaskId = id;
		const task = liveTasks.find((candidate) => candidate.id === id);
		if (task) selectedRelease = task.release;
	}

	function selectRelease(slug: string) {
		selectedRelease = slug;
		query = '';
		const first = liveTasks.find((task) => task.release === slug);
		selectedTaskId = first ? first.id : null;
	}
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}

	<!--
		The status encoding is declared once, here, and inherited by every region.
		Nothing below re-states a status colour, so the encoding cannot drift
		between the rail, the meter, the rows, the dossier and the ticker.
	-->
	<main
		class="ledger"
		style="
			--status-pending: var(--text-muted);
			--status-triaged: var(--sky-blue);
			--status-building: var(--amber);
			--status-verifying: var(--blush-pink);
			--status-done: var(--olive-green);
			--status-blocked: var(--fire-engine-red);
			--status-wontfix: var(--text-muted);
			--status-duplicate: var(--text-muted);
		"
	>
		<PageSection maxWidth="1600px">
			<header class="masthead">
				<p class="kicker">The corpus</p>
				<h1 class="headline">Ledger</h1>
				<p class="standfirst">
					Every task the agents hold, grouped by the release that gives it a reason. Find one by
					name; read it beside its neighbours.
				</p>
				<LongreadStatBand stats={headlineStats} />
				<LiveTicker events={feed} {connected} />
			</header>
		</PageSection>

		<PageSection maxWidth="1600px">
			<MainLayout
				asideWidth="20rem"
				gap="xl"
				stickyTop="calc(var(--header-height) + var(--space-4))"
			>
				{#snippet aside()}
					<ReleaseIndex
						{releases}
						tasks={liveTasks}
						{query}
						{selectedRelease}
						resultCount={results.length}
						onQuery={(value) => (query = value)}
						onSelectRelease={selectRelease}
					/>
				{/snippet}

				{#snippet main()}
					<MainLayout
						asidePosition="right"
						asideWidth="24rem"
						gap="lg"
						stickyTop="calc(var(--header-height) + var(--space-4))"
					>
						{#snippet aside()}
							<TaskDossier
								task={selectedTask}
								{siblings}
								{dependencies}
								{dependents}
								onSelect={selectTask}
							/>
						{/snippet}

						{#snippet main()}
							<ReleaseBody
								{release}
								{phases}
								{statusCounts}
								releaseTaskTotal={releaseTasks.length}
								{query}
								{results}
								{selectedTaskId}
								onSelectTask={selectTask}
								onClearQuery={() => (query = '')}
							/>
						{/snippet}
					</MainLayout>
				{/snippet}
			</MainLayout>
		</PageSection>
	</main>
</PageFrame>

<style>
	/* The site Header floats fixed over the page, so the page clears it itself —
	   PageFrame does not, and the masthead is the first thing under it. */
	.ledger {
		padding-top: var(--header-height);
	}

	.masthead {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		padding-bottom: var(--space-6);
		border-bottom: 1px solid var(--card-border);
	}

	.kicker {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: var(--text-muted);
	}

	/* One display voice at the top of the page, against the mono microtype
	   everywhere else — the hierarchy the current single-size page has none of. */
	.headline {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 6vw, 4rem);
		line-height: 1;
		letter-spacing: -0.02em;
		color: var(--text-primary);
	}

	.standfirst {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-lead);
		line-height: 1.5;
		color: var(--text-secondary);
		max-width: 46ch;
	}
</style>
