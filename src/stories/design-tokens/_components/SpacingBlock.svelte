<script lang="ts">
	let { tokenName, value }: { tokenName: string; value: string } = $props();

	let copied = $state(false);

	async function copyToken() {
		await navigator.clipboard.writeText(`var(${tokenName})`);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<button class="spacing-row" onclick={copyToken} title="Click to copy var({tokenName})">
	<code class="spacing-name">{tokenName}</code>
	<div class="spacing-bar" style="width: {value}; min-width: 4px;"></div>
	<span class="spacing-value">{value}</span>
	{#if copied}
		<span class="spacing-copied">Copied!</span>
	{/if}
</button>

<style>
	.spacing-row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 8px 12px;
		border: 1px solid var(--card-border);
		border-radius: 0;
		background: var(--card-bg);
		cursor: pointer;
		transition: all 0.2s ease;
		width: 100%;
		font-family: system-ui, sans-serif;
	}

	.spacing-row:hover {
		border-color: var(--card-border-hover);
	}

	.spacing-name {
		font-size: 12px;
		color: var(--text-primary);
		font-family: monospace;
		min-width: 80px;
		text-align: left;
	}

	.spacing-bar {
		height: 24px;
		background: var(--girder-red);
		border-radius: 0;
		opacity: 0.7;
	}

	.spacing-value {
		font-size: 12px;
		color: var(--text-muted);
		font-family: monospace;
		min-width: 40px;
	}

	.spacing-copied {
		font-size: 11px;
		color: var(--toolbox-olive);
		font-weight: 600;
	}
</style>
