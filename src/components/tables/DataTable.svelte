<script lang="ts" module>
	import type { Snippet } from 'svelte';

	/**
	 * Column definition for DataTable.
	 *
	 * Each column specifies a header label, an accessor key to read from
	 * row data, and an optional custom renderer for cell content.
	 */
	export interface DataTableColumn<TRow = Record<string, unknown>> {
		/** Unique identifier for the column */
		id: string;
		/** Display text for the column header */
		header: string;
		/** Key path to access the cell value from a row object */
		accessor: string;
		/** Whether this column supports sorting (defaults to true) */
		sortable?: boolean;
		/** Maximum width for cell text truncation */
		maxWidth?: string;
		/** Optional function to format the raw cell value for display */
		formatter?: (value: unknown, row: TRow) => string;
	}

	export interface DataTableProps<TRow = Record<string, unknown>> {
		/** Column definitions controlling what is displayed and how */
		columns: DataTableColumn<TRow>[];
		/** Array of data rows to render */
		rows: TRow[];
		/** Function to derive a unique key from each row */
		rowKey: (row: TRow) => string;

		/** Currently sorted column id (null for no sort) */
		sortColumn?: string | null;
		/** Current sort direction */
		sortDirection?: 'asc' | 'desc';
		/** Callback when a sortable column header is clicked */
		onSortChange?: (columnId: string, direction: 'asc' | 'desc') => void;

		/** Set of selected row keys */
		selectedKeys?: Set<string>;
		/** Whether to show row selection checkboxes */
		selectable?: boolean;
		/** Callback when selection changes */
		onSelectionChange?: (selectedKeys: Set<string>) => void;

		/** Whether data is currently loading */
		loading?: boolean;
		/** Message shown when rows array is empty */
		emptyMessage?: string;

		/** Optional snippet for custom row actions column */
		rowActions?: Snippet<[TRow]>;
	}
</script>

<script lang="ts" generics="TRow extends Record<string, unknown>">
	/**
	 * DataTable — generic sortable data table with optional row selection.
	 *
	 * Usage:
	 *   <DataTable
	 *     columns={[{ id: 'name', header: 'Name', accessor: 'name' }]}
	 *     rows={data}
	 *     rowKey={(row) => row.id}
	 *     sortColumn="name"
	 *     sortDirection="asc"
	 *     {onSortChange}
	 *   />
	 *
	 * Features:
	 * - Generic column/row definitions with typed accessors
	 * - Sortable column headers with direction indicators
	 * - Optional row selection with select-all toggle
	 * - Custom cell formatters per column
	 * - Row actions via snippet prop
	 * - Loading overlay and empty state
	 */
	import { SvelteSet } from 'svelte/reactivity';

	let {
		columns,
		rows,
		rowKey,
		sortColumn = null,
		sortDirection = 'asc',
		onSortChange,
		selectedKeys = new Set(),
		selectable = false,
		onSelectionChange,
		loading = false,
		emptyMessage = 'No data available',
		rowActions
	}: DataTableProps<TRow> = $props();

	const allSelected = $derived(
		rows.length > 0 && rows.every((row) => selectedKeys.has(rowKey(row)))
	);
	const someSelected = $derived(
		rows.some((row) => selectedKeys.has(rowKey(row))) && !allSelected
	);

	function toggleRowSelection(key: string) {
		const newSelection = new SvelteSet(selectedKeys);
		if (newSelection.has(key)) {
			newSelection.delete(key);
		} else {
			newSelection.add(key);
		}
		onSelectionChange?.(newSelection);
	}

	function toggleSelectAll() {
		const newSelection = new SvelteSet<string>();
		if (!allSelected) {
			rows.forEach((row) => newSelection.add(rowKey(row)));
		}
		onSelectionChange?.(newSelection);
	}

	function handleSortClick(column: DataTableColumn<TRow>) {
		if (column.sortable === false || !onSortChange) return;
		const newDirection =
			sortColumn === column.id && sortDirection === 'asc' ? 'desc' : 'asc';
		onSortChange(column.id, newDirection);
	}

	function getCellValue(row: TRow, column: DataTableColumn<TRow>): string {
		const value = row[column.accessor];
		if (column.formatter) {
			return column.formatter(value, row);
		}
		if (value === null || value === undefined) {
			return '-';
		}
		return String(value);
	}

	function getSortIndicator(columnId: string): 'asc' | 'desc' | null {
		if (sortColumn !== columnId) return null;
		return sortDirection;
	}
</script>

