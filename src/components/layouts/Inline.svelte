<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { Gap, Align, Justify } from './types';

	export interface InlineProps {
		gap?: Gap;
		align?: Align;
		justify?: Justify;
		wrap?: boolean;
		class?: string;
		children: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * Inline — horizontal flexbox container for flowing content with consistent spacing.
	 *
	 * Usage:
	 *   <Inline gap="md" align="center">
	 *     <Tag>Svelte</Tag>
	 *     <Tag>TypeScript</Tag>
	 *     <Tag>Tailwind</Tag>
	 *   </Inline>
	 *
	 * Features:
	 * - Row direction with optional wrapping (default: wraps)
	 * - Same gap system as Stack and Grid (numeric 1-7 or semantic xs/sm/md/lg/xl/2xl)
	 * - Cross-axis alignment and main-axis distribution controls
	 * - No visual styling — layout only
	 */
	import { resolveGap } from './types';

	let {
		gap = 2,
		align = 'center',
		justify = 'start',
		wrap = true,
		class: className,
		children
	}: InlineProps = $props();

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
	class="inline {className ?? ''}"
	style:gap={gapValue}
	style:align-items={alignItems}
	style:justify-content={justifyContent}
	style:flex-wrap={wrap ? 'wrap' : 'nowrap'}
>
	{@render children()}
</div>

<style>
	.inline {
		display: flex;
		flex-direction: row;
	}
</style>
