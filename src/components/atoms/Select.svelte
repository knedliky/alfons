<script lang="ts" module>
	export interface SelectOption {
		value: string;
		label: string;
		style?: string;
		/** Optional representative colour (any CSS colour or token). When set, the
		 *  selected row's background — and the trigger while this option is the
		 *  current value — tints with this colour instead of the brand --accent.
		 *  Pass 'transparent' for a deliberately uncoloured option, e.g. an "All"
		 *  reset that should read as no selection. */
		accent?: string;
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

	// The trigger declares role="combobox", which requires aria-controls pointing
	// at the listbox it opens. Svelte's $props.id() gives a stable unique id per
	// instance, so several selects on one page do not cross-wire.
	const uid = $props.id();
	const listboxId = `select-listbox-${uid}`;

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
	 * Value-pill background — tinted with the selected option's `accent` so the
	 * current value reads as an inner pill carrying its colour, exactly like a
	 * toggle group's active segment. Mixed into transparent (not the trigger bg)
	 * so the trigger's own surface shows through the gap around the pill. An
	 * accent of 'transparent', or none, leaves the pill uncoloured.
	 */
	const valuePillBackground = $derived(
		selectedOption?.accent && selectedOption.accent !== 'transparent'
			? `color-mix(in oklch, ${selectedOption.accent} 15%, transparent)`
			: 'transparent'
	);

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

	/**
	 * Render the dropdown at <body> instead of where it sits in the markup. The
	 * menu is position: fixed, but a transformed / filtered / contained ancestor
	 * would otherwise become its containing block — reparenting it away from the
	 * trigger and disabling its backdrop-filter (the frosted surface collapses to
	 * a flat tint). Portaling to the document root keeps the menu anchored to the
	 * viewport with its frosted surface intact wherever the Select is used.
	 */
	function portalToBody(node: HTMLElement) {
		document.body.appendChild(node);
		return {
			destroy() {
				node.remove();
			}
		};
	}

	function calculateDropdownPosition() {
		if (!triggerRef) return;
		const rect = triggerRef.getBoundingClientRect();
		const viewportHeight = window.innerHeight;

		const spaceBelow = viewportHeight - rect.bottom - DROPDOWN_GAP;
		const spaceAbove = rect.top - DROPDOWN_GAP;

		// Flip above when there is more room above than below
		const showAbove = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > spaceBelow;

		// The menu is portaled to <body>, so these viewport coordinates from the
		// trigger's rect place it correctly regardless of any transformed ancestor
		// around the trigger.
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

	// Keep the highlighted option visible during keyboard navigation by scrolling
	// the options list directly, rather than calling scrollIntoView. The dropdown is
	// position: fixed, and scrollIntoView is fooled by that — it scrolls the whole
	// document to the option's in-flow position. On a select that sits far down a
	// long page that jumps the window hundreds of px, which trips the scroll-to-close
	// handler below, so the menu opens and instantly closes. Scoping the scroll to
	// .select-options moves only the menu's own list and never touches the window.
	$effect(() => {
		if (isOpen && highlightedIndex >= 0 && listRef) {
			const optionsContainer = listRef.querySelector('.select-options');
			const highlightedElement = listRef.querySelector(
				`[data-index="${highlightedIndex}"]`
			) as HTMLElement | null;
			if (optionsContainer && highlightedElement) {
				const containerRect = optionsContainer.getBoundingClientRect();
				const elementRect = highlightedElement.getBoundingClientRect();
				if (elementRect.top < containerRect.top) {
					optionsContainer.scrollTop -= containerRect.top - elementRect.top;
				} else if (elementRect.bottom > containerRect.bottom) {
					optionsContainer.scrollTop += elementRect.bottom - containerRect.bottom;
				}
			}
		}
	});
</script>

<div
	class="select-container {size === 'sm' ? 'select-container-sm' : ''}"
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
	{#snippet caret()}
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
	{/snippet}

	<button
		bind:this={triggerRef}
		type="button"
		class="select-trigger motif-form-control {size === 'sm'
			? 'select-trigger-sm'
			: ''} {className ?? ''}"
		style="
			color: {tokens.text};
			--form-ring-bg: var(--select-bg);
		"
		{disabled}
		onclick={toggleDropdown}
		onkeydown={handleKeydown}
		role="combobox"
		aria-haspopup="listbox"
		aria-controls={listboxId}
		aria-expanded={isOpen}
		aria-invalid={error ? 'true' : undefined}
		data-valid={valid ? 'true' : undefined}
	>
		<span
			class="select-value"
			style="{selectedOption?.style ??
				''} background: {valuePillBackground}; color: {!selectedOption
				? tokens.textMuted
				: 'inherit'};"
		>
			{selectedOption?.label ?? placeholder}
			<!-- sm/filter trigger: the caret lives inside the value pill so the accent
			     tint covers it, matching a single-item toggle group. -->
			{#if size === 'sm'}{@render caret()}{/if}
		</span>

		<!-- default trigger: the caret sits at the far right of the trigger. -->
		{#if size !== 'sm'}{@render caret()}{/if}
	</button>

	{#if isOpen && isPositioned}
		<div
			bind:this={listRef}
			use:portalToBody
			class="select-dropdown"
			class:select-dropdown-sm={size === 'sm'}
			class:select-dropdown-above={dropdownPosition.showAbove}
			id={listboxId}
			role="listbox"
			tabindex="-1"
			style="
				position: fixed;
				top: {dropdownPosition.top}px;
				left: {dropdownPosition.left}px;
				min-width: {dropdownPosition.minWidth}px;
				background: {tokens.backgroundElevated};
				border: 1px solid {tokens.border};
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
								? `color-mix(in oklch, ${option.accent ?? 'var(--accent)'} 15%, transparent)`
								: isHighlighted
									? option.accent && option.accent !== 'transparent'
										? `color-mix(in oklch, ${option.accent} 15%, transparent)`
										: 'var(--select-highlighted-bg)'
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
		/* One source of truth for the text size shared by the trigger value and the
		   dropdown options. They render the same labels, so they must never differ
		   in size — otherwise the label appears to resize the instant the menu opens. */
		--select-font-size: 0.875rem;
	}

	/* Filter/sm size — tracks the ToggleGroup type ramp exactly (0.6875rem, lifting
	   to 0.75rem on wider viewports) so a sm Select and a ToggleGroup sitting in
	   the same toolbar read as one family rather than two different text sizes. */
	.select-container-sm {
		--select-font-size: 0.6875rem;
	}

	@media (min-width: 640px) {
		.select-container-sm {
			--select-font-size: 0.75rem;
		}
	}

	.select-trigger {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-height: var(--input-height);
		padding: 0 1.25rem;
		border: 1px solid var(--select-border);
		/* Rounded rectangle on the shared --radius-message tier, so the trigger
		   reads as one family with the search box, the dropdown panel and any card
		   surface beside it rather than as a lone stadium. */
		border-radius: var(--radius-message);
		font-size: var(--select-font-size);
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

	/* Small variant — the filter-row size: pinned to the shared
	   --filter-control-height so it lines up with the ToggleGroup, bracket filter,
	   and AgentInput skill pill in the same toolbar, with tighter padding. (This is
	   the height the former SelectFilter wrapper used to inject; folded in here so a
	   bare sm Select is a toolbar filter out of the box.) Text size is governed by
	   --select-font-size on the container. */
	.select-trigger-sm {
		min-height: var(--filter-control-height);
		/* Pad like the ToggleGroup container (0.25rem) so the value reads as an
		   inner pill with a gap to the border — the trigger becomes a single-item
		   toggle group. The chevron keeps the same gap on the right. */
		padding: var(--space-1);
		gap: var(--space-1);
		/* Stretch the value pill to the full inner height, exactly like the
		   ToggleGroup's active segment (which fills its padded container). */
		align-items: stretch;
	}

	.select-trigger:hover:not(:disabled) {
		border-color: var(--select-text-muted);
	}

	.select-trigger:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.select-value {
		white-space: nowrap;
	}

	/* In the sm/filter trigger the value becomes an inner pill matching the
	   ToggleGroup's active segment: same padding and full-pill radius, with a
	   pinned line-height. It also holds the caret, so the accent tint (set
	   inline) covers both the label and the arrow. */
	.select-trigger-sm .select-value {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.2rem 0.6rem;
		border-radius: var(--radius-pill);
		line-height: 1.4;
	}

	@media (min-width: 640px) {
		.select-trigger-sm .select-value {
			padding: var(--space-1) var(--space-3);
		}
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
		/* Portaled to <body>, the dropdown no longer inherits from .select-container,
		   so it restates the container's typography: the monospace family (search,
		   options and empty state all inherit it) and the --select-font-size ramp
		   (default size here; the sm/filter size and its 640px step live on
		   .select-dropdown-sm below). The trigger and the menu render the same
		   labels, so they must match or the label appears to change the instant the
		   menu opens. */
		font-family: var(--font-mono);
		--select-font-size: 0.875rem;
		display: flex;
		flex-direction: column;
		width: max-content;
		max-height: 280px;
		overflow: hidden;
		padding: 0.375rem;
		/* Square panel — the menu is a floating surface, not a pill, so it takes
		   the sharp non-agentic corner. (The trigger keeps the rounder
		   --radius-message stadium to match the pill ToggleGroup beside it.) */
		border-radius: 0;
		box-shadow: var(--select-dropdown-shadow);
		/* L3 frosted glass — the ladder's floating-level blur keeps the translucent
		   --elevation-3-bg dropdown legible over busy content. */
		backdrop-filter: blur(var(--frost-3));
		-webkit-backdrop-filter: blur(var(--frost-3));
		/* Fade in to prevent position-calculation flicker */
		animation: selectDropdownFadeIn 0.1s ease;
	}

	/* sm/filter size — match the container's type ramp (0.6875rem, lifting to
	   0.75rem on wider viewports) so a portaled menu reads at the same size as
	   its sm trigger. */
	.select-dropdown-sm {
		--select-font-size: 0.6875rem;
	}

	@media (min-width: 640px) {
		.select-dropdown-sm {
			--select-font-size: 0.75rem;
		}
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
		padding: var(--space-2) var(--space-3);
		margin-bottom: var(--space-1);
		font-size: var(--select-font-size);
		font-family: inherit;
		background: transparent;
		border: 1px solid var(--select-border);
		border-radius: var(--radius);
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
		/* No horizontal padding here, so the option fills keep an equal gap to the
		   dropdown border on every side (just the dropdown's own 0.375rem padding).
		   A scrollbar only appears for long option lists; there the thin overlay
		   thumb (macOS) sits over the fill's right edge while scrolling, or takes
		   its own column on classic-scrollbar platforms. */
		scrollbar-width: thin;
		scrollbar-color: var(--select-border) transparent;
	}

	/* Empty state shown when the search query matches nothing. */
	.select-empty {
		margin: 0;
		padding: 0.75rem 1.25rem;
		font-size: var(--select-font-size);
		text-align: center;
	}

	/* Options match the old CustomSelect: full-width, left-aligned, mono, with
	   long labels wrapping rather than truncating. The selected row is marked by
	   an accent-tinted background (set inline), not a trailing check icon.
	   Square rows in a square panel — the whole menu reads as one sharp block. */
	.select-option {
		display: block;
		width: 100%;
		padding: var(--space-2) var(--space-3);
		background: transparent;
		border: none;
		border-radius: 0;
		font-size: var(--select-font-size);
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
		border-radius: 0;
	}

	.select-options::-webkit-scrollbar-thumb:hover {
		background: var(--select-text-muted);
	}

	/* Error and success focus-ring states are handled by the shared
	   .motif-form-control rules in form-states.css (imported via base.css).
	   The --form-ring-bg custom property is set inline to var(--select-bg)
	   so the inner ring colour respects the admin/public theme. */
</style>
