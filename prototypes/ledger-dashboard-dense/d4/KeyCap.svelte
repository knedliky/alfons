<script lang="ts" module>
	export interface KeyCapProps {
		/** The key as it is printed on a keyboard: j, /, Esc, ⇧, ↓. */
		key: string;
		/** Draw it as currently held or currently active. */
		active?: boolean;
	}
</script>

<script lang="ts">
	/**
	 * KeyCap — a single key, drawn as a key.
	 *
	 * Local because Alfons has no keycap atom. Round one pressed Chip into the
	 * role for a lone ⌘K and it read acceptably; a page that shows twenty keys
	 * cannot, because Chip is a pill of content metadata and reads as a tag,
	 * not as something you press. A keycap wants a fixed advance width so a row
	 * of them aligns, a raised edge, and mono at a size the table can carry
	 * without the legend outweighing the data.
	 *
	 * <kbd> rather than <span>: the element exists, it is what a screen reader
	 * announces as keyboard input, and this page is nothing but keyboard input.
	 */
	let { key, active = false }: KeyCapProps = $props();
</script>

<kbd class="cap" class:active>{key}</kbd>

<style>
	.cap {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* Fixed advance so a row of caps aligns on a grid rather than jittering
		   with the width of each glyph. */
		min-width: var(--space-5);
		height: var(--space-5);
		padding-inline: var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		line-height: 1;
		color: var(--text-secondary);
		background: var(--surface-hover-subtle);
		/* Two-weight rule, as the top and left edge catch light and the bottom
		   sits in shadow — a key that reads as raised without a radius, which
		   this system does not have. */
		border: 1px solid var(--border-glass);
		border-bottom-width: 2px;
		border-bottom-color: var(--border-glass-hover);
	}

	.cap.active {
		color: var(--text-primary);
		background: var(--accent-bg-emphasis);
		border-color: var(--accent-border);
		border-bottom-color: var(--accent);
	}
</style>
