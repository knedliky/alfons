<script lang="ts" module>
	import type { DateValue } from '@internationalized/date';

	type CalendarVariant = 'admin' | 'public';

	export interface CalendarDayProps {
		date: DateValue;
		variant?: CalendarVariant;
		isToday?: boolean;
		isSelected?: boolean;
		isHighlighted?: boolean;
		isOutsideMonth?: boolean;
		isDisabled?: boolean;
		isRangeStart?: boolean;
		isRangeEnd?: boolean;
		onclick?: (date: DateValue) => void;
	}
</script>

<script lang="ts">
	/**
	 * CalendarDay — individual day cell with selection, range, and state styling.
	 *
	 * Usage:
	 *   <CalendarDay
	 *     {date}
	 *     isToday={true}
	 *     isSelected={false}
	 *     variant="admin"
	 *     {onclick}
	 *   />
	 *
	 * Features:
	 * - States: today, selected, highlighted (in-range), outside-month, disabled
	 * - Range start/end with directional border-radius
	 * - Admin and public theme variants via scoped tokens
	 */

	let {
		date,
		variant = 'admin',
		isToday: isTodayProp,
		isSelected,
		isHighlighted,
		isOutsideMonth,
		isDisabled,
		isRangeStart,
		isRangeEnd,
		onclick
	}: CalendarDayProps = $props();

	function handleClick() {
		if (isDisabled) return;
		onclick?.(date);
	}
</script>

<button
	class="calendar-day"
	class:admin={variant === 'admin'}
	class:public={variant === 'public'}
	class:today={isTodayProp}
	class:selected={isSelected}
	class:highlighted={isHighlighted}
	class:outside-month={isOutsideMonth}
	class:disabled={isDisabled}
	class:range-start={isRangeStart}
	class:range-end={isRangeEnd}
	type="button"
	onclick={handleClick}
	disabled={isDisabled}
	aria-label={isTodayProp ? `${date.day}, Today` : date.day.toString()}
>
	{date.day}
</button>

<style>
	.calendar-day {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		font-size: 0.875rem;
		font-weight: 400;
		background-color: transparent;
		border: none;
		border-radius: 6px;
		cursor: pointer;
		transition: all var(--transition-fast);

		/* Scoped tokens — defaults to admin */
		--day-text: var(--admin-text);
		--day-text-muted: var(--admin-text-muted);
		--day-bg-hover: var(--admin-bg);
		--day-accent: var(--accent);
		color: var(--day-text);
	}

	.calendar-day.public {
		--day-text: var(--text-primary);
		--day-text-muted: var(--text-muted);
		--day-bg-hover: var(--card-bg);
		--day-accent: var(--accent-red);
	}

	.calendar-day:hover:not(.disabled) {
		background-color: var(--day-bg-hover);
	}

	.calendar-day.today {
		font-weight: 600;
		color: var(--day-accent);
	}

	.calendar-day.selected {
		background-color: var(--day-accent) !important;
		color: var(--admin-bg) !important;
		font-weight: 500;
	}

	.calendar-day.public.selected {
		color: var(--bg-primary) !important;
	}

	.calendar-day.highlighted {
		/* Range fill uses accent with reduced opacity */
		background-color: color-mix(in srgb, var(--day-accent) 15%, transparent);
	}

	.calendar-day.range-start {
		border-radius: 6px 0 0 6px;
	}

	.calendar-day.range-end {
		border-radius: 0 6px 6px 0;
	}

	.calendar-day.range-start.range-end {
		border-radius: 6px;
	}

	.calendar-day.disabled {
		color: var(--day-text-muted);
		opacity: 0.3;
		cursor: not-allowed;
	}

	.calendar-day.outside-month {
		color: var(--day-text-muted);
		opacity: 0.5;
	}

	.calendar-day.selected.today {
		color: var(--admin-bg) !important;
	}

	.calendar-day.public.selected.today {
		color: var(--bg-primary) !important;
	}
</style>
