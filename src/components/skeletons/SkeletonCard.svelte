<script lang="ts">
	/**
	 * SkeletonCard
	 * Usage: `<SkeletonCard />`
	 * Features: Loading placeholder matching compact card dimensions with staggered pulse animation
	 */
</script>

<div class="skeleton-card">
	<div class="skeleton-header">
		<div class="skeleton-dot"></div>
		<div class="skeleton-badge"></div>
	</div>

	<div class="skeleton-title"></div>

	<div class="skeleton-excerpt">
		<div class="skeleton-line"></div>
		<div class="skeleton-line"></div>
		<div class="skeleton-line short"></div>
	</div>

	<div class="skeleton-meta"></div>
</div>

<style>
	.skeleton-card {
		display: flex;
		flex-direction: column;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-surface);
		padding: var(--card-padding);
		height: 100%;
	}

	.skeleton-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--space-3);
	}

	.skeleton-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--border-glass);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
	}

	.skeleton-badge {
		width: 60px;
		height: 20px;
		border-radius: 0;
		background: var(--border-glass);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		animation-delay: 0.1s;
	}

	.skeleton-title {
		height: 24px;
		width: 85%;
		border-radius: 0;
		background: var(--border-glass);
		margin-bottom: var(--space-2);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		animation-delay: 0.2s;
	}

	.skeleton-excerpt {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-4);
		flex: 1;
	}

	.skeleton-line {
		height: 14px;
		border-radius: 0;
		background: var(--border-glass);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
	}

	.skeleton-line:nth-child(1) {
		animation-delay: 0.3s;
	}

	.skeleton-line:nth-child(2) {
		animation-delay: 0.4s;
		width: 95%;
	}

	.skeleton-line:nth-child(3) {
		animation-delay: 0.5s;
	}

	/* Shorter last line simulates natural text wrap */
	.skeleton-line.short {
		width: 60%;
	}

	.skeleton-meta {
		height: 12px;
		width: 50%;
		border-radius: 0;
		background: var(--border-glass);
		margin-top: auto;
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		animation-delay: 0.6s;
	}

	@keyframes skeleton-pulse {
		0%,
		100% {
			opacity: var(--opacity-tertiary);
		}

		50% {
			opacity: 0.7;
		}
	}

	@media (max-width: 768px) {
		.skeleton-card {
			padding: var(--card-padding-sm);
		}
	}
</style>
