<script lang="ts">
	/**
	 * Ledger — the corpus dashboard — approach 5 of 5: Structural grid
	 *
	 * Direction: Swiss typography with the twelve-column grid left exposed,
	 * heavy rules, a near-monochrome palette and type weight carrying the
	 * entire hierarchy, with releases drawn as a phase timeline.
	 *
	 * The complaint this answers is "everything feels weak and not well
	 * grounded". The answer here is structural rather than decorative: nothing
	 * on this page is contained by a card. Regions are grounded by a 4px rule
	 * above them, divided by hairlines, and aligned to twelve columns that are
	 * drawn rather than implied. Hierarchy is carried by weight and size — 800
	 * down to 400, 3rem down to 0.75rem — so colour is left free to mean one
	 * thing only, which is status.
	 */
	import { Footer, Header, PageFrame, PageSection } from '@alfons/design';

	import FigureBand from './FigureBand.svelte';
	import PhaseTimeline from './PhaseTimeline.svelte';
	import SearchRail from './SearchRail.svelte';
	import TaskDossier from './TaskDossier.svelte';
	import TransitionStrip from './TransitionStrip.svelte';
	import {
		COLUMN_GUIDES,
		HEADLINE,
		RELEASES,
		TASKS,
		TRANSITIONS,
		releaseBySlug,
		taskById,
		type Figure,
		type Task
	} from './ledger-corpus';

	// He arrives with a vague memory of a title, so the page opens mid-search
	// rather than on an empty field. "prototype" is the honest case: it matches
	// five tasks across two projects, which is exactly why a result row has to
	// carry its release and project to be recognised.
	let query = $state('prototype');
	let selectedId = $state('AL-014');

	const selected = $derived(taskById(selectedId) ?? TASKS[0]);
	const selectedRelease = $derived(releaseBySlug(selected.release) ?? RELEASES[0]);
	const otherReleases = $derived(
		RELEASES.filter((release) => release.slug !== selectedRelease.slug)
	);

	const figures: Figure[] = [
		{ value: String(HEADLINE.open), label: 'Open', note: 'not yet done, across every project' },
		{ value: String(HEADLINE.inFlight), label: 'In flight', note: 'building or verifying now' },
		{ value: String(HEADLINE.blocked), label: 'Blocked', note: 'nothing is waiting on a human' },
		{
			value: String(HEADLINE.shipped),
			label: 'Shipped',
			note: `done in the last ${HEADLINE.shippedWindowDays} days`
		}
	];

	// The feed announces transitions as they arrive; the newest line is the one
	// the reader has not accounted for yet.
	let newestIndex = $state(0);

	$effect(() => {
		const timer = setInterval(() => {
			newestIndex = (newestIndex + 1) % TRANSITIONS.length;
		}, 5000);
		return () => clearInterval(timer);
	});

	function selectTask(task: Task) {
		selectedId = task.id;
	}
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}

	<main class="ledger">
		<PageSection>
			<!-- MASTHEAD -->
			<div class="grid twelve masthead-grid">
				<div class="guides" aria-hidden="true">
					{#each COLUMN_GUIDES as column (column)}<span></span>{/each}
				</div>

				<div class="span-7 masthead">
					<p class="eyebrow">Motivka / corpus</p>
					<h1>Ledger</h1>
				</div>

				<div class="standfirst">
					<p>
						Where a piece of work stands, and the shape of the work around it. Search by whatever
						you remember of the title; the result carries its release, its project and its phase so
						the right one is recognised without opening it.
					</p>
					<p class="scope">
						<span>{HEADLINE.releases} releases</span>
						<span>{HEADLINE.projects} projects</span>
						<span>live feed</span>
					</p>
				</div>
			</div>

			<!-- HEADLINE FIGURES -->
			<div class="grid twelve band-grid">
				<div class="guides" aria-hidden="true">
					{#each COLUMN_GUIDES as column (column)}<span></span>{/each}
				</div>
				<div class="span-12">
					<FigureBand {figures} />
				</div>
			</div>

			<!-- THE FRONT DOOR -->
			<div class="grid twelve search-grid">
				<div class="guides" aria-hidden="true">
					{#each COLUMN_GUIDES as column (column)}<span></span>{/each}
				</div>
				<div class="span-12">
					<SearchRail
						{query}
						{selectedId}
						onQuery={(next) => (query = next)}
						onSelect={selectTask}
					/>
				</div>
			</div>

			<!-- THE PAYOFF: THE FOUND TASK, AND THE RELEASE AROUND IT -->
			<div class="grid twelve payoff-grid">
				<div class="guides" aria-hidden="true">
					{#each COLUMN_GUIDES as column (column)}<span></span>{/each}
				</div>
				<div class="span-4">
					<TaskDossier task={selected} />
				</div>
				<div class="span-8">
					<p class="region-label">The release it belongs to</p>
					<PhaseTimeline release={selectedRelease} highlightTaskId={selected.id} />
				</div>
			</div>

			<!-- EVERYTHING ELSE IN FLIGHT -->
			<div class="grid twelve flight-grid">
				<div class="guides" aria-hidden="true">
					{#each COLUMN_GUIDES as column (column)}<span></span>{/each}
				</div>
				<div class="span-8 stack">
					<p class="region-label">Other releases in flight</p>
					{#each otherReleases as release (release.slug)}
						<PhaseTimeline {release} />
					{/each}
				</div>
				<div class="span-4">
					<p class="region-label">Arriving</p>
					<TransitionStrip transitions={TRANSITIONS} {newestIndex} />
				</div>
			</div>
		</PageSection>
	</main>
</PageFrame>

<style>
	/*
	 * The status encoding, set once for the whole page.
	 *
	 * Every region reads these and no region defines its own, which is what
	 * stops "building" from being amber in the timeline and something else in
	 * the feed. wontfix and duplicate are deliberately the muted grey: they are
	 * exits, not states worth a hue, and their mark shape already separates
	 * them from the lifecycle.
	 */
	.ledger {
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);

		display: block;
	}

	/*
	 * The grid, drawn rather than implied.
	 *
	 * Twelve columns with a hairline on every boundary. Leaving the structure
	 * visible is the whole argument: the page is grounded by alignment you can
	 * see, so nothing needs a border on four sides to look deliberate.
	 */
	.grid {
		position: relative;
		display: grid;
		column-gap: var(--space-5);
		padding-block: var(--space-7);
	}

	.twelve {
		grid-template-columns: repeat(12, minmax(0, 1fr));
	}

	.guides {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		column-gap: var(--space-5);
		pointer-events: none;
	}

	.guides span {
		border-inline-start: 1px solid var(--border-glass);
		margin-inline-start: calc(var(--space-5) / -2);
	}

	.guides span:first-child {
		margin-inline-start: 0;
	}

	.masthead-grid {
		padding-block-start: 0;
	}

	.span-4 {
		grid-column: span 4;
	}

	.span-7 {
		grid-column: span 7;
	}

	.span-8 {
		grid-column: span 8;
	}

	.span-12 {
		grid-column: span 12;
	}

	/* Flush right against the last column: `grid-column-start` after the span
	   shorthand would reset the end back to one track, which is how this read
	   as a single-column sliver before it was written as one declaration. */
	.standfirst {
		grid-column: 9 / -1;
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
	}

	/* Masthead: the extreme end of the weight scale, against the micro label
	   at the other end. Nothing between them is needed to establish rank. */
	.eyebrow {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.masthead h1 {
		margin: 0;
		font-family: var(--font-body);
		font-size: 3.9rem;
		font-weight: 800;
		line-height: 0.86;
		letter-spacing: -0.055em;
		text-transform: uppercase;
		color: var(--text-primary);
	}

	.masthead {
		border-block-end: var(--space-1) solid var(--text-primary);
		padding-block-end: var(--space-5);
		align-self: end;
	}

	.standfirst {
		align-self: end;
		border-block-end: 1px solid var(--border-glass);
		padding-block-end: var(--space-5);
	}

	.standfirst p {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-ui);
		font-weight: 400;
		line-height: 1.55;
		color: var(--text-secondary);
	}

	.standfirst .scope {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-block-start: var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.standfirst .scope span {
		padding-inline-end: var(--space-4);
		border-inline-end: 1px solid var(--border-glass);
		color: var(--text-muted);
	}

	.standfirst .scope span:last-child {
		border-inline-end: none;
	}

	.region-label {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.24em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	@media (max-width: 1023px) {
		.guides {
			display: none;
		}

		.span-4,
		.span-7,
		.span-8,
		.span-12 {
			grid-column: span 12;
		}

		.standfirst {
			grid-column: 1 / -1;
		}

		.payoff-grid,
		.flight-grid {
			row-gap: var(--space-7);
		}

		.masthead h1 {
			font-size: 3rem;
		}
	}
</style>
