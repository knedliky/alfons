<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import MainLayout from '../../components/layouts/MainLayout.svelte';

	const { Story } = defineMeta({
		title: 'Layouts/MainLayout',
		component: MainLayout,
		tags: ['autodocs'],
		argTypes: {
			gap: {
				control: { type: 'select' },
				options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 'xs', 'sm', 'md', 'lg', 'xl', '2xl']
			},
			asidePosition: {
				control: { type: 'select' },
				options: ['left', 'right']
			},
			asideWidth: { control: { type: 'text' } },
			stickyTop: { control: { type: 'text' } }
		}
	});
</script>

<!--
	MainLayout requires two named snippets: {#snippet aside()} and {#snippet main()}.
	Both must be provided — the aside sticks to the viewport top while main scrolls.
-->

<Story name="Default — Left Aside" asChild>
	<MainLayout asideWidth="16rem" gap="xl" asidePosition="left" stickyTop="2rem">
		{#snippet aside()}
			<div style="padding:1rem;background:var(--surface-raised-bg);border-radius:var(--radius);border:1px solid var(--border-glass)">
				<p style="margin:0 0 0.75rem;font-weight:600;font-size:0.875rem;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.05em">Contents</p>
				<ul style="margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:0.5rem">
					<li style="color:var(--text-primary);font-size:0.875rem">Introduction</li>
					<li style="color:var(--text-secondary);font-size:0.875rem">Background</li>
					<li style="color:var(--text-secondary);font-size:0.875rem">Methodology</li>
					<li style="color:var(--text-secondary);font-size:0.875rem">Results</li>
					<li style="color:var(--text-secondary);font-size:0.875rem">Conclusion</li>
				</ul>
			</div>
		{/snippet}
		{#snippet main()}
			<div style="display:flex;flex-direction:column;gap:1rem">
				<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
					<p style="margin:0;font-weight:600;color:var(--text-primary)">Article heading</p>
					<p style="margin:0.5rem 0 0;color:var(--text-secondary);font-size:0.875rem">Main scrolling content area — grows to fill remaining width after aside takes its fixed allocation.</p>
				</div>
				<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
					<p style="margin:0;color:var(--text-secondary);font-size:0.875rem">Second content block</p>
				</div>
				<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
					<p style="margin:0;color:var(--text-secondary);font-size:0.875rem">Third content block</p>
				</div>
			</div>
		{/snippet}
	</MainLayout>
</Story>

<Story name="Right Aside" asChild>
	<MainLayout asideWidth="14rem" gap="lg" asidePosition="right" stickyTop="2rem">
		{#snippet aside()}
			<div style="padding:1rem;background:var(--surface-raised-bg);border-radius:var(--radius);border:1px solid var(--border-glass)">
				<p style="margin:0 0 0.5rem;font-weight:600;font-size:0.875rem;color:var(--text-secondary)">Related</p>
				<div style="display:flex;flex-direction:column;gap:0.5rem">
					<div style="padding:0.5rem;background:var(--accent-bg);border-radius:var(--radius);font-size:0.8125rem;color:var(--text-primary)">Link one</div>
					<div style="padding:0.5rem;background:var(--accent-bg);border-radius:var(--radius);font-size:0.8125rem;color:var(--text-primary)">Link two</div>
				</div>
			</div>
		{/snippet}
		{#snippet main()}
			<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
				<p style="margin:0;font-weight:600;color:var(--text-primary)">Main content</p>
				<p style="margin:0.5rem 0 0;color:var(--text-secondary);font-size:0.875rem">Aside appears on the right via CSS order — DOM order stays aside-first for screen readers.</p>
			</div>
		{/snippet}
	</MainLayout>
</Story>

<Story name="Wide Aside" asChild>
	<MainLayout asideWidth="22rem" gap="2xl" asidePosition="left" stickyTop="1rem">
		{#snippet aside()}
			<div style="padding:1.25rem;background:var(--surface-raised-bg);border-radius:var(--radius);border:1px solid var(--border-glass)">
				<p style="margin:0 0 1rem;font-weight:600;color:var(--text-primary)">Sidebar filters</p>
				<div style="display:flex;flex-direction:column;gap:0.75rem">
					<div style="padding:0.75rem;background:var(--accent-bg);border-radius:var(--radius);font-size:0.875rem">Category A</div>
					<div style="padding:0.75rem;background:var(--accent-bg);border-radius:var(--radius);font-size:0.875rem">Category B</div>
					<div style="padding:0.75rem;background:var(--accent-bg);border-radius:var(--radius);font-size:0.875rem">Category C</div>
				</div>
			</div>
		{/snippet}
		{#snippet main()}
			<div style="display:flex;flex-direction:column;gap:1rem">
				<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">Result one</div>
				<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">Result two</div>
				<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">Result three</div>
			</div>
		{/snippet}
	</MainLayout>
</Story>
