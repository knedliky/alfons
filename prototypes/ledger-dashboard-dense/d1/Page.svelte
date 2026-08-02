<script lang="ts">
	/**
	 * Ledger — the corpus dashboard, dense — approach 1 of 5: Contrast ladder
	 *
	 * Direction: Takes the winning approach's own finding and pushes it alone: a deliberate three-step ladder of type family, weight and ink inside one dense table, with every other variable held constant, to find how much hierarchy density can absorb before it stops reading as dense.
	 *
	 * Brief: The ledger dashboard at /ledger is where Simon goes to find out where a specific piece of work stands. He rarely arrives with a task id; he arrives with a vague memory of a task's title, so search is the front door of this page and search results must carry enough context — release, project, status, phase — for the right one to be recognised on sight. Finding the task is not the payoff. What he actually wants once he has found it is the shape of the work around it: which release it belongs to, which phase it sits in, what its sibling tasks are, and what it depends on. The page remains a page on the Motivka site, keeping the site Header and Footer for continuity, but it relaxes the blog measure so that grids and tables can breathe. The corpus is live and substantial — many hundreds of tasks across dozens of releases in eleven projects — and it updates while you watch, over an SSE feed that announces status transitions and silently corrects task statuses underneath the view. Dark is the sole colour mode. Status colour is reserved for state and is never used as decoration. This is the second round. The first round tested five positions across the whole design space and the dense-table pole won, so this round explores five positions inside that pole alone. The finding that decided it, reported by the winning agent against its own work, is that density alone does not carry a page: a first pass at uniform monospace microtype was legible but inert, and looked like the failing page it replaced, only wider. What rescued it were three moves that cost no density at all — one column breaking the monospace into the body face at primary ink, rules drawn at two weights rather than one so they read as structure instead of noise, and a display voice at the masthead buying the table permission to be tight. Every approach in this round is therefore a dense table, and what varies between them is the single contrast device each one leans on. Two of them additionally attack the weaknesses the winning approach named against itself: that with nothing hidden there is no state of the page which answers what to look at without reading, and that it degrades badly below twelve hundred pixels because it scrolls sideways rather than dropping columns.
	 *
	 * Owned by one agent. Build from the base layer up — shell, then
	 * regions, then containers, then components — and keep
	 * data-alfons-working="what you are composing" on the region under
	 * construction so the build can be watched live at /dev/ledger-dashboard-dense.
	 * Remove the marker when the region is finished.
	 */
	import { Container, Footer, Header, PageFrame, PageHeader, PageSection } from '@alfons/design';
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}
	<main data-alfons-working="Contrast ladder — seeded shell, composing the base layer">
		<PageSection>
			<Container>
				<PageHeader
					title="Ledger — the corpus dashboard, dense"
					subtitle="Contrast ladder"
				/>
			</Container>
		</PageSection>
	</main>
</PageFrame>
