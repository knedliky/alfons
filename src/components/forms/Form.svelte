<script lang="ts" module>
	import type { ThemeVariant } from '../../contexts/theme.js';
	import type { Snippet } from 'svelte';

	export type FormStatus = 'idle' | 'success' | 'error';

	export interface FormProps {
		theme?: ThemeVariant;
		class?: string;
		status?: FormStatus;
		statusMessage?: string;
		children?: Snippet;
		[key: string]: unknown;
	}
</script>

<script lang="ts">
	/**
	 * Form — base form primitive for composing form experiences.
	 *
	 * Usage:
	 *   <Form onsubmit={handleSubmit} status={formStatus} statusMessage={message}>
	 *     <Input type="email" bind:value={email} required />
	 *     <Button type="submit">Send</Button>
	 *   </Form>
	 *
	 * Features:
	 * - Theme-aware via context (public/admin)
	 * - Status feedback with screen reader announcements (aria-live)
	 * - Passes through all native form attributes (onsubmit, action, method, novalidate)
	 * - Design-token colours for success/error states
	 */
	import { getThemeVariant } from '../../contexts/theme.js';

	let {
		theme,
		status = 'idle',
		statusMessage = '',
		class: className,
		children,
		...restProps
	}: FormProps = $props();

	const activeTheme = $derived(theme ?? getThemeVariant());
	const formClasses = $derived(['form', className].filter(Boolean).join(' '));
</script>

<form class={formClasses} data-theme={activeTheme} {...restProps}>
	{@render children?.()}

	<div
		class="form-status-region"
		data-visible={status !== 'idle' && statusMessage ? 'true' : 'false'}
	>
		<p class="form-status" data-status={status} role="status" aria-live="polite">
			{statusMessage}
		</p>
	</div>
</form>

<style>
	/* Minimal base — no opinionated layout, composing forms add their own */
	.form {
		width: 100%;
	}

	/* Grid row trick: animates from 0fr (collapsed) to 1fr (auto height) */
	.form-status-region {
		display: grid;
		grid-template-rows: 0fr;
		opacity: 0;
		margin-top: 0;
		transition:
			grid-template-rows 300ms ease,
			opacity 300ms ease,
			margin-top 300ms ease;
	}

	.form-status-region[data-visible='true'] {
		grid-template-rows: 1fr;
		opacity: 1;
		margin-top: var(--space-2);
	}

	.form-status {
		overflow: hidden;
		font-size: 0.875rem;
		transition: var(--colour-mode-transition);
	}

	.form-status[data-status='success'] {
		color: var(--colour-success);
	}

	.form-status[data-status='error'] {
		color: var(--colour-error);
	}
</style>
