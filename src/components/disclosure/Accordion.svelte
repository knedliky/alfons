<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface AccordionItem {
		id: string;
		title: string;
		/** Panel body — a string or a snippet for rich content */
		content: string | Snippet;
		disabled?: boolean;
	}

	export interface AccordionProps {
		items?: AccordionItem[];
		/** single keeps one panel open at a time; multiple allows several */
		type?: 'single' | 'multiple';
		/** Initially open id (or array of ids for multiple) */
		defaultOpen?: string | string[];
		/** Open id(s) — bind it or drive it via onOpenChange */
		open?: string | string[] | null;
		onOpenChange?: (open: string | string[] | null) => void;
		theme?: 'public' | 'admin';
		/** Additional CSS classes */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Accordion — stacked expand/collapse sections. Pass items ({ id, title,
	 * content, disabled }). type="single" (default) keeps one open at a time;
	 * type="multiple" allows several. Each header is a button with a rotating
	 * chevron; panels animate height via a grid row (0fr → 1fr), which is the
	 * CSS-only way to animate to auto height.
	 *
	 * Usage:
	 *   <Accordion items={faqs} defaultOpen="shipping" />
	 *   <Accordion items={faqs} type="multiple" bind:open />
	 */
	import Icon from '../atoms/Icon.svelte';

	let {
		items = [],
		type = 'single',
		defaultOpen,
		open = $bindable(defaultOpen ?? null),
		onOpenChange,
		theme = 'public',
		class: className = ''
	}: AccordionProps = $props();

	const openIds = $derived(open == null ? [] : Array.isArray(open) ? open : [open]);

	function toggle(id: string) {
		let next: string[];
		if (openIds.includes(id)) next = openIds.filter((x) => x !== id);
		else next = type === 'multiple' ? [...openIds, id] : [id];
		open = type === 'multiple' ? next : (next[0] ?? null);
		onOpenChange?.(open);
	}
</script>

<div class="motif-accordion {className}" class:is-admin={theme === 'admin'}>
	{#each items as item (item.id)}
		{@const isOpen = openIds.includes(item.id)}
		<div class="motif-accordion-item" class:is-open={isOpen}>
			<button
				type="button"
				class="motif-accordion-header"
				disabled={item.disabled}
				aria-expanded={isOpen}
				onclick={() => !item.disabled && toggle(item.id)}
			>
				<span class="motif-accordion-title">{item.title}</span>
				<span class="motif-accordion-chev" aria-hidden="true"><Icon name="chevron-down" size="sm" /></span>
			</button>
			<div class="motif-accordion-panel" role="region">
				<div class="motif-accordion-panel-inner">
					<div class="motif-accordion-panel-content">
						{#if typeof item.content === 'string'}
							<p>{item.content}</p>
						{:else}
							{@render item.content()}
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>

<style>
	.motif-accordion {
		width: 100%;
		border-top: 1px solid var(--card-border);
	}

	.motif-accordion-item {
		border-bottom: 1px solid var(--card-border);
	}

	.motif-accordion-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		width: 100%;
		padding: var(--space-4) 0;
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		font-family: var(--font-display);
		font-size: 1.0625rem;
		font-weight: 600;
		color: var(--text-primary);
		transition: color var(--transition-fast);
	}

	.motif-accordion-header:hover:not(:disabled) {
		color: var(--accent-secondary);
	}

	.motif-accordion-header:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	.motif-accordion-chev {
		display: inline-flex;
		color: var(--text-muted);
		transition: transform var(--transition-normal);
		flex-shrink: 0;
	}

	.motif-accordion-item.is-open .motif-accordion-chev {
		transform: rotate(180deg);
	}

	.motif-accordion-panel {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows 0.34s cubic-bezier(0.33, 1, 0.68, 1);
		will-change: grid-template-rows;
	}

	.motif-accordion-item.is-open .motif-accordion-panel {
		grid-template-rows: 1fr;
	}

	.motif-accordion-panel-inner {
		overflow: hidden;
		min-height: 0;
		padding-bottom: 0;
		transition: padding-bottom 0.34s cubic-bezier(0.33, 1, 0.68, 1);
	}

	.motif-accordion-item.is-open .motif-accordion-panel-inner {
		padding-bottom: var(--space-4);
	}

	.motif-accordion-panel-content {
		opacity: 0;
		transition: opacity 0.2s ease;
	}

	.motif-accordion-item.is-open .motif-accordion-panel-content {
		opacity: 1;
		transition: opacity 0.28s ease 0.1s;
	}

	.motif-accordion-panel-content > :global(*) {
		font-family: var(--font-body);
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--text-secondary);
		margin: 0;
	}

	.motif-accordion.is-admin {
		border-top-color: var(--admin-border);
	}

	.motif-accordion.is-admin .motif-accordion-item {
		border-bottom-color: var(--admin-border);
	}

	.motif-accordion.is-admin .motif-accordion-header {
		color: var(--admin-text);
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-accordion-panel,
		.motif-accordion-panel-inner,
		.motif-accordion-panel-content,
		.motif-accordion-chev {
			transition: none;
		}
	}
</style>
