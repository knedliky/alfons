<script lang="ts">
	/**
	 * What the feed says, without the feed taking the page off you.
	 *
	 * Two things arrive over SSE that this page must answer for: something newer
	 * than the lead started moving, and the lead itself stopped running. Neither
	 * is allowed to silently rearrange what someone is mid-sentence on, so both
	 * surface here — above the lead, in the reader's own time.
	 *
	 * Built on Card rather than a bare <button> or on Button: the actionable form
	 * is a full-width strip with two lines of text, which Button's pill is not,
	 * and the rows below use the same Card-as-button pattern — so the offer is
	 * shaped like the thing it is offering.
	 *
	 * Deliberately not an aria-live region: the page owns a single polite one, so
	 * an announcement happens once and says one thing.
	 */
	import { Card } from '@alfons/design';

	let {
		message,
		actionLabel,
		onaction
	}: { message: string; actionLabel?: string; onaction?: () => void } = $props();
</script>

{#if actionLabel && onaction}
	<!-- Not `outlined`: that variant borders in brand accent, and a red-edged
	     strip above the lead reads as an alarm. On this page emphasis has to come
	     from position and words, because colour is spoken for. -->
	<Card as="button" type="button" variant="default" size="compact" class="notice" onclick={onaction}>
		<span class="message">{message}</span>
		<span class="action">{actionLabel}</span>
	</Card>
{:else}
	<Card variant="ghost" size="compact" class="notice">
		<span class="message">{message}</span>
	</Card>
{/if}

<style>
	:global(.notice) {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		width: 100%;
		/* Comfortably past the 44px floor, and the whole strip is the target. */
		min-height: var(--space-7);
		margin-bottom: var(--space-4);
		text-align: left;
		color: var(--text-secondary);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		line-height: 1.5;
	}

	:global(button.notice) {
		cursor: pointer;
	}

	.action {
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-primary);
	}
</style>
