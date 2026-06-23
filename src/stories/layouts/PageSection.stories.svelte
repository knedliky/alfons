<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageSection from '../../components/layouts/PageSection.svelte';

	const { Story } = defineMeta({
		title: 'Layouts/PageSection',
		component: PageSection,
		tags: ['autodocs'],
		argTypes: {
			variant: {
				control: { type: 'select' },
				options: ['standard', 'hero', 'cta']
			},
			maxWidth: { control: { type: 'text' } }
		}
	});
</script>

<Story name="Standard" asChild args={{ variant: 'standard' }}>
	<PageSection variant="standard">
		<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius-md)">
			<p style="margin:0;font-weight:600;color:var(--text-primary)">Standard section</p>
			<p style="margin:0.5rem 0 0;color:var(--text-secondary);font-size:0.875rem">Equal vertical padding top and bottom. Most common section type.</p>
		</div>
	</PageSection>
</Story>

<Story name="Hero" asChild args={{ variant: 'hero' }}>
	<PageSection variant="hero">
		<div style="text-align:center;padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius-md)">
			<p style="margin:0;font-size:1.5rem;font-weight:700;color:var(--text-primary)">Hero heading</p>
			<p style="margin:0.75rem 0 0;color:var(--text-secondary)">Hero sections get 1.5× vertical padding and a 60vh min-height — prominent and vertically centred.</p>
		</div>
	</PageSection>
</Story>

<Story name="CTA" asChild args={{ variant: 'cta' }}>
	<PageSection variant="cta">
		<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">
			<p style="margin:0;font-weight:600;color:var(--text-primary)">Call to action</p>
			<p style="margin:0.5rem 0 0;color:var(--text-secondary);font-size:0.875rem">Reduced bottom padding creates visual flow into the next section.</p>
		</div>
	</PageSection>
</Story>

<Story name="Custom Max-Width" asChild args={{ variant: 'standard', maxWidth: '640px' }}>
	<PageSection variant="standard" maxWidth="640px">
		<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius-md)">
			<p style="margin:0;font-weight:600;color:var(--text-primary)">Narrow content area</p>
			<p style="margin:0.5rem 0 0;color:var(--text-secondary);font-size:0.875rem">Custom maxWidth="640px" overrides the default page-content-max-width token. Useful for prose.</p>
		</div>
	</PageSection>
</Story>

<Story name="All Variants Stacked" asChild>
	<div>
		<PageSection variant="hero">
			<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">
				<p style="margin:0;font-size:1.25rem;font-weight:700;color:var(--text-primary)">Hero</p>
			</div>
		</PageSection>
		<PageSection variant="standard">
			<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius-md)">
				<p style="margin:0;color:var(--text-primary)">Standard</p>
			</div>
		</PageSection>
		<PageSection variant="cta">
			<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius-md);text-align:center">
				<p style="margin:0;color:var(--text-primary)">CTA — reduced bottom padding</p>
			</div>
		</PageSection>
	</div>
</Story>
