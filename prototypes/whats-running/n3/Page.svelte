<script lang="ts">
	/**
	 * What's running — approach 3 of 5: Lead with the live one
	 *
	 * The bet: the task you came to read about is almost always the one an agent
	 * touched most recently, so show that one in full at the top and answer the
	 * question with no interaction at all. The other runners sit beneath it as a
	 * compact list.
	 *
	 * "Most recently active" means the most recent status transition. The
	 * defence is in runners.ts, next to the fixture that makes the three
	 * candidate definitions disagree.
	 *
	 * The three rules that make the bet safe to take:
	 *
	 * 1. THE LEAD NEVER SWAPS UNDER THE READER. It is pinned the moment the page
	 *    renders. When the feed makes something newer, the page offers to change
	 *    the lead and waits. Swapping the thing someone is reading is hostile,
	 *    and the cost of being one tap behind is smaller than the cost of losing
	 *    your place.
	 * 2. BEING WRONG COSTS ONE TAP. Every row in the list promotes itself into
	 *    the lead in place — no navigation, no new page, no scroll, and the
	 *    demoted lead simply joins the list. Nothing is lost by guessing wrong.
	 * 3. THE LEAD ONLY LEAVES WHEN IT STOPS RUNNING. A task that finishes cannot
	 *    stay on a page about what is running, so it goes; but the page says who
	 *    left and who took over rather than quietly redrawing.
	 *
	 * Announcements are deliberate. One polite live region, written to only when
	 * the lead changes or an offer appears. Ages ticking, list reordering and
	 * every other feed event stay silent — announcing everything is as useless
	 * as announcing nothing.
	 */
	import { Button, Container, Footer, Header, PageFrame, PageSection } from '@alfons/design';
	import FeedNotice from './FeedNotice.svelte';
	import NothingRunning from './NothingRunning.svelte';
	import RunnerCard from './RunnerCard.svelte';
	import { byMostRecentlyActive, describeAge, RUNNERS, type Runner } from './runners.ts';

	let runners = $state<Runner[]>(RUNNERS.map((runner) => ({ ...runner })));
	let connected = $state(true);
	let lastEventSecondsAgo = $state(45);

	// Pinned, not derived: the whole point is that the feed cannot move it.
	let leadId = $state<string | null>(byMostRecentlyActive(RUNNERS)[0]?.id ?? null);

	// Something newer than the lead arrived over the feed and is waiting to be
	// accepted. Cleared by taking it, by taking something else, or by the
	// candidate itself finishing.
	let offeredId = $state<string | null>(null);
	let departureNote = $state<string | null>(null);
	let announcement = $state('');

	const ordered = $derived(byMostRecentlyActive(runners));
	const lead = $derived(runners.find((runner) => runner.id === leadId) ?? null);
	const others = $derived(ordered.filter((runner) => runner.id !== leadId));
	const offered = $derived(runners.find((runner) => runner.id === offeredId) ?? null);
	const buildingCount = $derived(runners.filter((runner) => runner.status === 'building').length);
	const verifyingCount = $derived(runners.length - buildingCount);

	function promote(id: string) {
		const chosen = runners.find((runner) => runner.id === id);
		if (!chosen) return;
		leadId = id;
		offeredId = null;
		departureNote = null;
		// Caused by the reader, so confirming it is useful rather than noisy.
		announcement = `Now leading: ${chosen.id}, ${chosen.status}. ${chosen.title}`;
	}

	/** A status transition arriving over SSE for a task already running. */
	function feedTransition(id: string) {
		const moved = runners.find((runner) => runner.id === id);
		if (!moved) return;
		moved.status = moved.status === 'building' ? 'verifying' : 'building';
		if (moved.status === 'verifying') moved.latestAttempt += 1;
		moved.movedSecondsAgo = 0;
		lastEventSecondsAgo = 0;
		if (moved.id === leadId) return; // The lead updating in place is not an offer.
		offeredId = moved.id;
		announcement = `${moved.id} moved to ${moved.status}. It is newer than the task shown; you can lead with it.`;
	}

	/** The lead finishes: the one case where the page must change the lead. */
	function feedCompletion(id: string) {
		const leaving = runners.find((runner) => runner.id === id);
		if (!leaving) return;
		runners = runners.filter((runner) => runner.id !== id);
		if (offeredId === id) offeredId = null;
		lastEventSecondsAgo = 0;
		if (leaving.id !== leadId) return;
		const next = byMostRecentlyActive(runners)[0] ?? null;
		leadId = next?.id ?? null;
		departureNote = next
			? `${leaving.id} finished and left this page. Now leading ${next.id}.`
			: `${leaving.id} finished and left this page.`;
		announcement = departureNote;
	}

	// Ages are on screen, so they have to stay true. Silent: nothing here is
	// announced, and the list is not reordered under the reader by a tick.
	$effect(() => {
		const tick = setInterval(() => {
			for (const runner of runners) runner.movedSecondsAgo += 1;
			lastEventSecondsAgo += 1;
		}, 1000);
		return () => clearInterval(tick);
	});

	// Dev chrome below this line only — the two states and the feed events that
	// move between them, so both can be looked at without waiting on a corpus.
	let scenario = $state<'running' | 'empty'>('running');

	function loadScenario(next: 'running' | 'empty') {
		scenario = next;
		runners = next === 'running' ? RUNNERS.map((runner) => ({ ...runner })) : [];
		leadId = byMostRecentlyActive(runners)[0]?.id ?? null;
		offeredId = null;
		departureNote = null;
		announcement = '';
		lastEventSecondsAgo = next === 'running' ? 45 : 14 * 60;
	}
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}

	<main class="whats-running">
		<PageSection>
			<Container maxWidth="sm">
				<h1>
					What's running
					<span class="count">
						{#if runners.length === 0}
							nothing
						{:else}
							{buildingCount} building · {verifyingCount} verifying
						{/if}
					</span>
				</h1>

				<!-- One polite region, written to deliberately. Never mirrors the
				     ticking ages or the list reordering. -->
				<p class="offscreen" aria-live="polite" aria-atomic="true">{announcement}</p>

				{#if lead}
					{#if offered}
						<FeedNotice
							message="{offered.id} moved to {offered.status} {describeAge(
								offered.movedSecondsAgo
							)} — newer than the one shown."
							actionLabel="Lead with {offered.id}"
							onaction={() => promote(offered.id)}
						/>
					{:else if departureNote}
						<FeedNotice message={departureNote} />
					{/if}

					<RunnerCard runner={lead} size="lead" />

					{#if others.length > 0}
						<!-- The affordance is stated once, not on every row: three
						     identical prompts cost attention the page has not got, and
						     each row still names the action to a screen reader. -->
						<h2 class="also">
							Also running · {others.length}
							<span class="hint">tap any to lead with it</span>
						</h2>
						<ul class="list">
							{#each others as runner (runner.id)}
								<li>
									<RunnerCard {runner} size="row" onpromote={() => promote(runner.id)} />
								</li>
							{/each}
						</ul>
					{/if}
				{:else}
					{#if departureNote}
						<FeedNotice message={departureNote} />
					{/if}
					<NothingRunning {connected} {lastEventSecondsAgo} />
				{/if}
			</Container>
		</PageSection>

		<!-- Not part of the design: the feed and the corpus, driven by hand. -->
		<PageSection>
			<Container maxWidth="sm">
				<div class="harness" data-alfons-dev-chrome>
					<p>Prototype harness — not part of the page</p>
					<Button
						variant={scenario === 'running' ? 'secondary' : 'ghost'}
						size="sm"
						onclick={() => loadScenario('running')}>Four running</Button
					>
					<Button
						variant={scenario === 'empty' ? 'secondary' : 'ghost'}
						size="sm"
						onclick={() => loadScenario('empty')}>Nothing running</Button
					>
					<Button variant="ghost" size="sm" onclick={() => feedTransition('ATL-118')}>
						Feed: ATL-118 transitions
					</Button>
					<Button
						variant="ghost"
						size="sm"
						onclick={() => leadId && feedCompletion(leadId)}
						disabled={!leadId}
					>
						Feed: the lead finishes
					</Button>
					<Button variant="ghost" size="sm" onclick={() => (connected = !connected)}>
						Feed: {connected ? 'drop' : 'reconnect'}
					</Button>
				</div>
			</Container>
		</PageSection>
	</main>
</PageFrame>

<style>
	/* Status colour, declared once for the whole page and mapped from a
	   data-status attribute rather than interpolated into a var() name — an
	   attribute selector is both readable and visible to the linter. Colour on
	   this page means "this is the state right now" and is never decoration;
	   every indicator that uses it also carries the word. */
	.whats-running :global([data-status='building']) {
		--status-colour: var(--amber);
	}

	.whats-running :global([data-status='verifying']) {
		--status-colour: var(--blush-pink);
	}

	h1 {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-3);
		margin: 0 0 var(--space-5);
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.count {
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.also {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-3);
		margin: var(--space-6) 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 500;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.hint {
		text-transform: none;
		letter-spacing: 0;
		color: var(--text-muted);
		opacity: var(--state-hover-opacity);
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* No visually-hidden utility is exported from the library, so the page
	   carries its own. */
	.offscreen {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}

	.harness {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
		padding-top: var(--space-5);
		border-top: 1px solid var(--border-glass);
	}

	.harness p {
		width: 100%;
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
