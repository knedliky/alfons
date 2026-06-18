<script lang="ts" module>
	import type { SelectOption } from './Select.svelte';

	export interface SelectFilterProps {
		value: string;
		options: SelectOption[];
		placeholder?: string;
		/** Render a search input above the options that filters by label. */
		searchable?: boolean;
		onchange?: (value: string) => void;
		/** Applied to the underlying Select trigger. */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * SelectFilter — a dropdown filter control: Motif's Select, pinned to the shared
	 * --filter-control-height so it lines up with ToggleGroup and other toolbar
	 * filters rather than the default small-input height. A thin preset, not a new
	 * control — pass it generic {value, options, onchange} like any Select.
	 */
	import Select from './Select.svelte';

	let {
		value,
		options,
		placeholder,
		searchable,
		onchange,
		class: className = ''
	}: SelectFilterProps = $props();
</script>

<div class="select-filter">
	<Select {value} {options} {placeholder} {searchable} size="sm" class={className} {onchange} />
</div>

<style>
	/* Redirect the sm Select's height token to the shared filter-control height so
	   the dropdown matches its toolbar siblings. display: contents keeps the wrapper
	   out of layout; the custom property still cascades into the Select. */
	.select-filter {
		display: contents;
		--input-height-sm: var(--filter-control-height);
	}
</style>
