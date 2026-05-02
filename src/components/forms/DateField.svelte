<script lang="ts" module>
	export interface DateFieldProps {
		name: string;
		label: string;
		value: string | null;
		includeTime?: boolean;
		required?: boolean;
		error?: string;
		disabled?: boolean;
		minDate?: string;
		maxDate?: string;
		onchange?: (value: string | null) => void;
	}
</script>

<script lang="ts">
	/**
	 * DateField — date and datetime input for PocketBase record forms.
	 *
	 * Usage:
	 *   <DateField name="publishedAt" label="Published at" bind:value={record.published_at} />
	 *
	 * Features:
	 * - Date and datetime-local input support
	 * - Australian date format display (DD MMM YYYY HH:mm)
	 * - Clear button for nullable date fields
	 * - Admin token namespace
	 */

	let {
		name,
		label,
		value = null,
		includeTime = true,
		required = false,
		error,
		disabled = false,
		minDate,
		maxDate,
		onchange
	}: DateFieldProps = $props();

	const inputValue = $derived.by(() => {
		if (!value) return '';

		try {
			const date = new Date(value);
			if (isNaN(date.getTime())) return '';

			if (includeTime) {
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				const hours = String(date.getHours()).padStart(2, '0');
				const minutes = String(date.getMinutes()).padStart(2, '0');
				return `${year}-${month}-${day}T${hours}:${minutes}`;
			} else {
				const year = date.getFullYear();
				const month = String(date.getMonth() + 1).padStart(2, '0');
				const day = String(date.getDate()).padStart(2, '0');
				return `${year}-${month}-${day}`;
			}
		} catch {
			return '';
		}
	});

	const displayValue = $derived.by(() => {
		if (!value) return '';

		try {
			const date = new Date(value);
			if (isNaN(date.getTime())) return '';

			const formatter = new Intl.DateTimeFormat('en-AU', {
				day: '2-digit',
				month: 'short',
				year: 'numeric',
				...(includeTime && {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false
				})
			});

			return formatter.format(date);
		} catch {
			return '';
		}
	});

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const inputVal = target.value;

		if (!inputVal) {
			onchange?.(null);
			return;
		}

		try {
			const date = new Date(inputVal);
			if (!isNaN(date.getTime())) {
				onchange?.(date.toISOString());
			}
		} catch {
			onchange?.(null);
		}
	}

	function handleClear() {
		if (disabled) return;
		onchange?.(null);
	}
</script>

<div class="date-field">
	<label class="field-label" for={name}>
		<span class="label-text">{label}</span>
		{#if required}
			<span class="required-indicator" aria-hidden="true">*</span>
		{/if}
	</label>

	<div class="input-wrapper" class:has-error={!!error}>
		<svg
			class="calendar-icon"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			aria-hidden="true"
		>
			<rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="1.5" />
			<line x1="16" y1="2" x2="16" y2="6" stroke-width="1.5" stroke-linecap="round" />
			<line x1="8" y1="2" x2="8" y2="6" stroke-width="1.5" stroke-linecap="round" />
			<line x1="3" y1="10" x2="21" y2="10" stroke-width="1.5" />
		</svg>

		<input
			id={name}
			{name}
			type={includeTime ? 'datetime-local' : 'date'}
			value={inputValue}
			{disabled}
			{required}
			min={minDate}
			max={maxDate}
			class="field-input"
			oninput={handleInput}
			aria-invalid={!!error}
			aria-describedby={error ? `${name}-error` : undefined}
		/>

		{#if value && !disabled}
			<button
				type="button"
				class="clear-button"
				onclick={handleClear}
				aria-label="Clear date"
				tabindex="-1"
			>
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		{/if}
	</div>

	{#if displayValue}
		<span class="display-value">{displayValue}</span>
	{/if}

	{#if error}
		<span id={`${name}-error`} class="error-message">{error}</span>
	{/if}
</div>

<style>
	.date-field {
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

	.calendar-icon {
		position: absolute;
		left: 12px;
		width: 18px;
		height: 18px;
		color: var(--admin-text-muted);
		pointer-events: none;
		z-index: var(--z-raised);
	}

	.field-input {
		width: 100%;
		height: 44px;
		padding: 0 var(--space-4);
		padding-left: 40px;
		padding-right: 40px;
		font-size: 0.9375rem;
		font-family: inherit;
		color: var(--admin-text);
		background-color: var(--admin-bg);
		border: 1px solid var(--admin-border);
		border-radius: var(--radius);
		transition: all 0.15s ease;
		color-scheme: dark;
	}

	.field-input::-webkit-calendar-picker-indicator {
		filter: invert(1);
		opacity: 0.6;
		cursor: pointer;
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

	.clear-button {
		position: absolute;
		right: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: 4px;
		color: var(--admin-text-muted);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.clear-button:hover {
		background-color: var(--admin-border);
		color: var(--admin-text);
	}

	.clear-button svg {
		width: 16px;
		height: 16px;
	}

	.display-value {
		font-size: 0.8125rem;
		color: var(--admin-text-secondary);
		font-family: var(--font-mono);
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--colour-error);
	}
</style>
