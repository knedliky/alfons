<script lang="ts" module>
	export interface ToggleGroupOption<T extends string = string> {
		value: T;
		label: string;
	}

	export interface ToggleGroupProps<T extends string = string> {
		options: ToggleGroupOption<T>[];
		selected: T;
		onchange: (value: T) => void;
		class?: string;
	}
</script>

<script lang="ts" generics="T extends string = string">
	/**
	 * ToggleGroup — a pill-button segmented control, one value selected at a time.
	 *
	 * A compact glass-backed toolbar filter: each option is a button, the active one
	 * tinted. Pinned to --filter-control-height so it lines up with SelectFilter and
	 * any other filter control in the same toolbar, even when the row wraps.
	 */
	let { options, selected, onchange, class: className = '' }: ToggleGroupProps<T> = $props();
</script>

<div class="toggle-group {className}">
	{#each options as option}
		<button
			class="toggle-btn"
			class:toggle-btn--active={selected === option.value}
			onclick={() => onchange(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	/* Container — glass-compatible background and border. min-height pins this to
	   the shared filter-control rhythm so it always matches the sibling filters,
	   even when the toolbar wraps onto multiple rows. */
	.toggle-group {
		display: inline-flex;
		align-items: stretch;
		min-height: var(--filter-control-height);
		gap: 0.0625rem;
		padding: 0.25rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		/* Full pill. */
		border-radius: var(--radius-pill);
	}

	/* Inactive button — muted text, no background. Height is governed by the
	   container (min-height + align-items: stretch), so buttons set none. */
	.toggle-btn {
		/* Centre the label now that the button stretches to the container height. */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		/* Pin the line-height so the label can't inherit the page's taller body
		   line-height and push the button past the shared --filter-control-height
		   (which left the group ~3.6px taller than sibling SelectFilters). */
		line-height: 1.4;
		border: none;
		border-radius: var(--radius-pill);
		padding: 0.2rem 0.6rem;
		cursor: pointer;
		color: var(--text-muted);
		background: transparent;
		transition:
			color var(--transition-fast),
			background var(--transition-fast);
	}

	.toggle-btn:hover {
		color: var(--text-primary);
	}

	/* Active state — card-border tint background with primary text. */
	.toggle-btn--active,
	.toggle-btn--active:hover {
		background: var(--card-border);
		color: var(--text-primary);
	}

	/* Relaxed typography on wider viewports — height tracks --filter-control-height. */
	@media (min-width: 640px) {
		.toggle-btn {
			font-size: 0.75rem;
			padding: 0.25rem 0.75rem;
		}
	}
</style>
