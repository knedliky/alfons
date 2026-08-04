<script lang="ts">
	/**
	 * One running task, as a place on the map.
	 *
	 * At map distance it is a lit nameplate — the settled grid cell, standing
	 * where it lives: inside its release, inside its project. The five facts a
	 * cell carries are kept (state, name, elapsed, phase), minus the project
	 * and release lines the cell used to print, because on the map those are
	 * not facts to be printed — they are the ground the nameplate stands on,
	 * one line above it.
	 *
	 * With the camera on it, the same place expands in situ into the full
	 * card: identity, verdict, counts, meta — everything the winning card
	 * rendered. What it deliberately does NOT carry is the card's two
	 * destination buttons. The card earned those because a pushed screen
	 * covered all context; here the release header and the project header are
	 * already on screen, directly above, and they are the camera stops. Going
	 * up is tapping the ground the card visibly stands on — printing the same
	 * two names again as buttons would be the map telling the reader the same
	 * fact in two voices.
	 *
	 * A bare <button> for the closed form, flagged by review_markup as
	 * raw-element: a lit nameplate is a left-aligned grid of rule, mark, id
	 * and age filling its row, and Button is a centred pill. Same missing
	 * component the last two rounds named.
	 */
	import { elapsedSince, type RunningTask } from './tasks.ts';
	import StatusMark from './StatusMark.svelte';

	let {
		task,
		open,
		position,
		total,
		onOpen,
		place
	}: {
		task: RunningTask;
		open: boolean;
		position: number;
		total: number;
		onOpen: () => void;
		place: (node: HTMLElement, key: string) => { destroy(): void };
	} = $props();

	const verdictLine = $derived(
		task.latestVerdict
			? `Attempt ${task.latestAttempt} — ${task.latestVerdict}`
			: 'No verification attempted yet'
	);
</script>

{#if open}
	<article
		class="card"
		data-status={task.status}
		tabindex="-1"
		use:place={`task/${task.id}`}
		role="group"
		aria-roledescription="task"
		aria-label="{position} of {total}: {task.id}, {task.status}"
	>
		<header class="identity">
			<div class="top">
				<StatusMark status={task.status} size="lead" />
				<span class="id">{task.id}</span>
			</div>
			<h4 class="title">{task.title}</h4>
		</header>

		<div class="progress">
			<p class="verdict">{verdictLine}</p>
			<dl class="counts">
				<div class="count">
					<dt>Phase</dt>
					<dd>{task.phase}</dd>
				</div>
				<div class="count">
					<dt>Criteria</dt>
					<dd>{task.criterionCount}</dd>
				</div>
				<div class="count">
					<dt>Steps</dt>
					<dd>{task.stepCount}</dd>
				</div>
				<div class="count">
					<dt>Files</dt>
					<dd>{task.fileChangeCount}</dd>
				</div>
			</dl>
			<p class="meta">
				{task.type} &middot; {task.risk} risk &middot; opened {elapsedSince(task.createdOn)} ago
			</p>
		</div>
	</article>
{:else}
	<button
		type="button"
		class="chip"
		data-status={task.status}
		aria-label="{task.id}, {task.status}, {position} of {total} running. Move the camera to it."
		onclick={onOpen}
	>
		<span class="rule" aria-hidden="true"></span>
		<span class="line">
			<StatusMark status={task.status} />
			<span class="chip-id">{task.id}</span>
			<span class="age">{elapsedSince(task.createdOn)} &middot; phase {task.phase}</span>
		</span>
	</button>
{/if}

<style>
	/* ---- the lit nameplate, at map distance ---- */

	.chip {
		appearance: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		width: 100%;
		min-height: var(--space-7);
		padding: var(--space-3);
		text-align: left;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
	}

	.rule {
		width: 100%;
		height: var(--space-1);
		background: var(--place-status-colour);
	}

	.chip[data-status='building'],
	.card[data-status='building'] {
		--place-status-colour: var(--status-building);
	}

	.chip[data-status='verifying'],
	.card[data-status='verifying'] {
		--place-status-colour: var(--status-verifying);
	}

	.line {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		min-width: 0;
	}

	.chip-id {
		font-family: var(--font-mono);
		font-size: var(--text-ui);
		letter-spacing: 0.02em;
		color: var(--text-primary);
	}

	.age {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		white-space: nowrap;
	}

	.chip:focus-visible,
	.card:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	/* ---- the same place with the camera on it ---- */

	.card {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		width: 100%;
		padding: var(--space-4);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-top: var(--space-1) solid var(--place-status-colour);
	}

	.identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.id {
		font-family: var(--font-mono);
		font-size: var(--text-ui);
		color: var(--text-secondary);
		letter-spacing: 0.04em;
	}

	.title {
		margin: 0;
		font-family: var(--font-display);
		/* The type scale stops at --text-lead, a caption size on the one task the
		   camera has singled out. The floor is the token; the ceiling is a
		   literal, and no token exists that would have prevented it. Inherited
		   finding, re-reported. */
		font-size: clamp(var(--text-lead), 6vw, 1.75rem);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	.progress {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding-top: var(--space-3);
		border-top: 1px solid var(--card-border);
	}

	/* Deliberately not status-coloured: amber and blush are spent on building
	   and verifying, and a tinted verdict would make colour mean two things. */
	.verdict {
		margin: 0;
		font-size: var(--text-ui);
		color: var(--text-secondary);
	}

	.counts {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--space-3);
	}

	.count {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.count dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.count dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-lead);
		color: var(--text-primary);
	}

	.meta {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
