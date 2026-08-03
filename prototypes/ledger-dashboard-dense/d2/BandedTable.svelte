<script lang="ts" module>
	import type { Release, Task, TaskStatus } from './corpus.ts';
	import type { MeterSegment } from './CompletionMeter.svelte';

	export type SortColumn =
		| 'status'
		| 'id'
		| 'title'
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

	export interface Band {
		release: Release;
		/** The release's tasks that survived the search, already sorted. */
		rows: Task[];
		/** Every task in the release, matched or not, for the meter's denominator. */
		allRows: Task[];
		segments: MeterSegment[];
		/** Lowest phase that still carries an open task — where the release currently is. */
		activePhase: number | null;
		phaseRange: [number, number];
	}

	export interface BandedTableProps {
		bands: Band[];
		sortColumn: SortColumn;
		sortDirection: SortDirection;
		onSortChange: (column: SortColumn) => void;
		/** Slugs the reader has folded shut by hand. Ignored while a search is running. */
		collapsedSlugs: string[];
		onToggleBand: (slug: string) => void;
		/** True while a search term is present: collapse is then decided by the matches, not the reader. */
		searching: boolean;
		expandedId: string | null;
		onToggleExpand: (id: string) => void;
		query: string;
		recentlyMoved: string[];
		allTasks: Task[];
	}

	interface ColumnSpec {
		id: SortColumn;
		header: string;
		/** Full header text for the accessible name, where the visible one is abbreviated. */
		fullName?: string;
		numeric?: boolean;
	}

	/**
	 * Thirteen columns, not fifteen. Release and project were columns in round
	 * one; inside a permanent band both are stated once by the banner above the
	 * rows, so repeating them down every row is the redundancy banding is meant
	 * to remove. That is where some of the banner's vertical cost is paid back.
	 */
	const COLUMNS: ColumnSpec[] = [
		{ id: 'status', header: 'Status' },
		{ id: 'id', header: 'Id' },
		{ id: 'title', header: 'Title' },
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

	/** Column count including the leading disclosure column, for the spanning rows. */
	const TOTAL_COLUMNS = COLUMNS.length + 1;
</script>

<script lang="ts">
	/**
	 * BandedTable — the corpus as a permanent sequence of release bands.
	 *
	 * One table, one head, and two tbody elements per release: a banner body and
	 * a rows body. That shape is deliberate. Separate tables per band would let
	 * each band pick its own column widths, and the page would stop reading as
	 * one instrument; a single table keeps every band on the same axis while a
	 * tbody boundary is what HTML already means by "a group of rows".
	 *
	 * Hand-rolled rather than reached for from the library because DataTable
	 * styles itself from the --admin-* namespace, formats every cell to a
	 * string, and has no notion of either a group banner or an expanded detail
	 * row. This approach is made of exactly those two things.
	 */
	import StatusMark from './StatusMark.svelte';
	import CompletionMeter from './CompletionMeter.svelte';

	let {
		bands,
		sortColumn,
		sortDirection,
		onSortChange,
		collapsedSlugs,
		onToggleBand,
		searching,
		expandedId,
		onToggleExpand,
		query,
		recentlyMoved,
		allTasks
	}: BandedTableProps = $props();

	const taskById = $derived(Object.fromEntries(allTasks.map((task) => [task.id, task])));

	/**
	 * A band is shut either because the reader folded it or because a search
	 * found nothing in it. While a search is running the reader's own folds are
	 * ignored, so typing can never hide the row it just found.
	 */
	function isCollapsed(band: Band): boolean {
		if (searching) return band.rows.length === 0;
		return collapsedSlugs.includes(band.release.slug);
	}

	function ariaSort(column: SortColumn): 'ascending' | 'descending' | 'none' {
		if (sortColumn !== column) return 'none';
		return sortDirection === 'asc' ? 'ascending' : 'descending';
	}

	/** Split a title around the search term so the matched run can be marked. */
	function splitOnQuery(title: string): { text: string; matched: boolean }[] {
		const term = query.trim();
		if (term.length < 2) return [{ text: title, matched: false }];
		const parts: { text: string; matched: boolean }[] = [];
		const haystack = title.toLowerCase();
		const needle = term.toLowerCase();
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

	function dependentsOf(task: Task): Task[] {
		return allTasks.filter((other) => other.dependsOn.includes(task.id));
	}

	function phaseLabel(band: Band): string {
		const [first, last] = band.phaseRange;
		return first === last ? `phase ${first}` : `phases ${first}–${last}`;
	}

	function statusOf(id: string): TaskStatus {
		return taskById[id]?.status ?? 'pending';
	}
</script>

<div class="rail">
	<table>
		<caption class="visually-hidden">
			Every task in the corpus, grouped permanently by release. Column headers sort the rows inside
			every band and reorder the bands themselves.
		</caption>
		<thead>
			<tr>
				<th scope="col" class="col-disclose"><span class="visually-hidden">Expand</span></th>
				{#each COLUMNS as column (column.id)}
					<th
						scope="col"
						class="col-{column.id}"
						class:numeric={column.numeric}
						class:active={sortColumn === column.id}
						aria-sort={ariaSort(column.id)}
					>
						<button
							type="button"
							class="sort"
							onclick={() => onSortChange(column.id)}
							aria-label="Sort by {column.fullName ?? column.header}"
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

		{#each bands as band (band.release.slug)}
			{@const collapsed = isCollapsed(band)}
			<tbody class="band-banner" class:empty={band.rows.length === 0}>
				<tr>
					<th scope="colgroup" colspan={TOTAL_COLUMNS}>
						<!-- Pinned to the viewport edge so the banner stays readable while the
						     columns scroll sideways underneath it. -->
						<div class="banner">
							<button
								type="button"
								class="fold"
								aria-expanded={!collapsed}
								aria-controls="band-rows-{band.release.slug}"
								onclick={() => onToggleBand(band.release.slug)}
							>
								<span class="fold-arrow" aria-hidden="true">{collapsed ? '▸' : '▾'}</span>
								<span class="banner-slug">{band.release.slug}</span>
								<span class="visually-hidden">
									{collapsed ? 'Open' : 'Fold'} the {band.release.slug} band
								</span>
							</button>

							<div class="banner-story">
								<p class="banner-title">{band.release.title}</p>
								<p class="banner-facts">
									<span class="banner-project">{band.release.project}</span>
									{#if band.release.isBucket}
										<span class="banner-flag">bucket</span>
									{/if}
									{#each band.release.tags as tag (tag)}
										<span class="banner-tag">{tag}</span>
									{/each}
									<span class="banner-fact">
										{band.release.documentedOn
											? `documented ${band.release.documentedOn}`
											: 'undocumented'}
									</span>
									<span class="banner-fact">{phaseLabel(band)}</span>
									{#if band.activePhase !== null}
										<span class="banner-fact banner-active">on phase {band.activePhase}</span>
									{:else}
										<span class="banner-fact">nothing open</span>
									{/if}
									<span class="banner-fact banner-shown">
										<span class="figure">{band.rows.length}</span>/<span class="figure"
											>{band.allRows.length}</span
										> shown
									</span>
								</p>
							</div>

							<!-- Fixed width, so every band's track starts and ends on the same
							     two vertical lines and the meters read as one rail down the
							     page rather than sixteen unrelated bars. -->
							<div class="banner-meter">
								<CompletionMeter
									segments={band.segments}
									total={band.allRows.length}
									label={band.release.slug}
								/>
							</div>
						</div>
					</th>
				</tr>
			</tbody>

			<tbody class="band-rows" id="band-rows-{band.release.slug}" hidden={collapsed}>
				{#each band.rows as task (task.id)}
					<tr
						class="row"
						class:expanded={expandedId === task.id}
						class:moved={recentlyMoved.includes(task.id)}
					>
						<td class="col-disclose">
							<button
								type="button"
								class="disclose"
								aria-expanded={expandedId === task.id}
								aria-controls="detail-{task.id}"
								aria-label="Show what {task.id} depends on"
								onclick={() => onToggleExpand(task.id)}
							>
								{expandedId === task.id ? '▾' : '▸'}
							</button>
						</td>
						<td class="col-status"><StatusMark status={task.status} /></td>
						<td class="col-id"><span class="task-id">{task.id}</span></td>
						<td class="col-title">
							<span class="title">
								{#each splitOnQuery(task.title) as part, index (index)}
									{#if part.matched}<mark>{part.text}</mark>{:else}{part.text}{/if}
								{/each}
							</span>
						</td>
						<td class="col-phase numeric figure">{task.phase}</td>
						<td class="col-type">{task.type}</td>
						<td class="col-risk"><span class="risk" data-risk={task.risk}>{task.risk}</span></td>
						<td class="col-steps numeric figure">{task.stepCount}</td>
						<td class="col-criteria numeric figure">{task.criterionCount}</td>
						<td class="col-files numeric figure">{task.fileChangeCount}</td>
						<td class="col-attempt numeric figure">{task.latestAttempt || '—'}</td>
						<td class="col-verdict"
							><span class="verdict" data-verdict={task.latestVerdict ?? 'none'}
								>{task.latestVerdict ?? '—'}</span
							></td
						>
						<td class="col-created figure">{task.createdOn}</td>
						<td class="col-sealed figure">{task.latestSealedOn ?? '—'}</td>
					</tr>

					{#if expandedId === task.id}
						<tr class="detail" id="detail-{task.id}">
							<td colspan={TOTAL_COLUMNS}>
								<!--
									Two blocks, not three. Round one's detail strip led with siblings
									in the release; here the siblings are the rows immediately above
									and below, so only the cross-band relations are left to state.
								-->
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
														<StatusMark status={statusOf(dependencyId)} glyphOnly />
														<span class="task-id">{dependencyId}</span>
														<span class="detail-title"
															>{dependency?.title ?? 'outside the corpus'}</span
														>
														{#if dependency && dependency.release !== task.release}
															<span class="detail-elsewhere">{dependency.release}</span>
														{:else}
															<span class="detail-here">this band</span>
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
														{:else}
															<span class="detail-here">this band</span>
														{/if}
													</li>
												{/each}
											</ul>
										{/if}
									</section>
								</div>
							</td>
						</tr>
					{/if}
				{/each}

				{#if band.rows.length === 0 && !searching}
					<tr class="band-note">
						<td colspan={TOTAL_COLUMNS}>This release has no tasks in the corpus.</td>
					</tr>
				{/if}
			</tbody>
		{/each}
	</table>
</div>

<style>
	.rail {
		overflow-x: auto;
		border-block: 2px solid var(--border-glass-hover);
		background: var(--surface-rest-bg);
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

	thead th {
		padding: 0;
		text-align: left;
		border-bottom: 2px solid var(--border-glass-hover);
		background: var(--bg-glass-solid);
		white-space: nowrap;
	}

	thead th.active {
		box-shadow: inset 0 -2px 0 0 var(--accent);
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

	thead th.active .sort {
		color: var(--text-primary);
	}

	thead th.numeric .sort {
		justify-content: flex-end;
	}

	.sort-arrow {
		font-size: var(--text-micro);
		color: var(--accent);
	}

	/* ---- the band banner ---- */

	/* The heaviest rule on the page opens a band. Rules at two weights are what
	   make the page read as structure; this is the heavy one, and every rule
	   inside a band is the light one. */
	.band-banner th {
		padding: 0;
		text-align: left;
		font-weight: 400;
		border-top: 2px solid var(--border-glass-hover);
		border-bottom: 1px solid var(--border-glass);
		background: var(--surface-hover-subtle);
	}

	.band-banner.empty th {
		background: none;
	}

	.band-banner.empty .banner {
		opacity: var(--state-hover-opacity);
	}

	.banner {
		position: sticky;
		inset-inline-start: 0;
		display: flex;
		align-items: center;
		gap: var(--space-4);
		width: min(100%, 100vw);
		padding: var(--space-2) var(--space-3);
	}

	.fold {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
		flex: none;
		padding: 0;
		background: none;
		border: none;
		font: inherit;
		color: var(--text-muted);
		cursor: pointer;
	}

	.fold:hover,
	.fold:focus-visible {
		color: var(--text-primary);
	}

	.banner-slug {
		font-size: var(--text-caption);
		font-weight: 700;
		letter-spacing: 0.02em;
		color: var(--text-primary);
	}

	.banner-story {
		flex: 1;
		min-width: 0;
	}

	/* The display voice, once per band. It is what buys the rows beneath
	   permission to be as tight as they are. */
	.banner-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-caption);
		line-height: 1.3;
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.banner-facts {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-1) var(--space-3);
		margin: var(--space-1) 0 0;
		color: var(--text-muted);
	}

	.banner-project {
		color: var(--text-secondary);
		font-weight: 600;
	}

	.banner-flag,
	.banner-tag {
		padding: 0 var(--space-1);
		border: 1px solid var(--border-glass);
		letter-spacing: 0.04em;
	}

	.banner-flag {
		border-color: var(--border-glass-hover);
		color: var(--text-secondary);
	}

	.banner-meter {
		flex: none;
		width: 26rem;
	}

	.banner-active {
		color: var(--text-secondary);
	}

	.banner-shown .figure {
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

	.row:hover td {
		background: var(--surface-hover-subtle);
	}

	.row.expanded td {
		background: var(--surface-hover-subtle);
		border-bottom-color: transparent;
	}

	.band-note td {
		color: var(--text-muted);
		opacity: var(--opacity-tertiary);
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
			box-shadow: inset 2px 0 0 0 var(--accent);
		}
	}

	.col-disclose {
		width: var(--space-6);
		padding-inline: var(--space-2);
	}

	.disclose {
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

	.disclose:hover,
	.disclose:focus-visible {
		color: var(--accent);
	}

	.task-id {
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--text-secondary);
	}

	/* The one column that breaks the mono: the thing being recognised. */
	.col-title {
		width: 100%;
		max-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.title {
		font-family: var(--font-body);
		font-size: var(--text-caption);
		color: var(--text-primary);
	}

	/* The single accent use in the table: what the search just matched. */
	mark {
		background: var(--accent-bg-emphasis);
		color: var(--text-primary);
		box-shadow: inset 0 -2px 0 0 var(--accent);
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
		border-bottom: 1px solid var(--border-glass);
		white-space: normal;
	}

	.detail-inner {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-5);
		padding: var(--space-3) var(--space-5) var(--space-4);
		border-left: 2px solid var(--accent);
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

	.detail-title {
		flex: 1;
		font-family: var(--font-body);
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}

	.detail-elsewhere,
	.detail-here {
		padding: 0 var(--space-1);
		color: var(--text-muted);
	}

	/* A dependency in another band is the only one worth boxing: it is the one
	   the reader has to leave this band to see. */
	.detail-elsewhere {
		border: 1px solid var(--border-glass);
		color: var(--text-secondary);
	}

	.detail-here {
		opacity: var(--opacity-tertiary);
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

	/* Below the width the columns need, the banner is what must survive: it
	   stops wrapping into three lines and the title truncates instead. */
	@media (max-width: 900px) {
		.banner {
			gap: var(--space-3);
		}

		.banner-story {
			min-width: 12rem;
		}

		/* The rail still has to align, so the meter narrows rather than wrapping
		   under the story and doubling every banner's height. */
		.banner-meter {
			width: 15rem;
		}
	}
</style>
