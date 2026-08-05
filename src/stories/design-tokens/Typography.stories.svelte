<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import TypeSample from './_components/TypeSample.svelte';
	import ColourSwatch from './_components/ColourSwatch.svelte';

	const { Story } = defineMeta({
		title: 'Design Tokens/Typography'
	});
</script>

<Story name="Font Families">
	<div class="type-list">
		<TypeSample tokenName="--font-body" label="Body (Moderat)" />
		<TypeSample tokenName="--font-display" label="Display (Moderat)" />
		<TypeSample tokenName="--font-mono" label="Mono (GT America Mono)" />
		<TypeSample tokenName="--font-drop-cap" label="Drop cap (Moderat Black)" />
		<TypeSample tokenName="--font-wordmark" label="Wordmark (Moderat Bold)" />
	</div>
</Story>

<Story name="Text Colours">
	<div class="grid">
		<ColourSwatch tokenName="--text-primary" label="Text Primary" />
		<ColourSwatch tokenName="--text-secondary" label="Text Secondary" />
		<ColourSwatch tokenName="--text-muted" label="Text Muted" />
	</div>
</Story>

<style>
	.type-list {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 16px;
		max-width: 700px;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 16px;
		padding: 16px;
	}
</style>
