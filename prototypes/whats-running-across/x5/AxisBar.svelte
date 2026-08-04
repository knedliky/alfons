<script lang="ts">
	/**
	 * The vertical axis and the position echo — the one strip that never moves.
	 *
	 * This is the approach's primary affordance for changing level: an explicit
	 * up/down pair at the 44px floor, present in every state of every level,
	 * including the empty task level, which is how the empty state stops being
	 * a dead end. Swipe-vertical is deliberately NOT implemented even as an
	 * enhancement: the release and project panels scroll vertically, so a
	 * vertical gesture already has a meaning on two of the three levels, and a
	 * gesture that changes level over the task level but scrolls a list one
	 * level up is a grammar that lies. Buttons mean the same thing everywhere.
	 *
	 * Each button names its DESTINATION, not its direction — the finding the
	 * stack approach's back control earned: "up" alone leaves the reader
	 * guessing, "auth-hardening" is a promise. The kind is carried by the
	 * arrow and the aria-label, not by a printed word, because at 370px each
	 * half of this bar is about 150px and a slug needs all of it (u1 measured
	 * the same collision on its ladder).
	 *
	 * Between the pair, the two-axis indicator: three rungs for the three
	 * levels, the current one lit, with the sibling index beside it. It is
	 * aria-hidden — the page's live readout speaks the same fact in a sentence,
	 * and two voices saying "release, 3 of 8" at once would talk over each
	 * other.
	 *
	 * Bare <button> elements: a destination is an icon-plus-truncating-name row
	 * filling half the bar, and Button is a centred pill with its own padding —
	 * the same missing component three approaches have now reported.
	 */
	import { Icon } from '@alfons/design';
	import type { Level } from './axis.ts';
	import { LEVELS } from './axis.ts';

	let {
		level,
		siblingIndex,
		siblingCount,
		upName,
		downName,
		onUp,
		onDown
	}: {
		level: Level;
		/** Zero-based position on the current level's horizontal axis. */
		siblingIndex: number;
		siblingCount: number;
		/** Null when there is no level above (standing on a project). */
		upName: string | null;
		/** Null when there is nothing below (a project with no releases). */
		downName: string | null;
		onUp: () => void;
		onDown: () => void;
	} = $props();
</script>

<nav class="axis" aria-label="Move between levels">
	<button
		type="button"
		class="rung-button"
		disabled={upName === null}
		aria-label={upName === null ? 'No level above' : `Up to ${upName}`}
		onclick={onUp}
	>
		<Icon name="chevron-up" size="md" />
		<span class="dest">{upName ?? 'top'}</span>
	</button>

	<div class="indicator" aria-hidden="true">
		<span class="rungs">
			{#each LEVELS as rung (rung)}
				<span class="rung" data-current={rung === level ? 'true' : undefined}></span>
			{/each}
		</span>
		<span class="count">{siblingCount === 0 ? '0' : `${siblingIndex + 1}/${siblingCount}`}</span>
	</div>

	<button
		type="button"
		class="rung-button down"
		disabled={downName === null}
		aria-label={downName === null ? 'Nothing below here' : `Down to ${downName}`}
		onclick={onDown}
	>
		<span class="dest">{downName ?? 'floor'}</span>
		<Icon name="chevron-down" size="md" />
	</button>
</nav>

<style>
	.axis {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: stretch;
		gap: var(--space-3);
		flex: none;
	}

	/* --space-7 (48px at every width), not --filter-control-height, which drops
	   under the 44px touch floor from 640px up. Measured last round; carried. */
	.rung-button {
		appearance: none;
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-height: var(--space-7);
		min-width: 0;
		padding: var(--space-2) var(--space-3);
		background: var(--surface-hover-subtle);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
		text-align: left;
	}

	.rung-button.down {
		justify-content: flex-end;
		text-align: right;
	}

	.rung-button:disabled {
		cursor: default;
		opacity: var(--state-disabled-opacity);
	}

	.rung-button:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	/* The destination slug takes every pixel the icon leaves; the kind lives in
	   the arrow and the aria-label. */
	.dest {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.indicator {
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.rungs {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	/* Three rungs, the current one lit. Neutral, never a status colour: which
	   level you stand on is not a status. */
	.rung {
		width: var(--space-3);
		height: var(--space-1);
		background: var(--border-glass);
		transition: background var(--transition-normal);
	}

	.rung[data-current='true'] {
		background: var(--text-primary);
	}

	.count {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		white-space: nowrap;
	}
</style>
