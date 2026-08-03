<script lang="ts">
	/**
	 * Ledger — the corpus dashboard, dense — approach 1 of 5: Contrast ladder
	 *
	 * This approach is the round's control. It starts from round one's winner
	 * (prototypes/ledger-dashboard/a4) and holds every variable constant against
	 * it — same fifteen columns, same rows, same two rule weights, same layout,
	 * same regions in the same order, same release banner, same inline detail
	 * strip. The single thing that changes is the contrast ladder, taken much
	 * further than a4 took it.
	 *
	 * a4 ran two rungs: the title in the body face at primary ink, everything
	 * else mono microtype at muted ink. It reported that the second rung is what
	 * rescued the page from reading inert. The question here is where that
	 * stops: how much hierarchy can a dense table absorb before it stops reading
	 * as dense?
	 *
	 * The ladder is declared once, below, as four rungs across four dimensions —
	 * family, size, weight, ink. Nothing in the table sets a font property
	 * directly; every cell claims a rung. That is what makes the ladder a
	 * variable rather than a mood, and what made its ceiling findable: rungs one
	 * to three are separated by size, and rung four deliberately is not. The
	 * first build gave rung four its own smaller size (0.6875rem) and that is
	 * where it broke — see the note on --ledger-rung-4-size.
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
		Two encodings are declared once here and inherited everywhere: the status
		colour map, and the contrast ladder. Both exist as page-root custom
		properties for the same reason — a second declaration is a second chance
		to drift, and in a table of fifteen columns the drift is invisible until
		it is everywhere.
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
							Four rungs read down every row: the title you are recognising, the id and release you
							would say aloud, the words that classify it, and the tallies you only read once you
							have found it. Three of those rungs differ in size; the fourth differs in ink alone,
							because a fourth size step stopped separating and started blurring.
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

		/*
			The contrast ladder. Four rungs, four dimensions each, declared once so
			the whole page moves together when a rung moves.

			Rung 1 — recognition. The title. The one thing Simon is scanning for,
			so it is the only cell in the body face and the only cell at primary ink.
			Rung 2 — locator. Id, release, status word: the strings he would read
			aloud to name the work. Mono, but a size and a weight above the field.
			Rung 3 — classifier. Project, type, risk, verdict. Words that narrow a
			set rather than name a member.
			Rung 4 — substrate. Counts and dates, which are only read after the row
			has been found. Reduced to the point of being ground rather than figure.
		*/
		--ledger-rung-1-family: var(--font-body);
		--ledger-rung-1-size: var(--text-ui);
		--ledger-rung-1-weight: 500;
		--ledger-rung-1-ink: var(--text-primary);
		--ledger-rung-1-tracking: 0;

		--ledger-rung-2-family: var(--font-mono);
		--ledger-rung-2-size: var(--text-caption);
		--ledger-rung-2-weight: 600;
		--ledger-rung-2-ink: var(--text-secondary);
		--ledger-rung-2-tracking: 0.02em;

		--ledger-rung-3-family: var(--font-mono);
		--ledger-rung-3-size: var(--text-micro);
		--ledger-rung-3-weight: 450;
		--ledger-rung-3-ink: var(--text-secondary);
		--ledger-rung-3-tracking: 0.01em;

		/*
			Rung 4 keeps rung 3's size on purpose, and this is the finding of the
			approach. The first build gave it 0.6875rem — a genuine fourth size
			step, one notch under --text-micro. Two things broke at once. Rung 3
			and rung 4 sit side by side in the same row, and at 12px against 11px
			in the same mono face the difference no longer reads as a step: it
			reads as a rendering fault, the way a mismatched font size in a diff
			does. And four cap heights in one 22px row cannot share a baseline
			without one of them appearing to sag, so the row lost the flat top
			edge that is most of what makes a dense table scannable at all.
			The fourth rung therefore separates by ink and weight alone, which
			costs nothing and still reads.
		*/
		--ledger-rung-4-family: var(--font-mono);
		--ledger-rung-4-size: var(--text-micro);
		--ledger-rung-4-weight: 400;
		--ledger-rung-4-ink: var(--text-muted);
		--ledger-rung-4-tracking: 0;

		/*
			Above the ladder sit two display steps the scale does not reach: the
			token scale stops at --text-lead (1.25rem) and every step above it in
			the system is a hard-coded rem in base.css. Derived from --text-lead
			rather than written as literals so they move if the scale does.
		*/
		--ledger-display-figure: calc(var(--text-lead) * 2.4);
		--ledger-display-prompt: calc(var(--text-lead) * 1.4);

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

	/* The search field is the front door, so it is sized like one — a rung above
	   anything in the table, which is what makes the table read as its result. */
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
		font-family: var(--ledger-rung-4-family);
		font-size: var(--ledger-rung-4-size);
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--ledger-rung-4-ink);
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
		font-family: var(--ledger-rung-3-family);
		font-size: var(--ledger-rung-3-size);
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ledger-rung-4-ink);
	}

	.figure-cell dd {
		margin: var(--space-1) 0 0;
		font-family: var(--font-display);
		font-size: var(--ledger-display-figure);
		line-height: 1;
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.figure-cell p {
		margin: var(--space-2) 0 0;
		font-size: var(--ledger-rung-4-size);
		color: var(--text-secondary);
	}

	/* ---- search ---- */

	.ledger :global(.search-label) {
		display: block;
		margin-bottom: var(--space-2);
		font-family: var(--ledger-rung-3-family);
		font-size: var(--ledger-rung-3-size);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ledger-rung-3-ink);
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
		font-size: var(--ledger-display-prompt);
		line-height: 1;
		color: var(--accent);
	}

	.search-status {
		margin: var(--space-3) 0 0;
		font-family: var(--ledger-rung-4-family);
		font-size: var(--ledger-rung-4-size);
		color: var(--ledger-rung-4-ink);
	}

	.search-status .figure {
		font-weight: var(--ledger-rung-2-weight);
		color: var(--text-primary);
	}

	.search-sort {
		color: var(--ledger-rung-3-ink);
	}

	/* ---- feed ---- */

	.feed {
		margin-top: var(--space-5);
		padding-top: var(--space-3);
		border-top: 1px solid var(--border-glass);
	}

	.feed-head {
		margin: 0 0 var(--space-2);
		font-family: var(--ledger-rung-3-family);
		font-size: var(--ledger-rung-3-size);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ledger-rung-4-ink);
	}

	.feed-list {
		margin: 0;
		padding: 0;
		list-style: none;
		font-family: var(--ledger-rung-4-family);
		font-size: var(--ledger-rung-4-size);
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
		color: var(--ledger-rung-4-ink);
	}

	/* An id is a rung-2 string wherever it appears, feed included. */
	.task-id {
		font-family: var(--ledger-rung-2-family);
		font-size: var(--ledger-rung-2-size);
		font-weight: var(--ledger-rung-2-weight);
		letter-spacing: var(--ledger-rung-2-tracking);
		color: var(--ledger-rung-2-ink);
	}

	.no-rows {
		margin: 0;
		padding: var(--space-6) var(--page-padding-x);
		font-family: var(--ledger-rung-2-family);
		font-size: var(--ledger-rung-2-size);
		color: var(--ledger-rung-4-ink);
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
		font-family: var(--ledger-rung-3-family);
		font-size: var(--ledger-rung-3-size);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ledger-rung-4-ink);
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
		font-family: var(--ledger-rung-4-family);
		font-size: var(--ledger-rung-4-size);
		color: var(--ledger-rung-3-ink);
	}

	.legend-keys {
		margin: 0;
		font-family: var(--ledger-rung-4-family);
		font-size: var(--ledger-rung-4-size);
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
		color: var(--ledger-rung-3-ink);
	}

	.legend-keys dd {
		margin: 0;
		color: var(--ledger-rung-4-ink);
	}

	.legend-note {
		margin: var(--space-3) 0 0;
		font-size: var(--ledger-rung-3-size);
		color: var(--ledger-rung-4-ink);
	}
</style>
