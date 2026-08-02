<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface TabItem {
		id: string;
		label: string;
		/** Leading icon snippet */
		icon?: Snippet;
		/** Trailing count badge */
		badge?: string | number;
		/** Links the tab to its panel for aria-controls */
		panelId?: string;
		disabled?: boolean;
	}

	export interface TabsProps {
		tabs?: TabItem[];
		/** Active tab id — bind it or drive it via onChange */
		value?: string;
		defaultValue?: string;
		onChange?: (id: string) => void;
		/** line slides an underline; pill floats a glass stadium behind the active tab */
		variant?: 'line' | 'pill';
		size?: 'default' | 'sm';
		/** Stretch tabs to fill the full width */
		fitted?: boolean;
		theme?: 'public' | 'admin';
		/** Additional CSS classes */
		class?: string;
		'aria-label'?: string;
	}
</script>

<script lang="ts">
	/**
	 * Tabs — horizontal section switcher with a sliding accent indicator. Two
	 * variants: line (underline that slides under the active tab, echoing the
	 * Header) and pill (a subtle glass stadium behind the active tab, matching
	 * ToggleGroup's thumb — colour stays reserved for the accent line). Bind
	 * value or handle onChange. Roving-tabindex keyboard support
	 * (Left/Right/Home/End) with full ARIA tab semantics.
	 *
	 * Usage:
	 *   <Tabs tabs={sections} bind:value />
	 *   <Tabs tabs={sections} variant="pill" size="sm" />
	 */
	let {
		tabs = [],
		defaultValue,
		value = $bindable(defaultValue ?? tabs[0]?.id),
		onChange,
		variant = 'line',
		size = 'default',
		fitted = false,
		theme = 'public',
		class: className = '',
		'aria-label': ariaLabel = 'Section tabs'
	}: TabsProps = $props();

	let listElement: HTMLElement | undefined = $state();
	const tabElements: Record<string, HTMLButtonElement> = {};
	let indicator = $state({ left: 0, width: 0, height: 0, top: 0, visible: false });
	let ready = $state(false);

	function select(id: string | undefined) {
		if (id === undefined) return;
		value = id;
		onChange?.(id);
	}

	function measure() {
		const el = value !== undefined ? tabElements[value] : undefined;
		if (!listElement || !el) {
			indicator = { ...indicator, visible: false };
			return;
		}
		const lr = listElement.getBoundingClientRect();
		const er = el.getBoundingClientRect();
		indicator = {
			left: er.left - lr.left,
			width: er.width,
			height: er.height,
			top: er.top - lr.top,
			visible: true
		};
	}

	// Re-measure on any input that moves the active tab; enable the slide
	// transition only after the first paint.
	$effect(() => {
		void value;
		void variant;
		void size;
		void tabs;
		measure();
		if (!ready) {
			const id = requestAnimationFrame(() => (ready = true));
			return () => cancelAnimationFrame(id);
		}
	});

	$effect(() => {
		let raf = 0;
		const onResize = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(measure);
		};
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			cancelAnimationFrame(raf);
		};
	});

	function handleKeydown(event: KeyboardEvent) {
		const enabled = tabs.filter((t) => !t.disabled);
		const idx = enabled.findIndex((t) => t.id === value);
		let next: TabItem | undefined;
		if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
			next = enabled[(idx + 1) % enabled.length];
		} else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
			next = enabled[(idx - 1 + enabled.length) % enabled.length];
		} else if (event.key === 'Home') {
			next = enabled[0];
		} else if (event.key === 'End') {
			next = enabled[enabled.length - 1];
		} else {
			return;
		}
		event.preventDefault();
		if (next) {
			select(next.id);
			tabElements[next.id]?.focus();
		}
	}
</script>

<div
	class="motif-tabs variant-{variant} size-{size} {className}"
	class:is-fitted={fitted}
	class:is-admin={theme === 'admin'}
