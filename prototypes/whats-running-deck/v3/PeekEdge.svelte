<script lang="ts">
	/**
	 * The sliver. What a neighbouring card shows when only 48px of it is on screen.
	 *
	 * This exists so that the peek is a design rather than an accidental crop.
	 * Without it the reader sees whatever content happens to fall at the card's
	 * edge — the right-hand third of a title, or blank padding — which carries no
	 * identity at all. The rail is pinned over the card's own edge, opaque, and
	 * occludes that crop with two things chosen on purpose:
	 *
	 *   1. A status bar, four pixels, on the side facing the card the reader is
	 *      reading. Both neighbours therefore put their colour immediately either
	 *      side of the current card, so the states flanking you are read in the
	 *      same glance as the card itself.
	 *   2. The id and the status word, set vertically. Colour never carries the
	 *      meaning alone on this page — StatusMark always prints the word and so
	 *      does the sliver. The title is deliberately absent: forty-eight pixels
	 *      of a sentence is noise, and the id is the shortest thing that answers
	 *      "which one is that".
	 *
	 * It is a button because a peek that cannot be tapped is a picture of a
	 * control. It carries tabindex="-1" on purpose: the rail below the deck is
	 * the keyboard route and already has previous/next, so putting these in the
	 * tab order would be two extra stops that do the same job. They stay in the
	 * accessibility tree with a full label rather than being hidden, so a pointer
	 * user and a screen-reader user are told the same thing.
	 */
	import type { RunningTask } from './tasks.ts';

	let {
		task,
		position,
		total,
		side,
		onselect
	}: {
		task: RunningTask;
		position: number;
		total: number;
		/** Which edge of its own card this rail sits on. */
		side: 'leading' | 'trailing';
		onselect: () => void;
	} = $props();
</script>

<button
	type="button"
	class="peek"
	data-side={side}
	data-status={task.status}
	tabindex="-1"
	aria-label="Show task {position} of {total}: {task.id}, {task.status}"
	onclick={onselect}
>
	<span class="bar" aria-hidden="true"></span>
	<span class="legend">
		<span class="id">{task.id}</span>
		<span class="state">{task.status}</span>
	</span>
</button>

<style>
	.peek {
		appearance: none;
		position: absolute;
		inset-block: 0;
		width: var(--peek);
		padding: 0;
		border: none;
		cursor: pointer;
		/* Opaque, not the translucent card fill: the rail's job is to occlude the
		   card's own cropped content behind it. */
		background: var(--bg-primary);
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: clip;
		transition:
			opacity var(--transition-normal),
			visibility var(--transition-normal);
	}

	.peek[data-side='leading'] {
		left: 0;
		border-right: 1px solid var(--card-border);
	}

	.peek[data-side='trailing'] {
		right: 0;
		border-left: 1px solid var(--card-border);
	}

	.peek[data-status='building'] {
		--status-colour: var(--status-building);
	}

	.peek[data-status='verifying'] {
		--status-colour: var(--status-verifying);
	}

	/* On the side that faces the card being read, so the two colours sit either
	   side of it like margins rather than out at the screen edge where they would
	   be the first thing cropped. */
	.bar {
		position: absolute;
		inset-block: 0;
		width: var(--space-1);
		background: var(--status-colour);
	}

	.peek[data-side='leading'] .bar {
		left: 0;
	}

	.peek[data-side='trailing'] .bar {
		right: 0;
	}

	.legend {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		/* Rotated a quarter turn: a 48px column has no room for horizontal text,
		   and an id truncated to three characters answers nothing. */
		writing-mode: vertical-rl;
		text-orientation: mixed;
		font-family: var(--font-mono);
		letter-spacing: 0.08em;
		/* The card is tall and the legend is short, but a very short viewport must
		   crop the legend rather than push the rail out of shape. */
		max-height: 100%;
		overflow: clip;
	}

	.id {
		font-size: var(--text-caption);
		color: var(--text-primary);
	}

	.state {
		font-size: var(--text-micro);
		text-transform: uppercase;
		color: var(--status-colour);
	}
</style>
