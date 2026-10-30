<script lang="ts" module>
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export interface ButtonProps extends HTMLButtonAttributes {
		variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		class?: string;
		children?: import('svelte').Snippet;
	}
</script>

<script lang="ts">
	/**
	 * Button — control-panel hardware: a domed cap seated in a dark bezel.
	 *
	 * Usage:
	 *   <Button>Primary CTA</Button>
	 *   <Button variant="secondary" size="sm">Secondary</Button>
	 *   <div data-theme="admin"><Button variant="ghost">Admin action</Button></div>
	 *
	 * Features:
	 * - Five visual variants: default, secondary, outline, ghost, link
	 * - Three sizes plus icon mode: default, sm, lg, icon
	 * - Themed by tokens alone: the admin overlay restates the outline and
	 *   ghost roles (--button-outline-*, --button-ghost-hover-bg)
	 * - Design-token-first CSS with data-attribute selectors
	 *
	 * THE CAP. default takes an anodized red dome
	 * (--cap-red); secondary takes chrome (--cap-chrome). Both are seated by
	 * --shadow-cap. Hover brightens the dome by 6%, as light catching a curved
	 * surface — it does not grow the shadow, because the cap has not moved.
	 * Press seats it 2px into the collar (--shadow-cap-press) and dims 3%.
	 *
	 * Lit strictly from above. Do not add bottom bounce light: the panel the
	 * cap is set into is dark, so there is nothing below to bounce off.
	 *
	 * link is the one variant that is not hardware, so it takes no cap and is
	 * pulley blue rather than accent red — links are functional, and red is
	 * reserved for the thing that acts.
	 */
	let {
		variant = 'default',
		size = 'default',
		class: className,
		children,
		...restProps
	}: ButtonProps = $props();
</script>

<button class="button {className ?? ''}" data-variant={variant} data-size={size} {...restProps}>
	{@render children?.()}
</button>

<style>
	/* Base — reset browser defaults then apply shared styling */
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		white-space: nowrap;
		border-radius: var(--radius-base);
		font-family: var(--font-body);
		font-size: var(--text-caption);
		font-weight: var(--fw-medium);
		cursor: pointer;
		/* Named properties, not `all`. A cap animates its light and its seat;
		   transitioning `all` also animates the box-shadow the focus lamp
		   paints, so the ring faded in behind the pointer instead of appearing
		   with the keyboard. */
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast),
			box-shadow var(--transition-fast),
			transform var(--transition-fast),
			filter var(--transition-fast);
		border: 1px solid transparent;
		background: none;
		color: inherit;
		text-decoration: none;
		line-height: 1;
	}

	.button:disabled {
		pointer-events: none;
		opacity: var(--state-disabled-opacity);
	}

	/* The lamp: light escaping from beneath the cap. Capped variants keep their
	   bezel underneath it, so a focused button still reads as seated. */
	.button:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	/* Press seats the cap into its collar. Applies to every variant — even a
	   ghost acknowledges the press — but only capped ones change their bezel. */
	.button:active:not(:disabled) {
		transform: translateY(2px);
		filter: brightness(0.97);
	}

	/* Sizes — the Meccano ladder: 28 / 36 / 44px. These are deliberately
	   denser than the 40/48/56 they replace, and they stay in step with
	   --input-height-sm/--input-height/--input-height-lg, which spacing.css
	   defines against these tiers. Change one and change the other. */

	.button[data-size='default'] {
		height: var(--input-height);
		padding: 0 var(--space-4);
	}

	.button[data-size='sm'] {
		height: var(--input-height-sm);
		padding: 0 var(--space-3);
		font-size: var(--text-caption);
	}

	.button[data-size='lg'] {
		height: var(--input-height-lg);
		padding: 0 var(--space-5);
		font-size: var(--text-ui);
	}

	.button[data-size='icon'] {
		height: var(--input-height);
		width: var(--input-height);
		padding: 0;
	}

	/* === CAPPED VARIANTS — theme-independent ==========================
	   A panel cap is hardware, and hardware does not change because the
	   surrounding page is an admin one, so no theme sets a role here. */

	.button[data-variant='default'] {
		background-image: var(--cap-red);
		box-shadow: var(--shadow-cap);
		color: var(--accent-contrast);
		text-shadow: 0 1px 1px rgba(var(--shade-rgb), 0.5);
	}

	.button[data-variant='default']:hover:not(:disabled) {
		filter: brightness(1.06);
	}

	/* Chrome cap. Takes foundry-black text: the dome is a light plastic, and
	   the readme's rule is that light and mid plastics take dark ink. */
	.button[data-variant='secondary'] {
		background-image: var(--cap-chrome);
		box-shadow: var(--shadow-cap);
		color: var(--text-inverse);
		text-shadow: 0 1px 0 rgba(var(--sheen-rgb), 0.4);
	}

	.button[data-variant='secondary']:hover:not(:disabled) {
		filter: brightness(1.05);
	}

	/* Both caps seat 2px into the collar on press. */
	.button[data-variant='default']:active:not(:disabled),
	.button[data-variant='secondary']:active:not(:disabled) {
		box-shadow: var(--shadow-cap-press);
	}

	/* Focus keeps the bezel beneath the lamp, so the cap stays seated. */
	.button[data-variant='default']:focus-visible,
	.button[data-variant='secondary']:focus-visible {
		box-shadow: var(--focus-ring), var(--shadow-cap);
	}

	/* === FLAT VARIANTS — no cap, no gloss =============================
	   outline takes the bone edge the readme reserves for emphasis;
	   ghost takes a steel wash; link is not hardware at all. These are the
	   variants a theme restyles, through the --button-* roles. */

	.button[data-variant='outline'] {
		border-color: var(--button-outline-border);
		background: transparent;
		color: var(--text-primary);
	}

	.button[data-variant='outline']:hover:not(:disabled) {
		background: var(--button-outline-hover-bg);
		border-color: var(--button-outline-hover-border);
	}

	.button[data-variant='ghost'] {
		background: transparent;
		color: var(--ink-700);
	}

	.button[data-variant='ghost']:hover:not(:disabled) {
		background: var(--button-ghost-hover-bg);
		color: var(--text-primary);
	}

	.button[data-variant='link'] {
		background: transparent;
		color: var(--text-link);
		text-underline-offset: 3px;
		padding: 0;
		height: auto;
	}

	.button[data-variant='link']:hover:not(:disabled) {
		color: var(--ink-900);
		text-decoration: underline;
	}

	/* A link does not seat, because there is nothing to seat. */
	.button[data-variant='link']:active:not(:disabled) {
		transform: none;
	}
</style>
