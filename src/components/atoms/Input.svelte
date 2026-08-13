<script lang="ts" module>
	import type { ThemeVariant } from '../../contexts/theme.js';
	import type { HTMLInputAttributes } from 'svelte/elements';

	export interface InputProps extends Omit<HTMLInputAttributes, 'size'> {
		theme?: ThemeVariant;
		size?: 'default' | 'sm';
		class?: string;
		value?: string | number;
	}
</script>

<script lang="ts">
	/**
	 * Input — text input field with theme and size support.
	 *
	 * Usage:
	 *   <Input bind:value={name} placeholder="Your name" />
	 *   <Input type="email" size="sm" theme="admin" />
	 *
	 * Features:
	 * - Two sizes: default (h-12) and sm (h-10)
	 * - Automatic theme detection from context (public/admin)
	 * - Public theme: glassmorphic background with card border
	 * - Admin theme: transparent background with admin border
	 * - Design-token-first CSS with data-attribute selectors
	 * - Error state via aria-invalid="true": border changes to --colour-error
	 * - Success state via data-valid="true" attribute: border changes to --colour-success
	 */
	import { getThemeVariant } from '../../contexts/theme.js';

	let {
		theme,
		size = 'default',
		class: className,
		value = $bindable(),
		...rest
	}: InputProps = $props();

	const activeTheme = $derived(theme ?? getThemeVariant());
</script>

<input
	class="input motif-form-control {className ?? ''}"
	data-theme={activeTheme}
	data-size={size}
	style={activeTheme === 'admin' ? '--form-ring-bg: var(--admin-bg)' : undefined}
	bind:value
	{...rest}
/>

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

	/* Public theme */

	.input[data-theme='public'] {
		border: 1px solid var(--border-default);
		background: var(--surface-card);
		color: var(--text-primary);
		box-shadow: var(--input-shadow);
	}

	.input[data-theme='public']::placeholder {
		color: var(--text-muted);
	}

	/* Focus is the functional pulley-blue lamp. Red remains reserved for the
	   action that submits the field. */
	.input[data-theme='public']:focus-visible {
		border-color: var(--focus);
		box-shadow: var(--focus-ring);
	}

	/* Admin theme */

	.input[data-theme='admin'] {
		border: 1px solid var(--admin-border);
		background: transparent;
		color: var(--admin-text);
	}

	.input[data-theme='admin']::placeholder {
		color: var(--admin-text-muted);
	}

	.input[data-theme='admin']:focus {
		border-color: var(--admin-text-muted);
	}

	/* Error and success focus-ring states are handled by the shared
	   .motif-form-control rules in form-states.css (imported via base.css).
	   The --form-ring-bg custom property is set inline for admin context. */
</style>
