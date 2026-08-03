<script lang="ts">
	/**
	 * One running task, at either of the two sizes this page uses.
	 *
	 * A lead and a list row are the same task, not two designs. The spine is
	 * identical and in the same order at both sizes — status word, id, age,
	 * title, project and release — so when the feed or a tap moves a task from
	 * the list into the lead, the reader recognises the thing that moved. The
	 * lead only adds: it never rearranges.
	 *
	 * The row is the whole tappable target, because being wrong about the lead
	 * has to cost one unmissable tap and nothing else. It promotes in place; it
	 * does not navigate.
	 */
	import { Card } from '@alfons/design';
	import StageRail from './StageRail.svelte';
	import StatusFlag from './StatusFlag.svelte';
	import { describeAge, type Runner } from './runners.ts';

	let {
		runner,
		size,
		onpromote
	}: {
		runner: Runner;
		size: 'lead' | 'row';
		onpromote?: () => void;
	} = $props();

	const where = $derived(`${runner.project} · ${runner.release} · phase ${runner.phase}`);
</script>

{#snippet spine()}
	<div class="spine">
		<StatusFlag status={runner.status} {size} />
		<span class="id">{runner.id}</span>
		<span class="age">{describeAge(runner.movedSecondsAgo)}</span>
	</div>
{/snippet}

{#if size === 'lead'}
	<Card variant="elevated" class="runner lead" data-status={runner.status}>
		{@render spine()}
		<h2 class="title">{runner.title}</h2>
		<p class="where">{where}</p>
		<StageRail
			status={runner.status}
			latestAttempt={runner.latestAttempt}
			latestVerdict={runner.latestVerdict}
		/>
		<p class="counts">
			{runner.criterionCount} criteria · {runner.stepCount} steps · {runner.fileChangeCount} files
		</p>
		<p class="counts">
			{runner.type} · {runner.risk} risk · filed {runner.createdOn}
		</p>
	</Card>
{:else}
	<Card
		as="button"
		type="button"
		variant="interactive"
		size="compact"
		class="runner row"
		data-status={runner.status}
		aria-label="Lead with {runner.id}, {runner.status}: {runner.title}"
		onclick={onpromote}
	>
		{@render spine()}
		<p class="title">{runner.title}</p>
		<p class="where">{where}</p>
	</Card>
{/if}

<style>
	/* Card owns the surface; these rules own the contents. :global is how a
	   consumer styles into a library component's slot. */
	:global(.runner) {
		display: block;
		width: 100%;
		text-align: left;
	}

	:global(.runner.row) {
		/* Generous well past the 44px floor: the whole row is the target, and
		   this is a page read one-handed. */
		min-height: var(--space-8);
		cursor: pointer;
	}

	.spine {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		margin-bottom: var(--space-3);
	}

	.id {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.04em;
		color: var(--text-secondary);
	}

	.age {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.title {
		margin: 0 0 var(--space-2);
		font-family: var(--font-display);
		font-weight: 500;
		line-height: 1.25;
		color: var(--text-primary);
		text-wrap: balance;
	}

	/* The typography scale stops at --text-lead (1.25rem), and the lead task is
	   the one thing on this page that wants a display voice. Recorded as a
	   deviation in round.json. */
	:global(.runner.lead) .title {
		font-size: 1.625rem;
	}

	:global(.runner.row) .title {
		font-size: var(--text-ui);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}

	.where {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	:global(.runner.lead) .where {
		margin-bottom: var(--space-5);
	}

	.counts {
		margin: var(--space-2) 0 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	@media (min-width: 640px) {
		:global(.runner.lead) .title {
			font-size: 2rem;
		}
	}
</style>
