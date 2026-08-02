<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface MenuItem {
		label: string;
		/** Leading icon snippet */
		icon?: Snippet;
		onSelect?: () => void;
		/** Renders in the error colour */
		danger?: boolean;
		disabled?: boolean;
		/** Trailing keyboard shortcut hint */
		shortcut?: string;
	}

	export type MenuEntry = MenuItem | 'separator';

	export interface MenuProps {
		/** The trigger element (usually a Button) */
		trigger: Snippet;
		items?: MenuEntry[];
		/** Panel alignment relative to the trigger */
		align?: 'start' | 'end';
		theme?: 'public' | 'admin';
		/** Additional CSS classes */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Menu — a dropdown action menu anchored to a trigger. Pass the trigger
	 * snippet and an items array (each { label, icon, onSelect, danger,
	 * disabled, shortcut }, or the string 'separator'). Opens on click, closes
	 * on outside-click, Escape or selection; arrow keys move the highlight.
	 * Floats on the L3 layer with a portal so it escapes overflow.
	 *
	 * Usage:
	 *   <Menu items={actions}>
	 *     {#snippet trigger()}<Button variant="ghost">Actions</Button>{/snippet}
	 *   </Menu>
	 */
	let {
		trigger,
		items = [],
		align = 'start',
		theme = 'public',
		class: className = ''
	}: MenuProps = $props();

	let open = $state(false);
	let coords = $state<{ top: number; left: number } | null>(null);
	let active = $state(-1);
	let triggerElement: HTMLElement | undefined = $state();
	let listElement: HTMLElement | undefined = $state();

	const enabledIndexes = $derived(
		items.map((it, i) => (it !== 'separator' && !it.disabled ? i : -1)).filter((i) => i >= 0)
	);

	function portalToBody(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	function place() {
		if (!triggerElement) return;
		const r = triggerElement.getBoundingClientRect();
		coords = { top: r.bottom + 6, left: align === 'end' ? r.right : r.left };
	}

	function openMenu() {
		place();
		open = true;
		active = -1;
	}

	function close() {
		open = false;
		active = -1;
	}

	function selectItem(item: MenuEntry) {
		if (item === 'separator' || item.disabled) return;
		close();
		triggerElement?.focus();
		item.onSelect?.();
	}

	// Outside-click, Escape/arrow keys, and reposition-on-scroll are document
	// level concerns that only exist while the menu is open.
	$effect(() => {
		if (!open) return;
		const onDoc = (e: MouseEvent) => {
			const target = e.target as Node;
			if (triggerElement?.contains(target) || listElement?.contains(target)) return;
			close();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				close();
				triggerElement?.focus();
			} else if (e.key === 'ArrowDown') {
				e.preventDefault();
				const pos = enabledIndexes.indexOf(active);
				active = enabledIndexes[Math.min(pos + 1, enabledIndexes.length - 1)] ?? enabledIndexes[0];
			} else if (e.key === 'ArrowUp') {
				e.preventDefault();
				const pos = enabledIndexes.indexOf(active);
				active = enabledIndexes[Math.max(pos - 1, 0)] ?? enabledIndexes[enabledIndexes.length - 1];
			} else if (e.key === 'Enter' && active >= 0) {
				e.preventDefault();
				selectItem(items[active]);
			}
		};
		const onMove = () => place();
		document.addEventListener('mousedown', onDoc);
		document.addEventListener('keydown', onKey);
		window.addEventListener('resize', onMove);
		window.addEventListener('scroll', onMove, true);
		return () => {
			document.removeEventListener('mousedown', onDoc);
			document.removeEventListener('keydown', onKey);
			window.removeEventListener('resize', onMove);
			window.removeEventListener('scroll', onMove, true);
		};
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions --
     the wrapper relays clicks from the interactive trigger inside it (a Button),
     which already provides the keyboard path — Enter fires a click that bubbles. -->
<span
	bind:this={triggerElement}
	class="motif-menu-trigger"
	onclick={() => (open ? close() : openMenu())}
	aria-haspopup="menu"
	aria-expanded={open}
>
	{@render trigger()}
</span>

{#if open && coords}
	<div
		bind:this={listElement}
		use:portalToBody
		class="motif-menu {className}"
		class:is-admin={theme === 'admin'}
		role="menu"
		style="position: fixed; top: {coords.top}px; {align === 'end'
			? `right: ${window.innerWidth - coords.left}px`
			: `left: ${coords.left}px`}"
	>
		{#each items as item, i (i)}
			{#if item === 'separator'}
				<div class="motif-menu-sep" role="separator"></div>
			{:else}
				<button
					type="button"
					role="menuitem"
					disabled={item.disabled}
					class="motif-menu-item"
					class:is-danger={item.danger}
					class:is-active={i === active}
					onclick={() => selectItem(item)}
					onmouseenter={() => (active = i)}
				>
					{#if item.icon}<span class="motif-menu-icon" aria-hidden="true"
							>{@render item.icon()}</span
						>{/if}
					<span class="motif-menu-label">{item.label}</span>
					{#if item.shortcut}<span class="motif-menu-shortcut">{item.shortcut}</span>{/if}
				</button>
			{/if}
		{/each}
	</div>
{/if}

<style>
	.motif-menu {
		z-index: var(--z-modal, 1000);
		min-width: 11rem;
		max-width: 18rem;
		padding: var(--space-1);
		background: var(--elevation-3-bg, var(--bg-glass-solid));
		border: 1px solid var(--card-border);
		border-top-color: var(--el-edge-light);
		border-left-color: var(--el-edge-light);
		border-right-color: var(--el-edge-shade);
		border-bottom-color: var(--el-edge-shade);
		box-shadow: var(--shadow-dropdown);
		backdrop-filter: blur(var(--surface-float-frost));
		-webkit-backdrop-filter: blur(var(--surface-float-frost));
		animation: motif-menu-in 0.12s ease;
	}

	@keyframes motif-menu-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.motif-menu-trigger {
		display: inline-flex;
	}

	.motif-menu-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		border-radius: 0;
		font-family: var(--font-body);
		font-size: 0.875rem;
		color: var(--text-primary);
		transition: background-color var(--transition-fast);
	}

	.motif-menu-item:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.motif-menu-item.is-active:not(:disabled) {
		background: var(--surface-hover-subtle);
	}

	.motif-menu-item.is-danger {
		color: var(--colour-error);
	}

	.motif-menu-icon {
		display: inline-flex;
		color: var(--text-muted);
	}

	.motif-menu-item.is-danger .motif-menu-icon {
		color: var(--colour-error);
	}

	.motif-menu-icon :global(svg) {
		width: 16px;
		height: 16px;
	}

	.motif-menu-label {
		flex: 1;
	}

	.motif-menu-shortcut {
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		color: var(--text-muted);
	}

	.motif-menu-sep {
		height: 1px;
		margin: var(--space-1) 0;
		background: var(--card-border);
	}

	.motif-menu.is-admin {
		background: var(--admin-bg-elevated);
		border: 1px solid var(--admin-border);
	}

	.motif-menu.is-admin .motif-menu-item {
		color: var(--admin-text);
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-menu {
			animation: none;
		}
	}
</style>
