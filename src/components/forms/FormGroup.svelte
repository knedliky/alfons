<script lang="ts" module>
	import type { ThemeVariant } from '../../contexts/theme.js';
	import type { Snippet } from 'svelte';

	export interface FormGroupProps {
		/** Visible label text for the form field */
		label: string;
		/** Validation error message — replaces hint when present */
		error?: string;
		/** Helper text shown below the input (hidden when error is present) */
		hint?: string;
		/** Whether the field is required — appends a * to the label */
		required?: boolean;
		/** Associates the label with a specific input via the HTML for attribute */
		htmlFor?: string;
		/** Theme variant — admin uses admin tokens, public uses brand tokens */
		theme?: ThemeVariant;
		/** Configurable success message shown on error-to-valid transitions */
		successMessage?: string;
		/** Additional CSS classes */
		class?: string;
		/** The input/select/textarea to render inside the group */
		children?: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * FormGroup — vertical wrapper that composes label + input + hint/error text.
	 *
	 * Usage:
	 *   <FormGroup label="Email" htmlFor="email" required>
	 *     <Input id="email" type="email" aria-invalid={!!errors.email}
	 *            aria-describedby="email-description" />
	 *   </FormGroup>
	 *
	 *   <FormGroup label="Name" error="Name is required" htmlFor="name">
	 *     <Input id="name" aria-invalid={!!errors.name}
	 *            aria-describedby="name-description" />
	 *   </FormGroup>
	 *
	 * Accessibility contract (aria-describedby wiring):
	 *   FormGroup generates a description element with the ID `{htmlFor}-description`.
	 *   This element holds the hint text, error message, or success confirmation.
	 *   Consumers MUST wire `aria-describedby="{htmlFor}-description"` on their
	 *   input element so that screen readers associate the description with the field.
	 *
	 *   The generated ID follows the pattern: `{htmlFor}-description`
	 *   For example, if htmlFor="email", the description ID is "email-description".
	 *
	 *   The description element always exists in the DOM (not conditionally rendered)
	 *   so the aria-describedby reference is always valid. Its content changes
	 *   between hint, error, and success states. The container has aria-live="polite"
	 *   so screen readers announce state transitions without interrupting the user.
	 *
	 *   The generated hintId is exposed as a read-only derived value via the
	 *   `descriptionId` export on FormGroupProps for consumers who need
	 *   programmatic access rather than hard-coding the ID pattern.
	 *
	 * Validation pattern:
	 *   FormGroup manages the error/success display (text, icons, transitions).
	 *   The input atom manages its own border colour via aria-invalid and data-valid
	 *   attributes. Connect them using aria-describedby on the input pointing to
	 *   the FormGroup's generated description ID ({htmlFor}-description).
	 *
	 * Features:
	 * - Consistent vertical spacing (--space-2 gap) across all form fields
	 * - Label atom with required indicator (*)
	 * - Hint text below the input for guidance
	 * - Error text slides in with max-height transition, styled with --colour-error
	 * - Error icon (circle-x) prepended to error messages
	 * - Success checkmark shown briefly when transitioning from error to valid
	 * - CSS-driven state visibility — no DOM thrashing on state transitions
	 * - Screen reader announcements via aria-live="polite"
	 * - Connects error text to input via aria-describedby pattern
	 * - Configurable success message via the successMessage prop
	 * - Theme-aware: supports both admin and public contexts
	 */
	import { Icon, Label } from '../atoms/index.js';
	import { getThemeVariant } from '../../contexts/theme.js';

	let {
		label,
		error,
		hint,
		required = false,
		htmlFor,
		theme,
		successMessage = 'Looks good',
		class: className,
		children
	}: FormGroupProps = $props();

	const activeTheme = $derived(theme ?? getThemeVariant());

	/** Unique identifier for the description element, used by aria-describedby on the input */
	const descriptionId = $derived(htmlFor ? `${htmlFor}-description` : undefined);

	/** Whether the group is currently in an error state */
	const hasError = $derived(!!error);

	/**
	 * Track the previous error state so we can detect the error-to-valid transition.
	 * When a field goes from having an error to being valid, we briefly show a
	 * success checkmark to confirm the correction.
	 */
	let previousHadError = $state(false);
	let showSuccess = $state(false);
	let successTimeoutId: ReturnType<typeof setTimeout> | undefined;

	/**
	 * ADH-021 fix: Capture previousHadError at the top of the reactive block
	 * before any conditional branching. This prevents a race condition where
	 * rapid error toggles could cause previousHadError to be updated after the
	 * success logic runs, leading to incorrect success animation flashes.
	 */
	$effect(() => {
		const wasPreviouslyInError = previousHadError;
		previousHadError = hasError;

		if (wasPreviouslyInError && !hasError) {
			/* Field just transitioned from error to valid — show success indicator */
			showSuccess = true;
			clearTimeout(successTimeoutId);
			successTimeoutId = setTimeout(() => {
				showSuccess = false;
			}, 1500);
		}
	});

	/* Clean up timeout on component teardown */
	$effect(() => {
		return () => {
			clearTimeout(successTimeoutId);
		};
	});

	/**
	 * Derive the current display state for CSS-driven visibility.
	 * All three states (error, success, hint) are always rendered in the DOM
	 * and toggled via the data-state attribute. This eliminates DOM thrashing
	 * from conditional rendering ({#if}) on state transitions.
	 */
	const displayState = $derived<'error' | 'success' | 'hint' | 'idle'>(
		hasError ? 'error' : showSuccess ? 'success' : hint ? 'hint' : 'idle'
	);
</script>

<div
	class="form-group {className ?? ''}"
	data-theme={activeTheme}
	data-error={hasError ? 'true' : undefined}
>
	<Label for={htmlFor}>
		<span class="form-group-label-text">{label}</span>
		{#if required}
			<span class="form-group-required" aria-hidden="true">*</span>
		{/if}
	</Label>

	<div class="form-group-input">
		{@render children?.()}
	</div>

	<!--
		ADH-024: All three description states (error, success, hint) are always
		present in the DOM. Visibility is controlled by data-state on the wrapper
		and data-variant on each child. This avoids DOM replacement on transitions
		and enables smooth CSS animations between states.
	-->
	<div
		id={descriptionId}
		class="form-group-description-wrapper"
		data-state={displayState}
		aria-live="polite"
	>
		<p class="form-group-description" data-variant="error" role="alert">
			<Icon name="error" size="sm" />
			<span>{error ?? ''}</span>
		</p>

		<p class="form-group-description" data-variant="success">
			<Icon name="check" size="sm" />
			<span>{successMessage}</span>
		</p>

		<p class="form-group-description" data-variant="hint">
			{hint ?? ''}
		</p>
	</div>
</div>

<style>
	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.form-group-label-text {
		display: inline;
	}

	.form-group-required {
		color: var(--colour-error);
		font-weight: 600;
		margin-left: var(--space-1);
	}

	.form-group-input {
		display: flex;
		flex-direction: column;
	}

	/* Wrapper provides the slide-in transition via max-height */
	.form-group-description-wrapper {
		max-height: 0;
		overflow: hidden;
		transition: max-height var(--transition-normal);
	}

	/* Expand the wrapper when any state is active */
	.form-group-description-wrapper[data-state='error'],
	.form-group-description-wrapper[data-state='success'],
	.form-group-description-wrapper[data-state='hint'] {
		max-height: 3rem;
	}

	.form-group-description {
		display: none;
		align-items: center;
		gap: var(--space-1);
		margin: 0;
		font-size: var(--text-caption);
		line-height: 1.4;
		color: var(--text-muted);
		transition: color var(--transition-normal);
	}

	/* Show the description variant that matches the current display state */
	.form-group-description-wrapper[data-state='error']
		.form-group-description[data-variant='error'] {
		display: flex;
		color: var(--colour-error);
	}

	.form-group-description-wrapper[data-state='success']
		.form-group-description[data-variant='success'] {
		display: flex;
		color: var(--colour-success);
	}

	.form-group-description-wrapper[data-state='hint'] .form-group-description[data-variant='hint'] {
		display: flex;
	}

	/* --- Admin theme overrides --- */

	.form-group[data-theme='admin'] .form-group-description {
		color: var(--admin-text-muted);
	}

	.form-group[data-theme='admin']
		.form-group-description-wrapper[data-state='error']
		.form-group-description[data-variant='error'] {
		color: var(--colour-error);
	}

	.form-group[data-theme='admin']
		.form-group-description-wrapper[data-state='success']
		.form-group-description[data-variant='success'] {
		color: var(--colour-success);
	}
</style>
