<script lang="ts" module>
	export interface SelectOption {
		value: string;
		label: string;
		style?: string;
	}

	export interface SelectProps {
		value: string;
		options: SelectOption[];
		placeholder?: string;
		size?: 'default' | 'sm';
		class?: string;
		error?: boolean;
		/** Briefly highlights the trigger border with --colour-success */
		valid?: boolean;
		disabled?: boolean;
		theme?: 'admin' | 'public';
		/** When true, render a search input above the options that filters by label. */
		searchable?: boolean;
		/** Placeholder shown in the search input. Ignored when `searchable` is false. */
		searchPlaceholder?: string;
		onchange?: (value: string) => void;
	}
</script>

<script lang="ts">
	/**
	 * Select — custom floating dropdown with keyboard navigation.
	 *
	 * Usage:
	 *   <Select
	 *     value={selectedFont}
	 *     options={fontOptions}
	 *     onchange={(v) => (selectedFont = v)}
	 *   />
	 *
	 * Features:
	 * - Floating fixed-position dropdown (escapes overflow containers)
	 * - Flips above trigger when insufficient space below viewport
	 * - Full keyboard navigation (arrows, enter, escape, home/end)
	 * - Admin and public theme contexts via CSS custom properties
	 * - Closes on outside click and page scroll
	 * - Optional `searchable` filter input with a "No matches" empty state
	 * - Error state via aria-invalid="true" (set from error prop): border changes to --colour-error
	 * - Success state via data-valid="true" attribute (set from valid prop): border changes to --colour-success
	 */
	import { getThemeVariant } from '../../contexts/theme.js';

	let {
		value = '',
		options = [],
		placeholder = 'Select an option',
		size = 'default',
		class: className,
		error = false,
		valid = false,
		disabled = false,
		theme,
		searchable = false,
		searchPlaceholder = 'Search...',
		onchange
	}: SelectProps = $props();

	let isOpen = $state(false);
	let triggerRef = $state<HTMLButtonElement | null>(null);
	let listRef = $state<HTMLDivElement | null>(null);
	let searchInputRef = $state<HTMLInputElement | null>(null);
	let highlightedIndex = $state(-1);
	let searchQuery = $state('');
	// Initialise off-screen to prevent flicker before position is calculated
	let dropdownPosition = $state({ top: -9999, left: -9999, minWidth: 0, showAbove: false });

	const DROPDOWN_MAX_HEIGHT = 280;
	const DROPDOWN_GAP = 8;

	const activeTheme = $derived(theme ?? getThemeVariant());

	function getThemeToken(publicToken: string, adminToken: string): string {
		return activeTheme === 'admin' ? `var(${adminToken})` : `var(${publicToken})`;
	}

	/**
	 * Theme-aware token map — resolves public vs admin CSS custom properties.
	 * Note: var(--accent) and var(--colour-error/success) are used directly
	 * in the template because they are context-independent (shared across both
	 * themes, not overridden in admin.css). Only tokens that differ between
	 * admin and public contexts need the getThemeToken indirection.
	 */
	const tokens = $derived({
		text: getThemeToken('--text-primary', '--admin-text'),
		textSecondary: getThemeToken('--text-secondary', '--admin-text-secondary'),
		textMuted: getThemeToken('--text-muted', '--admin-text-muted'),
		border: getThemeToken('--card-border', '--admin-border'),
		background: getThemeToken('--card-bg', '--admin-bg'),
		// The floating dropdown sits at L3 of the elevation ladder: the public theme
		// uses the frosted-glass L3 fill (translucent, the dropdown's blur keeps it
		// legible); admin keeps its solid elevated surface.
		backgroundElevated: getThemeToken('--elevation-3-bg', '--admin-bg-elevated'),
		inputBg: getThemeToken('--input-bg', '--admin-bg')
	});

	const selectedOption = $derived(options.find((opt) => opt.value === value));

	/**
	 * Visible options after applying the search filter. When not searchable or
	 * the query is empty this is identical to `options`. All selection,
	 * keyboard navigation, and highlight logic operates over this list so the
	 * filtered view stays internally consistent.
	 */
	const visibleOptions = $derived.by(() => {
		if (!searchable || searchQuery.trim() === '') return options;
		const query = searchQuery.toLowerCase().trim();
		return options.filter((opt) => opt.label.toLowerCase().includes(query));
	});

	// Only show dropdown once position has been calculated
	const isPositioned = $derived(dropdownPosition.minWidth > 0);

	function calculateDropdownPosition() {
		if (!triggerRef) return;
		const rect = triggerRef.getBoundingClientRect();
		const viewportHeight = window.innerHeight;

		const spaceBelow = viewportHeight - rect.bottom - DROPDOWN_GAP;
		const spaceAbove = rect.top - DROPDOWN_GAP;

		// Flip above when there is more room above than below
		const showAbove = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;

		dropdownPosition = {
			top: showAbove ? rect.top - DROPDOWN_GAP : rect.bottom + DROPDOWN_GAP,
			left: rect.left,
			minWidth: rect.width,
			showAbove
		};
	}

	function toggleDropdown() {
		if (!isOpen) {
			// Open first, then calculate position — ensures DOM is ready
			isOpen = true;
			highlightedIndex = visibleOptions.findIndex((opt) => opt.value === value);
			requestAnimationFrame(() => {
				calculateDropdownPosition();
			});
		} else {
			closeDropdown();
		}
	}

	function closeDropdown() {
		isOpen = false;
		highlightedIndex = -1;
		searchQuery = '';
		// Reset position so stale values don't appear on next open
		dropdownPosition = { top: -9999, left: -9999, minWidth: 0, showAbove: false };
	}

	function selectOption(option: SelectOption) {
		onchange?.(option.value);
		closeDropdown();
		triggerRef?.focus();
	}

	function handleKeydown(event: KeyboardEvent) {
		switch (event.key) {
			case 'Enter':
				event.preventDefault();
				if (isOpen && highlightedIndex >= 0 && highlightedIndex < visibleOptions.length) {
					selectOption(visibleOptions[highlightedIndex]);
				} else {
					toggleDropdown();
				}
				break;

			case ' ':
				// Space is a valid character in the search input — only treat it as
				// "select highlighted" when the search input is not in play.
				if (!searchable) {
					event.preventDefault();
					if (isOpen && highlightedIndex >= 0 && highlightedIndex < visibleOptions.length) {
						selectOption(visibleOptions[highlightedIndex]);
					} else {
						toggleDropdown();
					}
				}
				break;

			case 'Escape':
				event.preventDefault();
				closeDropdown();
				break;

			case 'ArrowDown':
				event.preventDefault();
				if (!isOpen) {
					toggleDropdown();
				} else {
					highlightedIndex = Math.min(highlightedIndex + 1, visibleOptions.length - 1);
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
				if (isOpen && visibleOptions.length > 0) {
					highlightedIndex = 0;
				}
				break;

			case 'End':
				event.preventDefault();
				if (isOpen && visibleOptions.length > 0) {
					highlightedIndex = visibleOptions.length - 1;
				}
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

	// Auto-focus the search input on open so the user can type immediately
	$effect(() => {
		if (isOpen && searchable && isPositioned) {
			queueMicrotask(() => searchInputRef?.focus());
		}
	});

	// Reset the highlight when the filter changes, so Enter doesn't select a
	// stale row that scrolled out of the filtered list.
	$effect(() => {
		void searchQuery;
		if (isOpen && searchable) {
			highlightedIndex = visibleOptions.length > 0 ? 0 : -1;
		}
	});

	// Close on page scroll to prevent a disconnected-looking dropdown
	$effect(() => {
		if (isOpen) {
			const handleScroll = (event: Event) => {
				// Ignore scrolling within the dropdown itself
				if (listRef && listRef.contains(event.target as Node)) {
					return;
				}
				closeDropdown();
			};
			window.addEventListener('scroll', handleScroll, true);
			return () => window.removeEventListener('scroll', handleScroll, true);
		}
	});

	// Scroll highlighted option into view during keyboard navigation
	$effect(() => {
		if (isOpen && highlightedIndex >= 0 && listRef) {
			const highlightedElement = listRef.querySelector(
				`[data-index="${highlightedIndex}"]`
			) as HTMLElement;
			if (highlightedElement) {
				highlightedElement.scrollIntoView({ block: 'nearest' });
			}
		}
	});
</script>

<div
	class="select-container"
	style="
		--select-text: {tokens.text};
		--select-text-secondary: {tokens.textSecondary};
		--select-text-muted: {tokens.textMuted};
		--select-border: {tokens.border};
		--select-bg: {tokens.background};
		--select-bg-elevated: {tokens.backgroundElevated};
		--select-input-bg: {tokens.inputBg};
		--select-highlighted-bg: color-mix(in oklch, var(--select-text) 10%, transparent);
"
>
	<button
		bind:this={triggerRef}
		type="button"
		class="select-trigger motif-form-control {size === 'sm' ? 'select-trigger-sm' : ''} {className ?? ''}"
		style="
			color: {tokens.text};
			--form-ring-bg: var(--select-bg);
		"
		{disabled}
		onclick={toggleDropdown}
		onkeydown={handleKeydown}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		aria-invalid={error ? 'true' : undefined}
		data-valid={valid ? 'true' : undefined}
	>
		<span
			class="select-value"
			style="{selectedOption?.style ?? ''} color: {!selectedOption ? tokens.textMuted : 'inherit'};"
		>
			{selectedOption?.label ?? placeholder}
		</span>

		<svg
			class="select-arrow"
			class:open={isOpen}
			width="12"
			height="8"
			viewBox="0 0 12 8"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			style="color: {tokens.textSecondary};"
		>
			<path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
		</svg>
	</button>

	{#if isOpen && isPositioned}
		<div
			bind:this={listRef}
			class="select-dropdown"
			class:select-dropdown-above={dropdownPosition.showAbove}
			role="listbox"
			tabindex="-1"
			style="
				position: fixed;
				top: {dropdownPosition.top}px;
				left: {dropdownPosition.left}px;
				min-width: {dropdownPosition.minWidth}px;
				background: {tokens.backgroundElevated};
				border: 1px solid {tokens.border};
			"
		>
			{#if searchable}
				<input
					bind:this={searchInputRef}
					bind:value={searchQuery}
					class="select-search"
					type="text"
					placeholder={searchPlaceholder}
					aria-label={searchPlaceholder}
					onkeydown={handleKeydown}
					style="
						color: {tokens.text};
						border-color: {tokens.border};
					"
				/>
			{/if}

			<div class="select-options">
				{#if visibleOptions.length === 0}
					<p class="select-empty" style="color: {tokens.textMuted};">No matches</p>
				{:else}
					{#each visibleOptions as option, index (option.value)}
						{@const isSelected = option.value === value}
						{@const isHighlighted = index === highlightedIndex}
						<button
							type="button"
							class="select-option"
							data-index={index}
							style="
								{option.style ?? ''}
								color: {isSelected || isHighlighted ? tokens.text : tokens.textSecondary};
								background: {isSelected
									? 'color-mix(in oklch, var(--accent) 15%, transparent)'
									: isHighlighted
										? 'var(--select-highlighted-bg)'
										: 'transparent'};
							"
							onclick={() => selectOption(option)}
							onmouseenter={() => (highlightedIndex = index)}
							role="option"
							aria-selected={isSelected}
						>
							{option.label}
						</button>
					{/each}
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.select-container {
		position: relative;
		width: fit-content;
		/* Monospace pill treatment — the canonical Select look (absorbed from the
		   Merlin CustomSelect). Trigger, value, options and search all inherit. */
		font-family: var(--font-mono);
	}

	.select-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		min-height: var(--input-height);
		padding: 0 1.25rem;
		border: 1px solid var(--select-border);
		/* Rounded rectangle on the shared --radius-message tier, so the trigger
		   reads as one family with the search box, the dropdown panel and any card
		   surface beside it rather than as a lone stadium. */
		border-radius: var(--radius-message);
		font-size: 0.875rem;
		font-family: inherit;
		cursor: pointer;
		/* Glassy card-bg surface, matching the toggle group and old CustomSelect
		   (was --select-input-bg, the opaque form field background). */
		background: var(--select-bg);
		transition:
			border-color var(--transition-normal),
			background-color var(--transition-normal),
			box-shadow var(--transition-normal);
		text-align: left;
		white-space: nowrap;
	}

	/* Small variant — the filter-row size: 40px tall (var(--input-height-sm)),
	   compact mono text, lining up with the toggle-group / bracket-filter
	   tracks and the AgentInput skill pill. */
	.select-trigger-sm {
		min-height: var(--input-height-sm);
		padding: 0 1rem;
		font-size: 0.6875rem;
	}

	.select-trigger:hover:not(:disabled) {
		border-color: var(--select-text-muted);
	}

	.select-trigger:focus-visible {
		outline: none;
		border-color: var(--select-text-secondary);
		box-shadow:
			0 0 0 2px var(--select-bg),
			0 0 0 4px var(--accent);
	}

	.select-trigger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.select-value {
		white-space: nowrap;
	}

	.select-arrow {
		flex-shrink: 0;
		transition: transform var(--transition-fast);
	}

	.select-arrow.open {
		transform: rotate(180deg);
	}

	.select-dropdown {
		/* Fixed positioning escapes overflow containers */
		z-index: var(--z-dropdown);
		display: flex;
		flex-direction: column;
		width: max-content;
		max-height: 280px;
		overflow: hidden;
		padding: 0.25rem;
		/* Matches the trigger and the search box on the --radius-message tier; the
		   options inside step down to --radius-md to nest concentrically. */
		border-radius: var(--radius-message);
		box-shadow: var(--select-dropdown-shadow);
		/* L3 frosted glass — the ladder's floating-level blur keeps the translucent
		   --elevation-3-bg dropdown legible over busy content. */
		backdrop-filter: blur(var(--frost-3));
		-webkit-backdrop-filter: blur(var(--frost-3));
		/* Fade in to prevent position-calculation flicker */
		animation: selectDropdownFadeIn 0.1s ease;
	}

	@keyframes selectDropdownFadeIn {
		from {
			opacity: 0;
			transform: translateY(-4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.select-dropdown-above {
		animation: selectDropdownFadeInAbove 0.1s ease forwards;
		transform-origin: bottom;
	}

	@keyframes selectDropdownFadeInAbove {
		from {
			opacity: 0;
			transform: translateY(calc(-100% + 4px));
		}
		to {
			opacity: 1;
			transform: translateY(-100%);
		}
	}

	/* Search input — appears above the option list when `searchable` is set.
	   Reads as part of the dropdown shell: subtle border, transparent fill. */
	.select-search {
		flex-shrink: 0;
		width: 100%;
		padding: 0.5rem 0.75rem;
		margin-bottom: 0.25rem;
		font-size: 0.8125rem;
		font-family: inherit;
		background: transparent;
		border: 1px solid var(--select-border);
		border-radius: var(--radius-md);
		outline: none;
		transition: border-color var(--transition-fast);
	}

	.select-search::placeholder {
		color: var(--select-text-muted);
	}

	.select-search:focus {
		border-color: var(--select-text-secondary);
	}

	/* Scroll container — only the option list scrolls, keeping any search input
	   pinned to the top of the dropdown shell. The scrollbar is unified with the
	   dropdown surface rather than the global accent-red thumb: the standard
	   scrollbar-color property is set explicitly here so it overrides the global
	   `* { scrollbar-color }` rule in base.css (Chrome honours the standard
	   property over the ::-webkit-scrollbar pseudos when both are present). */
	.select-options {
		overflow-y: auto;
		min-height: 0;
		scrollbar-width: thin;
		scrollbar-color: var(--select-border) transparent;
	}

	/* Empty state shown when the search query matches nothing. */
	.select-empty {
		margin: 0;
		padding: 0.75rem 1.25rem;
		font-size: 0.8125rem;
		text-align: center;
	}

	/* Options match the old CustomSelect: full-width, left-aligned, mono, with
	   long labels wrapping rather than truncating. The selected row is marked by
	   an accent-tinted background (set inline), not a trailing check icon. */
	.select-option {
		display: block;
		width: 100%;
		padding: 0.5rem 0.75rem;
		background: transparent;
		border: none;
		border-radius: var(--radius-md);
		font-size: 0.8125rem;
		font-family: inherit;
		cursor: pointer;
		text-align: left;
		white-space: normal;
		word-break: break-word;
		line-height: 1.4;
		transition:
			background-color var(--transition-fast),
			color var(--transition-fast);
	}

	.select-options::-webkit-scrollbar {
		width: 6px;
	}

	.select-options::-webkit-scrollbar-track {
		background: transparent;
	}

	.select-options::-webkit-scrollbar-thumb {
		background: var(--select-border);
		border-radius: 3px;
	}

	.select-options::-webkit-scrollbar-thumb:hover {
		background: var(--select-text-muted);
	}

	/* Error and success focus-ring states are handled by the shared
	   .motif-form-control rules in form-states.css (imported via base.css).
	   The --form-ring-bg custom property is set inline to var(--select-bg)
	   so the inner ring colour respects the admin/public theme. */
</style>
