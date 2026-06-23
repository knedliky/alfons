<script lang="ts" module>
	export interface RangeSliderProps {
		id?: string;
		name?: string;
		value: number;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		onchange?: (value: number) => void;
	}
</script>

<script lang="ts">
	/**
	 * RangeSlider — native slider input for precise configuration panels, built for public usage.
	 *
	 * Inherits aesthetic cues from other forms while offering seamless input capabilities.
	 */
	let {
		id,
		name,
		value = $bindable(0),
		min = 0,
		max = 100,
		step = 1,
		disabled = false,
		onchange
	}: RangeSliderProps = $props();

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = parseFloat(target.value);
		value = newValue;
		onchange?.(newValue);
	}
</script>

<input
	{id}
	{name}
	type="range"
	{min}
	{max}
	{step}
	{value}
	{disabled}
	oninput={handleInput}
	class="range-slider"
	class:disabled
/>

<style>
	.range-slider {
		width: 100%;
		height: 4px;
		border-radius: var(--radius-pill);
		appearance: none;
		background-color: var(--border-glass);
		cursor: pointer;
		transition: opacity var(--transition-fast);
		outline: none;
	}

	.range-slider:focus-visible {
		box-shadow:
			0 0 0 2px var(--bg-primary),
			0 0 0 4px var(--accent-border);
	}

	.range-slider.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	:global([data-colour-mode='light']) .range-slider {
		background-color: var(--surface-dark-subtle);
	}

	/* Webkit Slider Thumb */
	.range-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		height: 16px;
		width: 16px;
		border-radius: 50%;
		background: var(--accent);
		cursor: pointer;
		border: 2px solid var(--bg-primary);
		box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.4);
		transition: transform var(--transition-fast);
	}

	.range-slider::-webkit-slider-thumb:hover {
		transform: scale(1.2);
	}

	.range-slider.disabled::-webkit-slider-thumb {
		cursor: not-allowed;
	}

	/* Firefox Slider Thumb */
	.range-slider::-moz-range-thumb {
		height: 16px;
		width: 16px;
		border-radius: 50%;
		background: var(--accent);
		cursor: pointer;
		border: 2px solid var(--bg-primary);
		box-shadow: 0 0 10px rgba(var(--accent-rgb), 0.4);
		transition: transform var(--transition-fast);
	}

	.range-slider::-moz-range-thumb:hover {
		transform: scale(1.2);
	}

	.range-slider.disabled::-moz-range-thumb {
		cursor: not-allowed;
	}
</style>
