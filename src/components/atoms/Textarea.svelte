<script lang="ts" module>
	import type { HTMLTextareaAttributes } from 'svelte/elements';

	export interface TextareaProps extends HTMLTextareaAttributes {
		class?: string;
		value?: string;
	}
</script>

<script lang="ts">
	/**
	 * Textarea — multi-line text input.
	 *
	 * Usage:
	 *   <Textarea bind:value={message} placeholder="Your message" />
	 *   <Textarea rows={6} />
	 *
	 * Features:
	 * - Themed by tokens alone: --field-bg and --field-border, which the
	 *   admin overlay sets to a transparent fill behind a hairline
	 * - Non-resizable, min-height 180px
	 * - Design-token-first CSS with data-attribute selectors
	 * - Error state via aria-invalid="true": border changes to --colour-error
	 * - Success state via data-valid="true" attribute: border changes to --colour-success
	 */
	let { class: className, value = $bindable(), ...rest }: TextareaProps = $props();
</script>

<textarea class="textarea motif-form-control {className ?? ''}" bind:value {...rest}></textarea>

<style>
	.textarea {
		/* Default two-line minimum derived from input height token */
		min-height: calc(var(--input-height) * 2);
		width: 100%;
		resize: none;
		font-size: 1rem;
		/* The same machined control corner as Input and Select. */
		border-radius: var(--radius-base);
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

	.textarea {
		border: 1px solid var(--field-border);
		background: var(--field-bg);
		color: var(--text-primary);
		box-shadow: var(--input-shadow);
	}

	.textarea::placeholder {
		color: var(--text-muted);
	}

	/* The pulley-blue lamp in every theme, as Input. */
	.textarea:focus-visible {
		border-color: var(--focus);
		box-shadow: var(--focus-ring);
	}

	/* Error and success focus-ring states are handled by the shared
	   .motif-form-control rules in form-states.css (imported via base.css). */
</style>
