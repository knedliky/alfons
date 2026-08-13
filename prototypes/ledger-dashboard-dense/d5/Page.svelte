<script lang="ts">
	/**
	 * Ledger — the corpus dashboard, dense — approach 5 of 5: Graphical density
	 *
	 * Direction: add data ink to textual density. Every release band gets a thin
	 * stacked phase meter; every task row gets a verification-attempt trail. The
	 * question is whether graphical density answers the orientation problem the
	 * winning approach named against itself — that with nothing hidden, there is
	 * no state of the page which says what to look at without reading — or
	 * whether 87 marks in a table is simply noise.
	 *
	 * The bet is Tufte's: at small scale, data ink gives a page a shape the eye
	 * reads before the type does. So the marks are placed where reading is
	 * slowest and the answer is most wanted — a release's shape, and whether a
	 * task fought its way to a pass — and nowhere else. There is no mark on this
	 * page that is not answering a question a column would otherwise make you
	 * read six cells to answer.
	 *
	 * Colour came last and mostly did not come at all. The phase meter carries
	 * status colour because a status meter is state, which is the one thing
	 * status colour is reserved for. The trail carries none: an attempt's
	 * outcome is ordinal, so length encodes it, and every warm hue on this page
	 * is already spoken for.
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
	import PhaseMeter from './PhaseMeter.svelte';
	import StatusMark from './StatusMark.svelte';
	import TaskTable, { type SortColumn } from './TaskTable.svelte';
	import VerificationTrail from './VerificationTrail.svelte';
	import {
		IN_FLIGHT_STATUSES,
		OPEN_STATUSES,
		PROJECTS,
		RELEASE_BY_SLUG,
		RELEASES,
		STATUS_ORDER,
		TASKS,
		type AttemptOutcome,
		type Task,
		type TaskStatus
	} from './corpus.ts';

	const RISK_ORDER = ['destructive', 'high', 'medium', 'low'];
	const VERDICT_ORDER = ['fail', 'partial', 'pass', ''];

	const EMPTY_TALLY: Record<TaskStatus, number> = {
		pending: 0,
		triaged: 0,
		building: 0,
		verifying: 0,
		done: 0,
		blocked: 0,
		wontfix: 0,
		duplicate: 0
	};

	/** The three shapes the trail draws, spelled out once for the key. */
	const TRAIL_KEY: { attempts: AttemptOutcome[]; word: string; gloss: string }[] = [
		{ attempts: ['fail'], word: 'fail', gloss: 'sealed and rejected' },
		{ attempts: ['partial'], word: 'partial', gloss: 'some criteria met' },
		{ attempts: ['pass'], word: 'pass', gloss: 'sealed and accepted' },
		{ attempts: ['open'], word: 'open', gloss: 'started, not sealed' },
		{ attempts: ['fail', 'fail', 'pass'], word: 'the shape to look for', gloss: 'fought to a pass' }
	];

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
			// Sorting by the trail means sorting by how much argument the task
			// took, which is the only ordering the mark itself suggests.
			case 'trail':
				return -task.attempts.length;
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
		const contested = tasks.filter((task) => task.attempts.length > 1).length;
		return { open, inFlight, blocked, contested };
	});

	const statusTally = $derived.by(() => {
		const tally: Record<TaskStatus, number> = { ...EMPTY_TALLY };
		for (const task of tasks) tally[task.status] += 1;
		return tally;
	});

	/**
	 * The orientation panel: every release as one meter, ranked by how much it
	 * wants attention rather than alphabetically or by size. This is the whole
	 * experiment. Round one's winner could only answer "what should I look at"
	 * by being read; a ranked wall of sixteen small multiples is an attempt to
	 * answer it by being looked at.
	 */
	const releaseShapes = $derived.by(() => {
		const tallies: Record<string, Record<TaskStatus, number>> = {};
		for (const task of tasks) {
			tallies[task.release] ??= { ...EMPTY_TALLY };
			tallies[task.release][task.status] += 1;
		}
		return RELEASES.map((release) => {
			const tally = tallies[release.slug] ?? { ...EMPTY_TALLY };
			const inFlight = IN_FLIGHT_STATUSES.reduce((sum, status) => sum + tally[status], 0);
			const open = OPEN_STATUSES.reduce((sum, status) => sum + tally[status], 0);
			return { release, tally, blocked: tally.blocked, inFlight, open };
		}).sort((a, b) => b.blocked - a.blocked || b.inFlight - a.inFlight || b.open - a.open);
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
		Every status colour is declared once, on .ledger, so the table, the meters,
		the feed and the legend cannot drift apart. wontfix and duplicate are
		closed without being finished, so they take the muted tone pending has and
		rely on their own glyph — and, in a meter, on a hatch — to stay
		distinguishable.

		Two geometry properties are declared alongside them because the library has
		no token for either: the 2px gap the chart contract mandates between
		adjacent fills, and the 4px radius it mandates on a data end. Declared once
		here rather than written as literals in four files.
	-->
	<main class="ledger">
		<PageSection maxWidth="1680px" class="band band-masthead">
			<Container maxWidth="full" padding={false}>
				<p class="kicker">ledger · context corpus · live</p>
				<PageHeader
					title="Every task, and the shape of every release"
					subtitle="One table, nothing hidden — and a meter on each release so the page can be looked at before it is read."
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
						<dt>Contested</dt>
						<dd>{counts.contested}</dd>
						<p>verified more than once before it settled</p>
					</div>
					<div class="figure-cell">
						<dt>Corpus</dt>
						<dd>{tasks.length}</dd>
						<p>{RELEASES.length} releases across {PROJECTS.length} projects</p>
					</div>
				</dl>
			</Container>
		</PageSection>

		<PageSection maxWidth="1680px" class="band band-shapes">
			<Container maxWidth="full" padding={false}>
				<div class="shapes-head">
					<h2>Release shape</h2>
					<p class="shapes-note">
						Every release as one stacked meter, ranked by blocked tasks, then by work in flight.
						Same scale, same origin, so the top of this wall is where the trouble is.
					</p>
					<ul class="key" aria-label="Status key for the meters">
						{#each STATUS_ORDER as status (status)}
							<li>
								<StatusMark {status} />
								<span class="key-count figure">{statusTally[status]}</span>
							</li>
						{/each}
					</ul>
				</div>

				<ul class="shapes">
					{#each releaseShapes as shape (shape.release.slug)}
						<li>
							<span class="shape-slug">{shape.release.slug}</span>
							<PhaseMeter counts={shape.tally} label={shape.release.slug} />
							<p class="shape-line">
								<span class="figure">{shape.release.taskCount}</span> tasks ·
								<span class="figure">{shape.blocked}</span> blocked ·
								<span class="figure">{shape.inFlight}</span> in flight
							</p>
						</li>
					{/each}
				</ul>
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
						<h2>The trail</h2>
						<ul class="trail-key">
							{#each TRAIL_KEY as entry (entry.word)}
								<li>
									<VerificationTrail attempts={entry.attempts} />
									<span class="trail-word">{entry.word}</span>
									<span class="trail-gloss">{entry.gloss}</span>
								</li>
							{/each}
						</ul>
						<p class="legend-note">
							Height is the outcome, oldest attempt on the left, and the mark that stands is the
							brightest. It carries no colour because an outcome is ordinal and because every warm
							hue on this page already means a status.
						</p>
					</div>

					<div class="legend-block">
						<h2>The meter</h2>
						<p class="legend-note">
							One segment per status, worst on the left, every meter drawn to the same full width so
							a release of three and a release of twelve are compared by shape rather than by size.
							A status with no tasks in it draws nothing. wontfix and duplicate are hatched, because
							they share the muted tone with pending and mean something else entirely.
						</p>
						<p class="legend-note">
							Both marks are stated in words as well: the meter in its accessible label, the trail
							in the Att and Verdict columns beside it and in full under the expanded row.
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

		/* Chart geometry the library has no token for. Declared once here so the
		   meter and the trail cannot drift apart. */
		--data-gap: 2px;
		--data-end-radius: 4px;
		--meter-width: 10rem;

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

	.ledger :global(.band-shapes) {
		padding-block: var(--space-5);
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

	/* ---- release shapes: the orientation panel ---- */

	.shapes-head {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		align-items: start;
		gap: var(--space-3) var(--space-6);
		padding-bottom: var(--space-4);
		border-bottom: 1px solid var(--border-glass);
	}

	.shapes-head h2 {
		grid-column: 1;
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.shapes-note {
		grid-column: 1;
		max-width: 42rem;
		margin: 0;
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}

	/* The legend the meters need, kept beside them rather than only at the foot
	   of the page: a stacked bar with eight series is unreadable without one. */
	.key {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 11rem), 1fr));
		gap: 0 var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.key li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		padding-block: var(--space-1);
		border-bottom: 1px solid var(--border-glass);
	}

	.key-count {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.shapes {
		display: grid;
		/* Wide enough that the count line under each meter never wraps: a ragged
		   second line would break the wall of small multiples into noise. */
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 18rem), 1fr));
		gap: var(--space-4) var(--space-6);
		margin: var(--space-4) 0 0;
		padding: 0;
		list-style: none;
	}

	.shapes li {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.shape-slug {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.shape-line {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.shape-line .figure {
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
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
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

	.trail-key {
		margin: 0;
		padding: 0;
		list-style: none;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
	}

	.trail-key li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-block: var(--space-1);
		border-bottom: 1px solid var(--border-glass);
	}

	.trail-word {
		min-width: 10rem;
		color: var(--text-secondary);
	}

	.trail-gloss {
		color: var(--text-muted);
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
