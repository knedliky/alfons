<script lang="ts" module>
	export interface DividerProps {
		/** Direction of the divider line */
		orientation?: 'horizontal' | 'vertical';
		/** Optional label text displayed centred between lines (horizontal only) */
		label?: string;
		/** Theme namespace — determines which border token is used */
		theme?: 'admin' | 'public';
		/** Additional CSS class names */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Divider — a visual separator for content sections.
	 *
	 * Three modes:
	 * - Horizontal (default): full-width rule using border tokens
	 * - Vertical: inline element with left border, stretches to parent height
	 * - Labelled: horizontal rule with centred text between two lines
	 *
	 * Supports admin and public theme namespaces.
	 */
	let {
		orientation = 'horizontal',
		label,
		theme = 'public',
		class: extraClass
	}: DividerProps = $props();

	const isLabelled = $derived(orientation === 'horizontal' && !!label);
</script>

{#if isLabelled}
	<!-- Labelled divider: flexbox row with lines flanking the label -->
	<div
		class="divider divider-labelled {extraClass ?? ''}"
		data-orientation="horizontal"
		data-theme={theme}
		role="separator"
		aria-orientation="horizontal"
	>
		<span class="divider-line"></span>
		<span class="divider-label">{label}</span>
		<span class="divider-line"></span>
	</div>
{:else if orientation === 'vertical'}
	<!-- Vertical divider: inline element with left border -->
	<span
		class="divider divider-vertical {extraClass ?? ''}"
		data-orientation="vertical"
		data-theme={theme}
		role="separator"
		aria-orientation="vertical"
	></span>
{:else}
	<!-- Horizontal divider: simple hr rule -->
	<!-- hr already has implicit role="separator" — no need to repeat -->
	<hr
		class="divider divider-horizontal {extraClass ?? ''}"
		data-orientation="horizontal"
		data-theme={theme}
		aria-orientation="horizontal"
	/>
{/if}

<style>
	/* Horizontal rule — full-width with theme-aware border colour */
	.divider-horizontal {
		width: 100%;
		border: none;
		border-top: 1px solid var(--border-glass);
		margin: 0;
	}

	.divider-horizontal[data-theme='admin'] {
		border-top-color: var(--admin-border);
	}

	/* Vertical separator — stretches to parent height */
	.divider-vertical {
		display: inline-block;
		height: 100%;
		width: 0;
		border-left: 1px solid var(--border-glass);
		vertical-align: middle;
	}

	.divider-vertical[data-theme='admin'] {
		border-left-color: var(--admin-border);
	}

	/* Labelled divider — centred text flanked by lines */
	.divider-labelled {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
	}

	.divider-line {
		flex: 1;
		height: 0;
		border-top: 1px solid var(--border-glass);
	}

	.divider-labelled[data-theme='admin'] .divider-line {
		border-top-color: var(--admin-border);
	}

	.divider-label {
		color: var(--text-muted);
		font-size: var(--text-caption);
		line-height: 1;
		white-space: nowrap;
		user-select: none;
	}
</style>
