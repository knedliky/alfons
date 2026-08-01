<script lang="ts" module>
	export interface WordmarkProps {
		/** Cap height in px (maps to font-size) */
		height?: number;
		/** Wordmark text — override only for sub-brands */
		text?: string;
		/** Additional CSS classes */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Wordmark — "Motivka" set in Moderat Bold (--font-wordmark), the brand
	 * lettering. Sized by height (the cap height in px maps to font-size).
	 * Always plain: the underscore-cursor motif belongs to the Logo, which
	 * carries it in every lockup (decision 12/07/2026 — the handoff's optional
	 * trailing cursor was stripped).
	 *
	 * Usage:
	 *   <Wordmark height={24} />
	 */
	let { height = 24, text = 'Motivka', class: className = '' }: WordmarkProps = $props();
</script>

<span class="motif-wordmark {className}" style:font-size="{height}px" role="img" aria-label={text}>
	<span aria-hidden="true">{text}</span>
</span>

<style>
	.motif-wordmark {
		display: inline-flex;
		align-items: baseline;
		font-family: var(--font-wordmark);
		font-weight: 700;
		line-height: 1;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		white-space: nowrap;
	}
</style>
