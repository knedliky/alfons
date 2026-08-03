<script lang="ts">
	/**
	 * What's running — approach 5 of 5: The live instrument.
	 *
	 * Direction: design the page around the event feed itself, so what is
	 * rendered is motion. The other four readings of this brief render current
	 * state and let the feed patch it; this one renders the feed and lets state
	 * fall out of it. The consequence that matters is that a task can be shown
	 * FINISHING rather than merely vanishing, and a finish and a block can be
	 * told apart — which no state-first page can do at all.
	 *
	 * Restraint is the whole risk. An instrument that animates is harder to read
	 * at a glance than a list, so motion is spent only where it carries meaning
	 * that would otherwise need a word: a channel arriving, a head advancing, a
	 * departure settling or halting, and — on the empty page — a single sweep
	 * that says the feed is alive. Nothing else moves.
	 *
	 * Scenes for watching, chosen by query string because no on-page control
	 * earns its place against one second of attention:
	 *   /dev/whats-running/n5                 the full cycle, four draining to none
	 *   /dev/whats-running/n5?scene=running   four running, held still
	 *   /dev/whats-running/n5?scene=idle      nothing running, held still
	 */
	import { Container, Footer, Header, PageFrame, PageSection } from '@alfons/design';
	import IdleInstrument from './IdleInstrument.svelte';
	import RunnerChannel from './RunnerChannel.svelte';
	import Tape from './Tape.svelte';
	import { countWord, createInstrument, sceneFromLocation } from './feed.svelte.ts';

	const instrument = createInstrument(sceneFromLocation());

	$effect(() => instrument.start());

	const headline = $derived(
		instrument.liveCount === 0 ? 'Nothing running' : `${countWord(instrument.liveCount)} running`
	);
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}

	<main class="instrument">
		<PageSection>
			<Container maxWidth="sm">
				<div class="stack">
					<header class="verdict">
						<!-- Only the count is announced. An arrival or a departure changes
						     it and is worth a word; a task advancing from building to
						     verifying does not, and announcing every transition would
						     flood a screen reader with the page's own metronome. -->
						<h1 aria-live="polite" aria-atomic="true">{headline}</h1>

						{#if instrument.liveCount > 0}
							<p class="tally">
								{#if instrument.buildingCount > 0}
									<span class="part" data-status="building">
										{instrument.buildingCount} building
									</span>
								{/if}
								{#if instrument.verifyingCount > 0}
									<span class="part" data-status="verifying">
										{instrument.verifyingCount} verifying
									</span>
								{/if}
							</p>
						{/if}
					</header>

					{#if instrument.runners.length > 0}
						<div class="channels">
							{#each instrument.runners as task (task.id)}
								<RunnerChannel {task} now={instrument.now} />
							{/each}
						</div>
						<Tape entries={instrument.tape} />
					{:else}
						<IdleInstrument lastMovement={instrument.lastMovement} now={instrument.now} />
					{/if}
				</div>
			</Container>
		</PageSection>
	</main>
</PageFrame>

<style>
	/*
	 * Status colour, declared once for the page. building and verifying are the
	 * only two states this page can show, and these two hues mean those two
	 * things and nothing else anywhere on the page — no accent, no atmosphere,
	 * no gradient. Every place a hue appears, the matching word appears with it.
	 *
	 * --sweep-duration is local because the motion scale stops at 500ms and the
	 * only long token, --widget-pulse-duration, is a breath rather than a
	 * traverse. It is derived from that token rather than invented, so the page
	 * still moves on the library's clock.
	 */
	.instrument {
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--sweep-duration: calc(var(--widget-pulse-duration) * 2);
	}

	.stack {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.verdict {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	/* The type scale stops at --text-lead, which is not a headline. Derived
	   from it rather than typed as a literal so it still tracks the scale. */
	h1 {
		margin: 0;
		font-family: var(--font-display);
		font-size: calc(var(--text-lead) * 2);
		line-height: 1.05;
		font-weight: 400;
		color: var(--text-primary);
	}

	.tally {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.part {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.part::before {
		content: '';
		width: var(--space-2);
		height: var(--space-2);
		background: currentcolor;
	}

	.part[data-status='building'] {
		color: var(--status-building);
	}

	.part[data-status='verifying'] {
		color: var(--status-verifying);
	}

	.channels {
		display: flex;
		flex-direction: column;
	}

	/* Wider than a phone, the instrument stays a column. It is not a dashboard
	   that grew; the extra width goes to the title, which is the thing a reader
	   actually wants more room for. */
	@media (min-width: 720px) {
		h1 {
			font-size: calc(var(--text-lead) * 2.6);
		}
	}
</style>
