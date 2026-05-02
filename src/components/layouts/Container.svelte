<script lang="ts" module>
	import type { Snippet } from 'svelte';

	type MaxWidth = 'sm' | 'md' | 'lg' | 'xl' | 'full';

	export interface ContainerProps {
		maxWidth?: MaxWidth;
		padding?: boolean;
		centered?: boolean;
		children: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * Container — responsive max-width wrapper with optional padding.
	 *
	 * Usage:
	 *   <Container maxWidth="lg">
	 *     <PageContent />
	 *   </Container>
	 *
	 * Features:
	 * - Five width presets: sm (640px), md (768px), lg (1024px), xl (1280px), full
	 * - Optional horizontal padding via page padding tokens
	 * - Optional horizontal centering via margin auto
	 * - No visual styling — layout only
	 */

	let { maxWidth = 'lg', padding = true, centered = true, children }: ContainerProps = $props();

	const maxWidthValue = $derived(
		{
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			full: '100%'
		}[maxWidth]
	);

	const marginValue = $derived(centered ? '0 auto' : '0');
</script>

<div
	class="container"
	class:with-padding={padding}
	style:max-width={maxWidthValue}
	style:margin={marginValue}
>
	{@render children()}
</div>

<style>
	.container {
		width: 100%;
	}

	.container.with-padding {
		padding-left: var(--page-padding-x);
		padding-right: var(--page-padding-x);
	}

	@media (max-width: 768px) {
		.container.with-padding {
			padding-left: var(--page-padding-x-mobile);
			padding-right: var(--page-padding-x-mobile);
		}
	}
</style>
