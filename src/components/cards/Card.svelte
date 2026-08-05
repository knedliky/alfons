<script lang="ts" module>
	import type { ThemeVariant } from '../../contexts/theme.js';
	import type { Snippet } from 'svelte';

	type CardElement = 'div' | 'a' | 'section' | 'article' | 'button';
	type CardSize = 'default' | 'compact' | 'flush';

	export interface CardProps {
		theme?: ThemeVariant;
		variant?: 'default' | 'elevated' | 'ghost' | 'outlined' | 'interactive';
		size?: CardSize;
		as?: CardElement;
		href?: string;
		class?: string;
		children?: Snippet;
		[key: string]: unknown;
	}
</script>

<script lang="ts">
	/**
	 * Card — base surface primitive for content containers.
	 *
	 * Usage:
	 *   <Card>Default card</Card>
	 *   <Card as="a" href="/about" variant="elevated">Linked card</Card>
	 *   <Card theme="admin" variant="ghost">Admin ghost card</Card>
	 *   <Card size="compact">Compact padding</Card>
	 *   <Card size="flush">No padding</Card>
	 *
	 * Features:
	 * - Polymorphic element via `as` prop (div, a, section, article, button)
	 * - Five variants: default (control plate), elevated, ghost, outlined, interactive
	 * - Three sizes: default, compact (tighter padding), flush (no padding)
	 * - Automatic theme detection from context (public/admin)
	 * - Self-contained styling — no dependency on global .card-glass utility
	 *
	 * THE PLATE. The default variant is a control-panel plate: a vertical sheen
	 * down a brushed charcoal face, a machined --steel-200 edge, a light inset
	 * along the top, and a rivet in each of the four corners. The rivets are
	 * painted on the plate as four radial gradients rather than composed as
	 * elements, so an empty card still has them and no consumer assembles them
	 * by hand. Each sits 12px in from its corner — inside --card-padding at
	 * every size, compact included.
	 *
	 * No eyebrows, kickers or accent strips. Metadata belongs in the body as
	 * mono spec text: <p class="mcn-spec">PART Nº 37B</p>.
	 */
	import { getThemeVariant } from '../../contexts/theme.js';

	let {
		theme,
		variant = 'default',
		size = 'default',
		as: Element = 'div',
		href,
		class: className,
		children,
		...restProps
	}: CardProps = $props();

	const activeTheme = $derived(theme ?? getThemeVariant());
</script>

<svelte:element
	this={Element}
	class="card {className ?? ''}"
	data-theme={activeTheme}
	data-variant={variant}
	data-size={size}
	{href}
	{...restProps}
>
	{@render children?.()}
</svelte:element>

