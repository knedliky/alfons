<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageFrame from '../../components/layouts/PageFrame.svelte';

	const { Story } = defineMeta({
		title: 'Layouts/PageFrame',
		component: PageFrame,
		tags: ['autodocs'],
		argTypes: {
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			},
			sidebarWidth: { control: { type: 'number' } }
		}
	});
</script>

<!--
	PageFrame supports four optional named snippets: {#snippet header()}, {#snippet footer()},
	{#snippet sidebar()}. When sidebar is provided it switches to CSS Grid mode.
	It also accepts a theme prop ('public' | 'admin') to set a theme context.
	createThemeContext uses setContext internally — this works fine in Storybook.
-->

<Story name="Column — Header and Footer" asChild>
	<div
		style="height:400px;border:1px dashed var(--border-glass);border-radius:var(--radius);overflow:hidden"
	>
		<PageFrame theme="public">
			{#snippet header()}
				<div
					style="padding:1rem 1.5rem;background:var(--surface-raised-bg);border-bottom:1px solid var(--border-glass);display:flex;align-items:center;gap:1rem"
				>
					<div style="font-weight:700;color:var(--text-primary)">Brand</div>
					<div style="flex:1"></div>
					<div
						style="padding:0.375rem 0.875rem;background:var(--accent-bg);border-radius:var(--radius);font-size:0.875rem;color:var(--text-primary)"
					>
						Log in
					</div>
				</div>
			{/snippet}
			{#snippet footer()}
				<div
					style="padding:1rem 1.5rem;background:var(--surface-rest-bg);border-top:1px solid var(--border-glass);font-size:0.8125rem;color:var(--text-secondary);text-align:center"
				>
					Footer — links · legal · contact
				</div>
			{/snippet}
			<div style="padding:2rem 1.5rem;flex:1;background:var(--bg-primary)">
				<div style="padding:1.5rem;background:var(--accent-bg);border-radius:var(--radius)">
					Main page content area
				</div>
			</div>
		</PageFrame>
	</div>
</Story>

<Story name="Column — No Chrome" asChild>
	<div
		style="height:300px;border:1px dashed var(--border-glass);border-radius:var(--radius);overflow:hidden"
	>
		<PageFrame>
			<div
				style="padding:2rem;background:var(--accent-bg);border-radius:var(--radius);margin:1.5rem"
			>
				Embedded content — no header or footer provided
			</div>
		</PageFrame>
	</div>
</Story>

<Story name="Sidebar Mode — Admin" asChild>
	<div
		style="height:400px;border:1px dashed var(--border-glass);border-radius:var(--radius);overflow:hidden"
	>
		<PageFrame theme="admin" sidebarWidth={220}>
			{#snippet sidebar()}
				<div
					style="height:100%;background:var(--surface-raised-bg);border-right:1px solid var(--border-glass);padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem"
				>
					<div style="font-weight:700;color:var(--text-primary);margin-bottom:0.5rem">Admin</div>
					<div
						style="padding:0.5rem 0.75rem;background:var(--accent-bg);border-radius:var(--radius);font-size:0.875rem;color:var(--text-primary)"
					>
						Dashboard
					</div>
					<div
						style="padding:0.5rem 0.75rem;border-radius:var(--radius);font-size:0.875rem;color:var(--text-secondary)"
					>
						Users
					</div>
					<div
						style="padding:0.5rem 0.75rem;border-radius:var(--radius);font-size:0.875rem;color:var(--text-secondary)"
					>
						Settings
					</div>
				</div>
			{/snippet}
			{#snippet header()}
				<div
					style="padding:0.875rem 1.25rem;background:var(--surface-rest-bg);border-bottom:1px solid var(--border-glass);font-size:0.875rem;color:var(--text-secondary)"
				>
					Admin header
				</div>
			{/snippet}
			<div style="padding:1.5rem">
				<div style="padding:1.25rem;background:var(--accent-bg);border-radius:var(--radius)">
					Admin content — grows to fill the body column
				</div>
			</div>
		</PageFrame>
	</div>
</Story>

<Story name="Sidebar Mode — Wide Sidebar" asChild>
	<div
		style="height:400px;border:1px dashed var(--border-glass);border-radius:var(--radius);overflow:hidden"
	>
		<PageFrame theme="admin" sidebarWidth={300}>
			{#snippet sidebar()}
				<div
					style="height:100%;background:var(--surface-raised-bg);border-right:1px solid var(--border-glass);padding:1.25rem"
				>
					<div style="font-weight:700;color:var(--text-primary);margin-bottom:1rem">
						Wide sidebar (300px)
					</div>
					<div style="display:flex;flex-direction:column;gap:0.5rem">
						<div
							style="padding:0.5rem 0.75rem;background:var(--accent-bg);border-radius:var(--radius);font-size:0.875rem"
						>
							Item one
						</div>
						<div
							style="padding:0.5rem 0.75rem;border-radius:var(--radius);font-size:0.875rem;color:var(--text-secondary)"
						>
							Item two
						</div>
						<div
							style="padding:0.5rem 0.75rem;border-radius:var(--radius);font-size:0.875rem;color:var(--text-secondary)"
						>
							Item three
						</div>
					</div>
				</div>
			{/snippet}
			<div style="padding:1.5rem">
				<div style="padding:1.25rem;background:var(--accent-bg);border-radius:var(--radius)">
					Main body
				</div>
			</div>
		</PageFrame>
	</div>
</Story>
