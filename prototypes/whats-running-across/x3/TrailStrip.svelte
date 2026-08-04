<script lang="ts">
	/**
	 * The trail, rendered: a fixed strip along the bottom edge, above every
	 * screen this page can show, holding one chip per place the reader has
	 * picked up. Nothing is ever behind anything else — the strip is the same
	 * strip on the running view, on a release and on a project, so every place
	 * on it is one tap away from everywhere.
	 *
	 * Bottom edge, because the strip is a control the thumb uses constantly and
	 * the bottom is the only part of a phone a thumb reaches without regripping.
	 * It sits ABOVE the pushed screens (--z-toast over their --z-overlay) so a
	 * screen sliding in passes beneath it and the trail visibly never moves —
	 * persistence shown, not claimed.
	 *
	 * Order is most-recent-first from the left, after one permanent chip:
	 * Running. The running view is the page's home and the one place that
	 * exists before any journey does, so it is pinned rather than subject to
	 * recency — and it is also the answer to "how do I get all the way back"
	 * without counting history entries. Before anything has been visited the
	 * strip is the Running chip and a sentence saying what the empty room is
	 * for; a strip that only appears once used would be undiscoverable exactly
	 * when it matters.
	 *
	 * A task chip whose task has stopped running cannot reopen the running view
	 * — the running view never expresses a non-running status, and this strip
	 * does not get to relax that. The chip stays, because the trail is the last
	 * things seen, but it re-points: its second line says `AL-014 → release`
	 * and the tap goes to the release. The arrow is what keeps the promise
	 * honest — the chip says where it now leads before the tap commits.
	 *
	 * A bare <button> per chip. Chip (the atom) was checked first and refused:
	 * it is a tag token with --space-1/2 padding, a remove affordance and a
	 * single centred line, and a trail plate is a 48px two-line grid — rank and
	 * state above, name below — whose every dimension would be overridden.
	 * Same finding as the destination row: reported, not worked around.
	 */
	import type { Place } from './trail.ts';
	import { placeKey, samePlace } from './trail.ts';
	import type { RunningStatus } from './tasks.ts';

	let {
		trail,
		current,
		currentTaskId,
		statusOf,
		onOpen,
		onHome
	}: {
		trail: Place[];
		/** The screen the reader stands on; null is the running view. */
		current: Place | null;
		/** The task on screen at card scale, when the running view is showing. */
		currentTaskId: string | null;
		/** Running status of a task, or null once it has ended. */
		statusOf: (id: string) => RunningStatus | null;
		onOpen: (place: Place, opener: HTMLElement) => void;
		onHome: (opener: HTMLElement) => void;
	} = $props();

	function isCurrent(place: Place): boolean {
		if (current !== null) return samePlace(place, current);
		return place.kind === 'task' && place.id === currentTaskId;
	}

	function stateWord(place: Place): string {
		if (place.kind !== 'task') return place.kind;
		const status = statusOf(place.id);
		return status ? `task · ${status}` : 'task · ended';
	}
</script>

<nav class="strip" aria-label="Trail of places visited">
	<div class="row">
		<button
			type="button"
			class="chip"
			class:here={current === null}
			aria-current={current === null ? 'true' : undefined}
			disabled={current === null}
			onclick={(event) => onHome(event.currentTarget)}
		>
			<span class="state">view</span>
			<span class="name">Running</span>
		</button>

		{#each trail as place (placeKey(place))}
			{@const here = isCurrent(place)}
			{@const ended = place.kind === 'task' && statusOf(place.id) === null}
			<button
				type="button"
				class="chip"
				class:here
				data-status={place.kind === 'task' ? (statusOf(place.id) ?? 'ended') : undefined}
				aria-current={here ? 'true' : undefined}
				disabled={here}
				onclick={(event) => onOpen(place, event.currentTarget)}
			>
				<span class="state">
					{#if place.kind === 'task'}
						<span class="dot" aria-hidden="true"></span>
					{/if}
					{stateWord(place)}
				</span>
				<span class="name">
					{#if place.kind === 'task'}
						{place.id}{#if ended}&nbsp;&rarr; {place.release}{/if}
					{:else if place.kind === 'release'}
						{place.slug}
					{:else}
						{place.name}
					{/if}
				</span>
			</button>
		{/each}

		{#if trail.length === 0}
			<p class="hint">Places you open gather here, newest first.</p>
		{/if}
	</div>
</nav>

<style>
	.strip {
		position: fixed;
		inset: auto 0 0 0;
		z-index: var(--z-toast);
		background: var(--bg-primary);
		border-top: 1px solid var(--card-border);
		/* The bottom padding is the prototyping harness's floating pager, which
		   floats over this band rather than over the chips. A production strip
		   would carry var(--space-2) here like the top edge. */
		padding: var(--space-2) 0 calc(var(--space-7) + var(--space-5));
	}

	.row {
		display: flex;
		align-items: stretch;
		gap: var(--space-2);
		padding-inline: var(--space-4);
		overflow-x: auto;
		overflow-y: hidden;
		overscroll-behavior-x: contain;
		scrollbar-width: none;
	}

	.row::-webkit-scrollbar {
		display: none;
	}

	.chip {
		appearance: none;
		flex: none;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-1);
		min-height: var(--space-7);
		max-width: 60vw;
		padding: var(--space-1) var(--space-3);
		text-align: left;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
	}

	/* The place the reader is standing on is not a destination. It stays on the
	   strip — a hand of cards with the held card missing would misreport the
	   hand — but it is disabled and marked, not tappable. Neutral marking: being
	   current is not a status. */
	.chip.here {
		background: var(--surface-hover-subtle);
		border-color: var(--text-primary);
		cursor: default;
	}

	.state {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.name {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Status colour on a task chip's dot and word, because a running status IS
	   state — the one thing colour is allowed to mean. Ended is not a status the
	   trail knows (it could be done, blocked, anything), so it stays muted. */
	.chip[data-status='building'] .state {
		color: var(--status-building);
	}

	.chip[data-status='verifying'] .state {
		color: var(--status-verifying);
	}

	.dot {
		width: var(--space-2);
		height: var(--space-2);
		flex: none;
		background: currentColor;
	}

	.chip[data-status='building'] .dot,
	.chip[data-status='verifying'] .dot {
		animation: breathe var(--widget-pulse-duration) ease-in-out infinite;
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
		.chip .dot {
			animation: none;
		}
	}

	.chip:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	.hint {
		margin: 0;
		align-self: center;
		font-size: var(--text-caption);
		color: var(--text-muted);
		white-space: nowrap;
	}
</style>
