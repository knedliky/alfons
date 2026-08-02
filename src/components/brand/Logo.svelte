<script lang="ts" module>
	export interface LogoProps {
		/** Rendered height in px; width derives from the shape ratio */
		height?: number;
		/** 'portrait' is the 3:4 brand block; 'square' is the dedicated square logomark */
		shape?: 'portrait' | 'square';
		/** Blink the underscore cursor (home page / loading affordance) */
		blinking?: boolean;
		/** Accessible label */
		title?: string;
		/** Additional CSS classes */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Logo — the Motivka brand mark: a red field with a light underscore bar (the
	 * cursor motif). A 3:4 portrait block by default; shape="square" fits the same
	 * mark, centred, inside a square footprint (for tight header/avatar use). Sized
	 * by height (px). The underscore is the same blinking-cursor language as the
	 * wordmark and nav.
	 *
	 * Usage:
	 *   <Logo height={32} />
	 *   <Logo height={28} shape="square" blinking />
	 *
	 * Recolour via the --logo-field / --logo-cursor CSS variables for a mono
	 * treatment. The fallback literals are the logo artwork's own colours —
	 * deliberately independent of the theme palette so the mark renders
	 * identically everywhere.
	 */
	let {
		height = 32,
		shape = 'portrait',
		blinking = false,
		title = 'Motivka',
		class: className = ''
	}: LogoProps = $props();

	// Two real marks: portrait 772×1024 (underscore left), square 1024×1024
	// (underscore centred). Square is its own artwork, not a crop of the portrait.
	const square = $derived(shape === 'square');
	const width = $derived(square ? height : Math.round(height * (772 / 1024)));
	const viewBox = $derived(square ? '0 0 1024 1024' : '0 0 772 1024');
	const fieldW = $derived(square ? 1024 : 772);
	const cursorX = $derived(square ? 800 : 674);
</script>

<svg
	class="motif-logo {className}"
	class:is-blinking={blinking}
	{width}
	{height}
	{viewBox}
	fill="none"
	role="img"
	aria-label={title}
	preserveAspectRatio="xMidYMid meet"
>
	<rect width={fieldW} height="1024" fill="var(--logo-field, #B80F0F)" />
	<rect
		class="motif-logo-cursor"
		x={cursorX}
		y="736"
		width="128"
		height="576"
		transform="rotate(90 {cursorX} 736)"
		fill="var(--logo-cursor, #D9D9D9)"
	/>
</svg>

<style>
	@keyframes motif-logo-blink {
		0%,
		49% {
			opacity: 1;
		}
		50%,
		100% {
			opacity: 0;
		}
	}

	.motif-logo.is-blinking .motif-logo-cursor {
		animation: motif-logo-blink 1.1s steps(1) infinite;
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-logo.is-blinking .motif-logo-cursor {
			animation: none;
		}
	}
</style>
