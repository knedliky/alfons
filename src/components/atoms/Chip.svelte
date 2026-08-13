<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface ChipProps {
		/** Chip text — alternative to children */
		label?: string;
		/** Chip content — alternative to label */
		children?: Snippet;
		/** Trailing remove button */
		onRemove?: () => void;
		/** Makes the whole chip a button */
		onClick?: () => void;
		/** Tint token for border/text (any brand colour, e.g. 'var(--pulley-blue)') */
		colour?: string;
		/** Border-only or faint wash */
		fill?: 'outline' | 'soft';
		/** Leading icon snippet */
		icon?: Snippet;
		size?: 'default' | 'sm';
		disabled?: boolean;
		/** Additional CSS classes */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * Chip — a compact, square token for selections, filters and tags. Optional
	 * leading icon and a trailing remove button (square corners, echoing the
	 * cursor motif). colour tints the border + text from any brand token;
	 * fill="soft" adds a faint wash. For uppercase taxonomy labels use Pill;
	 * for status use Badge.
	 *
	 * Usage:
	 *   <Chip label="Finance" colour="var(--pulley-blue)" fill="soft" onRemove={() => drop('finance')} />
	 *   <Chip label="High exposure" onClick={toggle} />
	 */
	import Icon from './Icon.svelte';

	let {
		label,
		children,
		onRemove,
		onClick,
		colour,
		fill = 'outline',
		icon,
		size = 'default',
		disabled = false,
		class: className = ''
	}: ChipProps = $props();

	const interactive = $derived(!!onClick && !disabled);

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onClick?.();
		}
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -- role="button" and tabindex
     are set together when interactive; the linter cannot see the pairing through
     the conditional expressions. -->
<span
	class="motif-chip size-{size} fill-{fill} {className}"
	class:is-disabled={disabled}
	class:is-interactive={interactive}
	style={colour ? `--chip-tint: ${colour}` : undefined}
	onclick={interactive ? onClick : undefined}
	onkeydown={interactive ? handleKeydown : undefined}
	role={interactive ? 'button' : undefined}
	tabindex={interactive ? 0 : undefined}
>
	{#if icon}
		<span class="motif-chip-icon" aria-hidden="true">{@render icon()}</span>
	{/if}
	<span class="motif-chip-label">
		{#if label}{label}{:else}{@render children?.()}{/if}
	</span>
	{#if onRemove && !disabled}
		<button
			type="button"
			class="motif-chip-remove"
			onclick={(e) => {
				e.stopPropagation();
				onRemove();
			}}
			aria-label="Remove {label ?? 'item'}"
		>
			<Icon name="close" size="sm" />
		</button>
	{/if}
</span>

<style>
	.motif-chip {
		--chip-tint: var(--text-secondary);
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		border-radius: 0;
		font-family: var(--font-body);
		font-weight: 600;
		white-space: nowrap;
		color: var(--chip-tint);
		border: 1px solid color-mix(in srgb, var(--chip-tint) 45%, transparent);
		background: transparent;
	}

	.motif-chip.fill-soft {
		background: color-mix(in srgb, var(--chip-tint) 12%, transparent);
	}

	.motif-chip.size-default {
		font-size: 0.75rem;
		padding: calc(var(--space-1) - 1px) calc(var(--space-2) + 2px);
	}

	.motif-chip.size-sm {
		font-size: 0.6875rem;
		padding: calc(var(--space-1) - 1px) var(--space-2);
		gap: var(--space-1);
	}

	.motif-chip.is-interactive {
		cursor: pointer;
		transition:
			border-color var(--transition-fast),
			background-color var(--transition-fast);
	}

	.motif-chip.is-interactive:hover {
		border-color: color-mix(in srgb, var(--chip-tint) 70%, transparent);
		background: color-mix(in srgb, var(--chip-tint) 10%, transparent);
	}

	.motif-chip.is-disabled {
		opacity: 0.5;
	}

	.motif-chip-label {
		color: var(--text-primary);
	}

	.motif-chip.fill-outline .motif-chip-label {
		color: inherit;
	}

	.motif-chip-icon {
		display: inline-flex;
	}

	.motif-chip-icon :global(svg) {
		width: 0.9em;
		height: 0.9em;
	}

	.motif-chip-remove {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		margin: -1px -2px -1px 0;
		width: 1rem;
		height: 1rem;
		background: transparent;
		border: none;
		color: inherit;
		cursor: pointer;
		opacity: 0.7;
		transition: opacity var(--transition-fast);
	}

	.motif-chip-remove:hover {
		opacity: 1;
	}

	.motif-chip-remove :global(svg) {
		width: 0.85em;
		height: 0.85em;
	}
</style>
