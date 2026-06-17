<script lang="ts" module>
	export interface PageHeaderProps {
		title: string;
		subtitle?: string;
		/** Article excerpt — rendered below the title when variant is 'article' */
		excerpt?: string;
		align?: 'left' | 'center' | 'right';
		spacing?: 'compact' | 'standard' | 'spacious' | 'none';
		variant?: 'public' | 'admin' | 'article';
		/** Enable per-word glitch tear filter on the title */
		glitch?: boolean;
		/** Enable per-letter animated glitch with colour-mode flicker on load */
		pixelate?: boolean;
	}
</script>

<script lang="ts">
	/**
	 * PageHeader — page-level h1 with optional subtitle.
	 *
	 * Usage:
	 *   <PageHeader
	 *     title="The AI Builders Field Guide"
	 *     subtitle="Practical wisdom for building intelligent systems."
	 *     align="center"
	 *     spacing="standard"
	 *     glitch
	 *   />
	 *
	 * Features:
	 * - Alignment variants: left, center, right
	 * - Spacing variants: compact, standard, spacious
	 * - Admin variant uses admin token namespace
	 * - Optional per-word glitch SVG filter on the title
	 * - Optional per-letter pixelate glitch with colour-mode flicker on load
	 * - Responsive spacing on mobile
	 */

	let {
		title,
		subtitle,
		excerpt,
		align = 'center',
		spacing = 'standard',
		variant = 'public',
		glitch = false,
		pixelate = false
	}: PageHeaderProps = $props();

	/* Article variant defaults to left-align and no bottom spacing unless
	   the caller explicitly overrides via props */
	const effectiveAlign = $derived(variant === 'article' && align === 'center' ? 'left' : align);
	const effectiveSpacing = $derived(
		variant === 'article' && spacing === 'standard' ? 'none' : spacing
	);

	/** Split title into individual words for per-word glitch filter targeting — only when glitch is enabled */
	const titleWords = $derived(glitch ? title.split(/\s+/).filter(Boolean) : []);

	/**
	 * Per-word filter parameters — each word gets its own noise seed, animation
	 * durations, and displacement amplitudes so they tear independently.
	 *
	 * Seeds are spread by 7 to avoid correlated feTurbulence noise patterns.
	 * Durations use incommensurate values (large LCM) to prevent synchronisation.
	 */
	const glitchFilters = $derived(
		glitch
			? titleWords.map((_, index) => ({
					id: `page-glitch-${index}`,
					seed: 3 + index * 7,
					dxDur: `${10 + index * 3}s`,
					dyDur: `${14 + index * 4}s`,
					dxValues: `0;${35 - index * 8};0`,
					dyValues: `0;${12 + index * 5};0`
				}))
			: []
	);

	/** Split title into individual characters for per-letter pixelate targeting — only when pixelate is enabled */
	const titleChars = $derived(pixelate ? title.split('') : []);

	/**
	 * Four phase-based filter groups for the pixelate effect.
	 *
	 * Instead of one SVG filter per character, characters are assigned to
	 * one of four phases by a deterministic hash. Each phase shares a single
	 * filter, reducing DOM nodes from N to 4. Individual character timing
	 * is handled by CSS animation-delay rather than per-filter SMIL begin.
	 */
	const PIXELATE_PHASES = [
		{ id: 'pix-burst', seed: 3 },
		{ id: 'pix-lull', seed: 14 },
		{ id: 'pix-resurgence', seed: 25 },
		{ id: 'pix-sparks', seed: 36 }
	] as const;

	/**
	 * Per-character pixelate parameters with double-hump delay envelope.
	 *
	 * Deterministic hash assigns each character to one of four phases:
	 * burst (0-0.5 s) -> lull (0.5-1.2 s) -> resurgence (1.2-2.2 s) -> trailing sparks (2.2-4.5 s)
	 * so the visual density of glitching letters follows the requested
	 * intense -> quiet -> resurgent -> rare pattern.
	 *
	 * Characters within the same phase share a single SVG filter (referenced
	 * by phase ID) but retain individual CSS animation delays for stagger.
	 */
	const pixelateChars = $derived(
		pixelate
			? titleChars.map((char, index) => {
					if (char === ' ') return { char, isSpace: true, filterId: '', phaseIndex: 0, delay: 0 };

					/* Prime-multiplied hash decorrelates adjacent indices */
					const hash = ((index * 37 + 13) * 53) % 100;

					let delay: number;
					let phaseIndex: number;
					if (hash < 40) {
						/* Phase 1: initial burst */
						delay = (hash / 40) * 0.5;
						phaseIndex = 0;
					} else if (hash < 55) {
						/* Phase 2: lull */
						delay = 0.5 + ((hash - 40) / 15) * 0.7;
						phaseIndex = 1;
					} else if (hash < 80) {
						/* Phase 3: resurgence */
						delay = 1.2 + ((hash - 55) / 25) * 1.0;
						phaseIndex = 2;
					} else {
						/* Phase 4: trailing sparks */
						delay = 2.2 + ((hash - 80) / 20) * 2.3;
						phaseIndex = 3;
					}

					return {
						char,
						isSpace: false,
						filterId: PIXELATE_PHASES[phaseIndex].id,
						phaseIndex,
						delay: Math.round(delay * 100) / 100
					};
				})
			: []
	);
