<script lang="ts" module>
	export interface DestinationRowProps {
		/** Leading mono rank label — "Release", "Project". Omit when the name says enough. */
		rank?: string;
		/** The destination's name. One line, ellipsised rather than wrapped. */
		name: string;
		/** A second line under the name — a title, a parent's name. Wraps. */
		secondary?: string;
		/** A third mono line for counts and dates. */
		meta?: string;
		/**
		 * The trailing mono cue word — "peek" on a row whose tap glances rather
		 * than navigates. A two-stage gesture that hides its first stage is a lie
		 * about cost, so the cue is a prop rather than a decoration.
		 */
		cue?: string;
		/** Trailing chevron. On by default: a destination row promises somewhere. */
		chevron?: boolean;
		/** 'subtle' raises the row off a card; 'card' is the row as its own card. */
		fill?: 'card' | 'subtle';
		/**
		 * 'box' draws the row's own border; 'top' draws only a top rule, for a row
		 * living flush inside a clipped parent (a grid cell's floor). 'top' also
		 * moves the focus ring inside, so a clipping parent cannot swallow it.
		 */
		edge?: 'box' | 'top';
		/** aria-label when the visible lines do not read as a sentence. */
		label?: string;
		/** For roving focus schemes owned by a parent. */
		tabindex?: number;
		/**
		 * Handed the row's own element so dismissal of whatever this raised can
		 * return focus to the exact control that raised it — document.activeElement
		 * at raise time is a guess about which browsers focus a button on click.
		 */
		onactivate: (opener: HTMLElement) => void;
		onkeydown?: (event: KeyboardEvent) => void;
	}
</script>

<script lang="ts">
	/**
	 * DestinationRow — a full-width, left-aligned, multi-line row that goes (or
	 * glances) somewhere, at a touch target of at least 44px.
	 *
	 * Button cannot be this: it is a centred pill with its own padding, and every
	 * one of its decisions would be overridden. Two prototype rounds restated
	 * that gap as bare <button> elements in eight places; this atom is the gap
	 * closed.
	 *
	 * Usage:
	 *   <DestinationRow rank="Release" name={slug} cue="peek" onactivate={raise} />
	 *   <DestinationRow name={slug} secondary={title} meta="4 tasks" onactivate={go} />
	 *
	 * Anatomy: [rank] [name / secondary / meta] [cue] [chevron]. Every part but
	 * the name is optional.
	 *
	 * The floor is --space-7, not --filter-control-height: that token drops to
	 * 2.25rem from 640px up and lands under the 44px touch minimum exactly where
	 * a touchscreen laptop reads the page. --space-7 is 48px at every width.
	 */
	import Icon from './Icon.svelte';

	let {
		rank,
		name,
		secondary,
		meta,
		cue,
		chevron = true,
		fill = 'card',
		edge = 'box',
		label,
		tabindex,
		onactivate,
		onkeydown
	}: DestinationRowProps = $props();
</script>

<button
	type="button"
	class="destination-row"
	data-fill={fill}
	data-edge={edge}
	aria-label={label}
	{tabindex}
	onclick={(event) => onactivate(event.currentTarget)}
	{onkeydown}
>
	{#if rank}
		<span class="rank">{rank}</span>
	{/if}
	<span class="lines">
		<span class="name">{name}</span>
		{#if secondary}
			<span class="secondary">{secondary}</span>
		{/if}
		{#if meta}
			<span class="meta">{meta}</span>
		{/if}
	</span>
	{#if cue}
		<span class="cue">{cue}</span>
	{/if}
	{#if chevron}
		<Icon name="chevron-right" size="sm" />
	{/if}
</button>

<style>
	.destination-row {
		appearance: none;
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		min-height: var(--space-7);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
	}

	.destination-row[data-fill='subtle'] {
		background: var(--surface-hover-subtle);
	}

	.destination-row[data-edge='top'] {
		border: none;
		border-top: 1px solid var(--card-border);
	}

	.destination-row:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	/* Inside rather than outside: a row flush in a clipped parent would have an
	   outer ring swallowed by the parent's overflow. */
	.destination-row[data-edge='top']:focus-visible {
		outline-offset: calc(var(--space-1) * -1);
	}

	.rank {
		flex: none;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.lines {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.name {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.secondary {
		font-size: var(--text-caption);
		line-height: 1.4;
		color: var(--text-secondary);
	}

	.meta {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	/* The word that makes a two-stage gesture honest: this tap glances, it does
	   not go. Muted, because it is a promise about cost, not a destination. */
	.cue {
		flex: none;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}
</style>
