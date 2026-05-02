<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { Gap, Align, Justify } from './types';

	type Direction = 'vertical' | 'horizontal';

	export interface StackProps {
		direction?: Direction;
		gap?: Gap;
		align?: Align;
		justify?: Justify;
		class?: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * Stack — flexbox container for arranging children with consistent spacing.
	 *
	 * Usage:
	 *   <Stack direction="vertical" gap={3}>
	 *     <Card>First</Card>
	 *     <Card>Second</Card>
	 *   </Stack>
	 *
	 *   <Stack gap="lg" align="center">
	 *     <Card>Semantic gap</Card>
	 *   </Stack>
	 *
	 * Features:
	 * - Vertical (column) or horizontal (row) direction
	 * - Gap sizes: numeric (1-7) mapped to --space-N, or semantic (xs/sm/md/lg/xl/2xl)
	 * - Cross-axis alignment and main-axis distribution controls
	 * - No visual styling — layout only
	 */
	import { resolveGap } from './types';

	let {
		direction = 'vertical',
		gap = 3,
		align = 'stretch',
		justify = 'start',
		class: className,
		children
	}: StackProps = $props();

	const flexDirection = $derived(direction === 'vertical' ? 'column' : 'row');
	const gapValue = $derived(resolveGap(gap));

	const alignItems = $derived(
		{
			start: 'flex-start',
			center: 'center',
			end: 'flex-end',
			stretch: 'stretch'
		}[align]
	);

	const justifyContent = $derived(
		{
			start: 'flex-start',
			center: 'center',
			end: 'flex-end',
			between: 'space-between',
			around: 'space-around'
		}[justify]
	);
</script>

<div
	class="stack {className ?? ''}"
	style:flex-direction={flexDirection}
	style:gap={gapValue}
	style:align-items={alignItems}
	style:justify-content={justifyContent}
>
	{@render children()}
</div>

<style>
	.stack {
		display: flex;
	}
</style>
