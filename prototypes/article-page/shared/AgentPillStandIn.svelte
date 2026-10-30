<script lang="ts">
	/**
	 * AgentPillStandIn — where Atlas's site-wide "ask scheherazade" pill sits.
	 *
	 * The article page cannot move or restyle the real pill (it belongs to the
	 * agent dock), so every approach renders this stand-in at the pill's live
	 * geometry and must keep text out from under it. Measured on 2026-10-30 at
	 * 375x812: 12px from the left and bottom edges, about 187 by 39 pixels.
	 */
</script>

<div class="agent-pill-stand-in" data-agent-pill-stand-in aria-hidden="true">
	ask scheherazade <span class="shortcut">⌘K</span>
</div>

<style>
	.agent-pill-stand-in {
		position: fixed;
		left: var(--space-3);
		bottom: var(--space-3);
		z-index: 40;
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4);
		font: var(--type-spec);
		color: var(--text-primary);
		background: var(--surface-card);
		border: 1px solid var(--border-hairline);
		border-radius: var(--radius-pill);
		pointer-events: none;
	}

	.shortcut {
		color: var(--text-muted);
	}
</style>
