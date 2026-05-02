<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface EmptyStateProps {
		title: string;
		message: string;
		icon?: 'users' | 'messages' | 'posts' | 'search' | 'data';
		action?: {
			label: string;
			href?: string;
			onclick?: () => void;
		};
		variant?: 'public' | 'admin';
		customIcon?: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * EmptyState — centred empty state with icon, heading, message, and optional CTA.
	 *
	 * Usage:
	 *   <EmptyState title="No posts found" message="Try adjusting your filters" icon="posts" variant="admin" />
	 *
	 * Features:
	 * - Five built-in icon variants: users, messages, posts, search, data
	 * - Custom icon via snippet for full control
	 * - Admin and public token namespaces
	 * - Optional CTA supporting both href navigation and onclick callback
	 */

	import Button from '../atoms/Button.svelte';

	let {
		title,
		message,
		icon = 'search',
		action,
		variant = 'admin',
		customIcon
	}: EmptyStateProps = $props();

	const backgroundColour = $derived(variant === 'admin' ? 'var(--admin-bg)' : 'var(--card-bg)');
	const borderColour = $derived(variant === 'admin' ? 'var(--admin-border)' : 'var(--card-border)');
	const titleColour = $derived(variant === 'admin' ? 'var(--admin-text)' : 'var(--text-primary)');
	const messageColour = $derived(
		variant === 'admin' ? 'var(--admin-text-secondary)' : 'var(--text-secondary)'
	);
	const iconColour = $derived(
		variant === 'admin' ? 'var(--admin-text-muted)' : 'var(--text-muted)'
	);
</script>

<div class="empty-state" style="background: {backgroundColour}; border-color: {borderColour};">
	<div class="empty-state-icon" style="color: {iconColour};">
		{#if customIcon}
			{@render customIcon()}
		{:else if icon === 'users'}
			<svg
				class="icon-svg"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
				></path>
			</svg>
		{:else if icon === 'messages'}
			<svg
				class="icon-svg"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
				></path>
			</svg>
		{:else if icon === 'posts'}
			<svg
				class="icon-svg"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				></path>
			</svg>
		{:else if icon === 'data'}
			<svg
				class="icon-svg"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
				></path>
			</svg>
		{:else}
			<svg
				class="icon-svg"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
				></path>
			</svg>
		{/if}
	</div>

	<h3 class="empty-state-title" style="color: {titleColour};">
		{title}
	</h3>

	<p class="empty-state-message" class:with-action={!!action} style="color: {messageColour};">
		{message}
	</p>

	{#if action}
		{#if action.href}
			<a href={action.href}>
				<Button variant="default">{action.label}</Button>
			</a>
		{:else if action.onclick}
			<Button variant="default" onclick={action.onclick}>{action.label}</Button>
		{/if}
	{/if}
</div>

<style>
	.empty-state {
		border-radius: var(--radius);
		border: 1px solid;
		padding: var(--space-8);
		text-align: center;
	}

	.empty-state-icon {
		width: 48px;
		height: 48px;
		margin: 0 auto var(--space-4);
	}

	.icon-svg {
		width: 48px;
		height: 48px;
	}

	.empty-state-title {
		margin-bottom: var(--space-2);
		font-size: 1.125rem;
		font-weight: 600;
	}

	.empty-state-message {
		margin-bottom: 0;
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.empty-state-message.with-action {
		margin-bottom: var(--space-6);
	}
</style>
