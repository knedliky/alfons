<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { Gap } from './types';

	type AsidePosition = 'left' | 'right';

	export interface MainLayoutProps {
		asideWidth?: string;
		gap?: Gap;
		stickyTop?: string;
		asidePosition?: AsidePosition;
		aside: Snippet;
		main: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * MainLayout — two-column layout with a sticky aside and scrolling main content.
	 *
	 * Usage:
	 *   <MainLayout asideWidth="18rem" gap="xl">
	 *     {#snippet aside()}<TableOfContents />{/snippet}
	 *     {#snippet main()}<ArticleBody />{/snippet}
	 *   </MainLayout>
	 *
	 * Features:
	 * - Aside sticks to viewport top while main scrolls with the page
	 * - Aside can be positioned left or right without changing DOM order (preserves screen reader order)
	 * - Stacks vertically on mobile (aside always appears first)
	 * - Gap supports numeric (1-7) and semantic (xs/sm/md/lg/xl/2xl) values
	 */
	import { resolveGap } from './types';

	let {
		asideWidth = '20rem',
		gap = '2xl',
		stickyTop = 'var(--space-8)',
		asidePosition = 'left',
		aside,
		main
	}: MainLayoutProps = $props();

	const gapValue = $derived(resolveGap(gap));

	/* CSS order property lets the aside appear on either side without changing DOM order */
	const asideOrder = $derived(asidePosition === 'left' ? 1 : 2);
	const mainOrder = $derived(asidePosition === 'left' ? 2 : 1);
</script>

<div class="main-layout" style:gap={gapValue}>
	<aside
		class="main-layout__aside"
		style:width={asideWidth}
		style:flex-basis={asideWidth}
		style:top={stickyTop}
		style:order={asideOrder}
	>
		{@render aside()}
	</aside>

	<main class="main-layout__main" style:order={mainOrder}>
		{@render main()}
	</main>
</div>

<style>
	.main-layout {
		display: flex;
		width: 100%;
		align-items: flex-start;
	}

	.main-layout__aside {
		position: sticky;
		/* align-self: flex-start is required — without it the flex child stretches to full container height,
		   which prevents sticky from taking effect */
		align-self: flex-start;
		flex-shrink: 0;
	}

	.main-layout__main {
		/* flex: 1 lets main consume all remaining width after aside takes its fixed width */
		flex: 1;
		min-width: 0; /* Prevents overflow from long unbreakable content */
	}

	@media (max-width: 767px) {
		.main-layout {
			flex-direction: column;
		}

		.main-layout__aside {
			position: static;
			width: 100%;
			flex-basis: auto;
			/* Always appears first on mobile regardless of asidePosition prop */
			order: 1;
		}

		.main-layout__main {
			order: 2;
		}
	}
</style>
