<script lang="ts">
	/**
	 * What's running — going up — approach 2 of 5: The standing line
	 *
	 * Direction: Prints the project, the release and the task as one persistent line on the card with every segment reachable, so the reader's position in the hierarchy is always visible and every ancestor is always one tap, testing whether the plainest and most conventional answer is also the best one here.
	 *
	 * Brief: This is a phone-first page that answers one question in about a second: is anything running right now? In motion means a task an agent is working on at this moment, which is the building and verifying statuses and nothing else. On the corpus today that is four tasks and it is frequently zero, so the nearly-empty page is the state this design lives in most of the time and the empty state is a primary design rather than an edge case handled last. Emptiness is information and must read as deliberate rather than as a page that failed to load. It is built for a phone held in one hand and read at a glance, so the layout starts at roughly three hundred and seventy pixels wide and grows from there. Touch targets are generous, nothing depends on hover and nothing depends on a pointer. The corpus is live over an SSE feed. Dark is the sole colour mode and status colour is reserved for state, never decoration. This round builds directly on a winning approach that gave the same content two scales, a grid of every runner at once and a single full-screen card, with one control moving between them. The grid is the landing state because the question is plural, four cells answer it in one frame with no gesture, and a cell is a nameplate rather than a shrunken card, carrying a status rule and word, an id, a project, a release, an elapsed time and a phase, but deliberately no title, because at that size a title is a clipped promise. Identity survives the transition in both directions: the current cell is marked and takes focus on the way out, and the deck positions instantly rather than smoothly on the way back in, because a smooth scroll replays the intervening cards and reads as the page losing your place. That approach is kept and every approach in this round keeps it. What is new is that the reader now wants to go up. From the task being read they want to reach its release and its project, following the hierarchy the corpus already has, where a task sits in a release and a release sits in a project. This must be very simple. It is navigation upward from where the reader already stands rather than a browser of the whole corpus, and it is not a filter and not a context switcher. The earlier brief forbade a second level entirely and that constraint is now deliberately relaxed for the upward move alone, which means every approach must be honest about what the relaxation costs a page whose whole argument was that it had no second level. The downward direction is unchanged: there is still no search, no board, no backlog, and anything that is not building or verifying still has no place in the running view.
	 *
	 * Owned by one agent. Build from the base layer up — shell, then
	 * regions, then containers, then components — and keep
	 * data-alfons-working="what you are composing" on the region under
	 * construction so the build can be watched live at /dev/whats-running-up.
	 * Remove the marker when the region is finished.
	 */
	import { Container, Footer, Header, PageFrame, PageHeader, PageSection } from '@alfons/design';
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}
	<main data-alfons-working="The standing line — seeded shell, composing the base layer">
		<PageSection>
			<Container>
				<PageHeader
					title="What's running — going up"
					subtitle="The standing line"
				/>
			</Container>
		</PageSection>
	</main>
</PageFrame>