<style>
	/* Base card surface — a control-panel plate: brushed charcoal face, a
	   machined --steel-200 edge, a light inset along the top, and a rivet in
	   each of the four corners.

	   The rivets are drawn as four radial gradients on the plate itself rather
	   than as elements, so a card with no children still has them and no
	   consumer has to compose them. Each is 12px in from its corner, which is
	   inside --card-padding at every size, including compact.

	   No eyebrows, kickers or accent strips: metadata lives in the body as mono
	   spec text (.mcn-spec). */
	.card {
		border-radius: var(--radius-surface);
		padding: var(--card-padding);
		transition:
			box-shadow var(--transition-normal),
			border-color var(--transition-normal),
			background-color var(--transition-normal),
			transform var(--transition-normal);
	}

	/* === Size variants ===
	   compact: tighter padding for dense grid layouts
	   flush: zero padding for cards that manage their own internal spacing */
	.card[data-size='compact'] {
		padding: var(--card-padding-sm);
	}

	.card[data-size='flush'] {
		padding: 0;
	}

	@media (max-width: 768px) {
		.card[data-size='default'] {
			padding: var(--card-padding-sm);
		}
	}

	/* === Public theme — default variant (self-contained glassmorphism) ===
	   These styles replace the global .card-glass utility class so Card.svelte
	   owns its visual treatment without external dependencies. */
	.card[data-theme='public'] {
		color: var(--text-primary);
	}

	/* The plate. A vertical sheen down the face, four corner rivets, a machined
	   steel edge and a light top inset — the whole thing reads as a panel
	   fastened to something rather than a rectangle floating on it. */
	.card[data-theme='public'][data-variant='default'] {
		background-color: var(--surface-card);
		background-image:
			radial-gradient(
				circle at 12px 12px,
				rgba(var(--sheen-rgb), 0.38) 0 1px,
				var(--rivet-face) 1.6px,
				var(--rivet-edge) 2.6px,
				transparent 3.4px
			),
			radial-gradient(
				circle at calc(100% - 12px) 12px,
				rgba(var(--sheen-rgb), 0.38) 0 1px,
				var(--rivet-face) 1.6px,
				var(--rivet-edge) 2.6px,
				transparent 3.4px
			),
			radial-gradient(
				circle at 12px calc(100% - 12px),
				rgba(var(--sheen-rgb), 0.38) 0 1px,
				var(--rivet-face) 1.6px,
				var(--rivet-edge) 2.6px,
				transparent 3.4px
			),
			radial-gradient(
				circle at calc(100% - 12px) calc(100% - 12px),
				rgba(var(--sheen-rgb), 0.38) 0 1px,
				var(--rivet-face) 1.6px,
				var(--rivet-edge) 2.6px,
				transparent 3.4px
			),
			linear-gradient(
				180deg,
				color-mix(in oklab, var(--surface-card), white 4%),
				var(--surface-card) 55%,
				color-mix(in oklab, var(--surface-card), black 10%)
			);
		border: 1px solid var(--steel-200);
		box-shadow:
			inset 0 1px 0 rgba(var(--sheen-rgb), 0.05),
			var(--card-shadow);
	}

	.card[data-theme='public'][data-variant='default']:hover {
		box-shadow:
			inset 0 1px 0 rgba(var(--sheen-rgb), 0.05),
			var(--card-shadow-hover);
	}

	/* === Admin theme — solid surface === */
	.card[data-theme='admin'] {
		background: var(--admin-bg-elevated);
		border: 1px solid var(--admin-border);
		color: var(--admin-text);
		box-shadow: var(--admin-shadow);
	}

	/* === Elevated variant === */
	.card[data-variant='elevated'] {
		box-shadow: var(--card-shadow-hover);
	}

	.card[data-theme='public'][data-variant='elevated'] {
		background: var(--bg-glass-solid);
		border: 1px solid var(--card-border);
	}

	.card[data-theme='admin'][data-variant='elevated'] {
		background: var(--admin-bg);
		box-shadow: var(--admin-shadow-elevated);
	}

	/* === Ghost variant === */
	.card[data-variant='ghost'] {
		background: transparent;
		border: none;
		box-shadow: none;
	}

	/* === Outlined variant ===
	   Transparent surface with accent-coloured border — useful for secondary emphasis
	   or when the card needs to stand out without a filled background. */
	.card[data-variant='outlined'] {
		background: transparent;
		border: 1px solid var(--accent-border);
		box-shadow: none;
	}

	.card[data-variant='outlined']:hover {
		border-color: var(--accent);
	}

	/* Admin theme: use admin border token to stay within the admin namespace */
	.card[data-theme='admin'][data-variant='outlined'] {
		background: transparent;
		border: 1px solid var(--admin-border);
		box-shadow: none;
	}

	.card[data-theme='admin'][data-variant='outlined']:hover {
		border-color: var(--admin-text-secondary);
	}

	/* === Interactive variant ===
	   Builds on the default surface with cursor and hover transform to signal
	   clickability — use for cards that act as links or trigger actions. */
	.card[data-variant='interactive'] {
		cursor: pointer;
	}

	.card[data-theme='public'][data-variant='interactive'] {
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		box-shadow: var(--card-shadow);
	}

	/* Dark mode: solid background matching default, with scale + border glow on hover.
	   Carries the same directional lit edge as the default variant. */
	:global([data-colour-mode='dark']) .card[data-theme='public'][data-variant='interactive'] {
		background: var(--bg-glass-solid);
		border-top-color: var(--el-edge-light);
		border-left-color: var(--el-edge-light);
		border-right-color: var(--el-edge-shade);
		border-bottom-color: var(--el-edge-shade);
	}

	:global([data-colour-mode='dark']) .card[data-theme='public'][data-variant='interactive']:hover {
		transform: scale(1.02);
		border-color: var(--accent-border);
		box-shadow: var(--card-shadow-hover);
	}

	/* Admin theme: elevated background with pointer affordance */
	.card[data-theme='admin'][data-variant='interactive'] {
		cursor: pointer;
		background: var(--admin-bg-elevated);
		border: 1px solid var(--admin-border);
		color: var(--admin-text);
		box-shadow: var(--admin-shadow);
	}

	.card[data-theme='admin'][data-variant='interactive']:hover {
		box-shadow: var(--admin-shadow-elevated);
	}

	/* === Compact card content layout ===
	   Shared content structure for cards using size="compact".
	   These global selectors let consumers build card-inner layouts
	   without duplicating structural CSS at every call site. */

	:global(.card-compact) {
		display: flex;
		flex-direction: row;
		text-decoration: none;
		height: 100%;
		width: 100%;
	}

	:global(a.card-compact:hover) {
		transform: scale(1.01);
	}

	:global(.card-compact .card-inner) {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	:global(.card-compact .card-inner.has-illustration) {
		flex-direction: row;
		gap: var(--space-5);
		align-items: stretch;
	}

	:global(.card-compact .card-illustration) {
		flex: 0 0 25%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-2);
		flex-shrink: 0;
		background: linear-gradient(135deg, var(--colour-info-bg) 0%, var(--accent-bg) 100%);
		border-radius: 0;
	}

	:global(.card-compact .card-illustration .illustration-svg) {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: contain;
	}

	:global(.card-compact .card-illustration .illustration-img) {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: cover;
		border-radius: 0;
	}

	:global(.card-compact .card-illustration.has-raster) {
		padding: 0;
		background: none;
	}

	:global(.card-compact .card-content) {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	:global(.card-compact .card-header-row) {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	:global(.card-compact .card-header-row:empty) {
		display: none;
	}

	:global(.card-compact .badge) {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: 0.125rem 0.5rem;
		border-radius: 0;
		font-size: 0.6875rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.03em;
		margin-left: auto;
	}

	:global(.card-compact .card-title) {
		font-size: 1.125rem;
		font-weight: 600;
		line-height: 1.3;
		color: var(--text-primary);
		margin-bottom: var(--space-2);
	}

	:global(.card-compact .card-excerpt) {
		font-size: 0.875rem;
		line-height: 1.6;
		color: var(--text-secondary);
		margin-bottom: var(--space-4);
		flex: 1;
	}

	:global(.card-compact .card-meta) {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-size: 0.75rem;
		color: var(--text-muted);
		margin-top: auto;
	}

	:global(.card-compact .meta-item) {
		white-space: nowrap;
	}

	:global(.card-compact .meta-separator) {
		opacity: 0.5;
	}

	:global(.card-compact .card-slot) {
		margin-top: var(--space-1);
	}

	@media (max-width: 768px) {
		:global(.card-compact .card-inner.has-illustration) {
			gap: var(--space-4);
			align-items: center;
		}

		:global(.card-compact .card-title) {
			font-size: 1rem;
		}

		:global(.card-compact .card-excerpt) {
			font-size: 0.8125rem;
		}

		:global(.card-compact .card-meta) {
			font-size: 0.6875rem;
		}
	}
</style>
