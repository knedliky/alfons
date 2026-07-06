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
		<TypeSample
			tokenName="--font-body"
			fontFamily="'Switzer', system-ui, sans-serif"
			label="Body (Switzer)"
		/>
		<TypeSample
			tokenName="--font-display"
			fontFamily="'Azeret Mono', monospace"
			label="Display (Azeret Mono)"
		/>
		<TypeSample
			tokenName="--font-mono"
			fontFamily="'Azeret Mono', monospace"
			label="Mono (Azeret Mono)"
		/>
		<TypeSample
			tokenName="--font-drop-cap"
			fontFamily="'Rock Salt', Georgia, cursive"
			label="Drop Cap (Rock Salt)"
		/>
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
