<script lang="ts" module>
	import type { SelectFieldOptions } from './types.js';

	export interface SelectFieldProps {
		name: string;
		label: string;
		value: string;
		required?: boolean;
		options?: SelectFieldOptions;
		error?: string;
		disabled?: boolean;
		placeholder?: string;
		onchange?: (value: string) => void;
	}
</script>

<script lang="ts">
	/**
	 * SelectField — custom single-select dropdown for PocketBase record forms.
	 *
	 * Usage:
	 *   <SelectField name="status" label="Status" bind:value={record.status} {options} />
	 *
	 * Features:
	 * - Custom dropdown with keyboard navigation (arrow keys, Enter, Escape)
	 * - Clear selection button for optional fields
	 * - Scroll-into-view for highlighted options
	 * - Admin token namespace
	 */

	let {
		name,
		label,
		value = '',
		required = false,
		options,
		error,
		disabled = false,
		placeholder = 'Select an option',
		onchange
	}: SelectFieldProps = $props();

	let isOpen = $state(false);
	let highlightedIndex = $state(-1);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let listRef = $state<HTMLDivElement | null>(null);

	const selectOptions = $derived(options?.values ?? []);
	const selectedLabel = $derived(value || '');

	function toggleDropdown() {
		if (disabled) return;
		isOpen = !isOpen;
		if (isOpen) {
			highlightedIndex = selectOptions.findIndex((opt) => opt === value);
		}
	}

	function closeDropdown() {
		isOpen = false;
		highlightedIndex = -1;
	}

	function selectOption(option: string) {
		onchange?.(option);
		closeDropdown();
		triggerRef?.focus();
	}

	function clearSelection(event: Event) {
		event.stopPropagation();
		onchange?.('');
	}

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Enter':
			case ' ':
				event.preventDefault();
				if (isOpen && highlightedIndex >= 0) {
					selectOption(selectOptions[highlightedIndex]);
				} else {
					toggleDropdown();
				}
				break;

			case 'Escape':
				event.preventDefault();
				closeDropdown();
				break;

			case 'ArrowDown':
				event.preventDefault();
				if (!isOpen) {
					isOpen = true;
					highlightedIndex = selectOptions.findIndex((opt) => opt === value);
				} else {
					highlightedIndex = Math.min(highlightedIndex + 1, selectOptions.length - 1);
				}
				break;

			case 'ArrowUp':
				event.preventDefault();
				if (isOpen) {
					highlightedIndex = Math.max(highlightedIndex - 1, 0);
				}
				break;

			case 'Home':
				event.preventDefault();
				if (isOpen) highlightedIndex = 0;
				break;

			case 'End':
				event.preventDefault();
				if (isOpen) highlightedIndex = selectOptions.length - 1;
				break;

			case 'Tab':
				closeDropdown();
				break;
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;
		if (triggerRef && !triggerRef.contains(target) && listRef && !listRef.contains(target)) {
			closeDropdown();
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});

	$effect(() => {
		if (isOpen && highlightedIndex >= 0 && listRef) {
			const highlightedElement = listRef.querySelector(
				`[data-index="${highlightedIndex}"]`
			) as HTMLElement;
			highlightedElement?.scrollIntoView({ block: 'nearest' });
		}
	});
</script>

