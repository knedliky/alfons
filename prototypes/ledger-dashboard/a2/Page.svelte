<script lang="ts">
	/**
	 * Ledger — the corpus dashboard — approach 2 of 5: Editorial ledger
	 *
	 * Direction: the corpus read as a data-journalism spread. A display-voice
	 * headline, an annotated throughput chart that tells the reader what to
	 * notice, and releases ordered as a narrative with standfirsts rather than
	 * tiled as a grid of equal cards.
	 *
	 * The one thing that is not editorial is the status encoding: the --status-*
	 * set is declared once on the page root and every region reads it from
	 * there, so the meaning of a colour cannot drift between the search results,
	 * the release narrative and the live feed.
	 */
	import {
		Chip,
		Container,
		Footer,
		Header,
		Input,
		LongreadFigure,
		LongreadStatBand,
		MainLayout,
		PageFrame,
		PageSection
	} from '@alfons/design';
	import ReleaseEntry from './ReleaseEntry.svelte';
	import StatusMark from './StatusMark.svelte';
	import TaskRow from './TaskRow.svelte';
	import ThroughputChart from './ThroughputChart.svelte';
	import {
		HEADLINE,
		PENDING_FEED,
		RELEASES,
		SEEDED_FEED,
		STATUS_ORDER,
		TASKS,
		THROUGHPUT,
		THROUGHPUT_ANNOTATIONS,
		type FeedEvent,
		type Task,
		type TaskStatus
	} from './corpus.ts';

	// The corpus is live, so the page owns a mutable copy the feed corrects.
	let tasks = $state<Task[]>(TASKS.map((task) => ({ ...task })));
	let feed = $state<FeedEvent[]>([...SEEDED_FEED]);

	let query = $state('prototype');
	let statusFilter = $state<TaskStatus | null>(null);
	let selectedTaskId = $state<string | null>(null);

	const results = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		return tasks
			.filter((task) => {
				if (statusFilter && task.status !== statusFilter) return false;
				if (!needle) return true;
				return (
					task.title.toLowerCase().includes(needle) ||
					task.id.toLowerCase().includes(needle) ||
					task.release.toLowerCase().includes(needle) ||
					task.project.toLowerCase().includes(needle)
				);
			})
			.slice(0, 8);
	});

	const selectedTask = $derived(tasks.find((task) => task.id === selectedTaskId) ?? null);

	const dependencies = $derived(
		selectedTask ? tasks.filter((task) => selectedTask.dependsOn.includes(task.id)) : []
	);

	/**
	 * The release the reader arrived for leads the spread. Everything else keeps
	 * its narrative order, which is deliberate: a release is not ranked by size.
	 */
	const orderedReleases = $derived.by(() => {
		if (!selectedTask) return RELEASES;
		const lead = RELEASES.find((release) => release.slug === selectedTask.release);
		if (!lead) return RELEASES;
		return [lead, ...RELEASES.filter((release) => release.slug !== lead.slug)];
	});

	function tasksIn(slug: string): Task[] {
		return tasks
			.filter((task) => task.release === slug)
			.sort((a, b) => a.phase - b.phase || a.id.localeCompare(b.id));
	}

	// A plain record rather than a Map: the tally is rebuilt from scratch on every
	// feed correction, so nothing here needs to be reactive in its own right.
	const statusCounts = $derived.by(() => {
		const counts: Partial<Record<TaskStatus, number>> = {};
		for (const task of tasks) counts[task.status] = (counts[task.status] ?? 0) + 1;
		return counts;
	});

	const headlineStats = $derived([
		{ value: String(HEADLINE.open), label: 'open' },
		{ value: String(HEADLINE.inFlight), label: 'in flight' },
		{ value: String(HEADLINE.blocked), label: 'blocked' },
		{ value: String(HEADLINE.shippedFortnight), label: 'shipped in 14 days' }
	]);

	/**
	 * The SSE feed, stood in for. Each announcement corrects the task underneath
	 * the view as well as printing itself, because a feed that only prints is a
	 * ticker and this one is the source of truth for the rows above it.
	 */
	let announced = $state(0);
	$effect(() => {
		const timer = setInterval(() => {
			if (announced >= PENDING_FEED.length) return;
			const event = PENDING_FEED[announced];
			announced += 1;
			feed = [event, ...feed];
			const task = tasks.find((candidate) => candidate.id === event.taskId);
			if (task) task.status = event.to;
		}, 6000);
		return () => clearInterval(timer);
	});
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}

	<main class="ledger">
		<!-- The masthead: the corpus stated as a story, not as a status bar. -->
		<PageSection maxWidth="1440px">
			<Container maxWidth="full" padding={false}>
				<div class="masthead">
					<p class="kicker">
						<span>The Ledger</span>
						<span class="rule"></span>
						<span>Monday 3 August 2026</span>
						<span class="rule"></span>
						<span class="live">
							<span class="live-dot"></span>
							live over SSE
						</span>
					</p>
					<h1 class="display">
						One hundred and forty-two tasks shipped in a fortnight, and one that has not moved
						since June
					</h1>
					<p class="standfirst">
						Eleven projects, dozens of releases and several hundred tasks, and the only thing
						anyone ever wants from it is where one particular piece of work stands. Start by
						remembering roughly what it was called.
					</p>
					<LongreadStatBand stats={headlineStats} />
				</div>
			</Container>
		</PageSection>

		<!-- Search is the front door, so it is set as one, not as a toolbar corner. -->
		<PageSection maxWidth="1440px">
			<Container maxWidth="full" padding={false}>
				<section class="search" aria-labelledby="search-heading">
					<h2 class="section-heading" id="search-heading">Find the task</h2>
					<p class="section-deck">
						Search runs over titles, ids, releases and projects. Every result carries its
						release, its project and its phase, because a title alone is rarely enough to
						recognise the right one.
					</p>

					<div class="search-field">
						<label class="search-label" for="ledger-search">
							What do you remember of the title?
						</label>
						<Input
							id="ledger-search"
							class="a2-search-input"
							bind:value={query}
							placeholder="prototype, schema, token exchange…"
							autocomplete="off"
						/>
					</div>

					<div class="filters">
						<span class="filters-label">Narrow by status</span>
						<div class="filter-chips">
							{#each STATUS_ORDER as status (status)}
								<Chip
									label="{status} · {statusCounts[status] ?? 0}"
									colour="var(--status-{status})"
									fill={statusFilter === status ? 'soft' : 'outline'}
									size="sm"
									onClick={() => (statusFilter = statusFilter === status ? null : status)}
								/>
							{/each}
						</div>
					</div>

					<p class="result-count">
						{results.length} of {tasks.length} shown
						{#if statusFilter}· filtered to {statusFilter}{/if}
					</p>

					<div class="results">
						{#each results as task (task.id)}
							<TaskRow
								{task}
								selected={task.id === selectedTaskId}
								onSelect={(id) => (selectedTaskId = selectedTaskId === id ? null : id)}
							/>
						{/each}
						{#if results.length === 0}
							<p class="no-results">
								Nothing matches “{query}”. Titles in this corpus tend to read as sentences —
								try a word from the middle of one.
							</p>
						{/if}
					</div>

					{#if selectedTask}
						<p class="handoff">
							<span class="handoff-mark">↓</span>
							<span>
								{selectedTask.id} sits in phase {selectedTask.phase} of
								<strong>{selectedTask.release}</strong>. Its siblings and what it waits on are
								below.
							</span>
						</p>
					{/if}
				</section>
			</Container>
		</PageSection>

		<!-- The chart carries its own title, annotation and source line. -->
		<PageSection maxWidth="1440px">
			<Container maxWidth="full" padding={false}>
				<LongreadFigure>
					<ThroughputChart
						data={THROUGHPUT}
						annotations={THROUGHPUT_ANNOTATIONS}
						title="Throughput follows the release document, not the other way round"
						deck="Tasks sealed done each week, thirteen weeks to the end of July."
						note="Notice the three spikes. Each one falls in the week a release document was written — and in every case the release had been open for a month before that. Writing the document is not the last act of a release; it is the act that finishes it. The fortnight now in progress is the largest of the quarter and has not yet fallen back."
					/>
				</LongreadFigure>
			</Container>
		</PageSection>

		<!-- The payoff: the shape of the work around the task, told release by release. -->
		<PageSection maxWidth="1440px">
			<Container maxWidth="full" padding={false}>
				<section class="narrative" aria-labelledby="narrative-heading">
					<h2 class="section-heading" id="narrative-heading">The releases, in order</h2>
					<p class="section-deck">
						Not a grid of equal cards. A release earns its place in the spread by what it is
						for, and the one holding the task you selected leads.
					</p>

					<MainLayout asideWidth="20rem" gap="xl" asidePosition="right">
						{#snippet main()}
							<div class="entries">
								{#each orderedReleases as release, index (release.slug)}
									<ReleaseEntry
										{release}
										ordinal={index + 1}
										tasks={tasksIn(release.slug)}
										lead={index === 0}
										{selectedTaskId}
										{dependencies}
										onSelectTask={(id) =>
											(selectedTaskId = selectedTaskId === id ? null : id)}
									/>
								{/each}
							</div>
						{/snippet}

						{#snippet aside()}
							<div class="stop-press">
								<h3 class="stop-press-title">Stop press</h3>
								<p class="stop-press-deck">
									Status transitions as the ledger announces them. The rows above correct
									themselves as each one lands.
								</p>
								<ul class="feed">
									{#each feed as event, index (event.at + event.taskId)}
										<li class="feed-item" class:newest={index === 0}>
											<span class="feed-time">{event.at}</span>
											<span class="feed-body">
												<span class="feed-id">{event.taskId}</span>
												<span class="feed-move">
													<StatusMark status={event.from} size="sm" />
													<span class="feed-arrow">→</span>
													<StatusMark status={event.to} size="sm" />
												</span>
											</span>
										</li>
									{/each}
								</ul>
							</div>
						{/snippet}
					</MainLayout>
				</section>
			</Container>
		</PageSection>
	</main>
</PageFrame>

<style>
	/**
	 * The status encoding, declared once. Every region below inherits it, so a
	 * colour cannot mean one thing in the results and another in the feed.
	 * Status colour appears only where it encodes state, and never as decoration.
	 */
	.ledger {
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		/* Neither is a live state; both read as retired, so both take the muted grey. */
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);

		/*
		 * The editorial scale. Alfons has no display type scale — the typography
		 * tokens stop at --text-lead (1.25rem) — so the four display steps this
		 * approach needs are declared here and used by name, rather than as
		 * literals sprinkled through the regions.
		 */
		--ledger-display: clamp(2.5rem, 5.4vw, 4.75rem);
		--ledger-section: clamp(1.75rem, 2.6vw, 2.5rem);
		--ledger-standfirst: clamp(1.125rem, 1.5vw, 1.4375rem);
	}

	.masthead {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.kicker {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.18em;
		color: var(--text-muted);
	}

	.kicker .rule {
		flex: none;
		width: var(--space-6);
		height: 1px;
		background: var(--border-glass);
	}

	.live {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--text-secondary);
	}

	/* The feed indicator is the page's one moment of accent, and it is a state. */
	.live-dot {
		width: 6px;
		height: 6px;
		background: var(--accent);
		animation: pulse var(--widget-pulse-duration) ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.25;
		}
	}

	.display {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--ledger-display);
		line-height: 1.02;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		max-width: 18ch;
		text-wrap: balance;
	}

	.masthead .standfirst {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--ledger-standfirst);
		line-height: 1.5;
		color: var(--text-secondary);
		max-width: 52ch;
	}

	.section-heading {
		margin: 0 0 var(--space-3);
		font-family: var(--font-display);
		font-size: var(--ledger-section);
		line-height: 1.1;
		letter-spacing: -0.02em;
		color: var(--text-primary);
	}

	.section-deck {
		margin: 0 0 var(--space-6);
		font-family: var(--font-body);
		font-size: var(--text-ui);
		line-height: 1.6;
		color: var(--text-secondary);
		max-width: 62ch;
	}

	.search {
		display: flex;
		flex-direction: column;
	}

	.search-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		max-width: 46rem;
	}

	.search-label {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-muted);
	}

	/*
	 * The field is the primary journey, so it is set at reading size rather than
	 * at control size. Input owns its own element, hence the global reach.
	 */
	.search .search-field :global(.a2-search-input) {
		height: calc(var(--input-height) * 1.35);
		font-family: var(--font-body);
		font-size: var(--text-lead);
		padding-left: var(--space-5);
		padding-right: var(--space-5);
	}

	.filters {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-4);
		margin-top: var(--space-5);
	}

	.filters-label {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-muted);
	}

	.filter-chips {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.result-count {
		margin: var(--space-5) 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--text-muted);
	}

	.results {
		display: flex;
		flex-direction: column;
		border-top: 1px solid var(--card-border);
	}

	.no-results {
		margin: 0;
		padding: var(--space-6) 0;
		font-family: var(--font-body);
		font-size: var(--text-ui);
		color: var(--text-secondary);
		max-width: 52ch;
	}

	.handoff {
		display: flex;
		gap: var(--space-3);
		margin: var(--space-5) 0 0;
		padding: var(--space-4) var(--space-5);
		background: var(--elevation-1-bg);
		border-top: 1px solid var(--el-edge-light);
		border-left: 1px solid var(--el-edge-light);
		border-right: 1px solid var(--el-edge-shade);
		border-bottom: 1px solid var(--el-edge-shade);
		box-shadow: var(--elevation-1);
		font-family: var(--font-body);
		font-size: var(--text-ui);
		color: var(--text-primary);
		max-width: 62ch;
	}

	.handoff-mark {
		font-family: var(--font-mono);
		color: var(--text-muted);
	}

	.entries {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
	}

	.stop-press {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-5);
		background: var(--elevation-1-bg);
		border-top: 1px solid var(--el-edge-light);
		border-left: 1px solid var(--el-edge-light);
		border-right: 1px solid var(--el-edge-shade);
		border-bottom: 1px solid var(--el-edge-shade);
		box-shadow: var(--elevation-1);
	}

	.stop-press-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 1.375rem;
		line-height: 1.1;
		color: var(--text-primary);
	}

	.stop-press-deck {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-caption);
		line-height: 1.5;
		color: var(--text-secondary);
	}

	.feed {
		margin: var(--space-2) 0 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
	}

	.feed-item {
		display: grid;
		grid-template-columns: 3.5rem minmax(0, 1fr);
		gap: var(--space-3);
		padding: var(--space-3) 0;
		border-top: 1px solid var(--border-glass);
	}

	.feed-item.newest {
		animation: land var(--duration-slow) var(--ease-spring);
	}

	@keyframes land {
		from {
			opacity: 0;
			transform: translateY(calc(var(--space-1) * -1));
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.feed-time {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.feed-body {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}

	.feed-id {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-primary);
	}

	.feed-move {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.feed-arrow {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.live-dot,
		.feed-item.newest {
			animation: none;
		}
	}
</style>
