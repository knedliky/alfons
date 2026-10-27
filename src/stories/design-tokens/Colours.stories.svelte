<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ColourSwatch from './_components/ColourSwatch.svelte';

	const { Story } = defineMeta({
		title: 'Design Tokens/Colours'
	});
</script>

<Story name="Part Colours">
	<div class="grid">
		<ColourSwatch tokenName="--girder-red" label="Girder Red" />
		<ColourSwatch tokenName="--gantry-orange" label="Gantry Orange" />
		<ColourSwatch tokenName="--brass-amber" label="Brass Amber" />
		<ColourSwatch tokenName="--toolbox-olive" label="Toolbox Olive" />
		<ColourSwatch tokenName="--pulley-blue" label="Pulley Blue" />
		<ColourSwatch tokenName="--boiler-navy" label="Boiler Navy" />
		<ColourSwatch tokenName="--flange-plum" label="Flange Plum" />
		<ColourSwatch tokenName="--pinion-pink" label="Pinion Pink" />
	</div>
</Story>

<!-- The ground, bone, and every step derived between them. Nothing here is
     hand-authored except the two poles and the two text tones. -->
<Story name="Neutrals">
	<div class="grid">
		<ColourSwatch tokenName="--ink-900" label="Ink 900 — bone" />
		<ColourSwatch tokenName="--ink-700" label="Ink 700" />
		<ColourSwatch tokenName="--ink-500" label="Ink 500" />
		<ColourSwatch tokenName="--ink-400" label="Ink 400" />
		<ColourSwatch tokenName="--ink-300" label="Ink 300" />
		<ColourSwatch tokenName="--steel-200" label="Steel 200" />
		<ColourSwatch tokenName="--steel-150" label="Steel 150" />
		<ColourSwatch tokenName="--steel-100" label="Steel 100" />
		<ColourSwatch tokenName="--steel-50" label="Steel 50" />
		<ColourSwatch tokenName="--foundry-black" label="Foundry Black — ground" />
	</div>
</Story>

<Story name="Semantic Colours">
	<div class="grid">
		<ColourSwatch tokenName="--bg-primary" label="Background Primary" />
		<ColourSwatch tokenName="--bg-glass" label="Background Glass" />
		<ColourSwatch tokenName="--bg-glass-solid" label="Background Glass Solid" />
		<ColourSwatch tokenName="--text-primary" label="Text Primary" />
		<ColourSwatch tokenName="--text-secondary" label="Text Secondary" />
		<ColourSwatch tokenName="--text-muted" label="Text Muted" />
		<ColourSwatch tokenName="--accent" label="Accent" />
		<ColourSwatch tokenName="--accent-hover" label="Accent Hover" />
		<ColourSwatch tokenName="--card-bg" label="Card Background" />
		<ColourSwatch tokenName="--card-border" label="Card Border" />
	</div>
</Story>

<!-- The colour roles the admin overlay restates, read under it. The --admin-*
     names this story used to show are retired (AL-027): admin text and
     surfaces are the general roles, and these are what differs. -->
<Story name="Admin Colours" parameters={{ theme: 'admin' }}>
	<div class="grid">
		<ColourSwatch tokenName="--card-plate-fill" label="Card Plate" />
		<ColourSwatch tokenName="--card-plate-edge" label="Card Edge" />
		<ColourSwatch tokenName="--card-elevated-fill" label="Card Elevated" />
		<ColourSwatch tokenName="--field-border" label="Field Border" />
		<ColourSwatch tokenName="--select-menu-bg" label="Select Menu" />
		<ColourSwatch tokenName="--button-outline-border" label="Outline Button Edge" />
		<ColourSwatch tokenName="--button-outline-hover-bg" label="Outline Button Hover" />
		<ColourSwatch tokenName="--card-outline-hover" label="Card Outline Hover" />
	</div>
</Story>

<Story name="State Colours">
	<div class="grid">
		<ColourSwatch tokenName="--colour-success" label="Success" />
		<ColourSwatch tokenName="--colour-warning" label="Warning" />
		<ColourSwatch tokenName="--colour-error" label="Error" />
		<ColourSwatch tokenName="--colour-info" label="Info" />
		<ColourSwatch tokenName="--colour-success-bg" label="Success BG" />
		<ColourSwatch tokenName="--colour-warning-bg" label="Warning BG" />
		<ColourSwatch tokenName="--colour-error-bg" label="Error BG" />
		<ColourSwatch tokenName="--colour-info-bg" label="Info BG" />
	</div>
</Story>

<!-- One series, because BarChart and LineChart plot one; the rest of the
     eight-colour --chart-series-* scale went under D-181. The chrome names
     are the plain ones again: AL-027 retired the -admin forms D-165 chose. -->
<Story name="Chart">
	<div class="grid">
		<ColourSwatch tokenName="--chart-series-1" label="Series 1" />
		<ColourSwatch tokenName="--chart-axis-colour" label="Axis" />
		<ColourSwatch tokenName="--chart-grid-colour" label="Grid" />
		<ColourSwatch tokenName="--chart-tooltip-bg" label="Tooltip BG" />
	</div>
</Story>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: 16px;
		padding: 16px;
	}
</style>
