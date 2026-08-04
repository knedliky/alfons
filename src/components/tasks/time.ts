/**
 * Time, rendered for a glance page. Presentation formatting only — anything
 * that fetches or decides belongs to the consuming page.
 */

/**
 * Elapsed time reads better than a timestamp on a glance page: "4h" answers
 * "has this been sitting there?" without the reader doing arithmetic.
 */
export function elapsedSince(iso: string, now: number = Date.now()): string {
	const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60_000));
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.round(minutes / 60);
	if (hours < 48) return `${hours}h`;
	return `${Math.round(hours / 24)}d`;
}

/** 24-hour clock, the convention everywhere in this corpus. */
export function clockTime(at: Date): string {
	return `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`;
}
