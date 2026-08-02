<script lang="ts">
	/**
	 * The master rail: search at its head, then every release, always on the page.
	 *
	 * This is the approach's whole premise — the index never collapses and is
	 * never covered, so "what else is in this release" is answerable without
	 * dismissing anything. Search sits at the head of the rail rather than in a
	 * toolbar corner, because it is the front door to the same column it filters.
	 */
	import { Input } from '@alfons/design';
	import type { Release, Task, TaskStatus } from './corpus.ts';

	interface Props {
		releases: Release[];
		tasks: Task[];
		query: string;
		selectedRelease: string;
		resultCount: number;
		onQuery: (value: string) => void;
		onSelectRelease: (slug: string) => void;
	}

	const {
		releases,
		tasks,
		query,
		selectedRelease,
		resultCount,
		onQuery,
		onSelectRelease
	}: Props = $props();

	/** A release's live status, summarised to the single most urgent state it holds. */
	function dominantStatus(slug: string): TaskStatus | null {
		const held = tasks.filter((task) => task.release === slug).map((task) => task.status);
		if (held.length === 0) return null;
		const priority: TaskStatus[] = ['blocked', 'verifying', 'building', 'triaged', 'pending', 'done'];
		return priority.find((status) => held.includes(status)) ?? held[0];
	}

	const grouped = $derived.by(() => {
		// A plain record rather than a Map: a grouping intermediate, not state.
		const byProject: Record<string, Release[]> = {};
		for (const release of releases) {
			(byProject[release.project] ??= []).push(release);
		}
		return Object.keys(byProject)
			.sort((a, b) => a.localeCompare(b))
			.map((project) => [project, byProject[project]] as const);
	});
</script>

<nav class="rail" aria-label="Release index">
	<div class="search">
		<label class="search-label" for="ledger-search">Find a task</label>
		<Input
			id="ledger-search"
			type="search"
			placeholder="A fragment of the title…"
			value={query}
			oninput={(event: Event) => onQuery((event.currentTarget as HTMLInputElement).value)}
		/>
		<p class="search-hint" role="status">
			{#if query}
				{resultCount} match{resultCount === 1 ? '' : 'es'} across the corpus
			{:else}
				Searches titles across every release and project
			{/if}
		</p>
	</div>

	<div class="index">
		<h2 class="index-heading">Releases</h2>
		{#each grouped as [project, projectReleases] (project)}
			<section class="project">
				<h3 class="project-name">{project}</h3>
				<ul class="release-list">
					{#each projectReleases as release (release.slug)}
						{@const status = dominantStatus(release.slug)}
						<li>
							<button
								type="button"
								class="release"
								data-selected={release.slug === selectedRelease}
								aria-current={release.slug === selectedRelease ? 'true' : undefined}
								onclick={() => onSelectRelease(release.slug)}
							>
								<span class="release-rail" aria-hidden="true"></span>
								<span class="release-body">
									<span class="release-slug">{release.slug}</span>
									<span class="release-title">{release.title}</span>
								</span>
								<span class="release-meta">
									{#if status}
										<span
											class="release-state"
											style="--state-colour: var(--status-{status});"
											title="Most urgent state held: {status}"
										>
											<span class="sr-only">most urgent state {status}</span>
										</span>
									{/if}
									<span class="release-count">{release.taskCount}</span>
								</span>
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	</div>
</nav>

<style>
	.rail {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		/* The rail scrolls independently so a long index never pushes the dossier down. */
		max-height: calc(100vh - var(--header-height) - var(--space-8));
		overflow-y: auto;
		padding-right: var(--space-3);
	}

	.search {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		position: sticky;
		top: 0;
		z-index: var(--z-raised);
		background: var(--bg-primary);
		padding-bottom: var(--space-3);
	}

	.search-label {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		color: var(--text-primary);
	}

	.search-hint {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.index {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.index-heading {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.12em;
		color: var(--text-muted);
	}

	.project {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.project-name {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		color: var(--text-secondary);
		padding-bottom: var(--space-1);
		border-bottom: 1px solid var(--card-border);
	}

	.release-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.release {
		display: flex;
		align-items: flex-start;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-3) var(--space-2) var(--space-3) 0;
		background: transparent;
		border: 0;
		text-align: left;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.release:hover {
		background: var(--surface-hover-subtle);
	}

	.release[data-selected='true'] {
		background: var(--accent-bg-subtle);
	}

	.release:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: -2px;
	}

	.release-rail {
		flex: none;
		align-self: stretch;
		width: 2px;
		background: transparent;
	}

	.release[data-selected='true'] .release-rail {
		background: var(--accent);
	}

	.release-body {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
		flex: 1;
	}

	.release-slug {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-primary);
	}

	.release-title {
		font-family: var(--font-body);
		font-size: var(--text-micro);
		line-height: 1.4;
		color: var(--text-muted);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.release-meta {
		display: flex;
		flex: none;
		align-items: center;
		gap: var(--space-2);
	}

	/* A bar, not a dot: shape carries alongside the colour here too. */
	.release-state {
		width: 3px;
		height: 12px;
		border-radius: 2px;
		background: var(--state-colour);
	}

	.release-count {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
