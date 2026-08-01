<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Wordmark from '../../components/brand/Wordmark.svelte';
	import Logo from '../../components/brand/Logo.svelte';

	const { Story } = defineMeta({
		title: 'Brand/Wordmark',
		component: Wordmark,
		tags: ['autodocs'],
		argTypes: {
			height: { control: { type: 'number' } },
			text: { control: { type: 'text' } }
		}
	});
</script>

<Story name="Default" asChild args={{ height: 24 }}>
	<Wordmark height={24} />
</Story>

<Story name="Header Lockup" asChild>
	<div style="display: inline-flex; align-items: center; gap: var(--space-3)">
		<Logo height={28} shape="square" />
		<Wordmark height={22} />
	</div>
</Story>

<Story name="Large" asChild args={{ height: 48 }}>
	<Wordmark height={48} />
</Story>
