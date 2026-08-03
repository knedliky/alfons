<script lang="ts">
	/**
	 * What's running — approach 2 of 5: One per screen
	 *
	 * Direction: Gives each running task the full width and height of the phone as a single card the reader moves between, so the depth is the card itself and there is no tap between seeing a task and reading it.
	 *
	 * Brief: This is a phone-first page that answers one question in about a second: is anything running right now? In motion means a task an agent is working on at this moment, which is the building and verifying statuses and nothing else. On the corpus today that is four tasks, and it is frequently zero, so the nearly-empty page is the state this design lives in most of the time and the empty state is the primary design rather than an edge case handled last. Emptiness here is information — nothing is running is a complete and useful answer, and it must read as deliberate rather than as a page that failed to load. When something is running, the reader wants to read into the one that matters: one level of depth, showing what the task actually is, which release it belongs to and how far along it has got. There is no second level, no navigation, no filtering, no search, no board, no backlog, and no attempt to show the rest of the corpus. Anything that is not building or verifying does not belong on this page at all. It is designed for a phone held in one hand and read at a glance, so the layout starts at roughly three hundred and seventy pixels wide and grows from there rather than being a desktop dashboard that has been made to fit. Touch targets are generous, nothing depends on hover, and nothing depends on a pointer. The corpus is live over an SSE feed, so a task finishing while the page is open should leave the page in front of you rather than requiring a reload. Dark is the sole colour mode. Status colour is reserved for state and is never decoration. Simplicity and immediacy are the whole brief: every element on the page must earn its place against the one second of attention it is given, and an element that merely could be there should not be.
	 *
	 * Owned by one agent. Build from the base layer up — shell, then
	 * regions, then containers, then components — and keep
	 * data-alfons-working="what you are composing" on the region under
	 * construction so the build can be watched live at /dev/whats-running.
	 * Remove the marker when the region is finished.
	 */
	import { Container, Footer, Header, PageFrame, PageHeader, PageSection } from '@alfons/design';
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}
	<main data-alfons-working="One per screen — seeded shell, composing the base layer">
		<PageSection>
			<Container>
				<PageHeader
					title="What's running"
					subtitle="One per screen"
				/>
			</Container>
		</PageSection>
	</main>
</PageFrame>
