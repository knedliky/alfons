<script lang="ts" module>
	import type { Snippet } from 'svelte';
	import type { RadioOption } from './radio-group.js';

	export interface RadioGroupProps {
		/** Selected value — bind it or drive it via onChange */
		value?: string;
		/** Initial selection when value is not bound */
		defaultValue?: string;
		onChange?: (value: string) => void;
		/** Shared radio name; auto-generated if omitted */
		name?: string;
		/** Render radios from data instead of children */
		options?: RadioOption[];
		orientation?: 'vertical' | 'horizontal';
		disabled?: boolean;
		theme?: 'public' | 'admin';
		/** Additional CSS classes */
		class?: string;
		children?: Snippet;
		'aria-label'?: string;
	}
</script>

<script lang="ts">
	/**
	 * RadioGroup — single-choice container. Bind value (or provide onChange) and
	 * nest Radio children, or pass an options array. Arrow keys move between
	 * radios (native radio behaviour via the shared name). Lays the radios out
	 * vertically by default; orientation="horizontal" for an inline row.
	 *
	 * Usage:
	 *   <RadioGroup bind:value options={[{ value: 'a', label: 'Option A' }]} />
	 *   <RadioGroup bind:value>
	 *     <Radio value="a" label="Option A" />
	 *     <Radio value="b" label="Option B" />
	 *   </RadioGroup>
	 */
	import Radio from './Radio.svelte';
	import { setRadioGroupContext } from './radio-group.js';

	let {
		defaultValue,
		// The initial selection falls back to defaultValue; after that, value is
		// the single source of truth (bind it or read it via onChange).
		value = $bindable(defaultValue),
		onChange,
		name,
		options,
		orientation = 'vertical',
		disabled = false,
		theme = 'public',
		class: className = '',
		children,
		'aria-label': ariaLabel
	}: RadioGroupProps = $props();

	const autoName = $props.id();

	setRadioGroupContext({
		get current() {
			return value;
		},
		get name() {
			return name ?? autoName;
		},
		get disabled() {
			return disabled;
		},
		get theme() {
			return theme;
		},
		select(next: string) {
			value = next;
			onChange?.(next);
		}
	});
</script>

<div class="motif-radiogroup orient-{orientation} {className}" role="radiogroup" aria-label={ariaLabel}>
	{#if options}
		{#each options as option (option.value)}
			<Radio
				value={option.value}
				label={option.label}
				description={option.description}
				disabled={option.disabled}
			/>
		{/each}
	{:else}
		{@render children?.()}
	{/if}
</div>

<style>
	.motif-radiogroup {
		display: flex;
		gap: var(--space-3);
	}

	.motif-radiogroup.orient-vertical {
		flex-direction: column;
	}

	.motif-radiogroup.orient-horizontal {
		flex-direction: row;
		flex-wrap: wrap;
		gap: var(--space-5);
	}
</style>
