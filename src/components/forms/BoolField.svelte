<script lang="ts" module>
	export interface BoolFieldProps {
		name: string;
		label: string;
		value: boolean;
		required?: boolean;
		error?: string;
		disabled?: boolean;
		description?: string;
		onchange?: (value: boolean) => void;
	}
</script>

<script lang="ts">
	/**
	 * BoolField — toggle switch for boolean PocketBase record fields.
	 *
	 * Usage:
	 *   <BoolField name="published" label="Published" bind:value={record.published} />
	 *
	 * Features:
	 * - Toggle switch with keyboard accessibility (Enter, Space)
	 * - Optional description text below the label
	 * - Error state with outline indicator
	 * - Admin token namespace
	 */

	let {
		name,
		label,
		value = false,
		required = false,
		error,
		disabled = false,
		description,
		onchange
	}: BoolFieldProps = $props();

	function handleToggle() {
		if (disabled) return;
		onchange?.(!value);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleToggle();
		}
	}
</script>

<div class="bool-field" class:has-error={!!error}>
	<label class="toggle-label">
		<div
			class="toggle-switch"
			class:checked={value}
			class:disabled
			role="switch"
			aria-checked={value}
			aria-label={label}
			tabindex={disabled ? -1 : 0}
			onclick={handleToggle}
			onkeydown={handleKeydown}
		>
			<input type="hidden" {name} value={value ? 'true' : 'false'} />
			<span class="toggle-track">
				<span class="toggle-thumb"></span>
			</span>
		</div>

		<div class="label-content">
			<span class="label-text">
				{label}
				{#if required}
					<span class="required-indicator" aria-hidden="true">*</span>
				{/if}
			</span>
			{#if description}
				<span class="description">{description}</span>
			{/if}
		</div>
	</label>

	{#if error}
		<span class="error-message">{error}</span>
	{/if}
</div>

<style>
	.bool-field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.toggle-label {
		display: flex;
		align-items: flex-start;
		gap: var(--space-4);
		cursor: pointer;
	}

	.toggle-switch {
		flex-shrink: 0;
		outline: none;
	}

	.toggle-switch:focus-visible .toggle-track {
		box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.3);
	}

	.toggle-switch.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toggle-track {
		display: flex;
		align-items: center;
		width: 48px;
		height: 26px;
		padding: 2px;
		background-color: var(--admin-border);
		border-radius: 0;
		transition: background-color 0.2s ease;
	}

	.toggle-switch.checked .toggle-track {
		background-color: var(--accent);
	}

	.toggle-thumb {
		width: 22px;
		height: 22px;
		background-color: var(--admin-text);
		border-radius: 50%;
		transition: transform 0.2s ease;
		box-shadow: var(--shadow-subtle);
	}

	.toggle-switch.checked .toggle-thumb {
		transform: translateX(22px);
	}

	.label-content {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding-top: 2px;
	}

	.label-text {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--admin-text);
		line-height: 1.4;
	}

	.required-indicator {
		color: var(--colour-error);
		font-weight: 600;
	}

	.description {
		font-size: 0.8125rem;
		color: var(--admin-text-secondary);
		line-height: 1.4;
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--colour-error);
		margin-left: calc(48px + var(--space-4));
	}

	.bool-field.has-error .toggle-track {
		box-shadow: 0 0 0 2px var(--colour-error);
	}
</style>
