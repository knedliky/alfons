<script lang="ts" module>
	export interface RadioProps {
		value: string;
		label?: string;
		description?: string;
		disabled?: boolean;
		/** Standalone use (outside a RadioGroup) */
		checked?: boolean;
		onChange?: (value: string) => void;
		name?: string;
		theme?: 'public' | 'admin';
		/** Additional CSS classes */
		class?: string;
		id?: string;
	}
</script>

<script lang="ts">
	/**
	 * Radio — one option inside a RadioGroup. Reads selection from the group
	 * context; can also be driven standalone via checked + onChange. The dot
	 * stays circular — the one deliberate exception to the square doctrine.
	 *
	 * Usage:
	 *   <Radio value="a" label="Option A" />
	 *   <Radio value="b" label="Standalone" checked onChange={handle} />
	 */
	import { getRadioGroupContext } from './radio-group.js';

	let {
		value,
		label,
		description,
		disabled: ownDisabled = false,
		checked = false,
		onChange,
		name,
		theme = 'public',
		class: className = '',
		id
	}: RadioProps = $props();

	const context = getRadioGroupContext();

	const autoId = $props.id();
	const fieldId = $derived(id ?? autoId);
	const isChecked = $derived(context ? context.current === value : checked);
	const isDisabled = $derived(ownDisabled || (context?.disabled ?? false));
	const groupName = $derived(context?.name ?? name);
	const activeTheme = $derived(context?.theme ?? theme);

	function handleChange() {
		if (isDisabled) return;
		if (context) {
			context.select(value);
		} else {
			onChange?.(value);
		}
	}
</script>

<label
	class="motif-radio {className}"
	class:is-disabled={isDisabled}
	class:is-admin={activeTheme === 'admin'}
	for={fieldId}
>
	<input
		id={fieldId}
		type="radio"
		class="motif-radio-input"
		name={groupName}
		{value}
		checked={isChecked}
		disabled={isDisabled}
		onchange={handleChange}
	/>
	<span class="motif-radio-dot" aria-hidden="true"></span>
	{#if label || description}
		<span class="motif-radio-text">
			{#if label}<span class="motif-radio-label">{label}</span>{/if}
			{#if description}<span class="motif-radio-desc">{description}</span>{/if}
		</span>
	{/if}
</label>

<style>
	.motif-radio {
		display: inline-flex;
		align-items: flex-start;
		gap: var(--space-3);
		cursor: pointer;
	}

	.motif-radio.is-disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.motif-radio-input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		margin: 0;
	}

	.motif-radio-dot {
		flex-shrink: 0;
		position: relative;
		width: 1.125rem;
		height: 1.125rem;
		margin-top: 0.0625rem;
		border-radius: 50%;
		border: 1.5px solid var(--card-border);
		background: var(--card-bg);
		transition:
			border-color 0.2s ease,
			transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.motif-radio-dot::after {
		content: '';
		position: absolute;
		inset: 0;
		margin: auto;
		width: 0.46rem;
		height: 0.46rem;
		border-radius: 50%;
		background: var(--accent);
		transform: scale(0);
		transition: transform 0.32s cubic-bezier(0.34, 1.7, 0.5, 1);
	}

	.motif-radio:hover:not(.is-disabled) .motif-radio-dot {
		border-color: var(--card-border-hover);
	}

	.motif-radio:hover:not(.is-disabled) .motif-radio-input:not(:checked) + .motif-radio-dot {
		transform: scale(1.1);
	}

	.motif-radio-input:checked + .motif-radio-dot {
		border-color: transparent;
		background: var(--accent);
		animation: motif-radio-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.motif-radio-input:checked + .motif-radio-dot::after {
		background: var(--text-primary);
		transform: scale(1);
	}

	@keyframes motif-radio-pop {
		0% {
			transform: scale(0.7);
		}
		55% {
			transform: scale(1.14);
		}
		100% {
			transform: scale(1);
		}
	}

	.motif-radio-input:focus-visible + .motif-radio-dot {
		outline: 1.5px solid var(--focus-ring-color);
		outline-offset: 2px;
	}

	.motif-radio-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.motif-radio-label {
		font-family: var(--font-body);
		font-size: 0.9375rem;
		line-height: 1.4;
		color: var(--text-primary);
	}

	.motif-radio-desc {
		font-family: var(--font-body);
		font-size: 0.8125rem;
		line-height: 1.4;
		color: var(--text-muted);
	}

	.motif-radio.is-admin .motif-radio-dot {
		background: var(--admin-bg);
		border-color: var(--admin-border);
	}

	.motif-radio.is-admin .motif-radio-label {
		color: var(--admin-text);
	}

	.motif-radio.is-admin .motif-radio-desc {
		color: var(--admin-text-secondary);
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-radio-dot,
		.motif-radio-dot::after {
			transition: none;
			animation: none;
		}

		.motif-radio-input:checked + .motif-radio-dot {
			animation: none;
		}
	}
</style>
