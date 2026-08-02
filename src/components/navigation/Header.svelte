<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface HeaderNavItem {
		href: string;
		label: string;
	}

	export interface HeaderProps {
		navItems?: HeaderNavItem[];
		/** The href of the active nav item — drives the sliding indicator */
		activePath?: string;
		/** compact shrinks the bar and keeps links inline (article/admin chrome) */
		variant?: 'default' | 'compact';
		/** Override the default Logo + Wordmark lockup */
		brand?: Snippet;
		brandHref?: string;
		blinkingLogo?: boolean;
		/** Wire to your router; defaults to plain anchor navigation */
		onNavigate?: (href: string) => void;
	}
</script>

<script lang="ts">
	/**
	 * Header — fixed floating glass navigation bar. A sliding accent indicator
	 * tracks the active nav item; below 768px the links collapse into a
	 * hamburger that opens a full-screen mobile menu. variant="compact" shrinks
	 * the bar and keeps the links inline (for article/admin chrome). Renders a
	 * brand lockup (Logo + Wordmark) on the left — override via the brand
	 * snippet. Includes a spacer so page content clears the fixed bar.
	 *
	 * Usage:
	 *   <Header activePath="#experiments" navItems={items} onNavigate={goto} />
	 */
	import Logo from '../brand/Logo.svelte';

	const DEFAULT_NAV: HeaderNavItem[] = [
		{ href: '#blog', label: 'Blog' },
		{ href: '#experiments', label: 'Experiments' },
		{ href: '#about', label: 'About' }
	];

	let {
		navItems = DEFAULT_NAV,
		activePath,
		variant = 'default',
		brand,
		brandHref = '#',
		blinkingLogo = false,
		onNavigate
	}: HeaderProps = $props();

	const active = $derived(activePath ?? navItems[0]?.href);
	const compact = $derived(variant === 'compact');

	let navElement: HTMLElement | undefined = $state();
	const itemElements: Record<string, HTMLAnchorElement> = {};
	let indicator = $state({ left: 0, width: 0, visible: false });
	let ready = $state(false);
	let menuOpen = $state(false);
	let hasInteracted = $state(false);

	function measure() {
		const el = itemElements[active];
		if (!navElement || !el) {
			indicator = { ...indicator, visible: false };
			return;
		}
		const nr = navElement.getBoundingClientRect();
		const er = el.getBoundingClientRect();
		const pad = 8;
		indicator = { left: er.left - nr.left - pad / 2, width: er.width + pad, visible: true };
	}

	// Re-measure whenever the active item or layout inputs change; enable the
	// slide transition only after the first paint so the indicator doesn't
	// animate in from 0.
	$effect(() => {
		void active;
		void variant;
		void navItems;
		measure();
		if (!ready) {
			const id = requestAnimationFrame(() => (ready = true));
			return () => cancelAnimationFrame(id);
		}
	});

	$effect(() => {
		let raf = 0;
		const onResize = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(measure);
		};
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			cancelAnimationFrame(raf);
		};
	});

	// Lock page scroll while the full-screen mobile menu is open.
	$effect(() => {
		document.body.style.overflow = menuOpen ? 'hidden' : '';
		return () => {
			document.body.style.overflow = '';
		};
	});

	function handleWindowKeydown(event: KeyboardEvent) {
		if (menuOpen && event.key === 'Escape') menuOpen = false;
	}

	function toggleMenu() {
		hasInteracted = true;
		menuOpen = !menuOpen;
	}

	function go(event: MouseEvent, href: string) {
		if (onNavigate) {
			event.preventDefault();
			onNavigate(href);
		}
		menuOpen = false;
	}
</script>

<svelte:window onkeydown={handleWindowKeydown} />

