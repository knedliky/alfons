<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';

	const { Story } = defineMeta({
		title: 'Design Tokens/Shadows & Effects'
	});
</script>

<Story name="Button Shadows">
	<div class="shadow-grid">
		<div class="shadow-sample">
			<div class="shadow-box" style="box-shadow: var(--button-shadow);">--button-shadow</div>
			<span class="shadow-label">Default</span>
		</div>
		<div class="shadow-sample">
			<div class="shadow-box" style="box-shadow: var(--button-shadow-hover);">
				--button-shadow-hover
			</div>
			<span class="shadow-label">Hover</span>
		</div>
		<div class="shadow-sample">
			<div class="shadow-box" style="box-shadow: var(--button-shadow-active);">
				--button-shadow-active
			</div>
			<span class="shadow-label">Active</span>
		</div>
	</div>
</Story>

<Story name="Card Effects">
	<div class="shadow-grid">
		<div class="shadow-sample">
			<div class="shadow-box card-box" style="box-shadow: var(--card-shadow);">--card-shadow</div>
			<span class="shadow-label">Default</span>
		</div>
		<div class="shadow-sample">
			<div class="shadow-box card-box" style="box-shadow: var(--card-shadow-hover);">
				--card-shadow-hover
			</div>
			<span class="shadow-label">Hover</span>
		</div>
		<div class="shadow-sample">
			<div class="shadow-box" style="box-shadow: var(--input-shadow);">--input-shadow</div>
			<span class="shadow-label">Input Shadow</span>
		</div>
	</div>
</Story>

<style>
	.shadow-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
		gap: 32px;
		padding: 32px;
	}

	.shadow-sample {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
	}

	.shadow-box {
		width: 160px;
		height: 80px;
		background: var(--card-bg, rgba(20, 16, 16, 0.4));
		border: 1px solid var(--card-border, rgba(243, 243, 243, 0.1));
		border-radius: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 10px;
		font-family: monospace;
		color: var(--text-muted);
		padding: 8px;
		text-align: center;
	}

	.card-box {
		width: 200px;
		height: 120px;
	}

	.shadow-label {
		font-size: 13px;
		font-weight: 600;
		color: var(--text-primary);
		font-family: system-ui, sans-serif;
	}
</style>
