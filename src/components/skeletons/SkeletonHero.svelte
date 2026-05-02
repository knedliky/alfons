<script lang="ts">
	/**
	 * SkeletonHero
	 * Usage: `<SkeletonHero />`
	 * Features: Loading placeholder for featured hero section with visual and content columns
	 */
</script>

<div class="skeleton-hero">
	<div class="skeleton-hero-grid">
		<div class="skeleton-visual">
			<div class="skeleton-visual-dot"></div>
			<div class="skeleton-visual-label"></div>
		</div>

		<div class="skeleton-content">
			<div class="skeleton-featured-badge"></div>
			<div class="skeleton-hero-title"></div>
			<div class="skeleton-hero-excerpt">
				<div class="skeleton-line"></div>
				<div class="skeleton-line"></div>
			</div>
			<div class="skeleton-hero-meta"></div>
		</div>
	</div>
</div>

<style>
	.skeleton-hero {
		/* Card surface styles — replaces orphaned .card-glass global class */
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--card-radius);
		padding: var(--card-padding);
		box-shadow: var(--card-shadow);
		margin-bottom: var(--space-6);
	}

	/* Stacked on mobile, side-by-side on desktop */
	.skeleton-hero-grid {
		display: grid;
		gap: var(--space-5);
	}

	.skeleton-visual {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 200px;
		border-radius: 8px;
		/* Subtle gradient placeholder for illustration area */
		background: linear-gradient(135deg, rgba(127, 57, 251, 0.05) 0%, rgba(206, 32, 41, 0.05) 100%);
	}

	.skeleton-visual-dot {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--border-glass);
		margin-bottom: var(--space-4);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
	}

	.skeleton-visual-label {
		width: 100px;
		height: 14px;
		border-radius: 4px;
		background: var(--border-glass);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		animation-delay: 0.1s;
	}

	.skeleton-content {
		display: flex;
		flex-direction: column;
	}

	.skeleton-featured-badge {
		width: 80px;
		height: 24px;
		border-radius: var(--radius-pill);
		background: var(--border-glass);
		margin-bottom: var(--space-2);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		animation-delay: 0.2s;
	}

	.skeleton-hero-title {
		height: 32px;
		width: 80%;
		border-radius: 4px;
		background: var(--border-glass);
		margin-bottom: var(--space-4);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
		animation-delay: 0.3s;
	}

	.skeleton-hero-excerpt {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: var(--space-5);
	}

	.skeleton-line {
		height: 16px;
		border-radius: 4px;
		background: var(--border-glass);
		animation: skeleton-pulse 1.5s ease-in-out infinite;
	}

	.skeleton-line:nth-child(1) {
		animation-delay: 0.4s;
	}

	.skeleton-line:nth-child(2) {
		animation-delay: 0.5s;
		width: 70%;
	}

	.skeleton-hero-meta {
		height: 14px;
		width: 40%;
		border-radius: 4px;
		background: var(--border-glass);
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

	@media (min-width: 1024px) {
		.skeleton-visual {
			min-height: 300px;
		}
	}

	@media (min-width: 1200px) {
		.skeleton-hero-grid {
			grid-template-columns: 1fr 2fr;
		}

		.skeleton-hero-title {
			height: 40px;
		}
	}
</style>
