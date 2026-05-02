<script lang="ts" module>
	import type { TextFieldOptions } from './types.js';

	export interface TextFieldProps {
		name: string;
		label: string;
		value: string;
		type?: 'text' | 'email' | 'url';
		required?: boolean;
		options?: TextFieldOptions;
		error?: string;
		disabled?: boolean;
		placeholder?: string;
		onchange?: (value: string) => void;
	}
</script>

<script lang="ts">
	/**
	 * TextField — text, email, and URL input field for PocketBase record forms.
	 *
	 * Usage:
	 *   <TextField name="title" label="Title" bind:value={record.title} />
	 *
	 * Features:
	 * - Supports text, email, and URL input types with contextual icons
	 * - Character counter when schema defines a max length
	 * - Validation error display linked via aria-describedby
	 * - Admin token namespace
	 */

	let {
		name,
		label,
		value = '',
		type = 'text',
		required = false,
		options,
		error,
		disabled = false,
		placeholder,
		onchange
	}: TextFieldProps = $props();

	const maxLength = $derived(options?.max ?? undefined);
	const minLength = $derived(options?.min ?? undefined);
	const pattern = $derived(options?.pattern ?? undefined);

	const showCharacterCount = $derived(maxLength && maxLength > 0);
	const characterCount = $derived(value?.length ?? 0);

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		onchange?.(target.value);
	}
</script>

<div class="text-field">
	<label class="field-label" for={name}>
		<span class="label-text">{label}</span>
		{#if required}
			<span class="required-indicator" aria-hidden="true">*</span>
		{/if}
	</label>

	<div class="input-wrapper" class:has-error={!!error}>
		<input
			id={name}
			{name}
			{type}
			{value}
			{disabled}
			{placeholder}
			maxlength={maxLength}
			minlength={minLength}
			{pattern}
			{required}
			class="field-input"
			oninput={handleInput}
			aria-invalid={!!error}
			aria-describedby={error ? `${name}-error` : undefined}
		/>

		{#if type === 'email'}
			<svg
				class="field-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
				/>
			</svg>
		{:else if type === 'url'}
			<svg
				class="field-icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="1.5"
					d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
				/>
			</svg>
		{/if}
	</div>

	<div class="field-footer">
		{#if error}
			<span id={`${name}-error`} class="error-message">{error}</span>
		{/if}

		{#if showCharacterCount}
			<span
				class="character-count"
				class:near-limit={maxLength && characterCount > maxLength * 0.9}
			>
				{characterCount}/{maxLength}
			</span>
		{/if}
	</div>
</div>

<style>
	.text-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field-label {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--admin-text);
	}

	.label-text {
		line-height: 1.4;
	}

	.required-indicator {
		color: var(--colour-error);
		font-weight: 600;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.field-input {
		width: 100%;
		height: 44px;
		padding: 0 var(--space-4);
		padding-right: 40px;
		font-size: 0.9375rem;
		font-family: inherit;
		color: var(--admin-text);
		background-color: var(--admin-bg);
		border: 1px solid var(--admin-border);
		border-radius: var(--radius);
		transition: all 0.15s ease;
	}

	.field-input::placeholder {
		color: var(--admin-text-muted);
	}

	.field-input:hover:not(:disabled) {
		border-color: var(--admin-text-muted);
	}

	.field-input:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.15);
	}

	.field-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: var(--admin-bg-elevated);
	}

	.input-wrapper.has-error .field-input {
		border-color: var(--colour-error);
	}

	.input-wrapper.has-error .field-input:focus {
		box-shadow: 0 0 0 3px var(--colour-error-bg);
	}

	.field-icon {
		position: absolute;
		right: 12px;
		width: 18px;
		height: 18px;
		color: var(--admin-text-muted);
		pointer-events: none;
	}

	.field-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 20px;
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--colour-error);
	}

	.character-count {
		margin-left: auto;
		font-size: 0.75rem;
		font-family: var(--font-mono);
		color: var(--admin-text-muted);
	}

	.character-count.near-limit {
		color: var(--colour-warning);
	}
</style>
