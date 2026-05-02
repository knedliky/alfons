/**
 * Date Utilities
 *
 * Co-located date formatting and manipulation functions used by calendar and picker components.
 * All dates use Australian locale (en-AU) and ISO string format (YYYY-MM-DD) for storage.
 *
 * Note: This is a subset of motivka's full dateUtils.ts — only the functions required
 * by the calendar/picker components are included here. The full set (13 functions)
 * remains in motivka for other consumers.
 */

import {
	CalendarDate,
	DateFormatter,
	getLocalTimeZone,
	today,
	type DateValue
} from '@internationalized/date';

/**
 * Parse an ISO date string (YYYY-MM-DD) to CalendarDate
 *
 * @param isoString - ISO date string
 * @returns CalendarDate object
 */
export function parseISODate(isoString: string): CalendarDate {
	const [year, month, day] = isoString.split('-').map(Number);
	return new CalendarDate(year, month, day);
}

/**
 * Get today's date as CalendarDate
 *
 * @returns Today's date in local timezone
 */
export function getToday(): CalendarDate {
	return today(getLocalTimeZone());
}

/**
 * Format a CalendarDate to ISO date string (YYYY-MM-DD)
 *
 * @param date - CalendarDate object
 * @returns ISO date string
 */
export function formatISODate(date: DateValue): string {
	return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

/**
 * Check if two dates are the same day
 *
 * @param date1 - First date to compare
 * @param date2 - Second date to compare
 * @returns True if dates are on the same day
 */
export function isSameDay(date1: DateValue, date2: DateValue): boolean {
	return date1.year === date2.year && date1.month === date2.month && date1.day === date2.day;
}

/**
 * Check if a date is within a date range (inclusive)
 *
 * @param date - Date to check
 * @param start - Range start date
 * @param end - Range end date
 * @returns True if date is within range
 */
export function isDateInRange(
	date: DateValue,
	start: DateValue | undefined,
	end: DateValue | undefined
): boolean {
	if (!start || !end) return false;
	return date.compare(start) >= 0 && date.compare(end) <= 0;
}

/**
 * Get the first day of the month for a given date
 *
 * @param date - Date to get month from
 * @returns CalendarDate representing first day of month
 */
export function getFirstOfMonth(date: DateValue): CalendarDate {
	return new CalendarDate(date.year, date.month, 1);
}

/**
 * Get last day of the month for a given date
 *
 * @param date - Date to get month from
 * @returns CalendarDate representing last day of month
 */
export function getLastOfMonth(date: DateValue): CalendarDate {
	const firstOfNextMonth = new CalendarDate(date.year, date.month, 1).add({ months: 1 });
	const lastDay = firstOfNextMonth.subtract({ days: 1 });
	return new CalendarDate(lastDay.year, lastDay.month, lastDay.day);
}

/**
 * Add days to a date
 *
 * @param date - Original date
 * @param days - Number of days to add
 * @returns New CalendarDate
 */
export function addDays(date: DateValue, days: number): CalendarDate {
	const result = date.add({ days });
	return new CalendarDate(result.year, result.month, result.day);
}

/**
 * Subtract days from a date
 *
 * @param date - Original date
 * @param days - Number of days to subtract
 * @returns New CalendarDate
 */
export function subtractDays(date: DateValue, days: number): CalendarDate {
	const result = date.subtract({ days });
	return new CalendarDate(result.year, result.month, result.day);
}

/**
 * Get week day names for locale
 *
 * @param locale - Locale string (default: 'en-AU')
 * @param format - Format style ('narrow', 'short', 'long')
 * @returns Array of weekday names starting from Monday
 */
export function getWeekdayNames(
	locale: string = 'en-AU',
	format: 'narrow' | 'short' | 'long' = 'short'
): string[] {
	const formatter = new DateFormatter(locale, { weekday: format });
	const days: string[] = [];

	// Start from Monday (1) to Sunday (7) for Australian calendar
	for (let i = 1; i <= 7; i++) {
		const date = new CalendarDate(2024, 1, i); // 1 Jan 2024 is a Monday
		days.push(formatter.format(date.toDate(getLocalTimeZone())));
	}

	return days;
}

/**
 * Get month names for locale
 *
 * @param locale - Locale string (default: 'en-AU')
 * @param format - Format style ('narrow', 'short', 'long')
 * @returns Array of month names
 */
export function getMonthNames(
	locale: string = 'en-AU',
	format: 'narrow' | 'short' | 'long' = 'long'
): string[] {
	const formatter = new DateFormatter(locale, { month: format });
	const months: string[] = [];

	for (let i = 1; i <= 12; i++) {
		const date = new CalendarDate(2024, i, 1);
		months.push(formatter.format(date.toDate(getLocalTimeZone())));
	}

	return months;
}
