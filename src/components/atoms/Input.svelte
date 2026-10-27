<script lang="ts" module>
	import type { HTMLInputAttributes } from 'svelte/elements';

	export interface InputProps extends Omit<HTMLInputAttributes, 'size'> {
		size?: 'default' | 'sm';
		class?: string;
		value?: string | number;
	}
</script>

<script lang="ts">
	/**
	 * Input — text input field with size support.
	 *
	 * Usage:
	 *   <Input bind:value={name} placeholder="Your name" />
	 *   <Input type="email" size="sm" />
	 *
	 * Features:
	 * - Two sizes: default (h-12) and sm (h-10)
	 * - Themed by tokens alone: --field-bg and --field-border, which the
	 *   admin overlay sets to a transparent fill behind a hairline
	 * - Design-token-first CSS with data-attribute selectors
	 * - Error state via aria-invalid="true": border changes to --colour-error
	 * - Success state via data-valid="true" attribute: border changes to --colour-success
	 */
	let { size = 'default', class: className, value = $bindable(), ...rest }: InputProps = $props();
</script>

<input class="input motif-form-control {className ?? ''}" data-size={size} bind:value {...rest} />

<style>
	/* Plain fields are machined controls, not pills. Their 6px corner is the
	   same --radius-2 Meccano gives its input wrapper and select trigger. */
	.input {
		display: flex;
		width: 100%;
		font-size: 1rem;
		transition:
			border-color var(--transition-normal),
			box-shadow var(--transition-normal);
		border-radius: var(--radius);
	}

	.input:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	/* Bordered control — pull the system outline flush so it merges with the
	   border into a single ring. */
	.input:focus-visible {
		outline-offset: -1.5px;
	}

	/* file input resets */
	.input::file-selector-button {
		border: 0;
		background: transparent;
		font-size: 0.875rem;
		font-weight: 500;
	}

	/* Sizes */

	.input[data-size='default'] {
		height: var(--input-height);
		padding: 0.75rem 1.25rem;
	}

	.input[data-size='sm'] {
		height: var(--input-height-sm);
		padding: var(--space-2) var(--space-4);
		font-size: 0.875rem;
	}

	.input {
		border: 1px solid var(--field-border);
		background: var(--field-bg);
		color: var(--text-primary);
		box-shadow: var(--input-shadow);
	}

	.input::placeholder {
		color: var(--text-muted);
	}

	/* Focus is the functional pulley-blue lamp in every theme. Red remains
	   reserved for the action that submits the field. */
	.input:focus-visible {
		border-color: var(--focus);
		box-shadow: var(--focus-ring);
	}

	/* Error and success focus-ring states are handled by the shared
	   .motif-form-control rules in form-states.css (imported via base.css). */
</style>
