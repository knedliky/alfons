<script lang="ts" module>
	import type { Release, Task } from './corpus';

	export type SortColumn =
		| 'status'
		| 'id'
		| 'title'
		| 'project'
		| 'release'
		| 'phase'
		| 'type'
		| 'risk'
		| 'steps'
		| 'criteria'
		| 'files'
		| 'attempt'
		| 'verdict'
		| 'created'
		| 'sealed';

	export type SortDirection = 'asc' | 'desc';

	export interface ColumnSpec {
		id: SortColumn;
		header: string;
		/** Full header text for the accessible name, where the visible one is abbreviated. */
		fullName?: string;
		numeric?: boolean;
	}

	export const COLUMNS: ColumnSpec[] = [
		{ id: 'status', header: 'Status' },
		{ id: 'id', header: 'Id' },
		{ id: 'title', header: 'Title' },
		{ id: 'project', header: 'Project' },
		{ id: 'release', header: 'Release' },
		{ id: 'phase', header: 'Ph', fullName: 'Phase', numeric: true },
		{ id: 'type', header: 'Type' },
		{ id: 'risk', header: 'Risk' },
		{ id: 'steps', header: 'Stp', fullName: 'Steps', numeric: true },
		{ id: 'criteria', header: 'Crt', fullName: 'Criteria', numeric: true },
		{ id: 'files', header: 'Fls', fullName: 'File changes', numeric: true },
		{ id: 'attempt', header: 'Att', fullName: 'Latest attempt', numeric: true },
		{ id: 'verdict', header: 'Verdict', fullName: 'Latest verdict' },
		{ id: 'created', header: 'Created' },
		{ id: 'sealed', header: 'Sealed', fullName: 'Latest sealed on' }
	];

	/** Column count including the leading cursor gutter, for the spanning rows. */
	const TOTAL_COLUMNS = COLUMNS.length + 1;

	export interface TaskGridProps {
		/** Already filtered and already sorted. This component only draws and points. */
		rows: Task[];
		releases: Map<string, Release>;
		/** Every task in the corpus, for resolving siblings and dependencies. */
		allTasks: Task[];
		sortColumn: SortColumn;
		sortDirection: SortDirection;
		onSortChange: (column: SortColumn) => void;
		/** Draw a release banner whenever the release changes down the column. */
		grouped: boolean;
		expandedId: string | null;
		onToggleExpand: (id: string) => void;
		/** The row the cursor is on. An id, never an index — see the comment below. */
		cursorId: string | null;
		onCursorChange: (id: string) => void;
		/** The column h and l have walked to, or null when no column is focused. */
		focusedColumn: SortColumn | null;
		onColumnFocus: (column: SortColumn) => void;
		/** The live term, highlighted in the title cell. Seek or filter, whichever is running. */
		term: string;
		/** Ids the seek matched, marked in place rather than filtered away. */
		matchIds: Set<string>;
		/** True while seeking, so non-matching rows can recede without disappearing. */
		seeking: boolean;
		/** Ids the feed has just moved, flashed once so a silent correction is visible. */
		recentlyMoved: string[];
		/**
		 * A row the filter would now drop but the cursor is standing on. Kept
		 * rather than yanked — see Page.svelte for why.
		 */
		heldId: string | null;
		gridId: string;
		onGridFocus: (focused: boolean) => void;
	}
</script>