<div class="data-table-container">
	<div class="table-wrapper" class:loading>
		{#if loading && rows.length === 0}
			<div class="loading-state">
				<div class="loading-spinner"></div>
				<span>Loading...</span>
			</div>
		{:else if rows.length === 0}
			<div class="empty-state">
				<svg
					class="empty-icon"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
					></path>
				</svg>
				<p>{emptyMessage}</p>
			</div>
		{:else}
			<div class="table-scroll">
				<table class="data-table">
					<thead>
						<tr>
							{#if selectable}
								<th class="checkbox-column">
									<input
										type="checkbox"
										checked={allSelected}
										indeterminate={someSelected}
										onchange={toggleSelectAll}
										class="row-checkbox"
										aria-label="Select all rows"
									/>
								</th>
							{/if}

							{#each columns as column (column.id)}
								{@const isSortable = column.sortable !== false && !!onSortChange}
								<th
									class:sortable-column={isSortable}
									onclick={() => isSortable && handleSortClick(column)}
									onkeydown={(e) =>
										e.key === 'Enter' && isSortable && handleSortClick(column)}
									tabindex={isSortable ? 0 : -1}
									role="columnheader"
									aria-sort={getSortIndicator(column.id)
										? getSortIndicator(column.id) === 'asc'
											? 'ascending'
											: 'descending'
										: 'none'}
								>
									<div class="column-header">
										<span>{column.header}</span>
										{#if isSortable}
											<span class="sort-indicator">
												{#if getSortIndicator(column.id) === 'asc'}
													<svg
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M5 15l7-7 7 7"
														></path>
													</svg>
												{:else if getSortIndicator(column.id) === 'desc'}
													<svg
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														xmlns="http://www.w3.org/2000/svg"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 9l-7 7-7-7"
														></path>
													</svg>
												{/if}
											</span>
										{/if}
									</div>
								</th>
							{/each}

							{#if rowActions}
								<th class="actions-column">Actions</th>
							{/if}
						</tr>
					</thead>
					<tbody>
						{#each rows as row (rowKey(row))}
							{@const key = rowKey(row)}
							<tr class:selected={selectable && selectedKeys.has(key)}>
								{#if selectable}
									<td class="checkbox-cell">
										<input
											type="checkbox"
											checked={selectedKeys.has(key)}
											onchange={() => toggleRowSelection(key)}
											class="row-checkbox"
											aria-label="Select row {key}"
										/>
									</td>
								{/if}

								{#each columns as column (column.id)}
									<td
										class="data-cell"
										style:max-width={column.maxWidth ?? '250px'}
										title={getCellValue(row, column)}
									>
										{getCellValue(row, column)}
									</td>
								{/each}

								{#if rowActions}
									<td class="actions-cell">
										{@render rowActions(row)}
									</td>
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

		{#if loading && rows.length > 0}
			<div class="loading-overlay">
				<div class="loading-spinner"></div>
			</div>
		{/if}
	</div>
</div>

<style>
	.data-table-container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.table-wrapper {
		flex: 1;
		position: relative;
		overflow: hidden;
	}

	.table-wrapper.loading {
		opacity: 0.6;
		pointer-events: none;
	}

	.table-scroll {
		height: 100%;
		overflow: auto;
	}

	.loading-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		height: 100%;
		min-height: 200px;
		color: var(--admin-text-secondary);
	}

	.loading-spinner {
		width: 32px;
		height: 32px;
		border: 3px solid var(--admin-border);
		border-top-color: var(--accent);
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--surface-overlay-subtle);
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		height: 100%;
		min-height: 200px;
		padding: 1.5rem;
		color: var(--admin-text-muted);
		text-align: center;
	}

	.empty-icon {
		width: 48px;
		height: 48px;
		opacity: 0.5;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
	}

	.data-table thead {
		position: sticky;
		top: 0;
		z-index: 1;
		background-color: var(--admin-bg);
	}

	.data-table th {
		padding: 0.5rem 1rem;
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--admin-text-secondary);
		text-align: left;
		white-space: nowrap;
	}

	.data-table td {
		padding: 0.5rem 1rem;
		font-size: 0.8125rem;
		color: var(--admin-text);
		vertical-align: middle;
	}

	.data-table tbody tr {
		transition: background-color 0.15s ease;
	}

	.data-table tbody tr:hover {
		background-color: var(--admin-bg);
	}

	.data-table tbody tr.selected {
		background-color: color-mix(in srgb, var(--accent) 10%, transparent);
	}

	.data-table tbody tr.selected:hover {
		background-color: color-mix(in srgb, var(--accent) 15%, transparent);
	}

	.checkbox-column,
	.checkbox-cell {
		width: 48px;
		text-align: left;
		padding-left: 1rem;
		vertical-align: middle;
	}

	.row-checkbox {
		width: 16px;
		height: 16px;
		margin: 0;
		cursor: pointer;
		accent-color: var(--accent);
		vertical-align: middle;
	}

	.sortable-column {
		cursor: pointer;
		user-select: none;
	}

	.sortable-column:hover {
		color: var(--admin-text);
	}

	.column-header {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.sort-indicator {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.sort-indicator svg {
		width: 16px;
		height: 16px;
	}

	.data-cell {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.actions-column {
		width: 120px;
		text-align: right;
	}

	.actions-cell {
		text-align: right;
	}

	/* Scrollbar styling */
	.table-scroll::-webkit-scrollbar {
		width: 8px;
		height: 8px;
	}

	.table-scroll::-webkit-scrollbar-track {
		background: var(--admin-bg-elevated);
	}

	.table-scroll::-webkit-scrollbar-thumb {
		background: var(--admin-border);
		border-radius: 4px;
	}

	.table-scroll::-webkit-scrollbar-thumb:hover {
		background: var(--admin-text-muted);
	}
</style>