>
	<!-- svelte-ignore a11y_interactive_supports_focus -- roving tabindex: focus
	     lives on the tab buttons (tabindex 0/-1); the list only receives their
	     bubbled keydown, so it must not be focusable itself. -->
	<div
		bind:this={listElement}
		class="motif-tabs-list"
		role="tablist"
		aria-label={ariaLabel}
		aria-orientation="horizontal"
		data-ready={ready ? '' : undefined}
		onkeydown={handleKeydown}
	>
		<span
			class="motif-tabs-indicator"
			class:is-visible={indicator.visible}
			style={variant === 'pill'
				? `left: ${indicator.left}px; width: ${indicator.width}px; top: ${indicator.top}px; height: ${indicator.height}px`
				: `left: ${indicator.left}px; width: ${indicator.width}px`}
			aria-hidden="true"
		></span>
		{#each tabs as tab (tab.id)}
			<button
				bind:this={tabElements[tab.id]}
				type="button"
				role="tab"
				id="tab-{tab.id}"
				aria-selected={tab.id === value}
				aria-controls={tab.panelId}
				tabindex={tab.id === value ? 0 : -1}
				disabled={tab.disabled}
				class="motif-tabs-tab"
				class:is-active={tab.id === value}
				onclick={() => select(tab.id)}
			>
				{#if tab.icon}<span class="motif-tabs-icon" aria-hidden="true">{@render tab.icon()}</span
					>{/if}
				<span class="motif-tabs-label">{tab.label}</span>
				{#if tab.badge != null}<span class="motif-tabs-badge">{tab.badge}</span>{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.motif-tabs {
		width: 100%;
	}

	.motif-tabs-list {
		position: relative;
		display: flex;
		align-items: stretch;
		gap: var(--space-1);
	}

	.motif-tabs.variant-line .motif-tabs-list {
		gap: var(--space-6);
		border-bottom: 1px solid var(--card-border);
	}

	.motif-tabs.variant-pill .motif-tabs-list {
		gap: var(--space-1);
		padding: var(--space-1);
		width: fit-content;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-pill);
	}

	.motif-tabs.is-fitted .motif-tabs-list {
		width: 100%;
	}

	.motif-tabs.is-fitted .motif-tabs-tab {
		flex: 1;
		justify-content: center;
	}

	.motif-tabs-tab {
		position: relative;
		z-index: 1;
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		background: transparent;
		border: none;
		cursor: pointer;
		white-space: nowrap;
		font-family: var(--font-body);
		font-weight: 600;
		color: var(--text-secondary);
		transition: color var(--transition-normal);
	}

	.motif-tabs-tab:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.motif-tabs-tab:hover:not(:disabled):not(.is-active) {
		color: var(--accent-secondary);
	}

	.motif-tabs-tab.is-active {
		color: var(--text-primary);
	}

	.motif-tabs.variant-pill .motif-tabs-tab {
		color: var(--text-muted);
	}

	.motif-tabs.variant-pill .motif-tabs-tab:hover:not(:disabled):not(.is-active) {
		color: var(--text-primary);
	}

	.motif-tabs.size-default .motif-tabs-tab {
		font-size: 0.9375rem;
	}

	.motif-tabs.size-sm .motif-tabs-tab {
		font-size: 0.8125rem;
	}

	.motif-tabs.variant-line.size-default .motif-tabs-tab {
		padding: var(--space-3) 0 calc(var(--space-3) + 1px);
	}

	.motif-tabs.variant-line.size-sm .motif-tabs-tab {
		padding: var(--space-2) 0 calc(var(--space-2) + 1px);
	}

	.motif-tabs.variant-pill.size-default .motif-tabs-tab {
		padding: var(--space-2) var(--space-5);
	}

	.motif-tabs.variant-pill.size-sm .motif-tabs-tab {
		padding: var(--space-1) var(--space-4);
	}

	.motif-tabs.variant-pill .motif-tabs-tab.is-active {
		color: var(--text-primary);
	}

	.motif-tabs-icon {
		display: inline-flex;
		align-items: center;
	}

	.motif-tabs-icon :global(svg) {
		width: 1em;
		height: 1em;
	}

	.motif-tabs-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.25rem;
		padding: 0 0.375rem;
		height: 1.25rem;
		border-radius: var(--radius-pill);
		background: var(--surface-hover-subtle);
		color: var(--text-muted);
		font-family: var(--font-mono);
		font-size: 0.625rem;
		font-weight: 600;
	}

	.motif-tabs-tab.is-active .motif-tabs-badge {
		background: var(--accent-bg-subtle);
		color: var(--accent);
	}

	.motif-tabs-indicator {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.motif-tabs.variant-line .motif-tabs-indicator {
		bottom: -1px;
		height: 3px;
		background: var(--accent);
	}

	.motif-tabs.variant-pill .motif-tabs-indicator {
		background: var(--card-border);
		border-radius: var(--radius-pill);
	}

	.motif-tabs-indicator.is-visible {
		opacity: 1;
	}

	.motif-tabs-list[data-ready] .motif-tabs-indicator {
		transition:
			left 0.28s cubic-bezier(0.4, 0, 0.2, 1),
			width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
			top 0.28s cubic-bezier(0.4, 0, 0.2, 1),
			height 0.28s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.2s ease;
	}

	.motif-tabs.is-admin .motif-tabs-tab.is-active {
		color: var(--admin-text);
	}

	.motif-tabs.is-admin.variant-line .motif-tabs-list {
		border-bottom-color: var(--admin-border);
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-tabs-list[data-ready] .motif-tabs-indicator {
			transition: opacity 0.2s ease;
		}
	}
</style>
