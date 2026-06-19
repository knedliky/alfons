<script lang="ts" module>
	import type { HTMLButtonAttributes } from 'svelte/elements';

	export interface ButtonProps extends HTMLButtonAttributes {
		variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';
		size?: 'default' | 'sm' | 'lg' | 'icon';
		theme?: 'admin' | 'public';
		class?: string;
		children?: import('svelte').Snippet;
	}
</script>

<script lang="ts">
	/**
	 * Button — pill-shaped interactive element with theme and variant support.
	 *
	 * Usage:
	 *   <Button>Primary CTA</Button>
	 *   <Button variant="secondary" size="sm">Secondary</Button>
	 *   <Button variant="ghost" theme="admin">Admin action</Button>
	 *
	 * Features:
	 * - Five visual variants: default, secondary, outline, ghost, link
	 * - Three sizes plus icon mode: default, sm, lg, icon
	 * - Automatic theme detection from context (public/admin)
	 * - Glassmorphism on secondary variant in public theme
	 * - Design-token-first CSS with data-attribute selectors
	 */
	import { getThemeVariant } from '../../contexts/theme.js';

	let {
		variant = 'default',
		size = 'default',
		theme,
		class: className,
		children,
		...restProps
	}: ButtonProps = $props();

	const activeTheme = $derived(theme ?? getThemeVariant());
</script>

<button
	class="button {className ?? ''}"
	data-variant={variant}
	data-size={size}
	data-theme={activeTheme}
	{...restProps}
>
	{@render children?.()}
</button>

<style>
	/* Base — reset browser defaults then apply shared styling */
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		border-radius: var(--radius-pill);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-normal);
		border: none;
		background: none;
		color: inherit;
		text-decoration: none;
		line-height: 1;
	}

	.button:focus-visible {
		outline: none;
	}

	.button:disabled {
		pointer-events: none;
		opacity: 0.5;
	}

	/* Sizes */

	.button[data-size='default'] {
		height: 3rem;
		padding: 0.75rem 2rem;
	}

	.button[data-size='sm'] {
		height: 2.5rem;
		padding: 0.5rem 1.5rem;
		font-size: 0.875rem;
	}

	.button[data-size='lg'] {
		height: 3.5rem;
		padding: 1rem 2.5rem;
		font-size: 1rem;
	}

	.button[data-size='icon'] {
		height: 3rem;
		width: 3rem;
	}

	/* Focus rings — theme-aware offset colour */

	.button[data-theme='public']:focus-visible {
		box-shadow:
			0 0 0 2px var(--bg-primary),
			0 0 0 4px var(--accent);
	}

	.button[data-theme='admin']:focus-visible {
		box-shadow:
			0 0 0 2px var(--admin-bg),
			0 0 0 4px var(--accent);
	}

	/* Public theme variants */

	.button[data-theme='public'][data-variant='default'] {
		background: var(--accent);
		color: white;
	}

	.button[data-theme='public'][data-variant='default']:hover {
		background: var(--accent-hover);
	}

	/* Secondary — glassmorphism border pill */
	.button[data-theme='public'][data-variant='secondary'] {
		background: transparent;
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.button[data-theme='public'][data-variant='secondary']:hover {
		background: rgba(243, 243, 243, 0.05);
		border-color: var(--card-border-hover);
	}

	.button[data-theme='public'][data-variant='outline'] {
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--accent);
	}

	.button[data-theme='public'][data-variant='outline']:hover {
		background: var(--accent);
		color: white;
	}

	.button[data-theme='public'][data-variant='ghost'] {
		background: transparent;
	}

	.button[data-theme='public'][data-variant='ghost']:hover {
		background: rgba(243, 243, 243, 0.05);
		color: var(--text-primary);
	}

	.button[data-theme='public'][data-variant='link'] {
		background: transparent;
		color: var(--accent);
		text-underline-offset: 4px;
	}

	.button[data-theme='public'][data-variant='link']:hover {
		color: var(--text-primary);
		text-decoration: underline;
	}

	/* Admin theme variants */

	.button[data-theme='admin'][data-variant='default'] {
		background: var(--accent);
		color: white;
	}

	.button[data-theme='admin'][data-variant='default']:hover {
		background: var(--accent-hover);
	}

	.button[data-theme='admin'][data-variant='secondary'] {
		background: transparent;
		border: 1px solid var(--admin-border);
		color: var(--admin-text);
	}

	.button[data-theme='admin'][data-variant='secondary']:hover {
		background: var(--admin-bg-elevated);
		border-color: var(--admin-text-muted);
	}

	.button[data-theme='admin'][data-variant='outline'] {
		border: 1px solid var(--accent);
		background: transparent;
		color: var(--accent);
	}

	.button[data-theme='admin'][data-variant='outline']:hover {
		background: var(--accent);
		color: white;
	}

	.button[data-theme='admin'][data-variant='ghost'] {
		background: transparent;
	}

	.button[data-theme='admin'][data-variant='ghost']:hover {
		background: var(--admin-bg-elevated);
		color: var(--admin-text);
	}

	.button[data-theme='admin'][data-variant='link'] {
		background: transparent;
		color: var(--accent);
		text-underline-offset: 4px;
	}

	.button[data-theme='admin'][data-variant='link']:hover {
		color: var(--admin-text);
		text-decoration: underline;
	}

	/* Light mode enhancements */

	:global([data-colour-mode='light']) .button[data-variant='secondary']:hover {
		background: var(--button-secondary-hover-bg);
		border-color: var(--button-secondary-hover-border);
	}

	:global([data-colour-mode='light']) .button[data-variant='outline']:hover {
		box-shadow: var(--button-outline-hover-shadow);
	}

	:global([data-colour-mode='light']) .button[data-variant='ghost']:hover {
		background: var(--button-ghost-hover-bg);
	}
</style>
