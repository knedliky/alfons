<script lang="ts">
	/**
	 * The spine: every runner, permanently, in the thumb's reach.
	 *
	 * This is the whole bet of the approach. n2 could show one task in full or
	 * state a count in words, never both at once, and it said so against its own
	 * work: "the count is not something the deck can express". The spine is the
	 * second register that expresses it — not a position indicator but a list of
	 * who is running and in what state, on screen at the same moment the card is
	 * being read.
	 *
	 * Three things follow from that, and they are the design:
	 *
	 * 1. It carries identity, not position. Each entry names the task and its
	 *    status. n2's rail was four identical ticks; four ticks answer "where am
	 *    I" and nothing else, which is the question the reader did not ask.
	 *
	 * 2. It is the control. Every runner is one tap away, which strictly beats a
	 *    previous/next pair that can only step. So the ticks and the arrows both
	 *    go, and this is the deck's only visible control.
	 *
	 * 3. It sits at the bottom. A phone held in one hand reaches the bottom third
	 *    with the thumb and the top with a regrip; the card is read with the eyes
	 *    and the spine is touched with the thumb, so the spine takes the reachable
	 *    edge and the card takes the rest. Above the card it would be a control
	 *    you cannot press without changing hands.
	 *
	 * The project is not printed. It is already in the id — AL, LDG, ATL, GW are
	 * the ledger's own prefixes — and at 370px an entry is about 80px wide, which
	 * buys one line of identity and one of state and no more. Spending a line on
	 * a project name that the id already carries would have cost the status word,
	 * and then colour would be carrying state on its own.
	 */
	import type { RunningTask } from './tasks.ts';

	let {
		tasks,
		index,
		onSelect
	}: { tasks: RunningTask[]; index: number; onSelect: (next: number) => void } = $props();

	let entries = $state<(HTMLButtonElement | null)[]>([]);

	function move(to: number) {
		onSelect(Math.min(Math.max(to, 0), tasks.length - 1));
	}

	// Roving focus: the arrow that moves the deck moves the focus with it, so a
	// second arrow keeps working rather than stranding focus on an entry that is
	// no longer current.
	function onKeydown(event: KeyboardEvent) {
		const jump =
			event.key === 'ArrowRight'
				? index + 1
				: event.key === 'ArrowLeft'
					? index - 1
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? tasks.length - 1
							: null;
		if (jump === null) return;
		event.preventDefault();
		const landed = Math.min(Math.max(jump, 0), tasks.length - 1);
		move(landed);
		entries[landed]?.focus();
	}
</script>

<nav class="spine" aria-label="Everything running">
	{#each tasks as task, position (task.id)}
		<!-- A bare button, and the one raw-element finding this component keeps.
		     Button is a padded, backgrounded control with fixed heights; an entry
		     is a two-line block that must flex to a quarter of a 370px screen and
		     take a status colour on its top edge. Every one of Button's own
		     decisions would have to be overridden, which is a Button in name
		     only. -->
		<button
			type="button"
			class="entry"
			data-status={task.status}
			aria-current={position === index ? 'true' : undefined}
			aria-label="{task.id}, {task.status}, task {position + 1} of {tasks.length}"
			tabindex={position === index ? 0 : -1}
			bind:this={entries[position]}
			onclick={() => move(position)}
			onkeydown={onKeydown}
		>
			<!-- The status bar is decoration only in the sense that removing it
			     loses nothing: the word below says the same thing. Colour is the
			     fast read, the word is the true one. -->
			<span class="state-bar" aria-hidden="true"></span>
			<span class="id">{task.id}</span>
			<span class="state" aria-hidden="true">{task.status}</span>
		</button>
	{/each}
</nav>

<style>
	.spine {
		display: flex;
		flex: none;
		/* The tightest gap on the scale, and it is measured rather than chosen.
		   At 370px four entries share 338px: at --space-2 an entry has 58px of
		   content and the word "verifying" needs 70, so the state word truncated
		   to "verifyin…" and the spine was carrying state in colour alone. This
		   gap plus the narrow inline padding below gives 71.5px, which fits it. */
		gap: var(--space-1);
	}

	.entry {
		appearance: none;
		/* Sized by content, then grown to share the slack — not equal quarters.
		   Equal quarters gave every entry 58px, and "verifying" needs 70, so the
		   state word truncated to "verifyin…" and the spine was left stating
		   state in colour alone. Content-sized, the four entries want 316px of
		   the 338px a 370px screen has, so nothing truncates and the 22px left
		   over is shared out. min-width:0 keeps the ellipsis as the last resort
		   for a longer id rather than an overflow. */
		flex: 1 1 auto;
		min-width: 0;
		/* 48px, comfortably over the 44px target, and the same height n2 spent on
		   its tick rail. The spine buys identity and state for what the old rail
		   spent on four identical marks. */
		min-height: var(--space-7);
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: center;
		gap: var(--space-1);
		/* Narrow on the inline axis for the reason above: the status word has to
		   fit at 370px or the spine states colour without a word beside it. The
		   block padding is untouched, so the touch target keeps its height. */
		padding: var(--space-2) var(--space-1);
		background: var(--surface-dark-subtle);
		border: 1px solid var(--card-border);
		cursor: pointer;
		text-align: left;
		transition: background var(--transition-normal);
	}

	/* Resolved from the two custom properties the page declares once. The
	   attribute selector rather than var(--status-{status}) because
	   interpolation inside var() is opaque to review_markup. */
	.entry[data-status='building'] {
		--status-colour: var(--status-building);
	}

	.entry[data-status='verifying'] {
		--status-colour: var(--status-verifying);
	}

	.state-bar {
		width: 100%;
		height: var(--space-1);
		flex: none;
		background: var(--status-colour);
		/* Everything in the spine is running, so everything in the spine moves.
		   The current entry is not the only live one. */
		animation: breathe var(--widget-pulse-duration) ease-in-out infinite;
	}

	.id {
		max-width: 100%;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.02em;
		color: var(--text-secondary);
		overflow: clip;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.state {
		max-width: 100%;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--status-colour);
		overflow: clip;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* The current entry is the one the card belongs to, so it is lit rather than
	   ticked: the reader's position is read off the same marks that carry the
	   overview, which is why no separate indicator survives. */
	.entry[aria-current='true'] {
		background: var(--surface-hover-subtle);
		/* Neutral, and the brightest neutral on the strip. Marking the current
		   entry with its own status colour would have made the colour mean two
		   things at once — "this task is verifying" and "you are here" — and the
		   spine's whole claim is that colour on it means state. */
		border-color: var(--text-muted);
	}

	.entry[aria-current='true'] .id {
		color: var(--text-primary);
	}

	.entry:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	@keyframes breathe {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: var(--opacity-tertiary);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.state-bar {
			animation: none;
		}
	}
</style>
