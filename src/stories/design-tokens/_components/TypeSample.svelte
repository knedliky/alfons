<script lang="ts">
	let { tokenName, label }: { tokenName: string; label: string } = $props();

	let previewEl = $state<HTMLDivElement>();
	let resolvedFamily = $state('');
	let copied = $state(false);

	// Read the font-family from the live token rather than hardcoding a string.
	// The preview renders with `var(--font-*)`, and we read the resolved value
	// back out, so this catalogue can never drift from the actual tokens when the
	// brand font changes (e.g. the move to Switzer).
	$effect(() => {
		if (!previewEl) return;
		const styles = getComputedStyle(previewEl);
		resolvedFamily = styles.getPropertyValue(tokenName).trim() || styles.fontFamily;
	});

	async function copyToken() {
		await navigator.clipboard.writeText(`var(${tokenName})`);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<button class="type-sample" onclick={copyToken} title="Click to copy var({tokenName})">
	<div class="type-preview" bind:this={previewEl} style="font-family: var({tokenName});">
		The quick brown fox jumps over the lazy dog
	</div>
	<div class="type-info">
		<span class="type-label">{label}</span>
		<code class="type-token">{tokenName}</code>
		<code class="type-family">{resolvedFamily}</code>
		{#if copied}
			<span class="type-copied">Copied!</span>
		{/if}
	</div>
</button>

<style>
	.type-sample {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 20px;
		border: 1px solid var(--card-border);
		border-radius: 8px;
		background: var(--card-bg);
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		text-align: left;
		font-family: system-ui, sans-serif;
	}

	.type-sample:hover {
		border-color: var(--card-border-hover);
	}

	.type-preview {
		font-size: 24px;
		color: var(--text-primary);
		line-height: 1.4;
	}

	.type-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.type-label {
		font-size: 14px;
		font-weight: 600;
		color: var(--text-primary);
	}

	.type-token {
		font-size: 11px;
		color: var(--text-muted);
		font-family: monospace;
	}

	.type-family {
		font-size: 11px;
		color: var(--admin-text-muted);
		font-family: monospace;
	}

	.type-copied {
		font-size: 11px;
		color: var(--hex-olive);
		font-weight: 600;
	}
</style>
