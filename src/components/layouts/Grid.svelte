<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { Gap, Align, Justify } from './types';

	export interface ResponsiveColumns {
		base: number;
		sm?: number;
		md?: number;
		lg?: number;
		xl?: number;
	}

	export interface GridProps {
		columns?: number | ResponsiveColumns;
		gap?: Gap;
		align?: Align;
		justify?: Justify;
		class?: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * Grid — responsive CSS Grid container for multi-column layouts.
	 *
	 * Usage:
	 *   <Grid columns={3} gap="xl">
	 *     <Card>One</Card>
	 *     <Card>Two</Card>
	 *     <Card>Three</Card>
	 *   </Grid>
	 *
	 *   <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={4}>
	 *     {#each items as item}<Card>{item}</Card>{/each}
	 *   </Grid>
	 *
	 * Features:
	 * - Simple number for fixed columns, or breakpoint object for responsive
	 * - Same gap system as Stack (numeric 1-7 or semantic xs/sm/md/lg/xl/2xl)
	 * - Pre-generated responsive breakpoint classes for 1-6 columns
	 * - Alignment and justification controls
	 */
	import { resolveGap } from './types';

	let {
		columns = 1,
		gap = 3,
		align = 'stretch',
		justify = 'start',
		class: className,
		children
	}: GridProps = $props();

	const gapValue = $derived(resolveGap(gap));

	/* Build the CSS class list from the columns prop */
	const gridClasses = $derived.by(() => {
		const classes = ['grid'];

		if (typeof columns === 'number') {
			classes.push(`grid-base-${columns}`);
		} else {
			classes.push(`grid-base-${columns.base}`);
			if (columns.sm) classes.push(`grid-sm-${columns.sm}`);
			if (columns.md) classes.push(`grid-md-${columns.md}`);
			if (columns.lg) classes.push(`grid-lg-${columns.lg}`);
			if (columns.xl) classes.push(`grid-xl-${columns.xl}`);
		}

		if (className) classes.push(className);
		return classes.join(' ');
	});

	const alignItems = $derived(
		{
			start: 'start',
			center: 'center',
			end: 'end',
			stretch: 'stretch'
		}[align]
	);

	const justifyItems = $derived(
		{
			start: 'start',
			center: 'center',
			end: 'end',
			between: 'start',
			around: 'center'
		}[justify]
	);
</script>

<div
	class={gridClasses}
	style:gap={gapValue}
	style:align-items={alignItems}
	style:justify-items={justifyItems}
>
	{@render children()}
</div>

<style>
	.grid {
		display: grid;
		width: 100%;
	}

	/* Base column counts (mobile-first) — generated for 1-6 columns */
	.grid-base-1 {
		grid-template-columns: repeat(1, 1fr);
	}
	.grid-base-2 {
		grid-template-columns: repeat(2, 1fr);
	}
	.grid-base-3 {
		grid-template-columns: repeat(3, 1fr);
	}
	.grid-base-4 {
		grid-template-columns: repeat(4, 1fr);
	}
	.grid-base-5 {
		grid-template-columns: repeat(5, 1fr);
	}
	.grid-base-6 {
		grid-template-columns: repeat(6, 1fr);
	}

	/* sm breakpoint (640px) */
	@media (min-width: 640px) {
		.grid-sm-1 {
			grid-template-columns: repeat(1, 1fr);
		}
		.grid-sm-2 {
			grid-template-columns: repeat(2, 1fr);
		}
		.grid-sm-3 {
			grid-template-columns: repeat(3, 1fr);
		}
		.grid-sm-4 {
			grid-template-columns: repeat(4, 1fr);
		}
		.grid-sm-5 {
			grid-template-columns: repeat(5, 1fr);
		}
		.grid-sm-6 {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	/* md breakpoint (768px) */
	@media (min-width: 768px) {
		.grid-md-1 {
			grid-template-columns: repeat(1, 1fr);
		}
		.grid-md-2 {
			grid-template-columns: repeat(2, 1fr);
		}
		.grid-md-3 {
			grid-template-columns: repeat(3, 1fr);
		}
		.grid-md-4 {
			grid-template-columns: repeat(4, 1fr);
		}
		.grid-md-5 {
			grid-template-columns: repeat(5, 1fr);
		}
		.grid-md-6 {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	/* lg breakpoint (1024px) */
	@media (min-width: 1024px) {
		.grid-lg-1 {
			grid-template-columns: repeat(1, 1fr);
		}
		.grid-lg-2 {
			grid-template-columns: repeat(2, 1fr);
		}
		.grid-lg-3 {
			grid-template-columns: repeat(3, 1fr);
		}
		.grid-lg-4 {
			grid-template-columns: repeat(4, 1fr);
		}
		.grid-lg-5 {
			grid-template-columns: repeat(5, 1fr);
		}
		.grid-lg-6 {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	/* xl breakpoint (1280px) */
	@media (min-width: 1280px) {
		.grid-xl-1 {
			grid-template-columns: repeat(1, 1fr);
		}
		.grid-xl-2 {
			grid-template-columns: repeat(2, 1fr);
		}
		.grid-xl-3 {
			grid-template-columns: repeat(3, 1fr);
		}
		.grid-xl-4 {
			grid-template-columns: repeat(4, 1fr);
		}
		.grid-xl-5 {
			grid-template-columns: repeat(5, 1fr);
		}
		.grid-xl-6 {
			grid-template-columns: repeat(6, 1fr);
		}
	}
</style>
