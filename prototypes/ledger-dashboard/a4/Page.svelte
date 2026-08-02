<script lang="ts">
	/**
	 * Ledger — the corpus dashboard — approach 4 of 5: Terminal density
	 *
	 * Direction: one full-width sortable table of every task, tabular numerals,
	 * rules instead of cards, colour reserved for status, nothing hidden behind
	 * a filter. The question this approach exists to answer is whether density
	 * on its own reads as authority.
	 *
	 * The failure it is arguing against is not size. The current page is thin,
	 * uniform 11px mono at muted colour on an unattached ground; this one keeps
	 * the row rhythm tight but spends everything it saves on a real type scale,
	 * heavy rules, and one column — the title — carried in body type at the
	 * primary colour. Everything else is supporting mono microtype.
	 */
	import {
		Container,
		Footer,
		Header,
		Input,
		Label,
		PageFrame,
		PageHeader,
		PageSection
	} from '@alfons/design';
	import TaskTable, { type SortColumn } from './TaskTable.svelte';
	import StatusMark from './StatusMark.svelte';
	import {
		IN_FLIGHT_STATUSES,
		OPEN_STATUSES,
		PROJECTS,
		RELEASE_BY_SLUG,
		RELEASES,
		TASKS,
		type Task,
		type TaskStatus
	} from './corpus.ts';

	const STATUS_ORDER: TaskStatus[] = [
		'blocked',
		'building',
		'verifying',
		'triaged',
		'pending',
		'done',
		'wontfix',
		'duplicate'
	];

	const RISK_ORDER = ['destructive', 'high', 'medium', 'low'];
	const VERDICT_ORDER = ['fail', 'partial', 'pass', ''];

	let query = $state('');
	let sortColumn = $state<SortColumn>('release');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let expandedId = $state<string | null>(null);

	/**
	 * The feed corrects statuses underneath the view, so the rendered status is
	 * the corpus status overlaid with whatever the feed has since said. Keeping
	 * the override separate means the seed data is never mutated and a reload
	 * of the prototype starts clean.
	 */
	let feedStatuses = $state<Record<string, TaskStatus>>({});
	let feedLog = $state<{ id: string; from: TaskStatus; to: TaskStatus; at: string }[]>([]);
	let recentlyMoved = $state<string[]>([]);

	const tasks = $derived(
		TASKS.map((task) => (feedStatuses[task.id] ? { ...task, status: feedStatuses[task.id] } : task))
	);

	const matched = $derived.by(() => {
		const term = query.trim().toLowerCase();
		if (!term) return tasks;
		return tasks.filter((task) =>
			`${task.id} ${task.title} ${task.project} ${task.release} ${task.type} ${task.status}`
				.toLowerCase()
				.includes(term)
		);
	});

	function sortKey(task: Task, column: SortColumn): string | number {
		switch (column) {
			case 'status':
				return STATUS_ORDER.indexOf(task.status);
			case 'id':
				return task.id;
			case 'title':
				return task.title.toLowerCase();
			case 'project':
				return task.project;
			case 'release':
				return task.release;
			case 'phase':
				return task.phase;
			case 'type':
				return task.type;
			case 'risk':
				return RISK_ORDER.indexOf(task.risk);
			case 'steps':
				return task.stepCount;
			case 'criteria':
				return task.criterionCount;
			case 'files':
				return task.fileChangeCount;
			case 'attempt':
				return task.latestAttempt;
			case 'verdict':
				return VERDICT_ORDER.indexOf(task.latestVerdict ?? '');
			case 'created':
				return task.createdOn;
			case 'sealed':
				return task.latestSealedOn ?? '';
		}
	}

	const sorted = $derived.by(() => {
		const direction = sortDirection === 'asc' ? 1 : -1;
		return [...matched].sort((a, b) => {
			const left = sortKey(a, sortColumn);
			const right = sortKey(b, sortColumn);
			if (left < right) return -1 * direction;
			if (left > right) return 1 * direction;
			// Phase then id, so a release always reads as a running order.
			if (a.phase !== b.phase) return a.phase - b.phase;
			return a.id.localeCompare(b.id);
		});
	});

	const grouped = $derived(sortColumn === 'release');

	const counts = $derived.by(() => {
		const open = tasks.filter((task) => OPEN_STATUSES.includes(task.status)).length;
		const inFlight = tasks.filter((task) => IN_FLIGHT_STATUSES.includes(task.status)).length;
		const blocked = tasks.filter((task) => task.status === 'blocked').length;
		const shipped = tasks.filter(
			(task) =>
				task.status === 'done' && task.completedOn !== null && task.completedOn >= '2026-07-20'
		).length;
		return { open, inFlight, blocked, shipped };
	});

	const statusTally = $derived.by(() => {
		const tally: Record<string, number> = {};
		for (const status of STATUS_ORDER) tally[status] = 0;
		for (const task of tasks) tally[task.status] = (tally[task.status] ?? 0) + 1;
		return tally;
	});

	function handleSortChange(column: SortColumn) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
			return;
		}
		sortColumn = column;
		sortDirection = 'asc';
	}

	function handleToggleExpand(id: string) {
		expandedId = expandedId === id ? null : id;
	}

	/**
	 * A scripted stand-in for the SSE feed. Scripted rather than random so the
	 * five approaches can be compared against the same sequence of events.
	 */
	const SCRIPTED_TRANSITIONS: { id: string; to: TaskStatus }[] = [
		{ id: 'AL-015', to: 'verifying' },
		{ id: 'ATL-116', to: 'verifying' },
		{ id: 'AL-014', to: 'done' },
		{ id: 'FN-023', to: 'verifying' },
		{ id: 'GW-007', to: 'blocked' },
		{ id: 'MTV-080', to: 'verifying' },
		{ id: 'DOM-005', to: 'blocked' },
		{ id: 'LDG-043', to: 'done' },
		{ id: 'SCR-060', to: 'verifying' },
		{ id: 'MTV-082', to: 'verifying' }
	];

	let feedCursor = 0;

	$effect(() => {
		const timer = setInterval(() => {
			const event = SCRIPTED_TRANSITIONS[feedCursor % SCRIPTED_TRANSITIONS.length];
			feedCursor += 1;
			const current = TASKS.find((task) => task.id === event.id);
			const currentStatus = feedStatuses[event.id] ?? current?.status;
			if (!currentStatus || currentStatus === event.to) return;

			feedStatuses = { ...feedStatuses, [event.id]: event.to };
			feedLog = [
				{
					id: event.id,
					from: currentStatus,
					to: event.to,
					at: new Date().toTimeString().slice(0, 8)
				},
				...feedLog
			].slice(0, 4);

			recentlyMoved = [...recentlyMoved, event.id];
			setTimeout(() => {
				recentlyMoved = recentlyMoved.filter((id) => id !== event.id);
			}, 2000);
		}, 5200);

		return () => clearInterval(timer);
	});
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}

	<!--
		Every status colour is declared once, on .ledger, so the table, the feed
		and the legend cannot drift apart. wontfix and duplicate are closed
		without being finished, so they take the muted tone pending has and rely
		on their own glyph to stay distinguishable.
	-->
	<main class="ledger">
		<PageSection maxWidth="1680px" class="band band-masthead">
			<Container maxWidth="full" padding={false}>
				<p class="kicker">ledger · context corpus · live</p>
				<PageHeader
					title="Every task, on one page"
					subtitle="Sort it, search it, and read the release around whatever you find. Nothing is behind a filter."
					align="left"
					spacing="none"
				/>

				<dl class="figures">
					<div class="figure-cell">
						<dt>Open</dt>
						<dd>{counts.open}</dd>
						<p>pending, triaged, building or verifying</p>
					</div>
					<div class="figure-cell">
						<dt>In flight</dt>
						<dd>{counts.inFlight}</dd>
						<p>an agent is on it right now</p>
					</div>
					<div class="figure-cell">
						<dt>Blocked</dt>
						<dd>{counts.blocked}</dd>
						<p>waiting on a task in another release</p>
					</div>
					<div class="figure-cell">
						<dt>Shipped, 14 days</dt>
						<dd>{counts.shipped}</dd>
						<p>completed since 2026-07-20</p>
					</div>
					<div class="figure-cell">
						<dt>Corpus</dt>
						<dd>{tasks.length}</dd>
						<p>{RELEASES.length} releases across {PROJECTS.length} projects</p>
					</div>
				</dl>
			</Container>
		</PageSection>

		<PageSection maxWidth="1680px" class="band band-search">
			<Container maxWidth="full" padding={false}>
				<div class="search">
					<Label for="ledger-search" class="search-label">Search the corpus</Label>
					<div class="search-field">
						<span class="search-prompt" aria-hidden="true">/</span>
						<Input
							id="ledger-search"
							class="search-input"
							type="search"
							bind:value={query}
							placeholder="a half-remembered title, an id, a release, a project"
							autocomplete="off"
						/>
					</div>
					<p class="search-status" aria-live="polite">
						<span class="figure">{sorted.length}</span> of
						<span class="figure">{tasks.length}</span> tasks
						{#if query.trim()}matching “{query.trim()}”{/if} · sorted by
						<span class="search-sort">{sortColumn}</span>
						{sortDirection === 'asc' ? 'ascending' : 'descending'}
						{#if grouped}· banded by release{/if}
					</p>
				</div>

				<div class="feed">
					<p class="feed-head">Feed</p>
					<ul class="feed-list">
						{#each feedLog as entry (entry.id + entry.at)}
							<li>
								<span class="feed-time figure">{entry.at}</span>
								<span class="task-id">{entry.id}</span>
								<StatusMark status={entry.from} />
								<span class="feed-arrow" aria-hidden="true">→</span>
								<StatusMark status={entry.to} />
							</li>
						{/each}
						{#if feedLog.length === 0}
							<li class="feed-idle">Connected. No transitions yet this session.</li>
						{/if}
					</ul>
				</div>
			</Container>
		</PageSection>

		<PageSection maxWidth="100%" class="band band-table">
			<TaskTable
				rows={sorted}
				releases={RELEASE_BY_SLUG}
				{sortColumn}
				{sortDirection}
				onSortChange={handleSortChange}
				{grouped}
				{expandedId}
				onToggleExpand={handleToggleExpand}
				{query}
				{recentlyMoved}
				allTasks={tasks}
			/>
			{#if sorted.length === 0}
				<p class="no-rows">
					No task matches “{query.trim()}”. The search reads id, title, project, release, type and
					status.
				</p>
			{/if}
		</PageSection>

		<PageSection maxWidth="1680px" class="band band-legend">
			<Container maxWidth="full" padding={false}>
				<div class="legend">
					<div class="legend-block">
						<h2>Status</h2>
						<ul class="legend-list">
							{#each STATUS_ORDER as status (status)}
								<li>
									<StatusMark {status} />
									<span class="legend-count figure">{statusTally[status] ?? 0}</span>
								</li>
							{/each}
						</ul>
						<p class="legend-note">
							Every status carries a glyph and a word as well as its colour, so the column survives
							being read without colour at all.
						</p>
					</div>

					<div class="legend-block">
						<h2>Columns</h2>
						<dl class="legend-keys">
							<div>
								<dt>Ph</dt>
								<dd>phase within the release</dd>
							</div>
							<div>
								<dt>Stp</dt>
								<dd>steps recorded on the task</dd>
							</div>
							<div>
								<dt>Crt</dt>
								<dd>acceptance criteria</dd>
							</div>
							<div>
								<dt>Fls</dt>
								<dd>file changes declared</dd>
							</div>
							<div>
								<dt>Att</dt>
								<dd>latest verification attempt</dd>
							</div>
						</dl>
						<p class="legend-note">
							High and destructive risk is underlined rather than coloured — colour on this page
							means state and nothing else.
						</p>
					</div>
				</div>
			</Container>
		</PageSection>
	</main>
</PageFrame>

<style>
	.ledger {
		/* The one place status colour is defined. */
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);

		font-variant-numeric: tabular-nums;
	}

	/* PageSection is built for editorial breathing room; a terminal wants the
	   space back, so the vertical rhythm is tightened region by region. */
	.ledger :global(.band) {
		padding-block: var(--space-6);
	}

	.ledger :global(.band-masthead) {
		padding-block-start: var(--space-7);
		padding-block-end: var(--space-5);
	}

	.ledger :global(.band-search) {
		padding-block: var(--space-5);
	}

	.ledger :global(.band-table) {
		padding-block: 0;
		padding-inline: 0;
	}

	.ledger :global(.band-legend) {
		padding-block: var(--space-6) var(--space-7);
	}

	/* The search field is the front door, so it is sized like one. */
	.ledger :global(.search-input) {
		height: calc(var(--input-height) * 1.25);
		font-family: var(--font-mono);
		font-size: var(--text-lead);
		border-width: 2px;
	}

	/* The UA cancel button paints its own blue, which is the one colour on this
	   page that answers to nothing. type="search" is kept for the semantics. */
	.ledger :global(.search-input::-webkit-search-cancel-button) {
		appearance: none;
	}

	.kicker {
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* ---- headline figures ---- */

	.figures {
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		margin: var(--space-5) 0 0;
		padding: 0;
		border-top: 2px solid var(--border-glass-hover);
		border-bottom: 2px solid var(--border-glass-hover);
	}

	.figure-cell {
		flex: 1 1 12rem;
		padding: var(--space-3) var(--space-4);
		border-left: 1px solid var(--border-glass);
	}

	.figure-cell:first-child {
		padding-left: 0;
		border-left: none;
	}

	.figure-cell dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.figure-cell dd {
		margin: var(--space-1) 0 0;
		font-family: var(--font-display);
		/* No token spans the display sizes, so the scale is derived from one
		   rather than guessed at as a literal. */
		font-size: calc(var(--text-lead) * 2.2);
		line-height: 1;
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.figure-cell p {
		margin: var(--space-2) 0 0;
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	/* ---- search ---- */

	.ledger :global(.search-label) {
		display: block;
		margin-bottom: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.search-field {
		display: flex;
		align-items: stretch;
		gap: var(--space-3);
	}

	.search-prompt {
		display: flex;
		align-items: center;
		font-family: var(--font-mono);
		font-size: calc(var(--text-lead) * 1.4);
		line-height: 1;
		color: var(--accent);
	}

	.search-status {
		margin: var(--space-3) 0 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.search-status .figure {
		font-weight: 700;
		color: var(--text-primary);
	}

	.search-sort {
		color: var(--text-secondary);
	}

	/* ---- feed ---- */

	.feed {
		margin-top: var(--space-5);
		padding-top: var(--space-3);
		border-top: 1px solid var(--border-glass);
	}

	.feed-head {
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.feed-list {
		margin: 0;
		padding: 0;
		list-style: none;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
	}

	.feed-list li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-block: var(--space-1);
	}

	.feed-time,
	.feed-arrow,
	.feed-idle {
		color: var(--text-muted);
	}

	.task-id {
		font-family: var(--font-mono);
		font-weight: 600;
		color: var(--text-secondary);
	}

	.no-rows {
		margin: 0;
		padding: var(--space-6) var(--page-padding-x);
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}

	/* ---- legend ---- */

	.legend {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
		gap: var(--space-6);
		padding-top: var(--space-5);
		border-top: 2px solid var(--border-glass-hover);
	}

	.legend-block h2 {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.legend-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
		gap: var(--space-1) var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.legend-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding-block: var(--space-1);
		border-bottom: 1px solid var(--border-glass);
	}

	.legend-count {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.legend-keys {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
	}

	.legend-keys div {
		display: flex;
		gap: var(--space-3);
		padding-block: var(--space-1);
		border-bottom: 1px solid var(--border-glass);
	}

	.legend-keys dt {
		min-width: var(--space-7);
		font-weight: 700;
		color: var(--text-secondary);
	}

	.legend-keys dd {
		margin: 0;
		color: var(--text-muted);
	}

	.legend-note {
		margin: var(--space-3) 0 0;
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
