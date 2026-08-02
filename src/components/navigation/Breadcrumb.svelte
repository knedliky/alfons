<script lang="ts" module>
	export interface BreadcrumbItem {
		/** Display text for this breadcrumb segment */
		label: string;
		/** URL to navigate to — omit for the current (last) item */
		href?: string;
	}

	export interface BreadcrumbProps {
		/** Ordered list of breadcrumb segments from root to current page */
		items: BreadcrumbItem[];
		/** Additional CSS class names */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Breadcrumb — navigation trail with SEO structured data.
	 *
	 * Usage:
	 *   <Breadcrumb items={[
	 *     { label: 'Home', href: '/' },
	 *     { label: 'Blog', href: '/blog' },
	 *     { label: 'Current Post' }
	 *   ]} />
	 *
	 * Features:
	 * - Semantic `<nav>` with `aria-label="Breadcrumb"` for accessibility
	 * - Ordered list (`<ol>`) for correct document outline
	 * - Inactive links use `--text-muted` with hover transition to `--text-primary`
	 * - Current item (last, no href) uses `--text-primary` and `aria-current="page"`
	 * - Chevron-right separators via the Icon atom
	 * - JSON-LD BreadcrumbList structured data for SEO
	 */
	import { Icon } from '../atoms/index.js';

	let { items, class: className }: BreadcrumbProps = $props();

	/** Build the JSON-LD structured data object for search engine consumption */
	const structuredData = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: items.map((item, index) => ({
				'@type': 'ListItem',
				position: index + 1,
				name: item.label,
				...(item.href ? { item: item.href } : {})
			}))
		})
	);

	/** Check whether a given item is the last (current) segment */
	function isCurrentItem(index: number): boolean {
		return index === items.length - 1;
	}
</script>

<svelte:head>
	<!--
		JSON-LD structured data for search engines, which has no expression form
		other than @html. structuredData is JSON.stringify of the items prop, not
		user-authored markup, so there is no injection surface. Kept as a targeted
		exception rather than downgrading the rule, so any other {@html} added to
		this library still fails the build.
	-->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html `<${'script'} type="application/ld+json">${structuredData}</${'script'}>`}
</svelte:head>

<nav aria-label="Breadcrumb" class="breadcrumb {className ?? ''}">
	<ol class="breadcrumb-list">
		{#each items as item, index (item.href ?? item.label)}
			<li class="breadcrumb-item">
				{#if !isCurrentItem(index) && item.href}
					<a href={item.href} class="breadcrumb-link">{item.label}</a>
				{:else}
					<span class="breadcrumb-current" aria-current="page">{item.label}</span>
				{/if}

				{#if !isCurrentItem(index)}
					<span class="breadcrumb-separator" aria-hidden="true">
						<Icon name="chevron-right" size="sm" />
					</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.breadcrumb-list {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		list-style: none;
		margin: 0;
		padding: 0;
		gap: var(--space-1);
	}

	.breadcrumb-item {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.breadcrumb-link {
		color: var(--text-muted);
		text-decoration: none;
		font-size: 0.875rem;
		transition: color var(--transition-normal);
	}

	.breadcrumb-link:hover {
		color: var(--text-primary);
	}

	.breadcrumb-current {
		color: var(--text-primary);
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* Separator inherits muted colour for visual subtlety */
	.breadcrumb-separator {
		display: flex;
		align-items: center;
		color: var(--text-muted);
	}
</style>
