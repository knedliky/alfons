<script lang="ts" module>
	import type { ThemeVariant } from '../../contexts/theme';
	import type { Snippet } from 'svelte';

	export interface PageFrameProps {
		children: Snippet;
		header?: Snippet;
		footer?: Snippet;
		sidebar?: Snippet;
		sidebarWidth?: number;
		theme?: ThemeVariant;
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * PageFrame — unified layout shell for both public and admin contexts.
	 *
	 * Usage (public):
	 *   <PageFrame>
	 *     {#snippet header()}<Header />{/snippet}
	 *     {#snippet footer()}<Footer />{/snippet}
	 *     <main>Page content</main>
	 *   </PageFrame>
	 *
	 * Usage (admin with sidebar):
	 *   <PageFrame sidebar={sidebarSnippet} sidebarWidth={280} theme="admin">
	 *     <main>Admin content</main>
	 *   </PageFrame>
	 *
	 * Features:
	 * - No sidebar: flex column (header > main > footer) — mirrors PageLayout
	 * - With sidebar: CSS Grid (sidebarWidth | 1fr) — mirrors admin layout
	 * - Stateless: sidebar collapse/expand state stays in consuming layout
	 * - Optional theme context creation via theme prop
	 * - Header and footer are optional snippet props — omit for embedded/iframe scenarios
	 * - Grid column transition for smooth sidebar resize
	 */
	import { untrack } from 'svelte';
	import { createThemeContext } from '../../contexts/theme';

	let {
		children,
		header,
		footer,
		sidebar,
		sidebarWidth = 280,
		theme,
		class: className
	}: PageFrameProps = $props();

	const hasSidebar = $derived(sidebar !== undefined);

	// setContext must run synchronously during init — intentionally captures initial value
	const initialTheme = untrack(() => theme);
	if (initialTheme) {
		createThemeContext(initialTheme);
	}
</script>

{#if hasSidebar}
	<!-- Sidebar mode: CSS Grid layout -->
	<div
		class="page-frame page-frame--sidebar {className ?? ''}"
		style="--frame-sidebar-width: {sidebarWidth}px"
	>
		<aside class="page-frame__sidebar">
			{@render sidebar?.()}
		</aside>
		<div class="page-frame__body">
			{#if header}
				<header class="page-frame__header">
					{@render header()}
				</header>
			{/if}
			<main class="page-frame__main">
				{@render children()}
			</main>
			{#if footer}
				<footer class="page-frame__footer">
					{@render footer()}
				</footer>
			{/if}
		</div>
	</div>
{:else}
	<!-- No sidebar: flex column layout -->
	<div class="page-frame page-frame--column {className ?? ''}">
		{#if header}
			<header class="page-frame__header">
				{@render header()}
			</header>
		{/if}
		<main class="page-frame__main">
			{@render children()}
		</main>
		{#if footer}
			<footer class="page-frame__footer">
				{@render footer()}
			</footer>
		{/if}
	</div>
{/if}

<style>
	/* Column mode — public pages (header > main > footer) */
	.page-frame--column {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		position: relative;
		z-index: var(--z-raised);
	}

	/* Sidebar mode — admin pages (sidebar | body) */
	.page-frame--sidebar {
		display: grid;
		grid-template-columns: var(--frame-sidebar-width) 1fr;
		height: 100vh;
		transition: grid-template-columns 300ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	.page-frame__sidebar {
		overflow-y: auto;
	}

	/* Body column inside sidebar mode — stacks header/main/footer vertically */
	.page-frame__body {
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		scroll-behavior: smooth;
		min-height: 0;
	}

	.page-frame__main {
		flex: 1;
		position: relative;
	}
</style>
