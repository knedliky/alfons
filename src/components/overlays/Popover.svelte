<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface PopoverProps {
		/** The trigger element (usually a Button) */
		trigger: Snippet;
		/** Panel content */
		children?: Snippet;
		/** Open state — bind it or drive it via onOpenChange */
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		/** Panel alignment relative to the trigger */
		align?: 'start' | 'end';
		/** Fixed panel width (CSS length) */
		width?: string;
		theme?: 'public' | 'admin';
		/** Additional CSS classes */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Popover — an anchored floating panel with arbitrary content (richer than
	 * a Tooltip, which is hover-only text). Click the trigger to toggle; closes
	 * on outside-click or Escape. Floats on the L3 layer via a portal. Bind
	 * open for controlled use.
	 *
	 * Usage:
	 *   <Popover>
	 *     {#snippet trigger()}<Button variant="ghost">Details</Button>{/snippet}
	 *     <p>Any content.</p>
	 *   </Popover>
	 */
	let {
		trigger,
		children,
		open = $bindable(false),
		onOpenChange,
		align = 'start',
		width,
		theme = 'public',
		class: className = ''
	}: PopoverProps = $props();

	let coords = $state<{ top: number; left: number; right: number } | null>(null);
	let triggerElement: HTMLElement | undefined = $state();
	let panelElement: HTMLElement | undefined = $state();

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
		coords = { top: r.bottom + 8, left: r.left, right: window.innerWidth - r.right };
	}

	function setOpen(next: boolean) {
		open = next;
		onOpenChange?.(next);
	}

	$effect(() => {
		if (open) place();
	});

	$effect(() => {
		if (!open) return;
		const onDoc = (e: MouseEvent) => {
			const target = e.target as Node;
			if (triggerElement?.contains(target) || panelElement?.contains(target)) return;
			setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setOpen(false);
				triggerElement?.focus();
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
	class="motif-popover-trigger"
	onclick={() => setOpen(!open)}
	aria-haspopup="dialog"
	aria-expanded={open}
>
	{@render trigger()}
</span>

{#if open && coords}
	<div
		bind:this={panelElement}
		use:portalToBody
		class="motif-popover {className}"
		class:is-admin={theme === 'admin'}
		role="dialog"
		style="position: fixed; top: {coords.top}px;{width ? ` width: ${width};` : ''} {align === 'end'
			? `right: ${coords.right}px`
			: `left: ${coords.left}px`}"
	>
		{@render children?.()}
	</div>
{/if}

<style>
	.motif-popover {
		z-index: var(--z-modal, 1000);
		min-width: 12rem;
		max-width: min(22rem, calc(100vw - 2rem));
		padding: var(--space-4);
		border-radius: 0;
		background: var(--elevation-3-bg, var(--bg-glass-solid));
		border: 1px solid var(--card-border);
		border-top-color: var(--el-edge-light);
		border-left-color: var(--el-edge-light);
		border-right-color: var(--el-edge-shade);
		border-bottom-color: var(--el-edge-shade);
		box-shadow: var(--shadow-popover);
		backdrop-filter: blur(var(--surface-float-frost));
		-webkit-backdrop-filter: blur(var(--surface-float-frost));
		font-family: var(--font-body);
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--text-secondary);
		animation: motif-popover-in 0.14s ease;
	}

	@keyframes motif-popover-in {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.motif-popover-trigger {
		display: inline-flex;
	}

	.motif-popover.is-admin {
		background: var(--admin-bg-elevated);
		border: 1px solid var(--admin-border);
		color: var(--admin-text-secondary);
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-popover {
			animation: none;
		}
	}
</style>
