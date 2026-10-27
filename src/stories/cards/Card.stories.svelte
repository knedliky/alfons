<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Card from '../../components/cards/Card.svelte';

	// Admin stories run under the admin overlay through `parameters.theme`,
	// which .storybook/preview.js writes to data-theme on <html> (D-238).
	const ADMIN = { theme: 'admin' };

	const { Story } = defineMeta({
		title: 'Cards/Card',
		component: Card,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['default', 'elevated', 'ghost', 'outlined', 'interactive']
			},
			size: {
				control: { type: 'select' },
				options: ['default', 'compact', 'flush']
			},
			as: {
				control: { type: 'select' },
				options: ['div', 'a', 'section', 'article', 'button']
			}
		}
	});
</script>

<Story name="Default" asChild args={{ variant: 'default', size: 'default' }}>
	<Card variant="default" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Labour Market Snapshot</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			Weekly analysis of job demand across the technology sector in Australia.
		</p>
	</Card>
</Story>

<Story name="Elevated" asChild args={{ variant: 'elevated', size: 'default' }}>
	<Card variant="elevated" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Top Skills This Week</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			TypeScript, Rust, and Kubernetes are in highest demand across Melbourne and Sydney.
		</p>
	</Card>
</Story>

<Story name="Ghost" asChild args={{ variant: 'ghost', size: 'default' }}>
	<Card variant="ghost" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Ghost Variant</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			Transparent background — useful for layering within a parent surface.
		</p>
	</Card>
</Story>

<Story name="Outlined" asChild args={{ variant: 'outlined', size: 'default' }}>
	<Card variant="outlined" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Outlined Variant</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			Transparent fill with an accent-coloured border for secondary emphasis.
		</p>
	</Card>
</Story>

<Story name="Interactive" asChild args={{ variant: 'interactive', size: 'default' }}>
	<Card variant="interactive" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Sector Report</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			Click to view the full report for the Healthcare and Allied Health sector.
		</p>
	</Card>
</Story>

<Story name="Compact" asChild args={{ variant: 'default', size: 'compact' }}>
	<Card variant="default" size="compact">
		<p style="margin: 0; font-size: 0.875rem;">
			Compact card — tighter padding for dense grid layouts.
		</p>
	</Card>
</Story>

<Story name="Admin Theme" asChild parameters={ADMIN} args={{ variant: 'default', size: 'default' }}>
	<Card variant="default" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem; color: var(--text-primary);">
			Organisation Summary
		</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			42 active organisations — 3 pending review as of 19/06/2026.
		</p>
	</Card>
</Story>

<Story
	name="Admin Elevated"
	asChild
	parameters={ADMIN}
	args={{ variant: 'elevated', size: 'default' }}
>
	<Card variant="elevated" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem; color: var(--text-primary);">
			Revenue This Month
		</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			$12,400.00 AUD — up 8% from last month.
		</p>
	</Card>
</Story>
