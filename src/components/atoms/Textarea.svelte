<script lang="ts" module>
	import type { ThemeVariant } from '../../contexts/theme.js';
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	export interface TextareaProps extends HTMLTextareaAttributes {
		theme?: ThemeVariant;
		class?: string;
		value?: string;
	}
</script>

<script lang="ts">
	/**
	 * Textarea — multi-line text input with theme variant support.
	 *
	 * Usage:
	 *   <Textarea bind:value={message} placeholder="Your message" />
	 *   <Textarea theme="admin" rows={6} />
	 *
	 * Features:
	 * - Automatic theme detection from context (public/admin)
	 * - Public theme: glassmorphic background with card border
	 * - Admin theme: transparent background with admin border
	 * - Non-resizable, min-height 180px
	 * - Design-token-first CSS with data-attribute selectors
	 * - Error state via aria-invalid="true": border changes to --colour-error
	 * - Success state via data-valid="true" attribute: border changes to --colour-success
	 */
	import { getThemeVariant } from '../../contexts/theme.js';

	let { theme, class: className, value = $bindable(), ...rest }: TextareaProps = $props();

	const activeTheme = $derived(theme ?? getThemeVariant());
</script>

<textarea
	class="textarea motif-form-control {className ?? ''}"
	data-theme={activeTheme}
	style={activeTheme === 'admin' ? '--form-ring-bg: var(--admin-bg)' : undefined}
	bind:value
	{...rest}
></textarea>

<style>
	.textarea {
		/* Default two-line minimum derived from input height token */
		min-height: calc(var(--input-height) * 2);
		width: 100%;
		resize: none;
		font-size: 1rem;
		border-radius: var(--radius-lg);
		padding: var(--space-4) var(--space-5);
		transition:
			border-color var(--transition-normal),
			box-shadow var(--transition-normal);
	}

	@media (min-width: 768px) {
		.textarea {
			min-height: calc(var(--input-height) * 2.5);
		}
	}

	.textarea:focus {
		outline: none;
	}

	.textarea:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	/* Public theme */

	.textarea[data-theme='public'] {
		border: 1px solid var(--card-border);
		/* Glassy card-bg surface, matching the toggle group and Select (was the
		   opaque --input-bg). Keeps Textarea consistent with Input. */
		background: var(--card-bg);
		color: var(--text-primary);
		box-shadow: var(--input-shadow);
	}

	.textarea[data-theme='public']::placeholder {
		color: var(--text-muted);
	}

	.textarea[data-theme='public']:focus {
		border-color: var(--card-border-hover);
		box-shadow:
			0 0 0 2px var(--bg-primary),
			0 0 0 4px var(--accent);
	}

	/* Admin theme */

	.textarea[data-theme='admin'] {
		border: 1px solid var(--admin-border);
		background: transparent;
		color: var(--admin-text);
	}

	.textarea[data-theme='admin']::placeholder {
		color: var(--admin-text-muted);
	}

	.textarea[data-theme='admin']:focus {
		border-color: var(--admin-text-muted);
		box-shadow:
			0 0 0 2px var(--admin-bg),
			0 0 0 4px var(--accent);
	}

	/* Error and success focus-ring states are handled by the shared
	   .motif-form-control rules in form-states.css (imported via base.css).
	   The --form-ring-bg custom property is set inline for admin context. */
</style>
