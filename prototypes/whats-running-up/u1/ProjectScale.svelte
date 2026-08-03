<script lang="ts">
	/**
	 * The fourth rung: the project the release belongs to, and the top of the
	 * ladder.
	 *
	 * The seam this approach was built to find is here rather than one rung
	 * lower. Card, grid and release are all views of tasks — the marked thing
	 * stays a task the whole way out. Between release and project the marked
	 * thing changes species: `prototype-loop-v1` was the frame a moment ago and
	 * is now an item inside one. That is the one move on the ladder where the
	 * reader is not looking at a wider view of what they were looking at, and no
	 * amount of matching chrome disguises it. It is rendered to match anyway, so
	 * the round can judge how much the mismatch actually costs.
	 *
	 * What it holds is deliberately thin: the project's releases, each with the
	 * facts that distinguish one from another — how many tasks, how many are
	 * running, whether it has been written up. Not its tasks, not a search over
	 * it, not the other ten projects. The ladder only ever reaches the ancestors
	 * of something already running, and the top of it is one project, not a list
	 * of them.
	 */
	import { documentedLine, releases, runningIn, type Project } from './hierarchy.ts';

	let {
		project,
		currentReleaseSlug
	}: { project: Project; currentReleaseSlug: string } = $props();

	let element = $state<HTMLElement | null>(null);

	export function focus() {
		element?.focus();
	}

	const held = $derived(project.releases.map((slug) => releases[slug]).filter(Boolean));
	const taskTotal = $derived(held.reduce((sum, release) => sum + release.taskCount, 0));
	const runningTotal = $derived(held.reduce((sum, release) => sum + runningIn(release), 0));
</script>

<section
	class="project"
	bind:this={element}
	tabindex="-1"
	aria-label="Project {project.slug}, holding {held.length} releases"
>
	<header class="identity">
		<p class="eyebrow">Project</p>
		<h2 class="slug">{project.slug}</h2>
		<p class="facts">
			<span>{held.length} releases</span>
			<span class="sep" aria-hidden="true">/</span>
			<span>{taskTotal} tasks</span>
			<span class="sep" aria-hidden="true">/</span>
			<span>{runningTotal} running</span>
		</p>
	</header>

	<!-- Scrolls if a project outgrows the screen. No horizontal gesture lives at
	     this rung, so a scroll container here cannot eat one. -->
	<ul class="releases">
		{#each held as release (release.slug)}
			<li
				class="release"
				aria-current={release.slug === currentReleaseSlug ? 'true' : undefined}
			>
				<p class="release-slug">
					{release.slug}
					{#if release.slug === currentReleaseSlug}
						<!-- Same thread as everywhere else on the ladder: the thing the
						     reader came from stays marked at the wider scale. -->
						<span class="here">here</span>
					{/if}
				</p>
				<p class="release-title">{release.title}</p>
				<p class="release-facts">
					<span>{release.taskCount} tasks</span>
					<span class="sep" aria-hidden="true">/</span>
					<span>{runningIn(release)} running</span>
					<span class="sep" aria-hidden="true">/</span>
					<span>{documentedLine(release)}</span>
				</p>
			</li>
		{/each}
	</ul>
</section>

<style>
	.project {
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding: var(--space-5);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		overflow: clip;
	}

	.project:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: calc(var(--space-1) * -1);
	}

	.identity {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		flex: none;
	}

	.eyebrow {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* Largest name on the ladder because it is the widest thing on it. The type
	   scale stops at --text-lead, so the ceiling is a literal. */
	.slug {
		margin: 0;
		font-family: var(--font-mono);
		font-size: clamp(var(--text-lead), min(9vw, 5vh), 2.125rem);
		line-height: 1.1;
		color: var(--text-primary);
	}

	.facts {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.sep {
		color: var(--text-muted);
	}

	.releases {
		margin: 0;
		padding-top: var(--space-4);
		padding-inline: 0;
		list-style: none;
		flex: 1;
		min-height: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		border-top: 1px solid var(--card-border);
		overflow-y: auto;
		overflow-x: hidden;
	}

	.release {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-3);
		border-left: 2px solid var(--border-glass);
	}

	/* Neutral. A release is not a status and takes no status colour. */
	.release[aria-current='true'] {
		background: var(--surface-hover-subtle);
		border-left-color: var(--text-primary);
	}

	.release-slug {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-primary);
	}

	.here {
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-primary);
	}

	/* Two lines, for the same reason as the release panel's own title: this list
	   is a list of releases, and a title allowed to run to three lines turns two
	   rows into a scroll. */
	.release-title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-caption);
		line-height: 1.35;
		color: var(--text-secondary);
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		overflow: hidden;
	}

	.release-facts {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
