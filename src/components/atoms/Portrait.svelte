<script lang="ts" module>
	export interface PortraitProps {
		src?: string;
		alt?: string;
		size: 'avatar' | 'circle' | 'portrait';
		initials?: string;
		interactive?: boolean;
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Portrait — avatar and portrait display with three size variants.
	 *
	 * Usage:
	 *   <Portrait size="avatar" src="/me.jpg" alt="Steph" />
	 *   <Portrait size="circle" initials="SM" interactive />
	 *   <Portrait size="portrait" src="/about.jpg" alt="About photo" />
	 *
	 * Features:
	 * - avatar: 48px circle (nav headers, login)
	 * - circle: 240px circle (about teaser, profile cards)
	 * - portrait: 3:4 aspect ratio rectangle (full about page)
	 * - Initials fallback when no image source provided
	 * - Optional hover effects via the interactive prop
	 * - Circle size includes a subtle GSAP SVG radiant glow behind the portrait
	 */
	import gsap from 'gsap';

	let {
		src,
		alt = '',
		size,
		initials,
		interactive = false,
		class: className = ''
	}: PortraitProps = $props();

	const wrapperClasses = $derived(
		[
			'portrait',
			`portrait-${size}`,
			interactive ? 'portrait-interactive' : '',
			size !== 'circle' ? className : ''
		]
			.filter(Boolean)
			.join(' ')
	);

	let glowContainer: SVGSVGElement | undefined = $state();

	$effect(() => {
		if (size === 'circle' && glowContainer) {
			const rings = glowContainer.querySelectorAll('circle');
			rings.forEach((ring, i) => {
				gsap.set(ring, { transformOrigin: '50% 40%', scale: 1.5, opacity: 0 });
				gsap.to(ring, {
					scale: 0.4,
					duration: 1,
					repeat: -1,
					ease: 'sine.out',
					delay: i * 0.2,
					// x: i * 50,
					y: i * 60,
					keyframes: {
						'0%': { opacity: 0, scale: 0.2 },
						'20%': { opacity: 0.1, scale: 0.4 },
						'60%': { opacity: 0.2, scale: 0.8 },
						'100%': { opacity: 0, scale: 0.2 }
					}
				});
			});
		}
	});
</script>

{#if src}
	{#if size === 'circle'}
		<div class="portrait-glow-container {className}">
			<!-- <svg class="portrait-glow" viewBox="0 0 240 240" bind:this={glowContainer} aria-hidden="true">
				<circle
					cx="120"
					cy="80"
					r="118"
					fill="var(--gantry-orange)"
					stroke="var(--gantry-orange)"
					stroke-width="2"
				/>
				<circle
					cx="120"
					cy="80"
					r="118"
					fill="var(--accent)"
					stroke="var(--accent)"
					stroke-width="2"
				/>
				<circle
					cx="120"
					cy="80"
					r="118"
					fill="var(--brass-amber)"
					stroke="var(--brass-amber)"
					stroke-width="2"
				/>
				<circle
					cx="120"
					cy="80"
					r="118"
					fill="var(--pinion-pink)"
					stroke="var(--pinion-pink)"
					stroke-width="2"
				/>
				<circle
					cx="120"
					cy="80"
					r="118"
					fill="var(--pulley-blue)"
					stroke="var(--pulley-blue)"
					stroke-width="2"
				/>
				<circle
					cx="120"
					cy="80"
					r="118"
					fill="var(--boiler-navy)"
					stroke="var(--boiler-navy)"
					stroke-width="2"
				/>
			</svg> -->
			<img {src} {alt} class={wrapperClasses} />
		</div>
	{:else}
		<img {src} {alt} class={wrapperClasses} />
	{/if}
{:else}
	<div class={wrapperClasses} role="img" aria-label={alt || 'Portrait'}>
		{#if initials}
			<span class="portrait-initials" aria-hidden="true">{initials}</span>
		{/if}
	</div>
{/if}

<style>
	.portrait {
		display: flex;
		align-items: center;
		justify-content: center;
		object-fit: cover;
		flex-shrink: 0;
	}

	.portrait-avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		border: 1px solid var(--card-border);
		background: var(--card-bg);
		transition: border-color var(--transition-normal);
	}

	.portrait-avatar.portrait-interactive:hover {
		border-color: var(--card-border-hover);
	}

	.portrait-avatar .portrait-initials {
		font-size: 1rem;
	}

	.portrait-circle {
		width: 240px;
		height: 240px;
		border-radius: 50%;
		background: var(--card-bg);
		transition: all var(--transition-normal);
		position: relative;
		z-index: var(--z-raised);
	}

	.portrait-circle.portrait-interactive:hover {
		border-color: var(--accent);
		transform: scale(1.05);
	}

	.portrait-circle .portrait-initials {
		font-size: 4rem;
	}

	.portrait-portrait {
		width: 100%;
		aspect-ratio: 3 / 4;
		border-radius: var(--radius-surface);
		border: 1px solid var(--card-border);
		background: var(--card-bg);
		transition: border-color var(--transition-normal);
	}

	.portrait-portrait.portrait-interactive:hover {
		border-color: var(--accent-border);
	}

	.portrait-portrait .portrait-initials {
		font-size: 3rem;
	}

	.portrait-initials {
		font-family: var(--font-display);
		font-weight: 500;
		color: var(--text-primary);
		user-select: none;
	}

	/* Glow container for circular portrait */
	.portrait-glow-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: max-content;
		height: max-content;
	}

	.portrait-glow {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		z-index: var(--z-raised);
		pointer-events: none;
	}
</style>
