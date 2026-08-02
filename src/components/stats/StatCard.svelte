<script lang="ts" module>
	export type StatCardColour = 'red' | 'green' | 'blue' | 'purple';
	export type StatCardIcon = 'messages' | 'users' | 'posts' | 'chart';

	export interface StatCardProps {
		label: string;
		value: string | number;
		subValue?: string;
		colour?: StatCardColour;
		icon?: StatCardIcon | string;
		badgeCount?: number;
		loading?: boolean;
		/** @deprecated Use loading instead */
		isLoading?: boolean;
		suffix?: string;
		/** @deprecated Kept for API compatibility */
		trend?: 'up' | 'down' | 'neutral';
		/** @deprecated Kept for API compatibility */
		change?: number;
	}
</script>

<script lang="ts">
	/**
	 * StatCard
	 * Usage: `<StatCard label="Total Messages" value={42} icon="messages" colour="red" />`
	 * Features: Key metric display with icon, badge count, sub-value, loading skeleton, four colour themes
	 */

	let {
		label,
		value,
		subValue,
		colour = 'red',
		icon = 'chart',
		badgeCount = 0,
		loading = false,
		isLoading = false,
		suffix = '',
		trend: _trend,
		change: _change
	}: StatCardProps = $props();

	const isLoadingState = $derived(loading || isLoading);

	const isStringSvgIcon = $derived(typeof icon === 'string' && icon.includes('<svg'));

	const iconPath = $derived.by(() => {
		if (typeof icon !== 'string' || isStringSvgIcon) return '';

		switch (icon) {
			case 'messages':
				return 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z';
			case 'users':
				return 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z';
			case 'posts':
				return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
			case 'chart':
			default:
				return 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z';
		}
	});

	const shouldShowBadge = $derived(badgeCount > 0);
</script>

<div class="stat-card">
	{#if isLoadingState}
		<div class="stat-card-inner">
			<div class="skeleton-icon"></div>
			<div class="skeleton-content">
				<div class="skeleton-label"></div>
				<div class="skeleton-value"></div>
				<div class="skeleton-sub"></div>
			</div>
		</div>
	{:else}
		<div class="stat-card-inner">
			<div class="icon-container colour-{colour}">
				{#if isStringSvgIcon && typeof icon === 'string'}
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html icon}
				{:else}
					<svg
						class="icon-svg"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
						aria-hidden="true"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={iconPath}
						></path>
					</svg>
				{/if}

				{#if shouldShowBadge}
					<span class="badge" aria-label="{badgeCount} notifications">
						{badgeCount}
					</span>
				{/if}
			</div>

			<div class="text-content">
				<p class="stat-label">{label}</p>
				<p class="stat-value">{value}{suffix}</p>
				{#if subValue}
					<p class="stat-sub colour-{colour}-text">{subValue}</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.stat-card {
		border-radius: 0;
		border: 1px solid var(--admin-border);
		background: var(--admin-bg);
		padding: var(--space-5);
	}

	.stat-card-inner {
		display: flex;
		align-items: flex-start;
		gap: var(--space-4);
	}

	.icon-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		border-radius: 0;
	}

	/* Colour theme backgrounds — faint status washes behind the stat icon */
	.colour-red {
		background: var(--stat-icon-bg-red);
	}

	.colour-green {
		background: var(--stat-icon-bg-green);
	}

	.colour-blue {
		background: var(--stat-icon-bg-blue);
	}

	.colour-purple {
		background: var(--stat-icon-bg-purple);
	}

	.icon-svg {
		width: 24px;
		height: 24px;
		/* white is correct here — icon sits on a coloured background */
		color: white;
	}

	.badge {
		position: absolute;
		top: -4px;
		right: -4px;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 var(--space-1);
		border-radius: var(--radius-pill);
		background: var(--accent);
		font-size: 0.75rem;
		font-weight: 500;
		/* white is correct here — badge text on coloured background */
		color: white;
	}

	.text-content {
		min-width: 0;
		flex: 1;
	}

	.stat-label {
		font-size: 0.875rem;
		color: var(--admin-text-secondary);
		margin: 0;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--admin-text);
		margin: 0;
	}

	.stat-sub {
		font-size: 0.875rem;
		margin: var(--space-1) 0 0 0;
	}

	/* Sub-value colour themes */
	.colour-red-text {
		color: var(--accent);
	}

	.colour-green-text {
		color: var(--colour-success);
	}

	.colour-blue-text {
		color: var(--colour-info);
	}

	.colour-purple-text {
		color: var(--colour-info);
	}

	/* Skeleton loading states */
	.skeleton-icon {
		width: 48px;
		height: 48px;
		flex-shrink: 0;
		border-radius: 0;
		background: var(--admin-border);
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.skeleton-label {
		height: 16px;
		width: 96px;
		border-radius: 0;
		background: var(--admin-border);
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-value {
		height: 32px;
		width: 80px;
		border-radius: 0;
		background: var(--admin-border);
		animation: pulse 1.5s ease-in-out infinite;
	}

	.skeleton-sub {
		height: 16px;
		width: 64px;
		border-radius: 0;
		background: var(--admin-border);
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}

		50% {
			opacity: 0.5;
		}
	}
</style>
