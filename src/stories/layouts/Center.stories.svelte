<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Center from '../../components/layouts/Center.svelte';

	const { Story } = defineMeta({
		title: 'Layouts/Center',
		component: Center,
		tags: ['autodocs']
	});
</script>

<Story name="Default" asChild>
	<div style="width:400px;height:200px;border:1px dashed var(--border-glass);border-radius:var(--radius)">
		<Center>
			<div style="padding:1rem 2rem;background:var(--accent-bg);border-radius:var(--radius)">
				Centred content
			</div>
		</Center>
	</div>
</Story>

<Story name="Card in Centre" asChild>
	<div style="width:600px;height:300px;border:1px dashed var(--border-glass);border-radius:var(--radius)">
		<Center>
			<div style="padding:2rem;background:var(--surface-raised-bg);border-radius:var(--radius-surface);border:1px solid var(--border-glass);min-width:240px;text-align:center">
				<p style="margin:0 0 0.5rem;font-weight:600;color:var(--text-primary)">Centred card</p>
				<p style="margin:0;color:var(--text-secondary);font-size:0.875rem">Centre positions both axes</p>
			</div>
		</Center>
	</div>
</Story>

<Story name="Full Viewport Height" asChild>
	<div style="width:100%;height:400px;border:1px dashed var(--border-glass);border-radius:var(--radius)">
		<Center>
			<div style="padding:2rem 3rem;background:var(--accent-bg);border-radius:var(--radius-surface);text-align:center">
				<p style="margin:0;font-weight:600;color:var(--text-primary)">Login form placeholder</p>
				<p style="margin:0.5rem 0 0;color:var(--text-secondary);font-size:0.875rem">Useful for auth pages</p>
			</div>
		</Center>
	</div>
</Story>
