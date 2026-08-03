<script lang="ts">
	/**
	 * What's running — the deck — approach 5 of 5: The vertical deck
	 *
	 * Direction: Turns the deck through ninety degrees so full-height cards snap under a vertical scroll, making the reader's own scroll position the sense of where they are and using the gesture a phone reader reaches for first.
	 *
	 * Brief: This is a phone-first page that answers one question in about a second: is anything running right now? In motion means a task an agent is working on at this moment, which is the building and verifying statuses and nothing else. On the corpus today that is four tasks and it is frequently zero, so the nearly-empty page is the state this design lives in most of the time and the empty state is a primary design rather than an edge case handled last. Emptiness is information: nothing is running is a complete and useful answer and it must read as deliberate rather than as a page that failed to load. There is no second level, no navigation, no filtering, no search, no board and no backlog, and anything that is not building or verifying does not belong on this page at all. It is designed for a phone held in one hand and read at a glance, so the layout starts at roughly three hundred and seventy pixels wide and grows from there. Touch targets are generous, nothing depends on hover and nothing depends on a pointer. The corpus is live over an SSE feed. Dark is the sole colour mode and status colour is reserved for state, never decoration. This round builds on a winning approach from the previous round which gave each running task the full width and height of the phone as a single card the reader moves between, so that reading a task costs no tap and the card can render everything about it without compression. That approach is kept and every approach in this round keeps it. What it could not do is the thing this round exists to solve, and it said so against its own work: a deck cannot express a count, so the reader gets depth at the cost of the overview, and the primary question of how many things are running and where the reader stands among them had to be stated in words above the deck rather than shown by the deck itself. The reader wants a sense check of where they are and what else is under way, at the same moment they are reading one task in full. Every approach here is therefore a full-screen card deck, and what varies is how the overview and the deck coexist. The previous approach established three things worth keeping: the count belongs in the heading rather than being inferred by counting marks, movement must work by swipe and by visible control and by keyboard all three, and the deck must never empty, because a deck holding a single card whose content is the answer keeps the page's shape when nothing is running while a disabled pager is furniture pretending to be a control.
	 *
	 * Owned by one agent. Build from the base layer up — shell, then
	 * regions, then containers, then components — and keep
	 * data-alfons-working="what you are composing" on the region under
	 * construction so the build can be watched live at /dev/whats-running-deck.
	 * Remove the marker when the region is finished.
	 */
	import { Container, Footer, Header, PageFrame, PageHeader, PageSection } from '@alfons/design';
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}
	<main data-alfons-working="The vertical deck — seeded shell, composing the base layer">
		<PageSection>
			<Container>
				<PageHeader
					title="What's running — the deck"
					subtitle="The vertical deck"
				/>
			</Container>
		</PageSection>
	</main>
</PageFrame>
