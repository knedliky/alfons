<script lang="ts" module>
	export interface CheckboxProps {
		checked?: boolean;
		/** Dash state — overridden by checked */
		indeterminate?: boolean;
		onChange?: (checked: boolean) => void;
		label?: string;
		/** Secondary line under the label */
		description?: string;
		disabled?: boolean;
		size?: 'default' | 'sm';
		/** Red outline */
		error?: boolean;
		name?: string;
		value?: string;
		theme?: 'public' | 'admin';
		/** Additional CSS classes */
		class?: string;
		id?: string;
	}
</script>

<script lang="ts">
	/**
	 * Checkbox — boolean control with a label, an optional description line, an
	 * indeterminate state and an error outline. The box fills with the accent on
	 * check (square corners per the radius doctrine). Bind checked or drive it
	 * via onChange.
	 *
	 * Usage:
	 *   <Checkbox bind:checked label="Email me updates" />
	 *   <Checkbox checked indeterminate label="Select all" description="3 of 7 selected" />
	 */
	let {
		checked = $bindable(false),
		indeterminate = false,
		onChange,
		label,
		description,
		disabled = false,
		size = 'default',
		error = false,
		name,
		value,
		theme = 'public',
		class: className = '',
		id
	}: CheckboxProps = $props();

	const autoId = $props.id();
	const fieldId = $derived(id ?? autoId);

	let inputElement: HTMLInputElement | undefined = $state();

	// The DOM's indeterminate flag is a property, not an attribute — mirror the
	// prop onto the element, letting a real check win over the dash.
	$effect(() => {
		if (inputElement) {
			inputElement.indeterminate = indeterminate && !checked;
		}
	});
</script>

<label
	class="motif-check size-{size} {className}"
	class:is-disabled={disabled}
	class:is-error={error}
	class:is-admin={theme === 'admin'}
	for={fieldId}
>
	<input
		bind:this={inputElement}
		id={fieldId}
		type="checkbox"
		class="motif-check-input"
		bind:checked
		{disabled}
		{name}
		{value}
		onchange={() => onChange?.(checked)}
		aria-invalid={error || undefined}
	/>
	<span class="motif-check-box" aria-hidden="true">
		{#if indeterminate && !checked}
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
			>
				<path d="M6 12h12" />
			</svg>
		{:else}
			<svg
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<polyline points="20 6 9 17 4 12" />
			</svg>
		{/if}
	</span>
	{#if label || description}
		<span class="motif-check-text">
			{#if label}<span class="motif-check-label">{label}</span>{/if}
			{#if description}<span class="motif-check-desc">{description}</span>{/if}
		</span>
	{/if}
</label>

<style>
	.motif-check {
		display: inline-flex;
		align-items: flex-start;
		gap: var(--space-3);
		cursor: pointer;
	}

	.motif-check.is-disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.motif-check-input {
		position: absolute;
		width: 1px;
		height: 1px;
		opacity: 0;
		margin: 0;
	}

	.motif-check-box {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.125rem;
		height: 1.125rem;
		margin-top: 0.0625rem;
		border-radius: 0;
		border: 1.5px solid var(--card-border);
		background: var(--card-bg);
		color: transparent;
		transition:
			background-color 0.2s ease,
			border-color 0.2s ease,
			color 0.2s ease,
			transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.motif-check.size-sm .motif-check-box {
		width: 1rem;
		height: 1rem;
	}

	.motif-check-box svg {
		width: 72%;
		height: 72%;
	}

	.motif-check-box svg polyline,
	.motif-check-box svg path {
		stroke-dasharray: 26;
		stroke-dashoffset: 26;
		transition: stroke-dashoffset 0.25s ease 0.06s;
	}

	.motif-check:hover:not(.is-disabled) .motif-check-box {
		border-color: var(--card-border-hover);
	}

	.motif-check:hover:not(.is-disabled)
		.motif-check-input:not(:checked):not(:indeterminate)
		+ .motif-check-box {
		transform: scale(1.08);
	}

	.motif-check-input:checked + .motif-check-box,
	.motif-check-input:indeterminate + .motif-check-box {
		background: var(--accent);
		border-color: var(--accent);
		/* White in both modes — the tick must stay legible on the accent fill,
		   so it does not track the theme's text colour. */
		color: oklch(1 0 0);
		animation: motif-check-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	.motif-check-input:checked + .motif-check-box svg polyline,
	.motif-check-input:indeterminate + .motif-check-box svg path {
		stroke-dashoffset: 0;
	}

	@keyframes motif-check-pop {
		0% {
			transform: scale(0.7);
		}
		55% {
			transform: scale(1.12);
		}
		100% {
			transform: scale(1);
		}
	}

	.motif-check-input:focus-visible + .motif-check-box {
		outline: 1.5px solid var(--focus-ring-color);
		outline-offset: 2px;
	}

	.motif-check.is-error .motif-check-box {
		border-color: var(--colour-error);
	}

	.motif-check-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.motif-check-label {
		font-family: var(--font-body);
		font-size: 0.9375rem;
		line-height: 1.4;
		color: var(--text-primary);
	}

	.motif-check-desc {
		font-family: var(--font-body);
		font-size: 0.8125rem;
		line-height: 1.4;
		color: var(--text-muted);
	}

	.motif-check.is-admin .motif-check-box {
		background: var(--admin-bg);
		border-color: var(--admin-border);
	}

	.motif-check.is-admin .motif-check-label {
		color: var(--admin-text);
	}

	.motif-check.is-admin .motif-check-desc {
		color: var(--admin-text-secondary);
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-check-box,
		.motif-check-box svg polyline,
		.motif-check-box svg path {
			transition: none;
			animation: none;
		}

		.motif-check-input:checked + .motif-check-box,
		.motif-check-input:indeterminate + .motif-check-box {
			animation: none;
		}

		.motif-check-input:checked + .motif-check-box svg polyline,
		.motif-check-input:indeterminate + .motif-check-box svg path {
			stroke-dashoffset: 0;
		}
	}
</style>
