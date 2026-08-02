<script lang="ts" module>
	export interface ProgressBarProps {
		/** 0–max. Null/undefined → indeterminate sliding bar */
		value?: number | null;
		max?: number;
		label?: string;
		/** Show the percentage on the right of the label row */
		showValue?: boolean;
		/** Fill colour */
		tone?: 'accent' | 'success' | 'warning' | 'error' | 'info';
		size?: 'sm' | 'default' | 'lg';
		theme?: 'public' | 'admin';
		/** Additional CSS classes */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * ProgressBar — horizontal progress track. Determinate when value (0–100) is
	 * given; omit it (or pass null) for an indeterminate sliding bar. The fill
	 * uses the accent by default; tone switches it to a state colour. An
	 * optional label row shows the caption and the percentage.
	 *
	 * Usage:
	 *   <ProgressBar value={64} label="Uploading" showValue />
	 *   <ProgressBar tone="success" value={100} />
	 *   <ProgressBar />
	 */
	let {
		value = null,
		max = 100,
		label,
		showValue = false,
		tone = 'accent',
		size = 'default',
		theme = 'public',
		class: className = ''
	}: ProgressBarProps = $props();

	const indeterminate = $derived(value === null || value === undefined);
	const pct = $derived(
		indeterminate ? 0 : Math.max(0, Math.min(100, ((value as number) / max) * 100))
	);
</script>

<div class="motif-progress size-{size} tone-{tone} {className}" class:is-admin={theme === 'admin'}>
	{#if label || showValue}
		<div class="motif-progress-head">
			{#if label}<span class="motif-progress-label">{label}</span>{/if}
			{#if showValue && !indeterminate}<span class="motif-progress-value">{Math.round(pct)}%</span
				>{/if}
		</div>
	{/if}
	<div
		class="motif-progress-track"
		class:is-indeterminate={indeterminate}
		role="progressbar"
		aria-valuenow={indeterminate ? undefined : Math.round(pct)}
		aria-valuemin={indeterminate ? undefined : 0}
		aria-valuemax={indeterminate ? undefined : 100}
		aria-label={label ?? 'Progress'}
	>
		<div class="motif-progress-fill" style={indeterminate ? undefined : `width: ${pct}%`}></div>
	</div>
</div>

<style>
	.motif-progress {
		width: 100%;
		--progress-fill: var(--accent);
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.motif-progress.tone-success {
		--progress-fill: var(--colour-success);
	}

	.motif-progress.tone-warning {
		--progress-fill: var(--colour-warning);
	}

	.motif-progress.tone-error {
		--progress-fill: var(--colour-error);
	}

	.motif-progress.tone-info {
		--progress-fill: var(--accent-tertiary);
	}

	.motif-progress-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.motif-progress-label {
		font-family: var(--font-body);
		font-size: 0.8125rem;
		color: var(--text-secondary);
	}

	.motif-progress-value {
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-primary);
	}

	.motif-progress-track {
		position: relative;
		width: 100%;
		height: 8px;
		border-radius: 0;
		overflow: hidden;
		background: color-mix(in srgb, var(--text-primary) 10%, transparent);
	}

	.motif-progress.size-sm .motif-progress-track {
		height: 5px;
	}

	.motif-progress.size-lg .motif-progress-track {
		height: 12px;
	}

	.motif-progress-fill {
		height: 100%;
		border-radius: inherit;
		background: var(--progress-fill);
		transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.motif-progress-track.is-indeterminate .motif-progress-fill {
		width: 40%;
		animation: motif-progress-slide 1.3s ease-in-out infinite;
	}

	@keyframes motif-progress-slide {
		0% {
			transform: translateX(-110%);
		}
		100% {
			transform: translateX(320%);
		}
	}

	.motif-progress.is-admin .motif-progress-track {
		background: var(--admin-bg-elevated);
	}

	.motif-progress.is-admin .motif-progress-label {
		color: var(--admin-text-secondary);
	}

	.motif-progress.is-admin .motif-progress-value {
		color: var(--admin-text);
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-progress-track.is-indeterminate .motif-progress-fill {
			animation-duration: 2.4s;
		}
	}
</style>
