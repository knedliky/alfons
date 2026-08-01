<script lang="ts" module>
	export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'custom';
	export type DateRangePickerVariant = 'admin' | 'public';

	export interface DateRangePickerProps {
		selectedPreset: DateRangePreset;
		customStart?: string;
		customEnd?: string;
		onPresetChange: (preset: DateRangePreset) => void;
		onCustomRangeChange?: (start: string, end: string) => void;
		disabled?: boolean;
		variant?: DateRangePickerVariant;
	}
</script>

<script lang="ts">
	/**
	 * DateRangePicker — preset and custom date range selector with two-month calendar.
	 *
	 * Usage:
	 *   <DateRangePicker
	 *     selectedPreset="7d"
	 *     variant="admin"
	 *     {onPresetChange}
	 *     onCustomRangeChange={(start, end) => console.log(start, end)}
	 *   />
	 *
	 * Features:
	 * - Preset buttons (Today, 7 Days, 30 Days, 90 Days)
	 * - Custom range selection via two-month calendar popover
	 * - Admin and public theme variants via scoped tokens
	 * - Keyboard navigation (Escape to close popover)
	 */
	import { parseISODate, getToday, formatISODate } from '../../utils/dateUtils.js';
	import CalendarGrid from './CalendarGrid.svelte';
	import type { DateValue } from '@internationalized/date';

	let {
		selectedPreset = '7d',
		customStart = '',
		customEnd = '',
		onPresetChange,
		onCustomRangeChange,
		disabled = false,
		variant = 'admin'
	}: DateRangePickerProps = $props();

	let isPopoverOpen = $state(false);
	let customRangeValue = $state<{ start: DateValue | undefined; end: DateValue | undefined }>({
		start: undefined,
		end: undefined
	});

	const dateFormatter = new Intl.DateTimeFormat('en-AU', {
		dateStyle: 'medium'
	});

	const presetOptions: { value: DateRangePreset; label: string }[] = [
		{ value: 'today', label: 'Today' },
		{ value: '7d', label: '7 Days' },
		{ value: '30d', label: '30 Days' },
		{ value: '90d', label: '90 Days' }
	];

	const maxDate = getToday();
	const minDate = maxDate.subtract({ years: 1 });

	let firstMonth = $derived.by(() => {
		if (customRangeValue.start) {
			return customRangeValue.start;
		}
		return maxDate;
	});

	let secondMonth = $derived(firstMonth.add({ months: 1 }));

	$effect(() => {
		if (customStart && customEnd && selectedPreset === 'custom') {
			customRangeValue = {
				start: parseISODate(customStart),
				end: parseISODate(customEnd)
			};
		}
	});

	function handlePresetClick(preset: DateRangePreset) {
		if (disabled) return;
		isPopoverOpen = false;
		onPresetChange(preset);
	}

	function handleCustomRangeSelect(date: DateValue) {
		if (!customRangeValue.start || (customRangeValue.start && customRangeValue.end)) {
			customRangeValue = { start: date, end: undefined };
		} else if (customRangeValue.start) {
			const start = customRangeValue.start;
			const end = date;

			if (start.compare(end) > 0) {
				customRangeValue = { start: end, end: start };
			} else {
				customRangeValue = { start, end };
			}

			onPresetChange('custom');
			onCustomRangeChange?.(
				formatISODate(customRangeValue.start!),
				formatISODate(customRangeValue.end!)
			);
			isPopoverOpen = false;
		}
	}

	function formatDateRange(): string {
		if (selectedPreset === 'custom' && customRangeValue?.start && customRangeValue?.end) {
			return `${dateFormatter.format(customRangeValue.start.toDate(new Intl.DateTimeFormat().resolvedOptions().timeZone))} – ${dateFormatter.format(customRangeValue.end.toDate(new Intl.DateTimeFormat().resolvedOptions().timeZone))}`;
		}
		return 'Custom';
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			isPopoverOpen = false;
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isPopoverOpen = false;
		}
	}

	function handleFirstMonthChange(month: DateValue) {
		customRangeValue = { ...customRangeValue, start: month };
	}

	function handleSecondMonthChange(month: DateValue) {
		const newFirstMonth = month.subtract({ months: 1 });
		customRangeValue = { ...customRangeValue, start: newFirstMonth };
	}
</script>

<svelte:window onkeydown={isPopoverOpen ? handleKeydown : undefined} />

<div
	class="date-range-picker"
	class:disabled
	class:admin={variant === 'admin'}
	class:public={variant === 'public'}
