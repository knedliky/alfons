<script lang="ts" module>
	export type DatePickerVariant = 'admin' | 'public';

	export interface DatePickerProps {
		value?: string;
		minDate?: string;
		maxDate?: string;
		onchange?: (date: string | undefined) => void;
		disabled?: boolean;
		placeholder?: string;
		variant?: DatePickerVariant;
	}
</script>

<script lang="ts">
	/**
	 * DatePicker — single date selection with popover calendar.
	 *
	 * Usage:
	 *   <DatePicker
	 *     value="2026-02-18"
	 *     placeholder="Select date"
	 *     variant="admin"
	 *     onchange={(date) => console.log(date)}
	 *   />
	 *
	 * Features:
	 * - Australian date format (DD/MM/YYYY) for display
	 * - Popover calendar with keyboard navigation (Escape to close)
	 * - Admin and public theme variants via scoped tokens
	 * - Min/max date constraints
	 */
	import { parseISODate, getToday, formatISODate } from '../../utils/dateUtils.js';
	import CalendarGrid from './CalendarGrid.svelte';
	import type { DateValue } from '@internationalized/date';

	let {
		value,
		minDate,
		maxDate,
		onchange,
		disabled = false,
		placeholder = 'Select date',
		variant = 'admin'
	}: DatePickerProps = $props();

	let isPopoverOpen = $state(false);
	let currentMonth = $state<DateValue>(getToday());
	// eslint-disable-next-line svelte/prefer-writable-derived
	let selectedDate = $state<DateValue | undefined>(undefined);

	let displayValue = $derived(selectedDate ? formatDateShort(selectedDate) : placeholder);

	function formatDateShort(date: DateValue): string {
		const formatter = new Intl.DateTimeFormat('en-AU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
		return formatter.format(date.toDate(new Intl.DateTimeFormat().resolvedOptions().timeZone));
	}

	function togglePopover() {
		if (disabled) return;
		isPopoverOpen = !isPopoverOpen;
	}

	function handleSelectDate(date: DateValue) {
		selectedDate = date;
		isPopoverOpen = false;
		onchange?.(formatISODate(date));
	}

	function handleMonthChange(month: DateValue) {
		currentMonth = month;
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

	$effect(() => {
		selectedDate = value ? parseISODate(value) : undefined;
	});

	$effect(() => {
		if (isPopoverOpen && selectedDate) {
			currentMonth = selectedDate;
		} else if (isPopoverOpen && !selectedDate) {
			currentMonth = getToday();
		}
	});
</script>

<svelte:window onkeydown={isPopoverOpen ? handleKeydown : undefined} />

<div class="date-picker" class:admin={variant === 'admin'} class:public={variant === 'public'}>
	<button
		type="button"
		class="date-picker-trigger"
		class:disabled
		onclick={togglePopover}
		{disabled}
		aria-haspopup="dialog"
		aria-expanded={isPopoverOpen}
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
			class="calendar-icon"
		>
			<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
			<line x1="16" y1="2" x2="16" y2="6" />
			<line x1="8" y1="2" x2="8" y2="6" />
			<line x1="3" y1="10" x2="21" y2="10" />
		</svg>
		<span class="date-value">{displayValue}</span>
	</button>

	{#if isPopoverOpen}
		<div class="popover-backdrop" onclick={handleBackdropClick} role="presentation">
			<div
				class="popover-content"
				onclick={(e) => e.stopPropagation()}
				onkeydown={(e) => e.key === 'Escape' && (isPopoverOpen = false)}
				role="dialog"
				aria-modal="true"
				aria-label="Select a date"
				tabindex="-1"
			>
				<CalendarGrid
					month={currentMonth}
					{selectedDate}
					{variant}
					minDate={minDate ? parseISODate(minDate) : undefined}
					maxDate={maxDate ? parseISODate(maxDate) : undefined}
					onMonthChange={handleMonthChange}
					onSelectDate={handleSelectDate}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.date-picker {
		position: relative;
		display: inline-block;

		/* Scoped tokens — defaults to admin */
		--dp-bg: var(--admin-bg);
		--dp-bg-elevated: var(--admin-bg-elevated);
		--dp-text: var(--admin-text);
		--dp-text-muted: var(--admin-text-muted);
		--dp-border: var(--admin-border);
	}

	.date-picker.public {
		--dp-bg: var(--card-bg);
		--dp-bg-elevated: var(--card-bg);
		--dp-text: var(--text-primary);
		--dp-text-muted: var(--text-muted);
		--dp-border: var(--card-border);
	}

	.date-picker-trigger {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		font-size: 0.875rem;
		font-weight: 400;
		color: var(--dp-text);
		background-color: var(--dp-bg);
		border: 1px solid var(--dp-border);
		border-radius: 6px;
		cursor: pointer;
		transition: all var(--transition-fast);
		white-space: nowrap;
	}

	.date-picker-trigger:hover:not(:disabled) {
		background-color: var(--dp-bg-elevated);
		border-color: var(--dp-text-muted);
	}

	.date-picker-trigger:disabled {
		cursor: not-allowed;
		opacity: 0.5;
	}

	.calendar-icon {
		flex-shrink: 0;
	}

	.date-value {
		flex-grow: 1;
		text-align: left;
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
		background-color: var(--dp-bg-elevated);
		border: 1px solid var(--dp-border);
		border-radius: var(--card-radius);
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
</style>
