<script lang="ts">
	/**
	 * Every project, as a list of destinations.
	 *
	 * This screen exists for one reason: the empty state. Pushed conceded that
	 * when nothing is running there is no way up at all, because the upward move
	 * lived only on a task. The rail dissolves that by offering "all projects"
	 * when it has no task to name — and this is where that tap lands.
	 *
	 * It is deliberately an index and nothing more: name, one line, how many
	 * releases. No task counts rolled up, no activity, no search — every one of
	 * those is the corpus browser the brief has refused for three rounds,
	 * arriving through the door the empty state opened.
	 */
	import type { Project } from './corpus.ts';

	let {
		projects,
		releaseCount,
		onOpenProject
	}: {
		projects: Project[];
		releaseCount: (name: string) => number;
		onOpenProject: (name: string, opener: HTMLElement) => void;
	} = $props();
</script>

<ul class="projects">
	{#each projects as project (project.name)}
		<li>
			<!-- The same bare <button> destination row Pushed reported: a
			     multi-line block filling the screen's width, which Button's
			     centred pill cannot be. -->
			<button
				type="button"
				class="row"
				onclick={(event) => onOpenProject(project.name, event.currentTarget)}
			>
				<span class="name">{project.name}</span>
				<span class="blurb">{project.blurb}</span>
				<span class="meta">{releaseCount(project.name)} releases here</span>
			</button>
		</li>
	{/each}
</ul>

<style>
	.projects {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.row {
		appearance: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
		/* --space-7 is 48px at every width; --filter-control-height is under the
		   44px touch minimum from 640px up. Same finding as Pushed, kept. */
		min-height: var(--space-7);
		padding: var(--space-3);
		text-align: left;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
	}

	.row:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	.name {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: inherit;
	}

	.blurb {
		font-size: var(--text-caption);
		line-height: 1.4;
		color: var(--text-secondary);
	}

	.meta {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
