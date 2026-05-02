<script lang="ts" module>
	import type { SelectFieldOptions } from './types.js';

	export interface MultiSelectFieldProps {
		name: string;
		label: string;
		value: string[];
		required?: boolean;
		options?: SelectFieldOptions;
		error?: string;
		disabled?: boolean;
		placeholder?: string;
		onchange?: (value: string[]) => void;
	}
</script>

<script lang="ts">
	/**
	 * MultiSelectField — checkbox-based multi-select for PocketBase select fields.
	 *
	 * Usage:
	 *   <MultiSelectField name="tags" label="Tags" bind:value={tags} {options} />
	 *
	 * Features:
	 * - Tag display of selected items with individual removal
	 * - Max-selection limit with counter
	 * - Clear-all button
	 * - Dropdown with checkboxes
	 * - Click-outside close
	 * - Keyboard navigation (Enter, Space, Escape)
	 * - Admin token namespace
	 */

	let {
		name,
		label,
		value = [],
		required = false,
		options,
		error,
		disabled = false,
		placeholder = 'Select options',
		onchange
	}: MultiSelectFieldProps = $props();

	let isOpen = $state(false);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let listRef = $state<HTMLDivElement | null>(null);

	const selectOptions = $derived(options?.values ?? []);
	const maxSelect = $derived(options?.maxSelect ?? Infinity);
	const maxReached = $derived(value.length >= maxSelect);

	function toggleDropdown() {
		if (disabled) return;
		isOpen = !isOpen;
	}

	function closeDropdown() {
		isOpen = false;
	}

	function toggleOption(option: string) {
		const isSelected = value.includes(option);

		if (isSelected) {
			onchange?.(value.filter((v) => v !== option));
		} else if (!maxReached) {
			onchange?.([...value, option]);
		}
	}

	function removeOption(option: string, event: Event) {
		event.stopPropagation();
		if (disabled) return;
		onchange?.(value.filter((v) => v !== option));
	}

	function clearAll(event: Event) {
		event.stopPropagation();
		if (disabled) return;
		onchange?.([]);
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as Node;
		if (triggerRef && !triggerRef.contains(target) && listRef && !listRef.contains(target)) {
			closeDropdown();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Escape':
				event.preventDefault();
				closeDropdown();
				break;

			case 'Enter':
			case ' ':
				event.preventDefault();
				toggleDropdown();
				break;
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside);
			return () => document.removeEventListener('click', handleClickOutside);
		}
	});
</script>

<div class="multi-select-field">
	<label class="field-label" for={name}>
		<span class="label-text">{label}</span>
		{#if required}
			<span class="required-indicator">*</span>
		{/if}
		{#if maxSelect !== Infinity}
			<span class="max-hint">({value.length}/{maxSelect})</span>
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
				class:has-value={value.length > 0}
				{disabled}
				onclick={toggleDropdown}
				onkeydown={handleKeydown}
				aria-haspopup="listbox"
				aria-expanded={isOpen}
				aria-describedby={error ? `${name}-error` : undefined}
			>
				{#if value.length === 0}
					<span class="placeholder">{placeholder}</span>
				{:else}
					<div class="selected-tags">
						{#each value.slice(0, 3) as selectedValue (selectedValue)}
							<span class="tag">
								<span class="tag-text">{selectedValue}</span>
								<span
									class="tag-remove"
									role="button"
									tabindex="-1"
									onclick={(e) => {
										e.stopPropagation();
										removeOption(selectedValue, e);
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter') {
											e.stopPropagation();
											removeOption(selectedValue, e);
										}
									}}
									aria-label="Remove {selectedValue}"
								>
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								</span>
							</span>
						{/each}
						{#if value.length > 3}
							<span class="tag more">+{value.length - 3}</span>
						{/if}
					</div>
				{/if}

				<svg
					class="dropdown-arrow"
					class:open={isOpen}
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{#if value.length > 0 && !disabled}
				<button
					type="button"
					class="clear-button"
					onclick={clearAll}
					aria-label="Clear all selections"
				>
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
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
			<div
				bind:this={listRef}
				class="dropdown-list"
				role="listbox"
				tabindex="-1"
				aria-multiselectable="true"
			>
				{#if selectOptions.length === 0}
					<div class="empty-message">No options available</div>
				{:else}
					{#each selectOptions as option (option)}
						{@const isSelected = value.includes(option)}
						{@const isDisabledOption = !isSelected && maxReached}
						<button
							type="button"
							class="dropdown-option"
							class:selected={isSelected}
							class:disabled-option={isDisabledOption}
							onclick={() => !isDisabledOption && toggleOption(option)}
							role="option"
							aria-selected={isSelected}
							disabled={isDisabledOption}
						>
							<span class="checkbox" class:checked={isSelected}>
								{#if isSelected}
									<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<polyline
											points="20 6 9 17 4 12"
											stroke-width="2"
											stroke-linecap="round"
											stroke-linejoin="round"
										/>
									</svg>
								{/if}
							</span>
							<span class="option-label">{option}</span>
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
	.multi-select-field {
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

	.max-hint {
		margin-left: auto;
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--admin-text-muted);
		font-family: var(--font-mono);
	}

	.select-container {
		position: relative;
	}

	.select-trigger {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		width: 100%;
		min-height: 44px;
		padding: 6px var(--space-4);
		font-size: 0.9375rem;
		font-family: inherit;
		color: var(--admin-text);
		background-color: var(--admin-bg);
		border: 1px solid var(--admin-border);
		border-radius: 8px;
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

	.placeholder {
		color: var(--admin-text-muted);
		flex: 1;
	}

	.selected-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		flex: 1;
	}

	.tag {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		font-size: 0.8125rem;
		background-color: rgba(var(--accent-rgb), 0.15);
		color: var(--accent);
		border-radius: 4px;
	}

	.tag.more {
		background-color: var(--admin-border);
		color: var(--admin-text-secondary);
	}

	.tag-text {
		line-height: 1.2;
	}

	.tag-remove {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		padding: 0;
		background: transparent;
		border: none;
		border-radius: 2px;
		color: inherit;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity 0.15s ease;
	}

	.tag-remove:hover {
		opacity: 1;
	}

	.tag-remove svg {
		width: 12px;
		height: 12px;
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
		border-radius: 8px;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
	}

	.dropdown-option {
		display: flex;
		align-items: center;
		gap: var(--space-2);
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

	.dropdown-option:hover:not(:disabled) {
		background-color: var(--admin-bg-elevated);
	}

	.dropdown-option.selected {
		background-color: rgba(var(--accent-rgb), 0.1);
	}

	.dropdown-option.disabled-option {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.checkbox {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		flex-shrink: 0;
		border: 1.5px solid var(--admin-border);
		border-radius: 4px;
		background-color: transparent;
		transition: all 0.15s ease;
	}

	.checkbox.checked {
		background-color: var(--accent);
		border-color: var(--accent);
	}

	.checkbox svg {
		width: 12px;
		height: 12px;
		/* Checked state — icon inherits accent background, needs light stroke */
		color: var(--admin-bg);
	}

	.option-label {
		flex: 1;
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

	.select-trigger-wrapper {
		display: flex;
		align-items: center;
		gap: var(--space-1);
	}
</style>
