<script lang="ts" module>
	export interface ToggleProps {
		id?: string;
		name?: string;
		checked: boolean;
		disabled?: boolean;
		onchange?: (checked: boolean) => void;
	}
</script>

<script lang="ts">
	/**
	 * Toggle - a stylized boolean switch designed for public usage, adhering to brand semantics.
	 */
	let { id, name, checked = $bindable(false), disabled = false, onchange }: ToggleProps = $props();

	function handleToggle() {
		if (disabled) return;
		const newChecked = !checked;
		checked = newChecked;
		onchange?.(newChecked);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			handleToggle();
		}
	}
</script>

<button
	{id}
	type="button"
	class="toggle-switch"
	class:checked
	class:disabled
	role="switch"
	aria-checked={checked}
	tabindex={disabled ? -1 : 0}
	onclick={handleToggle}
	onkeydown={handleKeydown}
>
	{#if name}
		<input type="hidden" {name} value={checked ? 'true' : 'false'} />
	{/if}
	<span class="toggle-track">
		<span class="toggle-thumb"></span>
	</span>
</button>

<style>
	.toggle-switch {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		outline: none;
	}

	.toggle-switch.disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.toggle-switch:focus-visible .toggle-track {
		box-shadow: 0 0 0 3px var(--accent-bg-emphasis);
	}

	.toggle-track {
		display: inline-flex;
		align-items: center;
		width: 44px;
		height: 24px;
		padding: 3px;
		background-color: var(--border-glass-hover);
		border-radius: var(--radius-pill);
		transition: background-color var(--transition-fast);
	}

	.toggle-switch.checked .toggle-track {
		background-color: var(--accent);
	}

	.toggle-thumb {
		width: 18px;
		height: 18px;
		background-color: var(--text-primary);
		border-radius: 50%;
		transition: transform var(--transition-fast);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
	}

	.toggle-switch.checked .toggle-thumb {
		transform: translateX(20px);
	}
</style>
