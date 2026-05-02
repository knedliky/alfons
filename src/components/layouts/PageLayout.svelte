<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface PageLayoutProps {
		/** Optional header chrome — consuming app passes its own Header component */
		header?: Snippet;
		/** Optional footer chrome — consuming app passes its own Footer component */
		footer?: Snippet;
		class?: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * PageLayout — full-page shell with optional header, main content, and footer.
	 *
	 * Usage:
	 *   <PageLayout>
	 *     {#snippet header()}<Header settings={data.settings} />{/snippet}
	 *     {#snippet footer()}<Footer settings={data.settings} />{/snippet}
	 *     <HeroSection />
	 *     <ContentSection />
	 *   </PageLayout>
	 *
	 * Features:
	 * - Convenience wrapper around PageFrame for public pages
	 * - Header and footer are optional snippet props — the consuming app provides its own chrome
	 * - Omitting header/footer renders without chrome (useful for embedded/iframe scenarios)
	 * - Transparent background to expose background effects (e.g. sticky chart backgrounds)
	 */
	import PageFrame from './PageFrame.svelte';

	let { header, footer, class: className, children }: PageLayoutProps = $props();
</script>

<PageFrame class="page-layout {className ?? ''}" {header} {footer}>
	{@render children()}
</PageFrame>

<style>
	/* Public-theme styling passed through PageFrame's class prop */
	:global(.page-layout) {
		/* Transparent so background effects show through */
		background-color: transparent;
		color: var(--text-primary);
		transition: var(--colour-mode-transition);
	}
</style>
