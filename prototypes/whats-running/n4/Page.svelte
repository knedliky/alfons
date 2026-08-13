<script lang="ts">
	/**
	 * What's running — approach 4 of 5: Progress led.
	 *
	 * The bet: "how far along is it" is the real question hiding inside "what's
	 * running". So each row leads with its acceptance criteria as marks and a
	 * one-sentence tally, and the list is ordered by how near done each task is.
	 * Identity — the title, the release — sits under that rather than over it.
	 *
	 * Two states, both designed rather than one handled: four running, and none.
	 * None is the state the page lives in most of the time, so it is not a notice
	 * dropped into an otherwise-normal page; it takes the page over.
	 */
	import { Button, Container, Footer, Header, PageFrame, PageSection } from '@alfons/design';
	import NothingRunning from './NothingRunning.svelte';
	import OutcomeLegend from './OutcomeLegend.svelte';
	import RunningTaskRow from './RunningTaskRow.svelte';
	import { byNearness, runners } from './runners.ts';

	/**
	 * Prototype scaffolding, not part of the design. The live page reads its
	 * runners from the SSE feed and is empty whenever the corpus is; here the two
	 * states need to be reachable side by side so both can be judged.
	 */
	let showEmpty = $state(false);

	const running = $derived(showEmpty ? [] : byNearness(runners));
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}
	<main class="page">
		<PageSection>
			<Container maxWidth="sm">
				{#if running.length === 0}
					<NothingRunning />
				{:else}
					<!--
						Not PageHeader: its display-serif h1 takes roughly a third of a
						370px screen before the reader has been told anything, and the
						answer has to be above the fold. This is the same scale and voice
						as the empty state's heading, so the two states read as one page.
					-->
					<header class="masthead">
						<h1 class="masthead-title">What's running</h1>
						<p class="masthead-note">four tasks, nearest done first</p>
					</header>
					<ul class="runners">
						{#each running as task (task.id)}
							<li><RunningTaskRow {task} /></li>
						{/each}
					</ul>
					<div class="legend">
						<OutcomeLegend />
					</div>
				{/if}

				<div class="scaffolding">
					<Button variant="outline" onclick={() => (showEmpty = !showEmpty)}>
						{showEmpty ? 'Show four running' : 'Show the empty state'}
					</Button>
					<span class="scaffolding-note">prototype control — not part of the design</span>
				</div>
			</Container>
		</PageSection>
	</main>
</PageFrame>

<style>
	.page {
		/*
		 * Status colour, declared once for the page. It encodes task state and
		 * nothing else: no verification outcome, no chrome, no emphasis. The marks
		 * in the meter are deliberately hue-free so that this stays the only
		 * colour on the page that carries meaning.
		 */
		--running-building: var(--amber);
		--running-verifying: var(--blush-pink);
	}

	.masthead {
		padding-block: 0 var(--space-5);
	}

	.masthead-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: 2.25rem;
		line-height: 1.1;
		color: var(--text-primary);
	}

	.masthead-note {
		margin: var(--space-2) 0 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.runners {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.legend {
		margin-top: var(--space-5);
	}

	.scaffolding {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: var(--space-3);
		margin-top: var(--space-8);
		padding-top: var(--space-4);
		border-top: 1px dashed var(--card-border);
	}

	.scaffolding-note {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		opacity: var(--opacity-tertiary);
	}
</style>
