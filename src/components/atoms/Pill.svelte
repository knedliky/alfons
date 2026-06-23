<script lang="ts" module>
	export type PillColour =
		| 'default'
		| 'agents'
		| 'workflows'
		| 'synthesis'
		| 'data'
		| 'design'
		| 'infra'
		| 'finance'
		| 'technology'
		| 'healthcare-education'
		| 'legal'
		| 'engineering-trades'
		| 'marketing-communications'
		| 'operations-admin';

	export type PillFill = 'soft' | 'solid' | 'outline';

	export interface PillProps {
		label: string;
		size?: 'sm' | 'md';
		colour?: PillColour;
		fill?: PillFill;
		/**
		 * Escape hatch for open-ended data (task categories, automatability
		 * levels, etc.) whose colour is not in the named `colour` enum. Accepts
		 * any CSS colour string — including a `var(--token)` from the consuming
		 * app, which resolves at the render site. When set, `tint` wins over
		 * `colour`.
		 */
		tint?: string;
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Pill — compact, uppercase label chip for categories, industries,
	 * automatability levels, and tags. The canonical look is the warm, tinted,
	 * mono treatment; the square bordered `outline` fill is retained for the
	 * blog. (For status indicators — success/warning/error — use `Badge`.)
	 *
	 * Usage:
	 *   <Pill label="Creative" fill="solid" tint="var(--burnt-sunset)" />
	 *   <Pill label="Operations & Admin" fill="soft" colour="operations-admin" size="sm" />
	 *   <Pill label="Design" fill="outline" colour="design" />
	 *
	 * Fills:
	 * - soft    — light tint background, coloured text (industry, automatability)
	 * - solid   — strong tint background, neutral text (task category)
	 * - outline — square corners, tinted background, accent border (blog)
	 *
	 * Colour:
	 * - `colour` maps to named --category-* / --industry-* tokens
	 * - `tint` accepts any CSS colour string for open-ended data (wins over colour)
	 */

	let {
		label,
		size = 'md',
		colour = 'default',
		fill = 'soft',
		tint,
		class: className = ''
	}: PillProps = $props();
</script>

<span
	class="pill pill-{size} {className}"
	data-colour={colour !== 'default' ? colour : undefined}
	data-fill={fill}
	style={tint ? `--pill-tint: ${tint};` : undefined}
>
	{label}
</span>

<style>
	.pill {
		display: inline-block;
		width: fit-content;
		text-transform: uppercase;
		font-family: var(--font-mono);
		white-space: nowrap;
		/* Single source of the pill's colour. Named colours override it below;
		   the `tint` prop overrides it inline. Every fill reads from it. */
		--pill-tint: var(--accent);
	}

	/* ---- Named colours — each only sets the tint custom property ---- */
	.pill[data-colour='agents'] {
		--pill-tint: var(--category-agents);
	}
	.pill[data-colour='workflows'] {
		--pill-tint: var(--category-workflows);
	}
	.pill[data-colour='synthesis'] {
		--pill-tint: var(--category-synthesis);
	}
	.pill[data-colour='data'] {
		--pill-tint: var(--category-data);
	}
	.pill[data-colour='design'] {
		--pill-tint: var(--category-design);
	}
	.pill[data-colour='infra'] {
		--pill-tint: var(--category-infra);
	}
	.pill[data-colour='finance'] {
		--pill-tint: var(--industry-finance);
	}
	.pill[data-colour='technology'] {
		--pill-tint: var(--industry-technology);
	}
	.pill[data-colour='healthcare-education'] {
		--pill-tint: var(--industry-healthcare-education);
	}
	.pill[data-colour='legal'] {
		--pill-tint: var(--industry-legal);
	}
	.pill[data-colour='engineering-trades'] {
		--pill-tint: var(--industry-engineering-trades);
	}
	.pill[data-colour='marketing-communications'] {
		--pill-tint: var(--industry-marketing-communications);
	}
	.pill[data-colour='operations-admin'] {
		--pill-tint: var(--industry-operations-admin);
	}

	/* ---- Fills — weight, letter-spacing, radius and colour treatment ---- */

	/* soft — light tint, coloured text (industry / automatability / kanban). */
	.pill[data-fill='soft'] {
		color: var(--pill-tint);
		background: color-mix(in oklch, var(--pill-tint) 15%, transparent);
		font-weight: 600;
		letter-spacing: 0.08em;
		border: none;
		border-radius: 0.25rem;
	}

	/* solid — strong tint, neutral text (task category). */
	.pill[data-fill='solid'] {
		color: var(--text-secondary);
		background: color-mix(in oklch, var(--pill-tint) 50%, transparent);
		font-weight: 700;
		letter-spacing: 0.06em;
		border: none;
		border-radius: 0.1875rem;
	}

	/* outline — square, bordered, sans-serif (legacy blog look). */
	.pill[data-fill='outline'] {
		color: var(--pill-tint);
		background: color-mix(in oklch, var(--pill-tint) 10%, transparent);
		border: 1px solid color-mix(in oklch, var(--pill-tint) 30%, transparent);
		font-family: inherit;
		font-weight: 400;
		border-radius: 0;
	}

	/* ---- Sizes — font-size and padding (letter-spacing comes from the fill) ---- */
	.pill-sm {
		font-size: 0.625rem;
		padding: 0.1875rem 0.5rem;
	}
	.pill-md {
		font-size: 0.6875rem;
		padding: var(--space-1) var(--space-2);
	}

	/* outline keeps its legacy sizing + letter-spacing so the blog is unchanged.
	   Higher specificity than the bare size class, so these win. */
	.pill-sm[data-fill='outline'] {
		font-size: 0.625rem;
		letter-spacing: 0.04em;
		padding: 2px 6px;
	}
	.pill-md[data-fill='outline'] {
		font-size: 0.75rem;
		letter-spacing: 0.05em;
		padding: var(--space-1) var(--space-2);
	}
</style>