<script lang="ts">
	/**
	 * TaskGrid — the whole corpus as one table with a cursor in it.
	 *
	 * Written locally rather than reached for from the library because the
	 * library DataTable renders every cell as a string, styles itself from the
	 * --admin-* namespace, has no notion of a group banner or an expanded row,
	 * and — the reason this approach exists — has no cursor model at all.
	 *
	 * Accessibility is the ARIA grid pattern rather than a plain table: one
	 * tab stop on the grid, aria-activedescendant pointing at the cursor row,
	 * or at the cursor cell once a column is focused. A roving tabindex over
	 * eighty-seven rows would put eighty-seven stops in the page's tab order,
	 * which is exactly the tool a keyboard user is trying to escape.
	 *
	 * Every key is also a click: the row moves the cursor, the gutter caret
	 * expands, the header sorts, the column header focuses its column.
	 */
	import StatusMark from './StatusMark.svelte';

	let {
		rows,
		releases,
		allTasks,
		sortColumn,
		sortDirection,
		onSortChange,
		grouped,
		expandedId,
		onToggleExpand,
		cursorId,
		onCursorChange,
		focusedColumn,
		onColumnFocus,
		term,
		matchIds,
		seeking,
		recentlyMoved,
		heldId,
		gridId,
		onGridFocus
	}: TaskGridProps = $props();

	// Plain records rather than Maps: these are rebuilt wholesale on every
	// change, so a reactive collection would buy nothing.
	const taskById = $derived(Object.fromEntries(allTasks.map((task) => [task.id, task])));

	let grid = $state<HTMLTableElement | null>(null);

	function rowElementId(id: string): string {
		return `${gridId}-row-${id}`;
	}

	function cellElementId(id: string, column: SortColumn): string {
		return `${gridId}-cell-${id}-${column}`;
	}

	/**
	 * What the screen reader is told is current. The cell while a column is
	 * focused, because that is what h and l are moving; the row otherwise,
	 * because that is what j and k are moving.
	 */
	const activeDescendant = $derived(
		cursorId === null
			? undefined
			: focusedColumn
				? cellElementId(cursorId, focusedColumn)
				: rowElementId(cursorId)
	);

	/**
	 * Keep the cursor in view without stealing the scroll position when it has
	 * not moved. 'nearest' does nothing when the target is already visible,
	 * which is the whole point: a live feed correction that leaves the cursor
	 * where it was must not scroll the page.
	 */
	$effect(() => {
		if (cursorId === null) return;
		const target =
			(focusedColumn ? document.getElementById(cellElementId(cursorId, focusedColumn)) : null) ??
			document.getElementById(rowElementId(cursorId));
		target?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
	});

	/** Which rows open a new release banner, resolved once per render rather than per row. */
	const bannerBefore = $derived.by(() => {
		const banners: Record<string, Release> = {};
		if (!grouped) return banners;
		let previous: string | null = null;
		for (const row of rows) {
			if (row.release === previous) continue;
			previous = row.release;
			const release = releases.get(row.release);
			if (release) banners[row.id] = release;
		}
		return banners;
	});

	/** How many of the visible rows sit in each release, for the banner count. */
	const shownPerRelease = $derived.by(() => {
		const counts: Record<string, number> = {};
		for (const row of rows) counts[row.release] = (counts[row.release] ?? 0) + 1;
		return counts;
	});

	const donePerRelease = $derived.by(() => {
		const counts: Record<string, number> = {};
		for (const task of allTasks) {
			if (task.status !== 'done') continue;
			counts[task.release] = (counts[task.release] ?? 0) + 1;
		}
		return counts;
	});

	function ariaSort(column: SortColumn): 'ascending' | 'descending' | 'none' {
		if (sortColumn !== column) return 'none';
		return sortDirection === 'asc' ? 'ascending' : 'descending';
	}

	/** Split a title around the live term so the matched run can be marked. */
	function splitOnTerm(title: string): { text: string; matched: boolean }[] {
		const needle = term.trim().toLowerCase();
		if (needle.length < 2) return [{ text: title, matched: false }];
		const parts: { text: string; matched: boolean }[] = [];
		const haystack = title.toLowerCase();
		let cursor = 0;
		let hit = haystack.indexOf(needle, cursor);
		while (hit !== -1) {
			if (hit > cursor) parts.push({ text: title.slice(cursor, hit), matched: false });
			parts.push({ text: title.slice(hit, hit + needle.length), matched: true });
			cursor = hit + needle.length;
			hit = haystack.indexOf(needle, cursor);
		}
		if (cursor < title.length) parts.push({ text: title.slice(cursor), matched: false });
		return parts;
	}

	function siblingsOf(task: Task): Task[] {
		return allTasks.filter((other) => other.release === task.release && other.id !== task.id);
	}

	function dependentsOf(task: Task): Task[] {
		return allTasks.filter((other) => other.dependsOn.includes(task.id));
	}

	function completionPercent(slug: string): number {
		const release = releases.get(slug);
		if (!release || release.taskCount === 0) return 0;
		return Math.round(((donePerRelease[slug] ?? 0) / release.taskCount) * 100);
	}

	export function focusGrid() {
		grid?.focus();
	}
