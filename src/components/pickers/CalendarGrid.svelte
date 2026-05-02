<script lang="ts" module>
	import type { DateValue } from '@internationalized/date';

	export type CalendarVariant = 'admin' | 'public';

	export interface CalendarGridProps {
		month: DateValue;
		selectedDate?: DateValue;
		selectedRange?: { start: DateValue | undefined; end: DateValue | undefined };
		minDate?: DateValue;
		maxDate?: DateValue;
		onMonthChange?: (month: DateValue) => void;
		onSelectDate?: (date: DateValue) => void;
		showRangeHighlight?: boolean;
		variant?: CalendarVariant;
	}
</script>

<script lang="ts">
	/**
	 * CalendarGrid — month calendar with navigation, weekday headers, and day cells.
	 *
	 * Usage:
	 *   <CalendarGrid
	 *     {month}
	 *     {selectedDate}
	 *     variant="admin"
	 *     {onMonthChange}
	 *     {onSelectDate}
	 *   />
	 *
	 * Features:
	 * - Single date and date range selection modes
	 * - Previous/next month navigation
	 * - Monday-first week layout (en-AU locale)
	 * - Admin and public theme variants via scoped tokens
	 */
	import {
		getWeekdayNames,
		getMonthNames,
		isSameDay,
		isDateInRange,
		getFirstOfMonth,
		getLastOfMonth,
		getToday,
		addDays,
		subtractDays,
		formatISODate
	} from '../../utils/dateUtils.js';
	import CalendarDay from './CalendarDay.svelte';

	let {
		month,
		selectedDate,
		selectedRange,
		minDate,
		maxDate,
		onMonthChange,
		onSelectDate,
		showRangeHighlight = false,
		variant = 'admin'
	}: CalendarGridProps = $props();

	const weekdayNames = getWeekdayNames('en-AU', 'short');

	function computeWeeks(): DateValue[][] {
		const firstOfMonth = getFirstOfMonth(month);
		const lastOfMonth = getLastOfMonth(month);

		const firstOfMonthCopy = new Date(month.year, month.month - 1, 1);
		const dayOfWeek = firstOfMonthCopy.getDay();

		// Convert JS Sunday=0 to Monday=0 layout
		const startDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

		const daysBefore = Array.from({ length: startDay }, (_, i) => {
			return subtractDays(firstOfMonth, startDay - i);
		}).reverse();

		const daysInMonth: DateValue[] = [];
		let currentDay = firstOfMonth;
		while (currentDay.month === month.month) {
			daysInMonth.push(currentDay);
			currentDay = addDays(currentDay, 1);
		}

		const totalDays = daysBefore.length + daysInMonth.length;
		const daysAfter = Array.from({ length: 42 - totalDays }, (_, i) => {
			return addDays(lastOfMonth, i + 1);
		});

		const allDays = [...daysBefore, ...daysInMonth, ...daysAfter];

		const weeksResult: DateValue[][] = [];
		for (let i = 0; i < 6; i++) {
			weeksResult.push(allDays.slice(i * 7, (i + 1) * 7));
		}

		return weeksResult;
	}

	let weeks = $derived(computeWeeks());

	function handlePreviousMonth() {
		const newMonth = month.subtract({ months: 1 });
		onMonthChange?.(newMonth);
	}

	function handleNextMonth() {
		const newMonth = month.add({ months: 1 });
		onMonthChange?.(newMonth);
	}

	let monthName = $derived(getMonthNames('en-AU', 'long')[month.month - 1]);

	function handleSelectDate(date: DateValue) {
		onSelectDate?.(date);
	}

	function isDateDisabled(date: DateValue): boolean {
		if (minDate && date.compare(minDate) < 0) return true;
		if (maxDate && date.compare(maxDate) > 0) return true;
		return false;
	}

	function isDateOutsideMonth(date: DateValue): boolean {
		return date.month !== month.month;
	}

	function getDateState(date: DateValue) {
		const today = getToday();
		const isDayToday = isSameDay(date, today);
		const isSelectedDate = selectedDate ? isSameDay(date, selectedDate) : false;

		const isSelectedRange =
			showRangeHighlight && selectedRange
				? (selectedRange.start && isSameDay(date, selectedRange.start)) ||
					(selectedRange.end && isSameDay(date, selectedRange.end))
				: false;

		const isInRange =
			showRangeHighlight && selectedRange && selectedRange.start && selectedRange.end
				? isDateInRange(date, selectedRange.start, selectedRange.end)
				: false;

		const isRangeStart =
			selectedRange && selectedRange.start && isSameDay(date, selectedRange.start);
		const isRangeEnd = selectedRange && selectedRange.end && isSameDay(date, selectedRange.end);

		return {
			isToday: isDayToday,
			isSelected: isSelectedDate || isSelectedRange,
			isHighlighted: isInRange && !isRangeStart && !isRangeEnd,
			isOutsideMonth: isDateOutsideMonth(date),
			isDisabled: isDateDisabled(date),
			isRangeStart: !!isRangeStart,
			isRangeEnd: !!isRangeEnd
		};
	}
