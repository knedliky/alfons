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

	/**
	 * The spine: identity, frozen. Three columns rather than one merged cell so
	 * each keeps its own aria-sort — a single cell carrying three sort controls
	 * can only advertise one sort state, which is a lie in two thirds of cases.
	 */
	const SPINE_COLUMNS: ColumnSpec[] = [
		{ id: 'status', header: 'Status' },
		{ id: 'id', header: 'Id' },
		{ id: 'title', header: 'Title' }
	];

	/** The twelve that scroll. Not one of them is dropped at any width. */
	const METADATA_COLUMNS: ColumnSpec[] = [
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

	/** Disclosure + spine + metadata, for the rows that span the whole table. */
	const TOTAL_COLUMNS = 1 + SPINE_COLUMNS.length + METADATA_COLUMNS.length;
</script>

<script lang="ts">
	/**
	 * TaskTable — the whole corpus as one table, with a frozen identity spine.
	 *
	 * Written locally rather than reached for from the library because the
	 * library DataTable renders every cell as a string, styles itself from the
	 * --admin-* namespace, has no notion of a group banner or an expanded row,
	 * and — the reason this approach exists — no frozen-column concept at all.
	 *
	 * The whole argument: below about 1200px the honest dense table scrolls
	 * sideways, and sideways scrolling costs you the row you were reading. Pin
	 * identity, let metadata move underneath it, and the cost disappears without
	 * hiding a single column at any breakpoint.
	 */
	import { Button } from '@alfons/design';
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
	// change, so a reactive collection would buy nothing.
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

	/* ---- the horizontal position problem ---- */

	let rail = $state<HTMLDivElement | null>(null);
	let scrollLeft = $state(0);
	let scrollWidth = $state(0);
	let viewport = $state(0);
	/** Where the frozen spine ends, in rail-viewport pixels. Measured, never assumed. */
	let spineWidth = $state(0);
	/** Content-space geometry of the twelve scrolling columns, remeasured on resize. */
	let geometry = $state<{ id: SortColumn; header: string; left: number; right: number }[]>([]);

	const scrollMax = $derived(Math.max(0, scrollWidth - viewport));
	const atStart = $derived(scrollLeft <= 1);
	const atEnd = $derived(scrollLeft >= scrollMax - 1);
	/** Everything to the left is only hidden once there is something to hide. */
	const spineOverlaps = $derived(!atStart);

	/**
	 * The window of scrolling columns actually legible right now. A column counts
	 * as in view only if it clears the frozen spine, because a column sitting
	 * underneath the spine is not visible however much of it the scroller thinks
	 * is on screen.
	 */
	const inView = $derived.by(() => {
		const left = scrollLeft + spineWidth;
		const right = scrollLeft + viewport;
		return geometry.filter((column) => column.right > left + 1 && column.left < right - 1);
	});

	const firstInView = $derived(inView[0]);
	const lastInView = $derived(inView[inView.length - 1]);

	function measure() {
		if (!rail) return;
		viewport = rail.clientWidth;
		scrollWidth = rail.scrollWidth;
		scrollLeft = rail.scrollLeft;

		const railLeft = rail.getBoundingClientRect().left;
		const origin = railLeft - rail.scrollLeft;

		const lastSpineCell = rail.querySelector<HTMLElement>('thead .spine-title');
		spineWidth = lastSpineCell
			? lastSpineCell.getBoundingClientRect().right - railLeft
			: spineWidth;

		geometry = METADATA_COLUMNS.map((column) => {
			const cell = rail?.querySelector<HTMLElement>(`thead [data-col='${column.id}']`);
			const box = cell?.getBoundingClientRect();
			return {
				id: column.id,
				header: column.fullName ?? column.header,
				left: box ? box.left - origin : 0,
				right: box ? box.right - origin : 0
			};
		});
	}

	$effect(() => {
		if (!rail) return;
		// Depend on the row set so a filter change remeasures: the columns resize
		// to their new content and every offset moves with them.
		void rows.length;
		measure();
		const observer = new ResizeObserver(() => measure());
		observer.observe(rail);
		return () => observer.disconnect();
	});

	function handleScroll() {
		if (!rail) return;
		scrollLeft = rail.scrollLeft;
	}

	/**
	 * Step by whole columns rather than by a pixel guess, so the reader always
	 * lands on a column boundary and the readout below never says "half of Risk".
	 */
	function step(direction: -1 | 1) {
		if (!rail) return;
		const target =
			direction === 1
				? geometry.find((column) => column.left > scrollLeft + spineWidth + 1)
				: [...geometry].reverse().find((column) => column.left < scrollLeft + spineWidth - 1);
		const next = target ? target.left - spineWidth : direction === 1 ? scrollMax : 0;
		rail.scrollTo({ left: Math.max(0, Math.min(scrollMax, next)), behavior: 'smooth' });
	}

	function jump(edge: 'start' | 'end') {
		rail?.scrollTo({ left: edge === 'start' ? 0 : scrollMax, behavior: 'smooth' });
	}

	/** Home and End inside the rail mean the first and last column, as in a spreadsheet. */
	function handleRailKeydown(event: KeyboardEvent) {
		if (event.target !== rail) return;
		if (event.key === 'Home') {
			event.preventDefault();
			jump('start');
		} else if (event.key === 'End') {
			event.preventDefault();
			jump('end');
		}
	}
</script>

<!--
	The readout sits above the rail rather than inside it, because inside it
	would itself need pinning, and a pinned control inside a pinned column is
	where this pattern usually starts to come apart.
-->
<div class="bar">
	<p class="position" aria-live="polite">
		<span class="position-fixed">
			<span class="figure">3</span> frozen
		</span>
		<span class="position-sep" aria-hidden="true">·</span>
		<span class="position-scrolling">
			showing <span class="figure">{firstInView?.header ?? '—'}</span>
			<span aria-hidden="true">→</span>
			<span class="figure">{lastInView?.header ?? '—'}</span>
			<span class="position-count"
				>({inView.length} of {METADATA_COLUMNS.length} scrolling columns)</span
			>
		</span>
	</p>

	<span class="track" role="img" aria-label="Horizontal position in the metadata columns">
		<span
			class="thumb"
			style:width="{scrollWidth > 0 ? Math.max(8, (viewport / scrollWidth) * 100) : 100}%"
			style:left="{scrollMax > 0 ? (scrollLeft / scrollMax) * (100 - (viewport / scrollWidth) * 100) : 0}%"
		></span>
	</span>

	<span class="steps">
		<Button
			variant="ghost"
			size="sm"
			class="step"
			onclick={() => step(-1)}
			disabled={atStart}
			aria-label="Scroll one column towards Project">◀ column</Button
		>
		<Button
			variant="ghost"
			size="sm"
			class="step"
			onclick={() => step(1)}
			disabled={atEnd}
			aria-label="Scroll one column towards Sealed">column ▶</Button
		>
	</span>
</div>

<!--
	tabindex on the scroll region is what makes the far columns reachable by
	arrow key at all; role and label are what make it announced when focus
	lands there. scroll-padding-inline-start is the other half: without it a
	tab stop in an off-screen column is scrolled to the container edge, which
	is underneath the frozen spine.

	The a11y rules below are suppressed rather than satisfied: WAI-ARIA asks for
	tabindex="0" on a scrollable region precisely so a keyboard can reach it, and
	the rule cannot tell that region from a decorative div given a tab stop. The
	role and the accessible name are both present, and arrow, Home and End were
	verified reaching the far columns.
-->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	class="rail"
	class:overlapping={spineOverlaps}
	bind:this={rail}
	onscroll={handleScroll}
	onkeydown={handleRailKeydown}
	tabindex="0"
	role="region"
	aria-label="Task metadata columns, scrolling horizontally. Arrow keys scroll; Home and End jump to the first and last column."
	style:--rail-viewport="{viewport}px"
>
	<table>
		<caption class="visually-hidden">
			Every task in the corpus. The status, id and title columns stay fixed; the remaining twelve
			scroll sideways. Column headers sort the table in place.
		</caption>
		<thead>
			<tr>
				<th scope="col" class="frozen spine-disclose"
					><span class="visually-hidden">Expand</span></th
				>
				{#each SPINE_COLUMNS as column (column.id)}
					<th
						scope="col"
						class="frozen spine-{column.id}"
						class:active={sortColumn === column.id}
						aria-sort={ariaSort(column.id)}
					>
						<button
							type="button"
							class="sort"
							onclick={() => onSortChange(column.id)}
							aria-label="Sort by {column.fullName ?? column.header}"
						>
							<span>{column.header}</span>
							<span class="sort-arrow" aria-hidden="true">
								{#if sortColumn === column.id}{sortDirection === 'asc' ? '▲' : '▼'}{/if}
							</span>
						</button>
					</th>
				{/each}
				{#each METADATA_COLUMNS as column (column.id)}
					<th
						scope="col"
						data-col={column.id}
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
							<span>{column.header}</span>
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
							<!-- Pinned left for the same reason the spine is: a release
							     heading that scrolls away stops answering which release
							     the row under the cursor belongs to. -->
							<div class="banner-inner">
								<span class="banner-slug">{banner.slug}</span>
								<span class="banner-title">{banner.title}</span>
								<span class="banner-spacer"></span>
								{#if banner.isBucket}
									<span class="banner-flag">bucket</span>
								{/if}
								<span class="banner-count">
									<span class="figure">{shownPerRelease[banner.slug] ?? 0}</span>/<span class="figure"
										>{banner.taskCount}</span
									> shown
								</span>
								<span class="meter" role="img" aria-label="{complete} percent of {banner.slug} is done">
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
					<td class="frozen spine-disclose">
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
					<td class="frozen spine-status"><StatusMark status={task.status} /></td>
					<th scope="row" class="frozen spine-id"><span class="task-id">{task.id}</span></th>
					<td class="frozen spine-title">
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
							<!-- Sized to the rail viewport, not to the table, so the detail
							     reads at the width the reader actually has. -->
							<div class="detail-inner">
								<section class="detail-block">
									<h3>Depends on</h3>
									{#if task.dependsOn.length === 0}
										<p class="detail-empty">Nothing. This task can start whenever it is picked up.</p>
									{:else}
										<ul>
											{#each task.dependsOn as dependencyId (dependencyId)}
												{@const dependency = taskById[dependencyId]}
												<li>
													<StatusMark status={dependency?.status ?? 'pending'} glyphOnly />
													<span class="task-id">{dependencyId}</span>
													<span class="detail-title">{dependency?.title ?? 'outside the corpus'}</span>
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
	/* ---- the position bar ---- */

	.bar {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		padding: var(--space-2) var(--page-padding-x);
		border-top: 2px solid var(--border-glass-hover);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.position {
		margin: 0;
		white-space: nowrap;
	}

	.position .figure {
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.position-fixed {
		font-weight: 600;
	}

	.position-sep,
	.position-count {
		color: var(--text-muted);
		opacity: var(--opacity-tertiary);
	}

	/* A proportional track, not a decoration: its thumb is the share of the
	   twelve columns on screen and its position is where in them you are. */
	.track {
		position: relative;
		flex: 1;
		min-width: var(--space-8);
		height: var(--space-1);
		background: var(--border-glass);
	}

	.thumb {
		position: absolute;
		inset-block: 0;
		background: var(--text-secondary);
	}

	.steps {
		display: flex;
		gap: var(--space-2);
		flex: none;
	}

	.bar :global(.step) {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
	}

	/* ---- the rail ---- */

	.rail {
		--w-disclose: var(--space-6);
		--w-status: 6.75rem;
		--w-id: 5.5rem;
		/* The one width that yields: the title gives up measure before any
		   metadata column gives up existence. */
		--w-title: clamp(9rem, 22vw, 21rem);
		--spine-width: calc(var(--w-disclose) + var(--w-status) + var(--w-id) + var(--w-title));

		/*
			Two axes, deliberately.

			overflow-x: auto forces overflow-y to compute to auto as well, which
			makes the rail a scroll container in both directions — and that means a
			vertically sticky thead resolves against the rail, not against the page.
			Left unbounded the rail is as tall as its content, so the header row has
			nothing to stick to and never sticks at all. Round one's winner has
			exactly that bug: its `thead { position: sticky; top: 0 }` is inert,
			measured at -640px after a page scroll.

			Bounding the rail to the viewport is what makes it true. The frozen spine
			asks for a header row that stays legible, and the only way to keep one is
			to admit that the rail is a viewport rather than a stretch of page.
		*/
		overflow: auto;
		max-height: calc(100dvh - var(--header-height) - var(--space-8));
		overscroll-behavior-y: auto;
		/* The rail's own top is where the header row sticks, so any programmatic
		   scroll must park that top below the fixed site Header rather than
		   under it. Keep scrolling by hand past this point and the header row
		   goes under with the rail — the one place the site Header still wins. */
		scroll-margin-top: calc(var(--header-height) + var(--space-4));
		border-block: 2px solid var(--border-glass-hover);
		/* Opaque, because the frozen cells sit on this ground and must carry the
		   identical fill — a spine on its own tint reads as a second table. */
		background: var(--bg-glass-solid);
		/* Focus moving into an off-screen column is scrolled to the container
		   edge, which is underneath the spine. This is the fix, in both axes. */
		scroll-padding-inline-start: var(--spine-width);
		scroll-padding-block-start: var(--space-7);
	}

	.rail:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: -2px;
	}

	table {
		/* max-content so the twelve metadata columns keep their natural widths at
		   every viewport; min-width 100% so a wide screen still fills the rail. */
		width: max-content;
		min-width: 100%;
		/* separate, not collapse: a collapsed border belongs to the table rather
		   than the cell, and it scrolls out from under a sticky cell. */
		border-collapse: separate;
		border-spacing: 0;
		font-family: var(--font-mono);
		font-variant-numeric: tabular-nums;
		font-size: var(--text-micro);
	}

	.figure {
		font-variant-numeric: tabular-nums;
		font-feature-settings: 'tnum' 1;
	}

	/* ---- head ---- */

	thead th {
		position: sticky;
		/* Zero, not --header-height: the rail is the scroll container, so this
		   offset is measured from the rail's own top edge. The site Header sits
		   above the rail and never overlaps it, which is the whole interaction
		   between the two once the rail is bounded. */
		top: 0;
		z-index: var(--z-raised);
		padding: 0;
		text-align: left;
		background: var(--bg-glass-solid);
		border-bottom: 2px solid var(--border-glass-hover);
		white-space: nowrap;
	}

	thead th.active {
		box-shadow: inset 0 -2px 0 0 var(--accent);
	}

	/* The corner: frozen in both axes, so it outranks both. */
	thead th.frozen {
		z-index: var(--z-sticky);
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

	th.active .sort {
		color: var(--text-primary);
	}

	th.numeric .sort {
		justify-content: flex-end;
	}

	.sort-arrow {
		color: var(--accent);
	}

	/* ---- the spine ---- */

	.frozen {
		position: sticky;
		z-index: var(--z-raised);
		background: var(--bg-glass-solid);
	}

	.spine-disclose {
		left: 0;
		width: var(--w-disclose);
		min-width: var(--w-disclose);
		padding-inline: var(--space-2);
	}

	.spine-status {
		left: var(--w-disclose);
		width: var(--w-status);
		min-width: var(--w-status);
	}

	.spine-id {
		left: calc(var(--w-disclose) + var(--w-status));
		width: var(--w-id);
		min-width: var(--w-id);
	}

	.spine-title {
		left: calc(var(--w-disclose) + var(--w-status) + var(--w-id));
		width: var(--w-title);
		min-width: var(--w-title);
		max-width: var(--w-title);
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/*
		The seam, which is the whole risk in this approach.

		At rest it is a 1px rule at the same weight as every other column gap, so
		the spine is simply the first four columns of one table. Once the rail has
		scrolled, and only then, it becomes a 2px rule with a short cast to its
		right — because now something genuinely does pass underneath it, and the
		reader is owed that fact. A permanent shadow would be a permanent claim
		that content is hidden when at scroll zero none is.
	*/
	.spine-title {
		border-right: 1px solid var(--border-glass);
		transition:
			border-right-color var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.rail.overlapping .spine-title {
		border-right-color: var(--border-glass-hover);
		box-shadow:
			2px 0 0 0 var(--border-glass-hover),
			var(--shadow-subtle);
	}

	/* ---- release banner ---- */

	.banner th {
		padding: 0;
		text-align: left;
		font-weight: 400;
		border-top: 2px solid var(--border-glass-hover);
		border-bottom: 1px solid var(--border-glass);
		background:
			linear-gradient(var(--surface-hover-subtle), var(--surface-hover-subtle)),
			var(--bg-glass-solid);
	}

	.banner-inner {
		position: sticky;
		left: 0;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: fit-content;
		max-width: var(--rail-viewport);
		padding: var(--space-2) var(--space-3);
	}

	.banner-slug {
		font-weight: 700;
		font-size: var(--text-caption);
		color: var(--text-primary);
	}

	.banner-title {
		font-family: var(--font-display);
		font-size: var(--text-caption);
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.banner-spacer {
		flex: 1;
	}

	.banner-flag {
		padding: 0 var(--space-1);
		border: 1px solid var(--border-glass-hover);
		color: var(--text-secondary);
	}

	.banner-count {
		color: var(--text-muted);
		white-space: nowrap;
	}

	.banner-count .figure {
		color: var(--text-secondary);
	}

	/* Single-series meter: neutral fill. It reports completion, so it must not
	   borrow a status colour to say it. */
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

	tbody td,
	tbody th {
		padding: var(--space-1) var(--space-3);
		border-bottom: 1px solid var(--border-glass);
		color: var(--text-muted);
		white-space: nowrap;
		vertical-align: middle;
		text-align: left;
		font-weight: 400;
	}

	/* Hover and expansion have to reach the spine as well, or the row splits in
	   two the moment the pointer lands on it. Layered rather than translucent so
	   the frozen cells stay opaque. */
	.row:hover > td,
	.row:hover > th,
	.row.expanded > td,
	.row.expanded > th {
		background:
			linear-gradient(var(--surface-hover-subtle), var(--surface-hover-subtle)),
			var(--bg-glass-solid);
	}

	.row.expanded > td,
	.row.expanded > th {
		border-bottom-color: transparent;
	}

	/* The feed corrects statuses underneath the view; one flash is the whole
	   announcement, so a silent change is never silent. */
	.row.moved > td,
	.row.moved > th {
		animation: settle var(--duration-slow) ease-out;
	}

	@keyframes settle {
		from {
			background:
				linear-gradient(var(--accent-bg-emphasis), var(--accent-bg-emphasis)),
				var(--bg-glass-solid);
		}
		to {
			background: var(--bg-glass-solid);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.row.moved > td,
		.row.moved > th {
			animation: none;
		}

		.row.moved > .spine-disclose {
			box-shadow: inset 3px 0 0 0 var(--accent);
		}
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

	/* The title is the thing being recognised, and it is frozen, so it is the
	   one cell that gets the body face at primary ink. */
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
		background: var(--bg-glass-solid);
		border-bottom: 2px solid var(--border-glass-hover);
		white-space: normal;
	}

	.detail-inner {
		position: sticky;
		left: 0;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: var(--space-5);
		width: var(--rail-viewport);
		padding: var(--space-4) var(--space-5) var(--space-5);
		border-left: 2px solid var(--accent);
		background:
			linear-gradient(var(--surface-hover-subtle), var(--surface-hover-subtle)),
			var(--bg-glass-solid);
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
