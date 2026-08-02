<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Card from '../../components/cards/Card.svelte';

	const { Story } = defineMeta({
		title: 'Cards/Card',
		component: Card,
		tags: ['autodocs'],
		argTypes: {
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			},
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

<Story name="Default" asChild args={{ theme: 'public', variant: 'default', size: 'default' }}>
	<Card theme="public" variant="default" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Labour Market Snapshot</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			Weekly analysis of job demand across the technology sector in Australia.
		</p>
	</Card>
</Story>

<Story name="Elevated" asChild args={{ theme: 'public', variant: 'elevated', size: 'default' }}>
	<Card theme="public" variant="elevated" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Top Skills This Week</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			TypeScript, Rust, and Kubernetes are in highest demand across Melbourne and Sydney.
		</p>
	</Card>
</Story>

<Story name="Ghost" asChild args={{ theme: 'public', variant: 'ghost', size: 'default' }}>
	<Card theme="public" variant="ghost" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Ghost Variant</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			Transparent background — useful for layering within a parent surface.
		</p>
	</Card>
</Story>

<Story name="Outlined" asChild args={{ theme: 'public', variant: 'outlined', size: 'default' }}>
	<Card theme="public" variant="outlined" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Outlined Variant</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			Transparent fill with an accent-coloured border for secondary emphasis.
		</p>
	</Card>
</Story>

<Story
	name="Interactive"
	asChild
	args={{ theme: 'public', variant: 'interactive', size: 'default' }}
>
	<Card theme="public" variant="interactive" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem;">Sector Report</h3>
		<p style="margin: 0; color: var(--text-secondary); font-size: 0.875rem;">
			Click to view the full report for the Healthcare and Allied Health sector.
		</p>
	</Card>
</Story>

<Story name="Compact" asChild args={{ theme: 'public', variant: 'default', size: 'compact' }}>
	<Card theme="public" variant="default" size="compact">
		<p style="margin: 0; font-size: 0.875rem;">
			Compact card — tighter padding for dense grid layouts.
		</p>
	</Card>
</Story>

<Story name="Admin Theme" asChild args={{ theme: 'admin', variant: 'default', size: 'default' }}>
	<Card theme="admin" variant="default" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem; color: var(--admin-text);">
			Organisation Summary
		</h3>
		<p style="margin: 0; color: var(--admin-text-secondary); font-size: 0.875rem;">
			42 active organisations — 3 pending review as of 19/06/2026.
		</p>
	</Card>
</Story>

<Story
	name="Admin Elevated"
	asChild
	args={{ theme: 'admin', variant: 'elevated', size: 'default' }}
>
	<Card theme="admin" variant="elevated" size="default">
		<h3 style="margin: 0 0 0.5rem; font-size: 1.125rem; color: var(--admin-text);">
			Revenue This Month
		</h3>
		<p style="margin: 0; color: var(--admin-text-secondary); font-size: 0.875rem;">
			$12,400.00 AUD — up 8% from last month.
		</p>
	</Card>
</Story>
