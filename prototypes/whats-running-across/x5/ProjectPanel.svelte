<script lang="ts">
	/**
	 * One project, as a panel on the top level of the surface.
	 *
	 * A project holds releases and nothing else the reader asked for, so that is
	 * all this panel is: one line about the project, then its releases. No task
	 * count rolled up across the project, no chart — those would be the corpus
	 * browser the brief refused, arriving by the door the relaxation opened.
	 *
	 * A release row is a control, and what it does is the grammar, not a push:
	 * tapping it moves the vertical anchor to that release and goes down one
	 * level. In the stack model this jump was forbidden outright when the
	 * release was already "open below"; on a surface there is nothing to be
	 * open below, so the row is always live and always means the same thing.
	 *
	 * Projects with no releases in the corpus say so in text, and the axis bar
	 * disables its down control while the reader stands here — an honest floor,
	 * not a broken lift.
	 */
	import { Icon } from '@alfons/design';
	import type { Project, Release } from './corpus.ts';

	let {
		project,
		releases,
		onDiveToRelease
	}: {
		project: Project;
		releases: Release[];
		/** Down the vertical axis, anchored to this release. */
		onDiveToRelease: (slug: string) => void;
	} = $props();
</script>

<article class="panel" aria-label="Project {project.name}">
	<header class="naming">
		<p class="rank">Project</p>
		<h2 class="name">{project.name}</h2>
		<p class="blurb">{project.blurb}</p>
	</header>

	<h3 class="heading">Releases &middot; {releases.length}</h3>

	{#if releases.length === 0}
		<p class="none">No releases recorded under this project yet. There is nothing below here.</p>
	{:else}
		<ul class="releases">
			{#each releases as release (release.slug)}
				<li>
					<!-- A bare <button>. A release row is a three-line block filling the
					     panel's width; Button is a centred pill with a fixed height.
					     The same missing component the last two rounds reported. -->
					<button type="button" class="row" onclick={() => onDiveToRelease(release.slug)}>
						<span class="slug">
							{release.slug}
							<Icon name="chevron-down" size="sm" />
						</span>
						<span class="title">{release.title}</span>
						<span class="meta">
							{release.taskCount} tasks &middot; {release.documentedOn
								? `documented ${release.documentedOn}`
								: 'not documented'}
						</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</article>

<style>
	.panel {
		display: flex;
		flex-direction: column;
		height: max-content;
		min-height: 100%;
		padding: var(--space-4);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
	}

	.naming {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		margin-bottom: var(--space-5);
	}

	.rank {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.name {
		margin: 0;
		font-family: var(--font-display);
		/* The type scale stops at --text-lead; the ceiling is a literal no token
		   would have prevented. Same clamp the release panel carries. */
		font-size: clamp(var(--text-lead), 6vw, 1.75rem);
		line-height: 1.15;
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}

	.blurb {
		margin: 0;
		font-size: var(--text-ui);
		line-height: 1.45;
		color: var(--text-secondary);
	}

	.heading {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
		padding-bottom: var(--space-2);
		border-bottom: 1px solid var(--card-border);
	}

	.none {
		margin: 0;
		font-size: var(--text-caption);
		line-height: 1.5;
		color: var(--text-muted);
	}

	.releases {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	/* --space-7, not --filter-control-height: that token drops to 2.25rem from
	   640px up and lands under the 44px touch minimum. Measured last round. */
	.row {
		appearance: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
		min-height: var(--space-7);
		padding: var(--space-3);
		text-align: left;
		background: var(--surface-hover-subtle);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
	}

	.row:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	.slug {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-primary);
		overflow-wrap: anywhere;
	}

	.title {
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
