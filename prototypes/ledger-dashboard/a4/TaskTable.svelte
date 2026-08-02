<script lang="ts" module>
	import type { Release, Task } from './corpus.ts';

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

	export interface TaskTableProps {
		/** Already filtered and already sorted. This component only draws. */
		rows: Task[];
		releases: Map<string, Release>;
		sortColumn: SortColumn;
		sortDirection: SortDirection;
		onSortChange: (column: SortColumn) => void;
		/** Draw a release banner whenever the release changes down the column. */
		grouped: boolean;
		expandedId: string | null;
		onToggleExpand: (id: string) => void;
		/** The live search term, highlighted in the title cell. */
		query: string;
		/** Ids the feed has just moved, flashed once so a silent correction is visible. */
		recentlyMoved: string[];
		/** Every task in the corpus, for resolving siblings and dependencies. */
		allTasks: Task[];
	}

	interface ColumnSpec {
		id: SortColumn;
		header: string;
		/** Full header text for the accessible name, where the visible one is abbreviated. */
		fullName?: string;
		numeric?: boolean;
	}

	const COLUMNS: ColumnSpec[] = [
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

	/** Column count including the leading disclosure column, for the spanning rows. */
	const TOTAL_COLUMNS = COLUMNS.length + 1;
</script>

<script lang="ts">
	/**
	 * TaskTable — the whole corpus as one table.
	 *
	 * Written locally rather than reached for from the library because the
	 * library DataTable renders every cell as a string, styles itself from the
	 * --admin-* namespace, and has no notion of a group banner or an expanded
	 * row. All three are load-bearing here: status needs a glyph, this is a
	 * public surface, and the release banner is the whole answer to "what else
	 * is in this release".
	 */
	import StatusMark from './StatusMark.svelte';

	let {
		rows,
		releases,
		sortColumn,
		sortDirection,
		onSortChange,
		grouped,
		expandedId,
		onToggleExpand,
		query,
		recentlyMoved,
		allTasks
	}: TaskTableProps = $props();

	// Plain records rather than Maps: these are rebuilt wholesale on every
	// change, so a reactive collection would buy nothing and the lint rule that
	// asks for SvelteMap is right to be suspicious of a mutable one.
	const taskById = $derived(Object.fromEntries(allTasks.map((task) => [task.id, task])));

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

	/** How many of the filtered rows sit in each release, for the banner count. */
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
</script>

<div class="rail">
	<table>
		<caption class="visually-hidden">
			Every task in the corpus. Column headers sort the table in place.
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
		<tbody>
			{#each rows as task (task.id)}
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
					class:expanded={expandedId === task.id}
					class:moved={recentlyMoved.includes(task.id)}
				>
					<td class="col-disclose">
						<button
							type="button"
							class="disclose"
							aria-expanded={expandedId === task.id}
							aria-controls="detail-{task.id}"
							aria-label="Show the work around {task.id}"
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
					<td class="col-project">{task.project}</td>
					<td class="col-release">{task.release}</td>
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

	/* Single-series meter: neutral fill, thin, anchored at zero, rounded only
	   at the data end. It reports completion, so it must not borrow a status
	   colour to say it. */
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
		border-start-end-radius: var(--space-1);
		border-end-end-radius: var(--space-1);
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

	.row:hover td {
		background: var(--surface-hover-subtle);
	}

	.row.expanded td {
		background: var(--surface-hover-subtle);
		border-bottom-color: transparent;
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

	/* The title is the thing being recognised, so it is the only cell that
	   gets a larger size, a lighter weight and the primary colour. Absorbing
	   the slack and truncating keeps every other column on its own axis. */
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

	/* The single accent use on the page: what the search just matched. */
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