</script>

{#if glitch}
	<!-- Hidden SVG — per-word filter defs for independent glitch tears on each title word -->
	<svg class="filter-defs" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
		<defs>
			{#each glitchFilters as filter (filter.id)}
				<filter id={filter.id} x="-15%" y="-15%" width="130%" height="130%">
					<!-- Fractal noise — unique seed per word for independent noise patterns -->
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.1 0.8"
						numOctaves="1"
						seed={filter.seed}
						result="noise"
					/>

					<!-- Smooth pan — incommensurate durations per word prevent synchronisation -->
					<feOffset in="noise" result="panned-noise">
						<animate
							attributeName="dx"
							values={filter.dxValues}
							dur={filter.dxDur}
							repeatCount="indefinite"
						/>
						<animate
							attributeName="dy"
							values={filter.dyValues}
							dur={filter.dyDur}
							repeatCount="indefinite"
						/>
					</feOffset>

					<!-- Edge detection: dilate text alpha then subtract original -->
					<feMorphology in="SourceAlpha" operator="dilate" radius="1" result="dilated" />
					<feComposite in="dilated" in2="SourceAlpha" operator="out" result="edge" />

					<!-- Displace the edge with panned noise for an irregular torn look -->
					<feDisplacementMap
						in="edge"
						in2="panned-noise"
						scale="7"
						xChannelSelector="R"
						yChannelSelector="G"
						result="torn-edge"
					/>

					<!-- Recolour torn edge to bright green at slightly higher opacity -->
					<feColorMatrix
						in="torn-edge"
						type="matrix"
						values="0 0 0 0 0.1
								0 0 0 0 0.9
								0 0 0 0 0.4
								0 0 0 0.5 0"
						result="green-edge"
					/>

					<!-- Layer: green tears sit behind the crisp original text -->
					<feMerge>
						<feMergeNode in="green-edge" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
			{/each}
		</defs>
	</svg>
{/if}

{#if pixelate}
	<!--
		Phase-based pixelate filters: 4 shared SVG filters (one per phase)
		instead of one per character. Individual character timing is handled
		by CSS animation-delay on the span rather than SMIL begin.
		The displacement animation starts immediately (begin=0s) — each
		character's CSS delay controls when its filter visually activates
		via the colour-flicker keyframes.
	-->
	<svg class="filter-defs" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
		<defs>
			{#each PIXELATE_PHASES as phase (phase.id)}
				<filter id={phase.id} x="-50%" y="-50%" width="200%" height="200%">
					<feTurbulence
						type="fractalNoise"
						baseFrequency="0.04 0.08"
						numOctaves="2"
						seed={phase.seed}
						result="noise"
					/>

					<!-- Continuous slow pan — runs independently of the per-letter settle -->
					<feOffset in="noise" result="panned-noise">
						<animate attributeName="dx" values="0;50;0" dur="25s" repeatCount="indefinite" />
						<animate attributeName="dy" values="0;20;0" dur="18s" repeatCount="indefinite" />
					</feOffset>

					<!-- Displacement: snap from 40 down to 1.5 over 2 s -->
					<feDisplacementMap
						in="SourceGraphic"
						in2="panned-noise"
						scale="0"
						xChannelSelector="R"
						yChannelSelector="G"
						result="warped"
					>
						<animate
							attributeName="scale"
							values="0;40;28;18;10;5;3;2;1.5"
							keyTimes="0;0.005;0.1;0.2;0.35;0.5;0.7;0.85;1"
							dur="2s"
							begin="0s"
							fill="freeze"
							calcMode="spline"
							keySplines="
								0 0 1 1;
								0.2 0 0.4 1;
								0.2 0 0.4 1;
								0.2 0 0.4 1;
								0.2 0 0.4 1;
								0.2 0 0.4 1;
								0.2 0 0.4 1;
								0.2 0 0.4 1"
						/>
					</feDisplacementMap>

					<!-- Jitter: choppy jumps decaying to zero -->
					<feOffset in="warped" result="jittered">
						<animate
							attributeName="dx"
							values="0;15;-10;12;-7;9;-4;6;-2;3;-1;0"
							dur="1.8s"
							begin="0s"
							fill="freeze"
						/>
						<animate
							attributeName="dy"
							values="0;5;-3;4;-2;3;-1;1;0"
							dur="1.8s"
							begin="0s"
							fill="freeze"
						/>
					</feOffset>

					<!-- Chromatic ghost: offset snap then settle -->
					<feOffset in="SourceGraphic" result="ghost-shifted">
						<animate
							attributeName="dx"
							values="0;8;-6;7;-4;5;-2;3;-1;0"
							dur="2s"
							begin="0s"
							fill="freeze"
						/>
					</feOffset>

					<feColorMatrix
						in="ghost-shifted"
						type="matrix"
						values="0 0 0 0 0.1
								0 0 0 0 0.9
								0 0 0 0 0.4
								0 0 0 0.25 0"
						result="coloured-ghost"
					/>

					<feMerge>
						<feMergeNode in="coloured-ghost" />
						<feMergeNode in="jittered" />
					</feMerge>
				</filter>
			{/each}
		</defs>
	</svg>
{/if}

<header
	class="page-header"
	class:align-left={effectiveAlign === 'left'}
	class:align-center={effectiveAlign === 'center'}
	class:align-right={effectiveAlign === 'right'}
	class:spacing-compact={effectiveSpacing === 'compact'}
	class:spacing-standard={effectiveSpacing === 'standard'}
	class:spacing-spacious={effectiveSpacing === 'spacious'}
	class:spacing-none={effectiveSpacing === 'none'}
	class:variant-admin={variant === 'admin'}
	class:variant-article={variant === 'article'}
>
	<!-- Article variant: category label sits above the title -->
	{#if variant === 'article' && subtitle}
		<span class="article-category">{subtitle}</span>
	{/if}

	<h1 class:pixelate-title={pixelate}>
		{#if pixelate}
			{#each pixelateChars as pchar, index (index)}
				{#if pchar.isSpace}
					<span class="pixelate-space"> </span>
				{:else}
					<span
						class="pixelate-char"
						style:filter="url(#{pchar.filterId})"
						style:animation-delay="{pchar.delay}s">{pchar.char}</span
					>
				{/if}
			{/each}
		{:else if glitch}
			{#each titleWords as word, index (index)}
				{#if index > 0}<span class="glitch-word-spacer"> </span>{/if}
				<span class="glitch-word" style:filter="url(#{glitchFilters[index].id})">{word}</span>
			{/each}
		{:else}
			{title}
		{/if}
	</h1>

	<!-- Standard variants: subtitle renders below the title -->
	{#if variant !== 'article' && subtitle}
		<p>{subtitle}</p>
	{/if}

	<!-- Article variant: excerpt renders below the title -->
	{#if variant === 'article' && excerpt}
		<p class="article-excerpt">{excerpt}</p>
	{/if}
</header>

<style>
	.page-header {
		width: 100%;
	}

	.align-left {
		text-align: left;
	}

	.align-left p {
		margin-left: 0;
		margin-right: auto;
	}

	.align-center {
		text-align: center;
	}

	.align-center p {
		margin-left: auto;
		margin-right: auto;
	}

	.align-right {
		text-align: right;
	}

	.align-right p {
		margin-left: auto;
		margin-right: 0;
	}

	.spacing-compact {
		margin-bottom: var(--space-5);
	}

	.spacing-standard {
		margin-bottom: var(--space-8);
	}

	.spacing-spacious {
		margin-bottom: var(--space-10);
	}

	h1 {
		margin: 0 0 var(--space-2) 0;
	}

	p {
		color: var(--text-secondary);
		max-width: var(--section-header-max-width);
		font-size: 1.25rem;
		margin-top: 0;
		margin-bottom: 0;
	}

	/* Dark mode pairs the public subtitle with the title in full white — the
	   secondary grey over-de-emphasises it on the near-black surface. Admin keeps
	   its own token; the article excerpt stays secondary for long-form legibility. */
	:global([data-colour-mode='dark']) .page-header:not(.variant-admin):not(.variant-article) p {
		color: var(--text-primary);
	}

	/* Per-word glitch spans — inline so text reflows normally */
	.glitch-word {
		display: inline;
	}

	.glitch-word-spacer {
		display: inline;
	}

	/* SVG is only needed in the DOM for filter defs — visually hidden */
	.filter-defs {
		position: absolute;
		width: 0;
		height: 0;
		overflow: hidden;
		pointer-events: none;
	}

	/* ------------------------------------------------------------------ */
	/* Per-letter pixelate: SVG glitch + colour-mode flicker per char     */
	/* ------------------------------------------------------------------ */

	/* Scope the colour-mode flicker variable for child .pixelate-char spans */
	.pixelate-title {
		--text-flicker-alt: #2d2a26;
	}

	:global([data-colour-mode='light']) .pixelate-title {
		--text-flicker-alt: oklch(0.93 0.02 68);
	}

	.pixelate-char {
		display: inline;
		/* `forwards` keeps correct colour after flicker; delay set via inline style */
		animation: pixelate-flicker 1.2s linear forwards;
	}

	.pixelate-space {
		display: inline;
	}

	/*
	 * Per-letter colour flicker: starts at the "wrong" colour-mode value,
	 * stutters rapidly, then locks onto --text-primary.
	 * Duration is per-letter (1.2 s) — shorter than the old whole-title version
	 * since each letter settling is a smaller visual event.
	 */
	@keyframes pixelate-flicker {
		0%,
		5% {
			color: var(--text-flicker-alt);
		}
		10% {
			color: var(--text-primary);
		}
		15% {
			color: var(--text-flicker-alt);
		}
		22% {
			color: var(--text-primary);
		}
		30% {
			color: var(--text-flicker-alt);
		}
		42% {
			color: var(--text-primary);
		}
		56% {
			color: var(--text-flicker-alt);
		}
		72% {
			color: var(--text-primary);
		}
		85%,
		100% {
			color: var(--text-primary);
		}
	}

	/* Admin variant: smaller, more compact header for admin interfaces */
	.variant-admin h1 {
		color: var(--admin-text);
		margin-bottom: var(--space-1);
		font-family: var(--font-body);
		font-weight: 600;
		font-size: 3rem;
	}

	.variant-admin p {
		color: var(--admin-text-secondary);
	}

	/* Article variant: lightweight header for blog post pages (ported from HeroDetail) */
	.article-category {
		display: inline-block;
		color: var(--accent);
		font-size: 0.9rem;
		font-weight: 400;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		width: fit-content;
	}

	.variant-article h1 {
		font-weight: 400;
		line-height: 1.1;
		margin-bottom: var(--space-2);
	}

	.article-excerpt {
		color: var(--text-secondary);
		max-width: 900px;
		font-size: 1.125rem;
		line-height: 1.5;
	}

	.spacing-none {
		margin-bottom: 0;
	}

	@media (max-width: 767px) {
		.spacing-compact {
			margin-bottom: var(--space-4);
		}

		.spacing-standard {
			margin-bottom: var(--space-6);
		}

		.spacing-spacious {
			margin-bottom: var(--space-8);
		}

		.variant-admin h1 {
			font-size: var(--admin-header-size-mobile);
		}

		.variant-admin p {
			font-size: var(--admin-subheader-size-mobile);
		}

		.variant-article h1 {
			font-size: 2.25rem;
		}

		.article-excerpt {
			font-size: 1rem;
		}
	}

	@media (max-width: 640px) {
		/* Disable SVG filters on mobile for GPU performance */
		.glitch-word {
			filter: none !important;
		}

		.pixelate-char {
			filter: none !important;
			animation: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.glitch-word {
			filter: none !important;
		}

		.pixelate-char {
			filter: none !important;
			animation: none;
		}
	}
</style>