</script>

<div class="calendar-grid" class:admin={variant === 'admin'} class:public={variant === 'public'}>
	<div class="calendar-header">
		<button
			class="calendar-nav-button"
			type="button"
			onclick={handlePreviousMonth}
			aria-label="Previous month"
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
				<path d="M15 18l-6-6 6-6" />
			</svg>
		</button>

		<span class="calendar-heading">
			{monthName}
			{month.year}
		</span>

		<button
			class="calendar-nav-button"
			type="button"
			onclick={handleNextMonth}
			aria-label="Next month"
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
				<path d="M9 18l6-6-6-6" />
			</svg>
		</button>
	</div>

	<div class="calendar-weekdays">
		{#each weekdayNames as weekday (weekday)}
			<span class="calendar-weekday">{weekday}</span>
		{/each}
	</div>

	<div class="calendar-days">
		{#each weeks as week, weekIndex (weekIndex)}
			<div class="calendar-week">
				{#each week as date (formatISODate(date))}
					<CalendarDay
						{date}
						{variant}
						isToday={getDateState(date).isToday}
						isSelected={getDateState(date).isSelected}
						isHighlighted={getDateState(date).isHighlighted}
						isOutsideMonth={getDateState(date).isOutsideMonth}
						isDisabled={getDateState(date).isDisabled}
						isRangeStart={getDateState(date).isRangeStart}
						isRangeEnd={getDateState(date).isRangeEnd}
						onclick={handleSelectDate}
					/>
				{/each}
			</div>
		{/each}
	</div>
</div>

<style>
	.calendar-grid {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);

		/* Scoped tokens — defaults to admin */
		--cal-bg: var(--admin-bg);
		--cal-text: var(--admin-text);
		--cal-text-secondary: var(--admin-text-secondary);
		--cal-text-muted: var(--admin-text-muted);
		--cal-border: var(--admin-border);
	}

	.calendar-grid.public {
		--cal-bg: var(--card-bg);
		--cal-text: var(--text-primary);
		--cal-text-secondary: var(--text-secondary);
		--cal-text-muted: var(--text-muted);
		--cal-border: var(--card-border);
	}

	.calendar-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 var(--space-2);
	}

	.calendar-heading {
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--cal-text);
	}

	.calendar-nav-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		color: var(--cal-text-secondary);
		background-color: transparent;
		border: 1px solid var(--cal-border);
		border-radius: 6px;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.calendar-nav-button:hover {
		background-color: var(--cal-bg);
		border-color: var(--cal-text-muted);
		color: var(--cal-text);
	}

	.calendar-nav-button:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.calendar-weekdays {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		margin-bottom: var(--space-2);
	}

	.calendar-weekday {
		padding: var(--space-2);
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--cal-text-muted);
		text-align: center;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.calendar-days {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.calendar-week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: var(--space-1);
	}
</style>