<header class="motif-hdr" class:is-compact={compact}>
	<div class="motif-hdr-inner">
		<div class="motif-hdr-row" class:is-compact={compact}>
			<a
				href={brandHref}
				class="motif-hdr-brand"
				onclick={(e) => go(e, brandHref)}
				aria-label="Motivka — home"
			>
				{#if brand}
					{@render brand()}
				{:else}
					<span class="motif-hdr-brand-lockup">
						<Logo height={compact ? 21 : 29} blinking={blinkingLogo} />
						<span class="motif-hdr-wordmark" style:font-size="{compact ? 16 : 24}px">Motivka</span>
					</span>
				{/if}
			</a>

			<nav
				bind:this={navElement}
				class="motif-hdr-nav"
				aria-label="Main navigation"
				data-ready={ready ? '' : undefined}
			>
				{#each navItems as item (item.href)}
					<a
						bind:this={itemElements[item.href]}
						href={item.href}
						class="motif-hdr-link"
						class:is-active={item.href === active}
						aria-current={item.href === active ? 'page' : undefined}
						onclick={(e) => go(e, item.href)}
					>
						{item.label}
					</a>
				{/each}
				<span
					class="motif-hdr-indicator"
					class:is-visible={indicator.visible}
					style:left="{indicator.left}px"
					style:width="{indicator.width}px"
					aria-hidden="true"
				></span>
			</nav>

			{#if !compact}
				<button
					type="button"
					class="motif-hdr-burger"
					aria-label={menuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={menuOpen}
					onclick={toggleMenu}
				>
					<svg
						class="motif-hdr-burger-svg"
						class:is-animated={hasInteracted}
						viewBox="0 0 24 24"
						width="34"
						height="34"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="square"
						aria-hidden="true"
					>
						<line
							class="motif-hdr-burger-line top"
							class:is-open={menuOpen}
							x1="4"
							y1="6"
							x2="20"
							y2="6"
						/>
						<line
							class="motif-hdr-burger-line middle"
							class:is-open={menuOpen}
							x1="4"
							y1="12"
							x2="20"
							y2="12"
						/>
						<line
							class="motif-hdr-burger-line bottom"
							class:is-open={menuOpen}
							x1="4"
							y1="18"
							x2="20"
							y2="18"
						/>
					</svg>
				</button>
			{/if}
		</div>
	</div>
</header>

{#if !compact}
	<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions --
	     backdrop click-to-close is a convenience; Escape (on svelte:window) and the
	     burger button are the accessible close routes. -->
	<div
		class="motif-hdr-mobile"
		class:is-open={menuOpen}
		role="dialog"
		aria-modal="true"
		aria-label="Mobile navigation menu"
		aria-hidden={!menuOpen}
		onclick={(e) => {
			if (e.target === e.currentTarget) menuOpen = false;
		}}
	>
		<div class="motif-hdr-mobile-panel" class:is-open={menuOpen}>
			<nav class="motif-hdr-mobile-nav" aria-label="Mobile navigation">
				{#each navItems as item, i (item.href)}
					<a
						href={item.href}
						class="motif-hdr-mobile-link"
						class:is-active={item.href === active}
						aria-current={item.href === active ? 'page' : undefined}
						style={menuOpen ? `animation-delay: ${200 + i * 80}ms` : undefined}
						onclick={(e) => go(e, item.href)}
					>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>
	</div>
{/if}

<div class="motif-hdr-spacer" class:is-compact={compact} aria-hidden="true"></div>

<style>
	.motif-hdr {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: var(--z-widget);
		padding: 0 var(--space-5);
		background: color-mix(in srgb, var(--bg-primary) 60%, transparent);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border-bottom: 1px solid var(--border-glass);
	}

	.motif-hdr-inner {
		max-width: 64rem;
		margin: 0 auto;
	}

	.motif-hdr-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 80px;
	}

	.motif-hdr-row.is-compact {
		height: 56px;
	}

	@media (min-width: 768px) {
		.motif-hdr-row.is-compact {
			height: 80px;
		}
	}

	.motif-hdr-brand {
		display: flex;
		align-items: center;
		text-decoration: none;
	}

	.motif-hdr-brand-lockup {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.motif-hdr-wordmark {
		font-family: var(--font-wordmark);
		font-weight: 700;
		letter-spacing: -0.03em;
		line-height: 1;
		color: var(--text-primary);
	}

	.motif-hdr-nav {
		position: relative;
		display: none;
		align-items: center;
		gap: var(--space-6);
	}

	@media (min-width: 768px) {
		.motif-hdr-nav {
			display: flex;
		}
	}

	.motif-hdr-link {
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 600;
		white-space: nowrap;
		color: var(--text-secondary);
		text-decoration: none;
		padding-bottom: 6px;
		transition: color var(--transition-normal);
	}

	.motif-hdr-link:hover {
		color: var(--accent-secondary);
	}

	.motif-hdr-link.is-active {
		color: var(--text-primary);
	}

	.motif-hdr-indicator {
		position: absolute;
		bottom: 0;
		height: 3px;
		background: var(--accent);
		opacity: 0;
	}

	.motif-hdr-indicator.is-visible {
		opacity: 1;
	}

	.motif-hdr-nav[data-ready] .motif-hdr-indicator {
		transition:
			left 0.28s cubic-bezier(0.4, 0, 0.2, 1),
			width 0.28s cubic-bezier(0.4, 0, 0.2, 1),
			opacity 0.2s ease;
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-hdr-nav[data-ready] .motif-hdr-indicator {
			transition: opacity 0.2s ease;
		}
	}

	.motif-hdr-burger {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		padding: var(--space-2);
		background: transparent;
		border: none;
		cursor: pointer;
		color: var(--text-primary);
	}

	@media (min-width: 768px) {
		.motif-hdr-burger {
			display: none;
		}
	}

	.motif-hdr-burger-svg {
		overflow: visible;
	}

	.motif-hdr-burger:hover .motif-hdr-burger-line {
		stroke: var(--accent);
	}

	.motif-hdr-burger-line {
		stroke: var(--text-primary);
		opacity: 1;
		transform-origin: center;
		transform-box: fill-box;
		translate: 0 0;
		rotate: 0deg;
	}

	/* Closing: rotate back immediately, then translate apart (0.4s delay) */
	.motif-hdr-burger-svg.is-animated .motif-hdr-burger-line {
		transition:
			rotate 0.4s cubic-bezier(0.5, -0.5, 0.5, 1.5) 0s,
			translate 0.4s cubic-bezier(0.5, -0.5, 0.5, 1.5) 0.4s,
			opacity 0.4s ease 0.4s,
			stroke 0.3s ease 0s;
	}

	/* Opening: translate together immediately, then rotate into X (0.4s delay) */
	.motif-hdr-burger-svg.is-animated .motif-hdr-burger-line.is-open {
		transition:
			translate 0.4s cubic-bezier(0.5, -0.5, 0.5, 1.5) 0s,
			rotate 0.4s cubic-bezier(0.5, -0.5, 0.5, 1.5) 0.4s,
			opacity 0.4s ease 0s,
			stroke 0.3s ease 0s;
	}

	.motif-hdr-burger-line.top.is-open {
		translate: 0 6px;
		rotate: 45deg;
		stroke: var(--accent);
	}

	.motif-hdr-burger-line.middle.is-open {
		opacity: 0;
	}

	.motif-hdr-burger-line.bottom.is-open {
		translate: 0 -6px;
		rotate: -45deg;
		stroke: var(--accent);
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-hdr-burger-svg.is-animated .motif-hdr-burger-line,
		.motif-hdr-burger-svg.is-animated .motif-hdr-burger-line.is-open {
			transition: stroke 0.3s ease;
		}
	}

	.motif-hdr-mobile {
		position: fixed;
		inset: 0;
		z-index: var(--z-overlay, 1100);
		display: flex;
		flex-direction: column;
		background: var(--bg-glass);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid var(--border-glass);
		opacity: 0;
		pointer-events: none;
	}

	.motif-hdr-mobile.is-open {
		opacity: 1;
		pointer-events: auto;
		animation: motifHdrFadeIn 0.4s ease-out;
	}

	@media (min-width: 768px) {
		.motif-hdr-mobile {
			display: none;
		}
	}

	.motif-hdr-mobile-panel {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		transform: translateX(100%);
		transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
	}

	.motif-hdr-mobile-panel.is-open {
		transform: translateX(0);
	}

	.motif-hdr-mobile-nav {
		display: flex;
		flex: 1;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		gap: var(--space-6);
		padding: 0 var(--space-7);
	}

	.motif-hdr-mobile-link {
		position: relative;
		font-family: var(--font-body);
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--text-secondary);
		text-decoration: none;
		opacity: 0;
		transform: translateX(20px);
		animation: motifHdrSlideIn 0.5s ease-out forwards;
		transition: color var(--transition-fast);
	}

	.motif-hdr-mobile-link:hover {
		color: var(--accent-secondary);
	}

	.motif-hdr-mobile-link.is-active {
		color: var(--accent);
	}

	.motif-hdr-mobile-link.is-active::after {
		content: '';
		position: absolute;
		left: -24px;
		top: 50%;
		transform: translateY(-50%);
		width: 4px;
		height: 32px;
		background: var(--accent);
	}

	@media (prefers-reduced-motion: reduce) {
		.motif-hdr-mobile-panel {
			transition: none;
		}

		.motif-hdr-mobile-link {
			animation: none;
			opacity: 1;
			transform: none;
		}
	}

	@keyframes motifHdrFadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes motifHdrSlideIn {
		from {
			opacity: 0;
			transform: translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.motif-hdr-spacer {
		height: 80px;
	}

	.motif-hdr-spacer.is-compact {
		height: 56px;
	}

	@media (min-width: 768px) {
		.motif-hdr-spacer.is-compact {
			height: 80px;
		}
	}
</style>
