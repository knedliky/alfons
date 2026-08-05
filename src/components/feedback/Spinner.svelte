<script lang="ts" module>
	export interface SpinnerProps {
		size?: 'sm' | 'default' | 'lg';
		/** Square colour — defaults to the accent */
		colour?: string;
		/** Screen-reader label */
		label?: string;
		/** Additional CSS classes */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Spinner — indeterminate loading indicator: a 2×2 grid of squares that
	 * pulses one corner at a time (travelling clockwise), each square changing
	 * size and opacity. Sizes from sm to lg; colour overrides the squares.
	 * Respects prefers-reduced-motion (settles to a static dimmed grid).
	 *
	 * Usage:
	 *   <Spinner />
	 *   <Spinner size="lg" colour="var(--pulley-blue)" label="Fetching results" />
	 */
	let {
		size = 'default',
		colour,
		label = 'Loading',
		class: className = ''
	}: SpinnerProps = $props();

	const SIZES: Record<string, number> = { sm: 16, default: 24, lg: 40 };
	const px = $derived(SIZES[size] ?? 24);

	// DOM order is TL, TR, BL, BR; delays step clockwise TL → TR → BR → BL.
	const delays = ['0s', '0.6s', '1.8s', '1.2s'];
</script>

<span
	class="motif-spinner size-{size} {className}"
	role="status"
	aria-live="polite"
	style="--spinner-size: {px}px;{colour ? ` --spinner-colour: ${colour};` : ''}"
>
	<span class="motif-spinner-grid" aria-hidden="true">
		{#each delays as delay, i (i)}
			<span class="motif-spinner-cell" style:animation-delay={delay}></span>
		{/each}
	</span>
	<span class="motif-spinner-label">{label}</span>
</span>

<style>
	.motif-spinner {
		display: inline-flex;
		--spinner-colour: var(--accent);
	}

	.motif-spinner-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: repeat(2, 1fr);
		gap: calc(var(--spinner-size) * 0.08);
		width: var(--spinner-size);
		height: var(--spinner-size);
	}

	.motif-spinner-cell {
		background: var(--spinner-colour);
		border-radius: 0;
		opacity: 0;
		animation: motif-spin-pulse 2.4s cubic-bezier(0.37, 0, 0.63, 1) infinite backwards;
		will-change: transform, opacity;
	}

	@keyframes motif-spin-pulse {
		0%,
		70%,
		100% {
			transform: scale(0.5);
			opacity: 0;
		}
		30% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.motif-spinner-label {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
		white-space: nowrap;
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-spinner-cell {
			animation: none;
			opacity: 0.5;
			transform: scale(0.85);
		}
	}
</style>
