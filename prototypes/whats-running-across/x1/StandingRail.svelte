<script lang="ts">
	/**
	 * The standing rail: task, release, project, named on every screen.
	 *
	 * This is the one thing this approach adds to Pushed, and the whole bet. It
	 * is fixed to the bottom edge — the only part of a phone a thumb reaches
	 * without regripping — and it sits ABOVE the pushed screens in the stacking
	 * order, so it is present on every screen including the pushed ones. Any
	 * level is then one tap from anywhere.
	 *
	 * What a tap does is decided by the page, not here, because only the page
	 * knows the history stack. The rail's contract is narrower: a slot is either
	 * HERE (where the reader stands — rendered as text, because tapping the
	 * place you are standing is not a move), a destination (a button), or
	 * honestly empty (the empty state has no task and no release, and the rail
	 * says so rather than hiding the slots and changing shape). The rail never
	 * changes shape between states — its promise is that the same three columns
	 * are always in the same place.
	 *
	 * Colour: none of the slots may take a status colour. A release is not a
	 * status and a project is not a status; HERE is marked with a top rule in
	 * --text-primary, the same neutral marking the grid gives the current cell.
	 *
	 * Not Breadcrumb, and considered: Breadcrumb is an inline <ol> of href
	 * links with JSON-LD structured data. Every one of those is wrong here — a
	 * rail tap is history.go()/pushState with no document to href to, the slots
	 * are two-line 48px touch targets rather than inline text, and emitting SEO
	 * structured data about a navigation stack that is page state would be a
	 * claim to search engines about documents that do not exist.
	 */
	export interface RailSlot {
		rank: string;
		name: string;
		/** 'here' renders text with aria-current; 'go' a button; 'none' muted text. */
		state: 'here' | 'go' | 'none';
		/** Read out and printed under an empty slot, e.g. "nothing running". */
		note?: string;
		onGo?: (opener: HTMLElement) => void;
	}

	let { slots }: { slots: RailSlot[] } = $props();
</script>

<nav class="rail" aria-label="Standing: task, release, project">
	<ul class="slots">
		{#each slots as slot (slot.rank)}
			<li class="slot">
				{#if slot.state === 'go'}
					<!-- A bare <button>: the same destination-row gap Pushed reported.
					     Button is a centred pill with fixed height and its own padding;
					     this is a two-line left-aligned column that must fill a third of
					     the rail and hold a 48px target. -->
					<button type="button" class="stand" onclick={(event) => slot.onGo?.(event.currentTarget)}>
						<span class="rank">{slot.rank}</span>
						<span class="name">{slot.name}</span>
						{#if slot.note}
							<span class="note">{slot.note}</span>
						{/if}
					</button>
				{:else}
					<p
						class="stand"
						data-state={slot.state}
						aria-current={slot.state === 'here' ? 'location' : undefined}
					>
						<span class="rank">{slot.rank}</span>
						<span class="name">{slot.name}</span>
						{#if slot.note}
							<span class="note">{slot.note}</span>
						{/if}
					</p>
				{/if}
			</li>
		{/each}
	</ul>
</nav>

<style>
	/* Above the pushed screens (--z-overlay) and below the dev harness's own
	   chrome. --z-toast is the elevation tier for a fixed strip at the bottom of
	   the viewport, which is exactly what this is. */
	.rail {
		position: fixed;
		inset-inline: 0;
		bottom: 0;
		z-index: var(--z-toast);
		background: var(--bg-primary);
		border-top: 1px solid var(--card-border);
		/* The bottom padding clears the prototyping harness's floating pager,
		   which sits fixed at the bottom of every /dev page; it floats over this
		   opaque apron rather than over the slots. A production rail would carry
		   var(--space-2) here plus the safe-area inset. */
		padding: var(--space-2) var(--space-4) calc(var(--space-7) + var(--space-5));
	}

	.slots {
		margin: 0 auto;
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-2);
	}

	/* Matches the page's own column cap so the rail's slots stay under the
	   content they name on wider screens. */
	@media (min-width: 640px) {
		.slots {
			max-width: 34rem;
		}
	}

	.slot {
		min-width: 0;
		display: flex;
	}

	.stand {
		appearance: none;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: var(--space-1);
		width: 100%;
		/* --space-7 is 48px at every width; --filter-control-height drops under
		   the touch minimum from 640px up. Same finding as Pushed, kept. */
		min-height: var(--space-7);
		margin: 0;
		padding: var(--space-1) var(--space-2);
		text-align: left;
		background: transparent;
		border: none;
		/* The HERE rule and its absence occupy the same 4px, so a slot does not
		   jump when the reader's standing moves onto it. */
		border-top: var(--space-1) solid transparent;
		color: var(--text-primary);
	}

	button.stand {
		cursor: pointer;
		background: var(--surface-hover-subtle);
	}

	.stand[data-state='here'] {
		border-top-color: var(--text-primary);
	}

	.stand[data-state='none'] {
		color: var(--text-muted);
	}

	button.stand:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: calc(var(--space-1) * -1);
	}

	.rank {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.name {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: inherit;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.note {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
