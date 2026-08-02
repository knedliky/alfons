<script lang="ts">
	/**
	 * The work-in-progress glow.
	 *
	 * Any element carrying data-alfons-working gets an animated brand-colour
	 * outline drawn over it, with the attribute's value as a label — so a round
	 * can be watched being built, region by region, approach by approach. The
	 * marker contract is one attribute because five agents must be able to hold
	 * it without coordinating: set it on the region you are composing, describe
	 * what you are doing in its value, remove it when the region is finished.
	 *
	 * Measured on a frame loop rather than observers: the marked element moves
	 * with scroll, HMR replaces it wholesale, and agents toggle the attribute
	 * from outside — a rAF measure of a handful of rects is cheaper than being
	 * right about every invalidation source. Dev chrome only; never shipped.
	 */
	interface Glow {
		top: number;
		left: number;
		width: number;
		height: number;
		label: string;
	}

	let glows = $state<Glow[]>([]);

	$effect(() => {
		let frame = 0;
		const measure = () => {
			const marked = document.querySelectorAll<HTMLElement>(
				'[data-alfons-working]:not([data-alfons-dev-chrome] *)'
			);
			glows = Array.from(marked).map((element) => {
				const rect = element.getBoundingClientRect();
				return {
					top: rect.top,
					left: rect.left,
					width: rect.width,
					height: rect.height,
					label: element.getAttribute('data-alfons-working') ?? ''
				};
			});
			frame = requestAnimationFrame(measure);
		};
		frame = requestAnimationFrame(measure);
		return () => cancelAnimationFrame(frame);
	});
</script>

{#each glows as glow, index (index)}
	<div
		class="glow"
		style="top: {glow.top}px; left: {glow.left}px; width: {glow.width}px; height: {glow.height}px;"
	>
		{#if glow.label}
			<span class="glow-label">{glow.label}</span>
		{/if}
	</div>
{/each}

<style>
	.glow {
		position: fixed;
		pointer-events: none;
		z-index: 9998;
		border: 2px solid var(--accent);
		border-radius: 0.5rem;
		animation: alfons-glow-pulse 1.6s ease-in-out infinite;
	}

	.glow-label {
		position: absolute;
		top: -1.6rem;
		left: 0;
		max-width: 100%;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
		padding: 0.1rem 0.6rem;
		border-radius: 999px;
		background: var(--accent);
		color: var(--powder-sand);
		font-size: 0.7rem;
		letter-spacing: 0.02em;
	}

	@keyframes alfons-glow-pulse {
		0%,
		100% {
			box-shadow:
				0 0 6px 0 var(--accent-border),
				inset 0 0 6px 0 var(--accent-bg);
		}
		50% {
			box-shadow:
				0 0 22px 4px var(--accent-border),
				inset 0 0 12px 0 var(--accent-bg-emphasis);
		}
	}
</style>