<div class="select-field">
	<label class="field-label" for={name}>
		<span class="label-text">{label}</span>
		{#if required}
			<span class="required-indicator" aria-hidden="true">*</span>
		{/if}
	</label>

	<div class="select-container">
		<div class="select-trigger-wrapper">
			<button
				bind:this={triggerRef}
				type="button"
				id={name}
				class="select-trigger"
				class:has-error={!!error}
				class:has-value={!!value}
				{disabled}
				onclick={toggleDropdown}
				onkeydown={handleKeydown}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-describedby={error ? `${name}-error` : undefined}
			>
				<span class="select-value" class:placeholder={!value}>
					{selectedLabel || placeholder}
				</span>

				<svg
					class="dropdown-arrow"
					class:open={isOpen}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{#if value && !disabled && !required}
				<button
					type="button"
					class="clear-button"
					onclick={clearSelection}
					aria-label="Clear selection"
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

		{#if isOpen}
			<div bind:this={listRef} class="dropdown-list" role="listbox" tabindex="-1">
				{#if selectOptions.length === 0}
					<div class="empty-message">No options available</div>
				{:else}
					{#each selectOptions as option, index (option)}
						<button
							type="button"
							class="dropdown-option"
							class:selected={option === value}
							class:highlighted={index === highlightedIndex}
							data-index={index}
							onclick={() => selectOption(option)}
							onmouseenter={() => (highlightedIndex = index)}
							role="option"
							aria-selected={option === value}
						>
							<span class="option-label">{option}</span>
							{#if option === value}
								<svg
									class="check-icon"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									aria-hidden="true"
								>
									<polyline
										points="20 6 9 17 4 12"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							{/if}
						</button>
					{/each}
				{/if}
			</div>
		{/if}
	</div>

	{#if error}
		<span id="{name}-error" class="error-message">{error}</span>
	{/if}
</div>

<style>
	.select-field {
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

	.select-container {
		position: relative;
	}

	.select-trigger-wrapper {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}

	.select-trigger {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex: 1;
		height: 44px;
		padding: 0 var(--space-4);
		font-size: 0.9375rem;
		font-family: inherit;
		color: var(--admin-text);
		background-color: var(--admin-bg);
		border: 1px solid var(--admin-border);
		border-radius: var(--radius);
		cursor: pointer;
		text-align: left;
		transition: all 0.15s ease;
	}

	.select-trigger:hover:not(:disabled) {
		border-color: var(--admin-text-muted);
	}

	.select-trigger:focus {
		outline: none;
		border-color: var(--accent);
		box-shadow: 0 0 0 3px rgba(var(--accent-rgb), 0.15);
	}

	.select-trigger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: var(--admin-bg-elevated);
	}

	.select-trigger.has-error {
		border-color: var(--colour-error);
	}

	.select-trigger.has-error:focus {
		box-shadow: 0 0 0 3px var(--colour-error-bg);
	}

	.select-value {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.select-value.placeholder {
		color: var(--admin-text-muted);
	}

	.clear-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
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
		width: 14px;
		height: 14px;
	}

	.dropdown-arrow {
		width: 18px;
		height: 18px;
		flex-shrink: 0;
		color: var(--admin-text-secondary);
		transition: transform 0.2s ease;
	}

	.dropdown-arrow.open {
		transform: rotate(180deg);
	}

	.dropdown-list {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		z-index: var(--z-dropdown);
		max-height: 240px;
		overflow-y: auto;
		background-color: var(--admin-bg);
		border: 1px solid var(--admin-border);
		border-radius: var(--radius);
		box-shadow: var(--shadow-dropdown);
	}

	.dropdown-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 10px var(--space-4);
		font-size: 0.9375rem;
		font-family: inherit;
		color: var(--admin-text);
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.15s ease;
	}

	.dropdown-option:first-child {
		border-radius: 7px 7px 0 0;
	}

	.dropdown-option:last-child {
		border-radius: 0 0 7px 7px;
	}

	.dropdown-option:only-child {
		border-radius: 7px;
	}

	.dropdown-option:hover,
	.dropdown-option.highlighted {
		background-color: var(--admin-bg-elevated);
	}

	.dropdown-option.selected {
		background-color: rgba(var(--accent-rgb), 0.15);
		color: var(--accent);
	}

	.dropdown-option.selected.highlighted {
		background-color: rgba(var(--accent-rgb), 0.2);
	}

	.option-label {
		flex: 1;
	}

	.check-icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		color: var(--accent);
	}

	.empty-message {
		padding: var(--space-4);
		font-size: 0.875rem;
		color: var(--admin-text-muted);
		text-align: center;
	}

	.error-message {
		font-size: 0.75rem;
		color: var(--colour-error);
	}

	.dropdown-list::-webkit-scrollbar {
		width: 6px;
	}

	.dropdown-list::-webkit-scrollbar-track {
		background: transparent;
	}

	.dropdown-list::-webkit-scrollbar-thumb {
		background: var(--admin-border);
		border-radius: 3px;
	}
</style>
