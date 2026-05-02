<script lang="ts" module>
	import type { NumberFieldOptions } from './types.js';

	export interface NumberFieldProps {
		name: string;
		label: string;
		value: number | null;
		required?: boolean;
		options?: NumberFieldOptions;
		error?: string;
		disabled?: boolean;
		placeholder?: string;
		onchange?: (value: number | null) => void;
	}
</script>

<script lang="ts">
	/**
	 * NumberField — numeric input with increment/decrement controls for PocketBase record forms.
	 *
	 * Usage:
	 *   <NumberField name="count" label="Count" bind:value={record.count} />
	 *
	 * Features:
	 * - Min/max constraint enforcement from PocketBase schema options
	 * - Integer or decimal support via noDecimal schema option
	 * - Step increment/decrement buttons
	 * - Admin token namespace
	 */

	let {
		name,
		label,
		value = null,
		required = false,
		options,
		error,
		disabled = false,
		placeholder,
		onchange
	}: NumberFieldProps = $props();

	const min = $derived(options?.min ?? undefined);
	const max = $derived(options?.max ?? undefined);
	const noDecimal = $derived(options?.noDecimal ?? false);
	const step = $derived(noDecimal ? 1 : 0.01);

	const displayValue = $derived(value !== null ? String(value) : '');

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const rawValue = target.value;

		if (rawValue === '' || rawValue === null) {
			onchange?.(null);
			return;
		}

		const numValue = noDecimal ? parseInt(rawValue, 10) : parseFloat(rawValue);

		if (!isNaN(numValue)) {
			onchange?.(numValue);
		}
	}

	function increment() {
		if (disabled) return;
		const currentValue = value ?? 0;
		const newValue = currentValue + step;

		if (max !== undefined && newValue > max) return;

		onchange?.(noDecimal ? Math.floor(newValue) : newValue);
	}

	function decrement() {
		if (disabled) return;
		const currentValue = value ?? 0;
		const newValue = currentValue - step;

		if (min !== undefined && newValue < min) return;

		onchange?.(noDecimal ? Math.ceil(newValue) : newValue);
	}
</script>

<div class="number-field">
	<label class="field-label" for={name}>
		<span class="label-text">{label}</span>
		{#if required}
			<span class="required-indicator" aria-hidden="true">*</span>
		{/if}
	</label>

	<div class="input-wrapper" class:has-error={!!error}>
		<button
			type="button"
			class="step-button decrement"
			onclick={decrement}
			{disabled}
			aria-label="Decrease value"
			tabindex="-1"
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
			</svg>
		</button>

		<input
			id={name}
			{name}
			type="number"
			value={displayValue}
			{disabled}
			{placeholder}
			{min}
			{max}
			{step}
			{required}
			class="field-input"
			oninput={handleInput}
			aria-invalid={!!error}
			aria-describedby={error ? `${name}-error` : undefined}
		/>

		<button
			type="button"
			class="step-button increment"
			onclick={increment}
			{disabled}
			aria-label="Increase value"
			tabindex="-1"
		>
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
			</svg>
		</button>
	</div>

	{#if error}
		<span id={`${name}-error`} class="error-message">{error}</span>
	{/if}

	{#if min !== undefined || max !== undefined}
		<span class="range-hint">
			{#if min !== undefined && max !== undefined}
				Range: {min} - {max}
			{:else if min !== undefined}
				Min: {min}
			{:else if max !== undefined}
				Max: {max}
			{/if}
		</span>
	{/if}
</div>

<style>
	.number-field {
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
		display: flex;
		align-items: stretch;
		border: 1px solid var(--admin-border);
		border-radius: var(--radius);
		overflow: hidden;
		transition: all 0.15s ease;
	}

	.input-wrapper:hover:not(:has(:disabled)) {
		border-color: var(--admin-text-muted);
	}

	.input-wrapper:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.15);
	}

	.input-wrapper.has-error {
		border-color: var(--colour-error);
	}

	.input-wrapper.has-error:focus-within {
		box-shadow: 0 0 0 3px var(--colour-error-bg);
	}

	.field-input {
		flex: 1;
		min-width: 0;
		height: 44px;
		padding: 0 var(--space-4);
		font-size: 0.9375rem;
		font-family: var(--font-mono);
		color: var(--admin-text);
		background-color: var(--admin-bg);
		border: none;
		text-align: center;
		appearance: textfield;
		-moz-appearance: textfield;
	}

	.field-input::-webkit-outer-spin-button,
	.field-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.field-input::placeholder {
		color: var(--admin-text-muted);
	}

	.field-input:focus {
		outline: none;
	}

	.field-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: var(--admin-bg-elevated);
	}

	.step-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		padding: 0;
		background-color: var(--admin-bg-elevated);
		border: none;
		color: var(--admin-text-secondary);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.step-button:hover:not(:disabled) {
		background-color: var(--admin-border);
		color: var(--admin-text);
	}

	.step-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.step-button svg {
		width: 18px;
		height: 18px;
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--colour-error);
	}

	.range-hint {
		font-size: 0.75rem;
		color: var(--admin-text-muted);
	}
</style>
