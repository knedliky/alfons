<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface CenterProps {
		children: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * Center — flexbox wrapper that centres children both horizontally and vertically.
	 *
	 * Usage:
	 *   <Center>
	 *     <LoginForm />
	 *   </Center>
	 *
	 * Features:
	 * - Full-height flex container using align-items and justify-content center
	 * - No visual styling — layout only
	 */

	let { children }: CenterProps = $props();
</script>

<div class="center">
	{@render children()}
</div>

<style>
	.center {
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
