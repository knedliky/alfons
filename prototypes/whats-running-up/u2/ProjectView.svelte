<script lang="ts">
	/**
	 * What a project segment opens.
	 *
	 * A project has almost nothing of its own — a name, a repository path, and a
	 * sentence about what it is for. What it has is releases, so that is what this
	 * page is: the list of them, each one a tap back down to the release view the
	 * middle segment opens.
	 *
	 * This is the top. There is no segment above `project`, so the line here is
	 * two long and the root is the only thing to its left. That is the shape of
	 * the corpus rather than a decision.
	 *
	 * Which releases are shown is the one judgement call here, and it is: all of
	 * them. A project view that showed only releases with something running would
	 * be the running view again with a different heading, and the reader who
	 * tapped `alfons` is asking what alfons is, not what alfons is doing this
	 * second. The running count is on each row, so the answer to the second
	 * question is still there.
	 */
	import StandingLine, { type Segment } from './StandingLine.svelte';
	import { releasesInProject, runningCount, type Project } from './hierarchy.ts';

	let {
		project,
		onOpenRunning,
		onOpenRelease
	}: {
		project: Project;
		onOpenRunning: () => void;
		onOpenRelease: (slug: string) => void;
	} = $props();

	const segments = $derived<Segment[]>([
		{ label: 'running', kind: 'running', onSelect: onOpenRunning },
		{ label: project.name, kind: 'project' }
	]);

	const releases = $derived(releasesInProject(project.name));
</script>

<section class="project" aria-label="Project {project.name}">
	<StandingLine {segments} label="Where {project.name} sits" />

	<div class="scroller">
		<header class="head">
			<h2 class="name">{project.name}</h2>
			<p class="blurb">{project.blurb}</p>
			<p class="repo">{project.repoPath}</p>
		</header>

		<div class="block">
			<h3 class="block-name">Releases</h3>
			<ul class="releases">
				{#each releases as release (release.slug)}
					{@const running = runningCount(release)}
					<li>
						<button
							type="button"
							class="row"
							aria-label="Release {release.slug}, {release.tasks.length} tasks, {running} running."
							onclick={() => onOpenRelease(release.slug)}
						>
							<span class="slug">{release.slug}</span>
							<span class="release-title">{release.title}</span>
							<span class="counts">
								{release.tasks.length} tasks &middot;
								{running} running &middot;
								{release.documentedOn ? `documented ${release.documentedOn}` : 'not documented'}
							</span>
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	/* Panel carries the border and padding so the line is inset with everything
	   else; the scroller is a sibling so the line cannot scroll away. Same shape
	   as the release view, deliberately. */
	.project {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
	}

	/* Same reasoning as the release view: a list up here may scroll, because the
	   deck and its swipe are not on screen. */
	.scroller {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		overscroll-behavior: contain;
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.name {
		margin: 0;
		font-family: var(--font-display);
		font-size: clamp(var(--text-lead), 6vw, 1.75rem);
		line-height: 1.2;
		color: var(--text-primary);
	}

	.blurb {
		margin: 0;
		font-size: var(--text-ui);
		line-height: 1.5;
		color: var(--text-secondary);
	}

	.repo {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}

	.block {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.block-name {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--card-border);
	}

	.releases {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
	}

	/* A bare <button>: a three-line row filling its width, which Button is not. */
	.row {
		appearance: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
		min-height: var(--filter-control-height);
		justify-content: center;
		text-align: left;
		padding: var(--space-3) 0;
		background: none;
		border: none;
		border-bottom: 1px solid var(--card-border);
		cursor: pointer;
	}

	.slug {
		font-family: var(--font-mono);
		font-size: var(--text-ui);
		color: var(--text-primary);
		letter-spacing: 0.02em;
		/* The row is the target; the slug is what says it goes somewhere, and it
		   says so standing still rather than on hover. */
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.release-title {
		font-size: var(--text-caption);
		line-height: 1.4;
		color: var(--text-secondary);
	}

	.counts {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.row:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: -2px;
	}
</style>
