<script lang="ts" module>
	/**
	 * StatusConfig maps status string values to display labels and colour variants.
	 * Defined locally to keep admin atoms self-contained within the motif package.
	 */
	export interface StatusConfig {
		[statusValue: string]: {
			label: string;
			colour: 'success' | 'warning' | 'error' | 'info' | 'neutral';
		};
	}

	export interface StatusBadgeProps {
		status: string;
		config: StatusConfig;
		size?: 'sm' | 'md';
	}
</script>

<script lang="ts">
	/**
	 * StatusBadge — unified status indicator for admin tables and lists.
	 *
	 * Usage:
	 *   <StatusBadge status="published" config={POST_STATUS_COLOURS} />
	 *   <StatusBadge status="new" config={MESSAGE_STATUS_COLOURS} size="md" />
	 *
	 * Features:
	 * - Maps semantic colour names to state design tokens
	 * - Two size variants: sm (default) and md
	 * - Falls back to neutral styling for unknown status values
	 * - Dynamic inline style for background/text — values come from CSS variables
	 */

	let { status, config, size = 'sm' }: StatusBadgeProps = $props();

	const COLOUR_MAP = {
		success: { bg: 'var(--colour-success-bg)', text: 'var(--colour-success)' },
		warning: { bg: 'var(--colour-warning-bg)', text: 'var(--colour-warning)' },
		error: { bg: 'var(--colour-error-bg)', text: 'var(--colour-error)' },
		info: { bg: 'var(--colour-info-bg)', text: 'var(--colour-info)' },
		neutral: { bg: 'var(--bg-glass-solid)', text: 'var(--text-muted)' }
	} as const;

	const statusInfo = $derived(
		config[status] ?? {
			label: status,
			colour: 'neutral' as const
		}
	);

	const colours = $derived(COLOUR_MAP[statusInfo.colour] ?? COLOUR_MAP.neutral);
</script>

<span
	class="status-badge"
	data-size={size}
	style="background-color: {colours.bg}; color: {colours.text};"
>
	{statusInfo.label}
</span>

<style>
	.status-badge {
		display: inline-flex;
		align-items: center;
		border-radius: var(--radius-base);
		font-weight: 500;
	}

	.status-badge[data-size='sm'] {
		font-size: 0.75rem;
		padding: var(--space-1) var(--space-2);
	}

	.status-badge[data-size='md'] {
		font-size: 0.875rem;
		padding: var(--space-1) calc(var(--space-2) + 2px);
	}
</style>
