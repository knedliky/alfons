<script lang="ts">
	let { tokenName, label }: { tokenName: string; label?: string } = $props();

	let swatchEl: HTMLButtonElement | undefined = $state();
	let copied = $state(false);
	let computedValue = $state('');

	// Resolve the token from the swatch's OWN element rather than the document
	// root, so a swatch placed inside a local data-colour-mode wrapper (the
	// Light Mode story) reports the value it actually renders, not the canvas's.
	$effect(() => {
		if (!swatchEl) return;
		computedValue = getComputedStyle(swatchEl).getPropertyValue(tokenName).trim();
	});

	async function copyToken() {
		await navigator.clipboard.writeText(`var(${tokenName})`);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<button
	bind:this={swatchEl}
	class="swatch-container"
	onclick={copyToken}
	title="Click to copy var({tokenName})"
>
	<!-- The checkerboard sits behind the fill so translucent tokens read as
	     translucent; the fill uses the `background` shorthand (not
	     background-color) so gradient tokens render as gradients. -->
	<div class="swatch">
		<div class="swatch-fill" style="background: var({tokenName})"></div>
	</div>
	<div class="swatch-info">
		<span class="swatch-label">{label || tokenName}</span>
		<code class="swatch-token">{tokenName}</code>
		<span class="swatch-value">{computedValue || '—'}</span>
		{#if copied}
			<span class="swatch-copied">Copied!</span>
		{/if}
	</div>
</button>

<style>
	.swatch-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 12px;
		border: 1px solid var(--card-border);
		border-radius: 8px;
		background: var(--card-bg);
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 120px;
		font-family: system-ui, sans-serif;
	}

	.swatch-container:hover {
		border-color: var(--card-border-hover);
		background: var(--card-bg);
	}

	.swatch {
		position: relative;
		width: 64px;
		height: 64px;
		border-radius: 8px;
		border: 1px solid var(--border-glass);
		overflow: hidden;
		/* Checkerboard so any alpha in the token shows through as translucency.
		   The squares are drawn with --border-glass so the helper stays tokenised. */
		background-color: var(--bg-glass-solid);
		background-image:
			linear-gradient(45deg, var(--border-glass) 25%, transparent 25%),
			linear-gradient(-45deg, var(--border-glass) 25%, transparent 25%),
			linear-gradient(45deg, transparent 75%, var(--border-glass) 75%),
			linear-gradient(-45deg, transparent 75%, var(--border-glass) 75%);
		background-size: 12px 12px;
		background-position:
			0 0,
			0 6px,
			6px -6px,
			-6px 0;
	}

	.swatch-fill {
		position: absolute;
		inset: 0;
	}

	.swatch-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		max-width: 150px;
	}

	.swatch-label {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-primary);
		text-align: center;
	}

	.swatch-token {
		font-size: 10px;
		color: var(--text-muted);
		font-family: monospace;
		text-align: center;
		word-break: break-all;
	}

	.swatch-value {
		font-size: 10px;
		color: var(--admin-text-muted);
		font-family: monospace;
		text-align: center;
		word-break: break-all;
	}

	.swatch-copied {
		font-size: 11px;
		color: var(--hex-olive);
		font-weight: 600;
	}
</style>