>
	<div class="preset-row">
		{#each presetOptions as preset (preset.value)}
			<button
				type="button"
				class="preset-button"
				class:active={selectedPreset === preset.value}
				onclick={() => handlePresetClick(preset.value)}
				{disabled}
			>
				{preset.label}
			</button>
		{/each}

		{#if isPopoverOpen}
			<div class="popover-backdrop" onclick={handleBackdropClick} role="presentation">
				<div
					class="popover-content"
					onclick={(e) => e.stopPropagation()}
					onkeydown={(e) => e.key === 'Escape' && (isPopoverOpen = false)}
					role="dialog"
					aria-modal="true"
					aria-label="Select a date range"
					tabindex="-1"
				>
					<div class="calendar-months">
						<CalendarGrid
							month={firstMonth}
							selectedRange={customRangeValue}
							{variant}
							{minDate}
							{maxDate}
							onMonthChange={handleFirstMonthChange}
							onSelectDate={handleCustomRangeSelect}
							showRangeHighlight={true}
						/>

						<CalendarGrid
							month={secondMonth}
							selectedRange={customRangeValue}
							{variant}
							{minDate}
							{maxDate}
							onMonthChange={handleSecondMonthChange}
							onSelectDate={handleCustomRangeSelect}
							showRangeHighlight={true}
						/>
					</div>
				</div>
			</div>
		{:else}
			<button
				type="button"
				class="preset-button custom-button"
				class:active={selectedPreset === 'custom'}
				onclick={() => (isPopoverOpen = true)}
				{disabled}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
					<line x1="16" y1="2" x2="16" y2="6" />
					<line x1="8" y1="2" x2="8" y2="6" />
					<line x1="3" y1="10" x2="21" y2="10" />
				</svg>
				<span class="custom-label">
					{selectedPreset === 'custom' && customRangeValue?.start && customRangeValue?.end
						? formatDateRange()
						: 'Custom'}
				</span>
			</button>
		{/if}
	</div>
</div>

<style>
	.date-range-picker {
		display: flex;
		align-items: center;

		/* Scoped tokens — defaults to admin */
		--drp-bg: var(--admin-bg);
		--drp-bg-elevated: var(--admin-bg-elevated);
		--drp-text: var(--admin-text);
		--drp-text-secondary: var(--admin-text-secondary);
		--drp-text-muted: var(--admin-text-muted);
		--drp-border: var(--admin-border);
		--drp-accent: var(--accent);
	}

	.date-range-picker.public {
		--drp-bg: var(--card-bg);
		--drp-bg-elevated: var(--card-bg);
		--drp-text: var(--text-primary);
		--drp-text-secondary: var(--text-secondary);
		--drp-text-muted: var(--text-muted);
		--drp-border: var(--card-border);
		--drp-accent: var(--accent-red);
	}

	.date-range-picker.disabled {
		opacity: 0.6;
		pointer-events: none;
	}

	.preset-row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-2);
	}

	.preset-button {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--drp-text-secondary);
		background-color: var(--drp-bg);
		border: 1px solid var(--drp-border);
		border-radius: 0;
		cursor: pointer;
		transition: all var(--transition-fast);
		white-space: nowrap;
	}

	.preset-button:hover:not(:disabled) {
		background-color: var(--drp-bg-elevated);
		border-color: var(--drp-text-muted);
		color: var(--drp-text);
	}

	.preset-button.active {
		background-color: color-mix(in srgb, var(--drp-accent) 10%, transparent);
		border-color: var(--drp-accent);
		color: var(--drp-accent);
	}

	.preset-button:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.custom-button {
		position: relative;
	}

	.custom-label {
		max-width: 200px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.popover-backdrop {
		position: fixed;
		inset: 0;
		z-index: var(--z-overlay);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: var(--space-4);
		animation: fadeIn 0.15s ease;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.popover-content {
		position: relative;
		padding: var(--space-4);
		background-color: var(--drp-bg-elevated);
		border: 1px solid var(--drp-border);
		border-radius: var(--radius-surface);
		box-shadow: var(--shadow-popover);
		animation: scaleIn 0.15s ease;
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.95) translateY(-8px);
		}
		to {
			opacity: 1;
			transform: scale(1) translateY(0);
		}
	}

	.calendar-months {
		display: flex;
		gap: var(--space-6);
	}

	@media (max-width: 768px) {
		.calendar-months {
			flex-direction: column;
			gap: var(--space-4);
		}

		.popover-content {
			max-width: calc(100vw - 2rem);
			margin: 0 var(--space-4);
		}
	}
</style>
