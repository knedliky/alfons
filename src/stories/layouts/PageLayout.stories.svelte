<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageLayout from '../../components/layouts/PageLayout.svelte';

	const { Story } = defineMeta({
		title: 'Layouts/PageLayout',
		component: PageLayout,
		tags: ['autodocs']
	});
</script>

<!--
	PageLayout is a convenience wrapper around PageFrame for public pages.
	It accepts optional named snippets: {#snippet header()} and {#snippet footer()}.
	Uses PageFrame internally — no SvelteKit-specific imports.
-->

<Story name="Default — Full Chrome" asChild>
	<div
		style="height:420px;border:1px dashed var(--border-glass);border-radius:var(--radius);overflow:hidden"
	>
		<PageLayout>
			{#snippet header()}
				<div
					style="padding:1rem 2rem;background:var(--surface-raised-bg);border-bottom:1px solid var(--border-glass);display:flex;align-items:center;gap:1.5rem"
				>
					<span style="font-weight:700;color:var(--text-primary)">Atlas</span>
					<nav style="display:flex;gap:1.25rem">
						<span style="font-size:0.875rem;color:var(--text-primary)">Home</span>
						<span style="font-size:0.875rem;color:var(--text-secondary)">About</span>
						<span style="font-size:0.875rem;color:var(--text-secondary)">Work</span>
					</nav>
				</div>
			{/snippet}
			{#snippet footer()}
				<div
					style="padding:1rem 2rem;background:var(--surface-rest-bg);border-top:1px solid var(--border-glass);display:flex;justify-content:space-between;align-items:center"
				>
					<span style="font-size:0.8125rem;color:var(--text-secondary)"
						>Atlas — all rights reserved</span
					>
					<span style="font-size:0.8125rem;color:var(--text-secondary)">Privacy · Terms</span>
				</div>
			{/snippet}
			<div style="padding:3rem 2rem">
				<div style="padding:2rem;background:var(--accent-bg);border-radius:var(--radius)">
					<p style="margin:0;font-size:1.25rem;font-weight:600;color:var(--text-primary)">
						Hero section placeholder
					</p>
					<p style="margin:0.5rem 0 0;color:var(--text-secondary)">
						Main page content grows between header and footer.
					</p>
				</div>
			</div>
		</PageLayout>
	</div>
</Story>

<Story name="Header Only" asChild>
	<div
		style="height:300px;border:1px dashed var(--border-glass);border-radius:var(--radius);overflow:hidden"
	>
		<PageLayout>
			{#snippet header()}
				<div
					style="padding:1rem 2rem;background:var(--surface-raised-bg);border-bottom:1px solid var(--border-glass)"
				>
					<span style="font-weight:700;color:var(--text-primary)">Brand</span>
				</div>
			{/snippet}
			<div style="padding:2rem">
				<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
					No footer — useful for landing pages with custom footers
				</div>
			</div>
		</PageLayout>
	</div>
</Story>

<Story name="No Chrome" asChild>
	<div
		style="height:250px;border:1px dashed var(--border-glass);border-radius:var(--radius);overflow:hidden"
	>
		<PageLayout>
			<div style="padding:2rem">
				<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
					No header or footer — embedded or iframe scenario
				</div>
			</div>
		</PageLayout>
	</div>
</Story>

<Story name="Multiple Sections" asChild>
	<div
		style="height:500px;border:1px dashed var(--border-glass);border-radius:var(--radius);overflow:auto"
	>
		<PageLayout>
			{#snippet header()}
				<div
					style="padding:1rem 2rem;background:var(--surface-raised-bg);border-bottom:1px solid var(--border-glass)"
				>
					<span style="font-weight:700;color:var(--text-primary)">Brand</span>
				</div>
			{/snippet}
			{#snippet footer()}
				<div
					style="padding:1rem 2rem;background:var(--surface-rest-bg);border-top:1px solid var(--border-glass);font-size:0.8125rem;color:var(--text-secondary);text-align:center"
				>
					Footer
				</div>
			{/snippet}
			<div style="padding:2rem;display:flex;flex-direction:column;gap:1rem">
				<div style="padding:2rem;background:var(--accent-bg);border-radius:var(--radius)">
					Hero section
				</div>
				<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
					Feature section
				</div>
				<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
					CTA section
				</div>
			</div>
		</PageLayout>
	</div>
</Story>