</script>

<!--
	tabindex on the wrapper rather than the table: the table is the thing that
	scrolls sideways, and a focus ring on a scroll container is the one place
	the ring is guaranteed to be on screen.
-->
<div class="rail" id={gridId} data-focused-column={focusedColumn ?? 'none'}>
	<!--
		role="grid" on the table rather than on the scroll container: a table
		inside a div[role=grid] is a table nested in a grid, which is not a
		structure the pattern allows. On the table itself every implicit role
		below it is already the right one — tr is row, td is gridcell, th is
		columnheader — so none of them are restated.
	-->
	<table
		bind:this={grid}
		role="grid"
		tabindex="0"
		aria-label="Every task in the corpus. Press question mark for the key model."
		aria-rowcount={rows.length}
		aria-colcount={TOTAL_COLUMNS}
		aria-activedescendant={activeDescendant}
		onfocus={() => onGridFocus(true)}
		onblur={() => onGridFocus(false)}
	>
		<caption class="visually-hidden">
			Every task in the corpus. j and k move the cursor, slash seeks, f filters, Enter opens the
			cursor row, question mark lists every key.
		</caption>
		<thead>
			<tr>
				<th scope="col" class="col-cursor">
					<span class="visually-hidden">Cursor</span>
				</th>
				{#each COLUMNS as column (column.id)}
					<th
						scope="col"
						class="col-{column.id}"
						class:numeric={column.numeric}
						class:sorted={sortColumn === column.id}
						class:focused={focusedColumn === column.id}
						aria-sort={ariaSort(column.id)}
					>
						<!--
							tabindex -1, as the grid pattern requires: the grid is one tab
							stop, and a control inside it is reached by the grid's own
							navigation — h and l to the column, s to sort. Left tabbable,
							the fifteen headers and the eighty-seven carets below would put
							a hundred and two stops in the page's tab order, which is the
							exact thing a keyboard-first page exists to remove. The mouse
							is unaffected; both still click.
						-->
						<button
							type="button"
							class="sort"
							tabindex="-1"
							onclick={() => {
								onColumnFocus(column.id);
								onSortChange(column.id);
							}}
							aria-label="Focus and sort by {column.fullName ?? column.header}"
						>
							<span class="sort-label">{column.header}</span>
							<span class="sort-arrow" aria-hidden="true">
								{#if sortColumn === column.id}{sortDirection === 'asc' ? '▲' : '▼'}{/if}
							</span>
						</button>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each rows as task, rowIndex (task.id)}
				{@const banner = bannerBefore[task.id]}
				{#if banner}
					{@const complete = completionPercent(banner.slug)}
					<tr class="banner">
						<th scope="colgroup" colspan={TOTAL_COLUMNS}>
							<div class="banner-inner">
								<span class="banner-slug">{banner.slug}</span>
								<span class="banner-title">{banner.title}</span>
								<span class="banner-spacer"></span>
								{#if banner.isBucket}
									<span class="banner-flag">bucket</span>
								{/if}
								{#each banner.tags as tag (tag)}
									<span class="banner-tag">{tag}</span>
								{/each}
								<span class="banner-doc">
									{banner.documentedOn ? `documented ${banner.documentedOn}` : 'undocumented'}
								</span>
								<span class="banner-count">
									<span class="figure">{shownPerRelease[banner.slug] ?? 0}</span>/<span
										class="figure">{banner.taskCount}</span
									> shown
								</span>
								<span
									class="meter"
									role="img"
									aria-label="{complete} percent of {banner.slug} is done"
								>
									<span class="meter-fill" style:width="{complete}%"></span>
								</span>
								<span class="banner-percent figure">{complete}%</span>
							</div>
						</th>
					</tr>
				{/if}

				<tr
					class="row"
					id={rowElementId(task.id)}
					aria-rowindex={rowIndex + 1}
					aria-selected={cursorId === task.id}
					aria-expanded={expandedId === task.id}
					class:cursor={cursorId === task.id}
					class:expanded={expandedId === task.id}
					class:moved={recentlyMoved.includes(task.id)}
					class:match={seeking && matchIds.has(task.id)}
					class:dim={seeking && term.trim().length > 0 && !matchIds.has(task.id)}
					class:held={heldId === task.id}
					onclick={() => onCursorChange(task.id)}
				>
					<td class="col-cursor">
						<button
							type="button"
							class="caret"
							tabindex="-1"
							aria-expanded={expandedId === task.id}
							aria-controls="{gridId}-detail-{task.id}"
							aria-label="Show the work around {task.id}"
							onclick={(event) => {
								event.stopPropagation();
								onCursorChange(task.id);
								onToggleExpand(task.id);
							}}
						>
							<span class="caret-glyph" aria-hidden="true"
								>{expandedId === task.id ? '▾' : cursorId === task.id ? '▸' : '·'}</span
							>
						</button>
					</td>
					<td id={cellElementId(task.id, 'status')} class="col-status">
						<StatusMark status={task.status} />
					</td>
					<td id={cellElementId(task.id, 'id')} class="col-id">
						<span class="task-id">{task.id}</span>
					</td>
					<td id={cellElementId(task.id, 'title')} class="col-title">
						<span class="title">
							{#each splitOnTerm(task.title) as part, index (index)}
								{#if part.matched}<mark>{part.text}</mark>{:else}{part.text}{/if}
							{/each}
						</span>
					</td>
					<td id={cellElementId(task.id, 'project')} class="col-project">{task.project}</td>
					<td id={cellElementId(task.id, 'release')} class="col-release">{task.release}</td>
					<td id={cellElementId(task.id, 'phase')} class="col-phase numeric figure">{task.phase}</td
					>
					<td id={cellElementId(task.id, 'type')} class="col-type">{task.type}</td>
					<td id={cellElementId(task.id, 'risk')} class="col-risk">
						<span class="risk" data-risk={task.risk}>{task.risk}</span>
					</td>
					<td id={cellElementId(task.id, 'steps')} class="col-steps numeric figure"
						>{task.stepCount}</td
					>
					<td id={cellElementId(task.id, 'criteria')} class="col-criteria numeric figure"
						>{task.criterionCount}</td
					>
					<td id={cellElementId(task.id, 'files')} class="col-files numeric figure"
						>{task.fileChangeCount}</td
					>
					<td id={cellElementId(task.id, 'attempt')} class="col-attempt numeric figure"
						>{task.latestAttempt || '—'}</td
					>
					<td id={cellElementId(task.id, 'verdict')} class="col-verdict">
						<span class="verdict" data-verdict={task.latestVerdict ?? 'none'}
							>{task.latestVerdict ?? '—'}</span
						>
					</td>
					<td id={cellElementId(task.id, 'created')} class="col-created figure">{task.createdOn}</td
					>
					<td id={cellElementId(task.id, 'sealed')} class="col-sealed figure"
						>{task.latestSealedOn ?? '—'}</td
					>
				</tr>

				{#if expandedId === task.id}
					<tr class="detail" id="{gridId}-detail-{task.id}">
						<td colspan={TOTAL_COLUMNS}>
							<div class="detail-inner">
								<section class="detail-block">
									<h3>Depends on</h3>
									{#if task.dependsOn.length === 0}
										<p class="detail-empty">
											Nothing. This task can start whenever it is picked up.
										</p>
									{:else}
										<ul>
											{#each task.dependsOn as dependencyId (dependencyId)}
												{@const dependency = taskById[dependencyId]}
												<li>
													<StatusMark status={dependency?.status ?? 'pending'} glyphOnly />
													<span class="task-id">{dependencyId}</span>
													<span class="detail-title"
														>{dependency?.title ?? 'outside the corpus'}</span
													>
													{#if dependency && dependency.release !== task.release}
														<span class="detail-elsewhere">{dependency.release}</span>
													{/if}
												</li>
											{/each}
										</ul>
									{/if}
								</section>

								<section class="detail-block">
									<h3>Blocks</h3>
									{#if dependentsOf(task).length === 0}
										<p class="detail-empty">Nothing waits on this one.</p>
									{:else}
										<ul>
											{#each dependentsOf(task) as dependent (dependent.id)}
												<li>
													<StatusMark status={dependent.status} glyphOnly />
													<span class="task-id">{dependent.id}</span>
													<span class="detail-title">{dependent.title}</span>
													{#if dependent.release !== task.release}
														<span class="detail-elsewhere">{dependent.release}</span>
													{/if}
												</li>
											{/each}
										</ul>
									{/if}
								</section>

								<section class="detail-block detail-siblings">
									<h3>
										Siblings in <span class="task-id">{task.release}</span>
										<span class="detail-note">phase {task.phase} marked</span>
									</h3>
									<ul>
										{#each siblingsOf(task) as sibling (sibling.id)}
											<li class:same-phase={sibling.phase === task.phase}>
												<StatusMark status={sibling.status} glyphOnly />
												<span class="task-id">{sibling.id}</span>
												<span class="detail-phase figure">P{sibling.phase}</span>
												<span class="detail-title">{sibling.title}</span>
											</li>
										{/each}
									</ul>
								</section>
							</div>
						</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>

<style>
	/* The table is the page, so it owns the full viewport width and scrolls
	   sideways rather than dropping columns — a hidden column in a density
	   study defeats the study. */
	.rail {
		overflow-x: auto;
		border-block: 2px solid var(--border-glass-hover);
		background: var(--surface-rest-bg);
	}

	/* The grid is one tab stop, so it says so loudly when it has focus. The
	   ring is drawn on the scroll container rather than on the table, because
	   the table is wider than the viewport and three of its four edges would
	   be off screen. */
	.rail:has(table:focus-visible) {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: -2px;
	}

	table:focus-visible {
		outline: none;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-size: var(--text-micro);
	}

	.figure {
		font-variant-numeric: tabular-nums;
		font-feature-settings: 'tnum' 1;
	}

	/* ---- head ---- */

	thead {
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
	}

	thead tr {
		background: var(--bg-glass-solid);
	}

	thead th {
		padding: 0;
		text-align: left;
		border-bottom: 2px solid var(--border-glass-hover);
		background: var(--bg-glass-solid);
		white-space: nowrap;
	}

	thead th.sorted {
		box-shadow: inset 0 -2px 0 0 var(--accent);
	}

	/* Column focus and sort are different facts, so they are drawn
	   differently: sort underlines the header, focus lights the whole column. */
	thead th.focused .sort {
		color: var(--text-primary);
		background: var(--accent-bg);
	}

	/* h and l walk a column, so the whole column has to answer, not just its
	   header. Written as one rule per column against a data attribute on the
	   grid rather than a class on 1300 cells. */
	.rail[data-focused-column='status'] .col-status,
	.rail[data-focused-column='id'] .col-id,
	.rail[data-focused-column='title'] .col-title,
	.rail[data-focused-column='project'] .col-project,
	.rail[data-focused-column='release'] .col-release,
	.rail[data-focused-column='phase'] .col-phase,
	.rail[data-focused-column='type'] .col-type,
	.rail[data-focused-column='risk'] .col-risk,
	.rail[data-focused-column='steps'] .col-steps,
	.rail[data-focused-column='criteria'] .col-criteria,
	.rail[data-focused-column='files'] .col-files,
	.rail[data-focused-column='attempt'] .col-attempt,
	.rail[data-focused-column='verdict'] .col-verdict,
	.rail[data-focused-column='created'] .col-created,
	.rail[data-focused-column='sealed'] .col-sealed {
		background: var(--accent-bg-subtle);
		color: var(--text-secondary);
	}

	.sort {
		display: flex;
		align-items: baseline;
		gap: var(--space-1);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: none;
		border: none;
		font: inherit;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		cursor: pointer;
		transition: color var(--transition-fast);
	}

	.sort:hover,
	.sort:focus-visible {
		color: var(--text-primary);
	}

	thead th.sorted .sort {
		color: var(--text-primary);
	}

	thead th.numeric .sort {
		justify-content: flex-end;
	}

	.sort-arrow {
		font-size: var(--text-micro);
		color: var(--accent);
	}

	/* ---- release banner ---- */

	.banner th {
		padding: 0;
		text-align: left;
		font-weight: 400;
		border-top: 2px solid var(--border-glass-hover);
		border-bottom: 1px solid var(--border-glass);
		background: var(--surface-hover-subtle);
	}

	.banner-inner {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-3);
	}

	.banner-slug {
		font-weight: 700;
		font-size: var(--text-caption);
		letter-spacing: 0.02em;
		color: var(--text-primary);
	}

	.banner-title {
		font-family: var(--font-display);
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}

	.banner-spacer {
		flex: 1;
	}

	.banner-flag,
	.banner-tag {
		padding: 0 var(--space-1);
		border: 1px solid var(--border-glass);
		color: var(--text-muted);
		letter-spacing: 0.04em;
	}

	.banner-flag {
		border-color: var(--border-glass-hover);
		color: var(--text-secondary);
	}

	.banner-doc,
	.banner-count {
		color: var(--text-muted);
		white-space: nowrap;
	}

	.banner-count .figure {
		color: var(--text-secondary);
	}

	/* Single-series meter: neutral fill, thin, anchored at zero. It reports
	   completion, so it must not borrow a status colour to say it. */
	.meter {
		position: relative;
		display: block;
		width: var(--space-8);
		height: var(--space-1);
		flex: none;
		background: var(--border-glass);
	}

	.meter-fill {
		position: absolute;
		inset-block: 0;
		inset-inline-start: 0;
		background: var(--text-secondary);
	}

	.banner-percent {
		min-width: var(--space-7);
		text-align: right;
		color: var(--text-secondary);
	}

	/* ---- rows ---- */

	tbody td {
		padding: var(--space-1) var(--space-3);
		border-bottom: 1px solid var(--border-glass);
		color: var(--text-muted);
		white-space: nowrap;
		vertical-align: middle;
	}

	.row {
		cursor: pointer;
		/* Sticky header height, so a cursor scrolled into view is not parked
		   underneath the column headers. */
		scroll-margin-block: var(--space-8);
	}

	.row:hover td {
		background: var(--surface-hover-subtle);
	}

	/*
	   The cursor. Not a hover style: a full-bleed accent bar down the gutter,
	   a lifted ground, and the title cell promoted to primary ink. It has to
	   survive being found on a page of eighty-seven rows after looking away.
	*/
	.row.cursor td {
		background: var(--accent-bg);
		border-bottom-color: var(--accent-border);
		color: var(--text-secondary);
	}

	.row.cursor td:first-child {
		box-shadow: inset var(--space-1) 0 0 0 var(--accent);
	}

	.row.cursor .title,
	.row.cursor .task-id {
		color: var(--text-primary);
	}

	.row.expanded td {
		border-bottom-color: transparent;
	}

	/* Seek marks in place rather than filtering, so the rows that did not
	   match have to recede without leaving. */
	.row.dim td {
		opacity: var(--state-hover-opacity);
	}

	.row.match td:first-child {
		box-shadow: inset 2px 0 0 0 var(--text-secondary);
	}

	.row.cursor.match td:first-child {
		box-shadow: inset var(--space-1) 0 0 0 var(--accent);
	}

	/* A row the filter would now drop, kept because the cursor is on it. */
	.row.held td {
		border-bottom-style: dashed;
	}

	/* The feed corrects statuses underneath the view; one flash is the whole
	   announcement, so a silent change is never silent. */
	.row.moved td {
		animation: settle var(--duration-slow) ease-out;
	}

	@keyframes settle {
		from {
			background: var(--accent-bg-emphasis);
		}
		to {
			background: transparent;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.row.moved td {
			animation: none;
			box-shadow: inset 0 -2px 0 0 var(--accent);
		}
	}

	.col-cursor {
		width: var(--space-6);
		padding-inline: var(--space-2);
	}

	.caret {
		display: block;
		width: 100%;
		padding: 0;
		background: none;
		border: none;
		font: inherit;
		color: var(--text-muted);
		cursor: pointer;
		text-align: left;
	}

	.row.cursor .caret {
		color: var(--accent);
	}

	.caret:hover,
	.caret:focus-visible {
		color: var(--accent);
	}

	.task-id {
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--text-secondary);
	}

	/* The title is the thing being recognised, so it is the only cell that
	   gets a larger size, a lighter weight and the primary colour. */
	.col-title {
		width: 100%;
		max-width: 0;
		/* Below about 1200px the flexible title cell is the one that gives, and
		   it collapses to two characters before any other column moves — which
		   is the one column that must stay readable. A floor makes the rail
		   scroll instead of the title vanishing. */
		min-width: 22rem;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.title {
		font-family: var(--font-body);
		font-size: var(--text-caption);
		color: var(--text-primary);
	}

	/* What the live term just matched. */
	mark {
		background: var(--accent-bg-emphasis);
		color: var(--text-primary);
		box-shadow: inset 0 -2px 0 0 var(--accent);
	}

	.col-project,
	.col-release {
		color: var(--text-secondary);
	}

	.numeric {
		text-align: right;
	}

	.risk[data-risk='high'],
	.risk[data-risk='destructive'] {
		color: var(--text-primary);
		text-decoration: underline;
		text-decoration-style: dotted;
		text-underline-offset: 0.2em;
	}

	.verdict[data-verdict='fail'] {
		color: var(--text-primary);
	}

	/* ---- expanded detail ---- */

	.detail td {
		padding: 0;
		background: var(--surface-hover-subtle);
		border-bottom: 2px solid var(--border-glass-hover);
		white-space: normal;
	}

	.detail-inner {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-5);
		padding: var(--space-4) var(--space-5) var(--space-5);
		border-left: var(--space-1) solid var(--accent);
	}

	.detail-block h3 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.detail-note {
		font-weight: 400;
		letter-spacing: 0.04em;
		text-transform: none;
		color: var(--text-muted);
		opacity: var(--opacity-tertiary);
	}

	.detail-block ul {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.detail-block li {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		padding-block: var(--space-1);
		border-bottom: 1px solid var(--border-glass);
	}

	.detail-siblings li.same-phase .detail-title {
		color: var(--text-primary);
	}

	.detail-title {
		flex: 1;
		font-family: var(--font-body);
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}

	.detail-phase,
	.detail-elsewhere {
		color: var(--text-muted);
	}

	.detail-elsewhere {
		padding: 0 var(--space-1);
		border: 1px solid var(--border-glass);
	}

	.detail-empty {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
