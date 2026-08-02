<script lang="ts" module>
	export interface PaginationProps {
		/** Current page (1-based) — bind it or drive it via onPageChange */
		page?: number;
		pageCount?: number;
		onPageChange?: (page: number) => void;
		/** Pages shown either side of the current page */
		siblingCount?: number;
		/** Pages pinned at each end */
		boundaryCount?: number;
		showPrevNext?: boolean;
		/** Summary text on the left (e.g. "1–20 of 143") */
		summary?: string;
		size?: 'sm' | 'default';
		theme?: 'public' | 'admin';
		/** Additional CSS classes */
		class?: string;
		'aria-label'?: string;
	}

	/** Build the page list with ellipses given the current page and bounds. */
	function buildPages(
		page: number,
		pageCount: number,
		siblingCount: number,
		boundaryCount: number
	): (number | 'left-dots' | 'right-dots')[] {
		const range = (s: number, e: number) => Array.from({ length: e - s + 1 }, (_, i) => s + i);
		const totalNumbers = siblingCount * 2 + 3 + boundaryCount * 2;
		if (pageCount <= totalNumbers) return range(1, pageCount);

		const leftSibling = Math.max(page - siblingCount, boundaryCount + 2);
		const rightSibling = Math.min(page + siblingCount, pageCount - boundaryCount - 1);
		const showLeftDots = leftSibling > boundaryCount + 2;
		const showRightDots = rightSibling < pageCount - boundaryCount - 1;

		const pages: (number | 'left-dots' | 'right-dots')[] = [...range(1, boundaryCount)];
		if (showLeftDots) pages.push('left-dots');
		else pages.push(...range(boundaryCount + 1, leftSibling - 1));
		pages.push(...range(leftSibling, rightSibling));
		if (showRightDots) pages.push('right-dots');
		else pages.push(...range(rightSibling + 1, pageCount - boundaryCount));
		pages.push(...range(pageCount - boundaryCount + 1, pageCount));
		return pages;
	}
</script>

<script lang="ts">
	/**
	 * Pagination — mono page navigator for DataTable and any paged list. Renders
	 * first/last boundary pages, a sibling window around the current page, and
	 * collapses the gaps to ellipses. Previous / Next stroke arrows clamp at the
	 * ends. Bind page or handle onPageChange.
	 *
	 * Usage:
	 *   <Pagination bind:page pageCount={12} summary="1–20 of 234" />
	 */
	let {
		page = $bindable(1),
		pageCount = 1,
		onPageChange,
		siblingCount = 1,
		boundaryCount = 1,
		showPrevNext = true,
		summary,
		size = 'default',
		theme = 'public',
		class: className = '',
		'aria-label': ariaLabel = 'Pagination'
	}: PaginationProps = $props();

	const pages = $derived(buildPages(page, Math.max(pageCount, 1), siblingCount, boundaryCount));

	function go(next: number) {
		if (next >= 1 && next <= pageCount && next !== page) {
			page = next;
			onPageChange?.(next);
		}
	}
</script>

{#if pageCount > 1 || summary}
	<nav
		class="motif-pg size-{size} {className}"
		class:is-admin={theme === 'admin'}
		aria-label={ariaLabel}
	>
		{#if summary}<span class="motif-pg-summary">{summary}</span>{/if}
		<ul class="motif-pg-list">
			{#if showPrevNext}
				<li>
					<button
						type="button"
						class="motif-pg-btn motif-pg-arrow"
						onclick={() => go(page - 1)}
						disabled={page <= 1}
						aria-label="Previous page"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg
						>
					</button>
				</li>
			{/if}
			{#each pages as p, i (typeof p === 'number' ? `p${p}` : `${p}-${i}`)}
				<li>
					{#if typeof p === 'number'}
						<button
							type="button"
							class="motif-pg-btn"
							class:is-active={p === page}
							onclick={() => go(p)}
							aria-label="Page {p}"
							aria-current={p === page ? 'page' : undefined}
						>
							{p}
						</button>
					{:else}
						<span class="motif-pg-dots" aria-hidden="true">…</span>
					{/if}
				</li>
			{/each}
			{#if showPrevNext}
				<li>
					<button
						type="button"
						class="motif-pg-btn motif-pg-arrow"
						onclick={() => go(page + 1)}
						disabled={page >= pageCount}
						aria-label="Next page"
					>
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg
						>
					</button>
				</li>
			{/if}
		</ul>
	</nav>
{/if}

<style>
	.motif-pg {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.motif-pg-summary {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		letter-spacing: 0.03em;
		color: var(--text-muted);
	}

	/* Mobile-first: the list wraps under the summary; from 540px it floats right. */
	.motif-pg-list {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		list-style: none;
		margin: 0;
		padding: 0;
	}

	@media (min-width: 540px) {
		.motif-pg-list {
			margin-left: auto;
		}
	}

	.motif-pg-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2.25rem;
		height: 2.25rem;
		padding: 0 var(--space-2);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-pill);
		font-family: var(--font-mono);
		font-size: 0.8125rem;
		font-weight: 600;
		color: var(--text-secondary);
		cursor: pointer;
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.motif-pg.size-sm .motif-pg-btn {
		min-width: 1.875rem;
		height: 1.875rem;
		font-size: 0.75rem;
	}

	.motif-pg-btn:hover:not(:disabled):not(.is-active) {
		background: var(--surface-hover-subtle);
		color: var(--text-primary);
	}

	.motif-pg-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.motif-pg-btn.is-active {
		background: var(--accent);
		border-color: var(--accent);
		/* White in both modes — must stay legible on the accent fill. */
		color: oklch(1 0 0);
	}

	.motif-pg-arrow {
		color: var(--text-muted);
	}

	.motif-pg-dots {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 2rem;
		height: 2.25rem;
		font-family: var(--font-mono);
		color: var(--text-muted);
	}

	.motif-pg.is-admin .motif-pg-btn {
		color: var(--admin-text-secondary);
	}

	.motif-pg.is-admin .motif-pg-btn.is-active {
		background: var(--admin-accent, var(--accent));
		border-color: var(--admin-accent, var(--accent));
		color: oklch(1 0 0);
	}
</style>
