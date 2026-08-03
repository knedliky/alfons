<script lang="ts">
	/**
	 * Ledger — the corpus dashboard, dense — approach 2 of 5: Permanently banded
	 *
	 * Direction: the release banner stops being a sorting artefact and becomes
	 * the structure. There is no state of this page in which a task is seen
	 * outside its release: the page is always a sequence of small ruled bands,
	 * each banner carrying its release's whole story, and sorting reorders the
	 * bands rather than dissolving them.
	 *
	 * The argument is that this answers the brief's real payoff — "what else is
	 * in this release" — structurally instead of by asking the reader to sort
	 * for it, and that a banded page has shape before it has content, which is
	 * the orientation problem round one's winner named against itself.
	 *
	 * The cost is vertical and it is real: sixteen banners at two lines each is
	 * roughly a third again on top of eighty-seven rows. Two things pay part of
	 * it back — the release and project columns are gone, because the banner
	 * states both once, and folding every band turns the page into a
	 * sixteen-line table of contents that no flat table can produce.
	 */
	import {
		Button,
		Container,
		Footer,
		Header,
		Input,
		Label,
		PageFrame,
		PageHeader,
		PageSection
	} from '@alfons/design';
	import BandedTable, { type Band, type SortColumn } from './BandedTable.svelte';
	import CompletionMeter from './CompletionMeter.svelte';
	import StatusMark from './StatusMark.svelte';
	import {
		OPEN_STATUSES,
		IN_FLIGHT_STATUSES,
		PROJECTS,
		RELEASES,
		TASKS,
		type Task,
		type TaskStatus
	} from './corpus.ts';

	/** Progress order, left to right: this is the order the meter stacks in. */
	const METER_ORDER: TaskStatus[] = [
		'done',
		'verifying',
		'building',
		'triaged',
		'pending',
		'blocked',
		'wontfix',
		'duplicate'
	];

	/** Attention order, worst first: this is the order the status column sorts in. */
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
	let sortColumn = $state<SortColumn>('phase');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let expandedId = $state<string | null>(null);
	let collapsedSlugs = $state<string[]>([]);

	/**
	 * The feed corrects statuses underneath the view, so the rendered status is
	 * the corpus status overlaid with whatever the feed has since said. Keeping
	 * the override separate means the seed data is never mutated.
	 */
	let feedStatuses = $state<Record<string, TaskStatus>>({});
	let feedLog = $state<{ id: string; from: TaskStatus; to: TaskStatus; at: string }[]>([]);
	let recentlyMoved = $state<string[]>([]);

	const tasks = $derived(
		TASKS.map((task) => (feedStatuses[task.id] ? { ...task, status: feedStatuses[task.id] } : task))
	);

	const searching = $derived(query.trim().length > 0);

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

	function compareTasks(a: Task, b: Task, direction: number): number {
		const left = sortKey(a, sortColumn);
		const right = sortKey(b, sortColumn);
		if (left < right) return -1 * direction;
		if (left > right) return 1 * direction;
		// Phase then id, so a band always reads as a running order.
		if (a.phase !== b.phase) return a.phase - b.phase;
		return a.id.localeCompare(b.id);
	}

	/**
	 * Bands are ordered by their own leading row under the current sort, so the
	 * flat order the reader asked for still runs down the page — the bands are
	 * the units it runs over. A band with no surviving row has no leading row,
	 * so it sinks to the bottom and folds shut, which is how a search narrows
	 * without flattening.
	 */
	const bands = $derived.by(() => {
		const direction = sortDirection === 'asc' ? 1 : -1;

		// Plain records rather than Maps: these are grouping intermediates rebuilt
		// on every derivation, and the reactivity lint rightly reserves Map for state.
		const matchedByRelease: Record<string, Task[]> = {};
		for (const task of matched) (matchedByRelease[task.release] ??= []).push(task);

		const allByRelease: Record<string, Task[]> = {};
		for (const task of tasks) (allByRelease[task.release] ??= []).push(task);

		const built: Band[] = RELEASES.map((release) => {
			const allRows = allByRelease[release.slug] ?? [];
			const rows = [...(matchedByRelease[release.slug] ?? [])].sort((a, b) =>
				compareTasks(a, b, direction)
			);

			const tally: Record<string, number> = {};
			for (const task of allRows) tally[task.status] = (tally[task.status] ?? 0) + 1;

			const phases = allRows.map((task) => task.phase);
			const open = allRows.filter((task) => OPEN_STATUSES.includes(task.status));

			return {
				release,
				rows,
				allRows,
				segments: METER_ORDER.map((status) => ({ status, count: tally[status] ?? 0 })),
				activePhase: open.length === 0 ? null : Math.min(...open.map((task) => task.phase)),
				phaseRange: [
					phases.length === 0 ? 1 : Math.min(...phases),
					phases.length === 0 ? 1 : Math.max(...phases)
				] as [number, number]
			};
		});

		return built.sort((a, b) => {
			if (a.rows.length === 0 && b.rows.length === 0)
				return a.release.slug.localeCompare(b.release.slug);
			if (a.rows.length === 0) return 1;
			if (b.rows.length === 0) return -1;
			const led = compareTasks(a.rows[0], b.rows[0], direction);
			return led === 0 ? a.release.slug.localeCompare(b.release.slug) : led;
		});
	});

	const shownCount = $derived(bands.reduce((sum, band) => sum + band.rows.length, 0));
	const bandsWithMatches = $derived(bands.filter((band) => band.rows.length > 0).length);

	const counts = $derived.by(() => {
		const open = tasks.filter((task) => OPEN_STATUSES.includes(task.status)).length;
		const inFlight = tasks.filter((task) => IN_FLIGHT_STATUSES.includes(task.status)).length;
		const blocked = tasks.filter((task) => task.status === 'blocked').length;
		return { open, inFlight, blocked };
	});

	/** The whole corpus as one meter, on the same component every band uses. */
	const corpusSegments = $derived.by(() => {
		const tally: Record<string, number> = {};
		for (const task of tasks) tally[task.status] = (tally[task.status] ?? 0) + 1;
		return METER_ORDER.map((status) => ({ status, count: tally[status] ?? 0 }));
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

	function handleToggleBand(slug: string) {
		collapsedSlugs = collapsedSlugs.includes(slug)
			? collapsedSlugs.filter((other) => other !== slug)
			: [...collapsedSlugs, slug];
	}

	function foldAll() {
		collapsedSlugs = RELEASES.map((release) => release.slug);
	}

	function openAll() {
		collapsedSlugs = [];
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
			].slice(0, 3);

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
		Every status colour is declared once, on .ledger, so the table, the meters,
		the feed and the legend cannot drift apart. wontfix and duplicate are
		closed without being finished, so they take the muted tone pending has and
		rely on their own glyph to stay distinguishable.
	-->
	<main class="ledger">
		<PageSection maxWidth="1680px" class="band-region band-masthead">
			<Container maxWidth="full" padding={false}>
				<p class="kicker">ledger · context corpus · live</p>
				<PageHeader
					title="Sixteen releases, in order"
					subtitle="Every task sits inside its release, always. Sorting reorders the bands; it never dissolves them, so a task is never seen apart from the work around it."
					align="left"
					spacing="none"
				/>

				<div class="masthead-foot">
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
							<p>waiting on a task in another band</p>
						</div>
						<div class="figure-cell">
							<dt>Corpus</dt>
							<dd>{tasks.length}</dd>
							<p>{RELEASES.length} releases across {PROJECTS.length} projects</p>
						</div>
					</dl>

					<div class="corpus-meter">
						<p class="corpus-meter-head">The whole corpus</p>
						<CompletionMeter
							segments={corpusSegments}
							total={tasks.length}
							label="the whole corpus"
						/>
					</div>
				</div>
			</Container>
		</PageSection>

		<PageSection maxWidth="1680px" class="band-region band-search">
			<Container maxWidth="full" padding={false}>
				<div class="controls">
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
							<span class="figure">{shownCount}</span> of
							<span class="figure">{tasks.length}</span> tasks in
							<span class="figure">{bandsWithMatches}</span> of
							<span class="figure">{bands.length}</span> bands
							{#if searching}
								· {bands.length - bandsWithMatches} bands folded shut, still in place below
							{:else}
								· sorted by <span class="search-sort">{sortColumn}</span>
								{sortDirection === 'asc' ? 'ascending' : 'descending'}
							{/if}
						</p>
					</div>

					<div class="folds">
						<p class="folds-head">Bands</p>
						<div class="folds-buttons">
							<Button variant="outline" size="sm" onclick={foldAll} disabled={searching}>
								Fold all
							</Button>
							<Button variant="outline" size="sm" onclick={openAll} disabled={searching}>
								Open all
							</Button>
						</div>
						<p class="folds-note">
							{#if searching}
								The search decides the folds while it is running.
							{:else}
								Folded, the page is a sixteen-line contents.
							{/if}
						</p>
					</div>

					<div class="feed">
						<p class="feed-head">Feed</p>
						<ul class="feed-list">
							{#each feedLog as entry (entry.id + entry.at)}
								<li>
									<span class="feed-time figure">{entry.at}</span>
									<span class="task-id">{entry.id}</span>
									<StatusMark status={entry.from} glyphOnly />
									<span class="feed-arrow" aria-hidden="true">→</span>
									<StatusMark status={entry.to} />
								</li>
							{/each}
							{#if feedLog.length === 0}
								<li class="feed-idle">Connected. No transitions yet this session.</li>
							{/if}
						</ul>
					</div>
				</div>
			</Container>
		</PageSection>

		<PageSection maxWidth="100%" class="band-region band-table">
			<BandedTable
				{bands}
				{sortColumn}
				{sortDirection}
				onSortChange={handleSortChange}
				{collapsedSlugs}
				onToggleBand={handleToggleBand}
				{searching}
				{expandedId}
				onToggleExpand={handleToggleExpand}
				{query}
				{recentlyMoved}
				allTasks={tasks}
			/>
			{#if searching && shownCount === 0}
				<p class="no-rows">
					No task matches “{query.trim()}”. Every band is still below, folded shut. The search reads
					id, title, project, release, type and status.
				</p>
			{/if}
		</PageSection>

		<PageSection maxWidth="1680px" class="band-region band-legend">
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
							being read without colour at all. The band meters stack the same eight in progress
							order, done first.
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
							Release and project are not columns: the banner above the rows says both once. High
							and destructive risk is underlined rather than coloured — colour on this page means
							state and nothing else.
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

	/* PageSection is built for editorial breathing room; a banded page spends
	   its vertical budget on the banners instead, so every region is tightened. */
	.ledger :global(.band-region) {
		padding-block: var(--space-5);
	}

	.ledger :global(.band-masthead) {
		padding-block-start: var(--space-7);
		padding-block-end: var(--space-4);
	}

	.ledger :global(.band-table) {
		padding-block: 0;
		padding-inline: 0;
	}

	.ledger :global(.band-legend) {
		padding-block: var(--space-6) var(--space-7);
	}

	/* PageHeader holds its subtitle to the section-header measure, which is the
	   blog measure the brief asks this page to relax. */
	.ledger :global(.band-masthead p) {
		max-width: 60rem;
	}

	.ledger :global(.search-input) {
		height: calc(var(--input-height) * 1.15);
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

	.masthead-foot {
		display: flex;
		flex-wrap: wrap;
		align-items: stretch;
		gap: var(--space-5);
		margin-top: var(--space-5);
		border-top: 2px solid var(--border-glass-hover);
		border-bottom: 2px solid var(--border-glass-hover);
	}

	.figures {
		display: flex;
		flex-wrap: wrap;
		flex: 1 1 40rem;
		gap: 0;
		margin: 0;
		padding: 0;
	}

	.figure-cell {
		flex: 1 1 11rem;
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

	/* The corpus reads on the same instrument every band reads on, so the
	   masthead figure and the band figures are comparable by construction. */
	.corpus-meter {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-2);
		flex: 1 1 16rem;
		padding: var(--space-3) 0 var(--space-3) var(--space-4);
		border-left: 1px solid var(--border-glass);
	}

	.corpus-meter-head {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* ---- controls ---- */

	.controls {
		display: grid;
		grid-template-columns: minmax(min(100%, 26rem), 2fr) minmax(min(100%, 12rem), 1fr) minmax(
				min(100%, 16rem),
				1fr
			);
		gap: var(--space-5);
		align-items: start;
	}

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

	/* ---- fold controls ---- */

	.folds-head,
	.feed-head {
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.folds-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.folds-note {
		margin: var(--space-3) 0 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	/* ---- feed ---- */

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
		gap: var(--space-2);
		padding-block: var(--space-1);
		border-bottom: 1px solid var(--border-glass);
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

	@media (max-width: 1100px) {
		.controls {
			grid-template-columns: 1fr;
		}
	}
</style>
