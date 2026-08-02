<script lang="ts">
	/**
	 * Ledger — the corpus dashboard — approach 3 of 5: Release dossier
	 *
	 * Direction: Renders the journey literally as master-detail — a persistent release index down one side and the selected release's phases, tasks and siblings filling the rest, with no modal drawer at all — pushing layout composition and persistent state in place of overlay.
	 *
	 * Brief: The ledger dashboard at /ledger is where Simon goes to find out where a specific piece of work stands. He rarely arrives with a task id; he arrives with a vague memory of a task's title, so search is the front door of this page and search results must carry enough context — release, project, status, phase — for the right one to be recognised on sight. Finding the task is not the payoff. What he actually wants once he has found it is the shape of the work around it: which release it belongs to, which phase it sits in, what its sibling tasks are, and what it depends on. The page remains a page on the Motivka site, keeping the site Header and Footer for continuity, but it relaxes the blog measure so that grids and tables can breathe. The corpus is live and substantial — many hundreds of tasks across dozens of releases in eleven projects — and it updates while you watch, over an SSE feed that announces status transitions and silently corrects task statuses underneath the view. The current page fails on hierarchy and on grounding: one 11px monospace size is used for every element from the headline to the filter chips, cards carry no fill and a ten-percent-alpha border so they float unattached on a warm dark ground, and the search field is sized as an afterthought in a toolbar corner despite being the primary journey. The design references are Linear and Height for product-tool polish — a restrained palette, real elevation, generous row height, one accent used sparingly — and the Financial Times and the Economist for editorial data design, where headings carry a display voice and a chart carries its own annotation. Dark is the sole colour mode. Status colour is reserved for state and is never used as decoration.
	 *
	 * Owned by one agent. Build from the base layer up — shell, then
	 * regions, then containers, then components — and keep
	 * data-alfons-working="what you are composing" on the region under
	 * construction so the build can be watched live at /dev/ledger-dashboard.
	 * Remove the marker when the region is finished.
	 */
	import { Container, Footer, Header, PageFrame, PageHeader, PageSection } from '@alfons/design';
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}
	<main data-alfons-working="Release dossier — seeded shell, composing the base layer">
		<PageSection>
			<Container>
				<PageHeader
					title="Ledger — the corpus dashboard"
					subtitle="Release dossier"
				/>
			</Container>
		</PageSection>
	</main>
</PageFrame>
