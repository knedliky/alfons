<script lang="ts">
	/**
	 * A project, as a destination: one line about it, then its releases.
	 *
	 * A project holds releases and nothing else the reader asked for, so that is
	 * all this screen is. No task count rolled up across the project, no activity
	 * summary, no chart — every one of those would be the corpus browser the
	 * brief refused, arriving by the door the relaxation opened.
	 *
	 * A release listed here is tappable, and that is the second push. It stops
	 * there: a release already open beneath this screen is rendered as a plain
	 * row rather than a destination, because tapping it would be a forward move
	 * to somewhere the reader is already standing, and that is exactly the loop
	 * — release, project, release, project — that lets a stack grow without end
	 * on a page whose whole argument was that it had no depth.
	 */
	import type { Project, Release } from './corpus.ts';

	let {
		project,
		releases,
		isOpen,
		onOpenRelease
	}: {
		project: Project;
		releases: Release[];
		/** True when that release is already a frame on the stack beneath this one. */
		isOpen: (slug: string) => boolean;
		onOpenRelease: (slug: string, opener: HTMLElement) => void;
	} = $props();
</script>

<p class="blurb">{project.blurb}</p>

<h3 class="heading">Releases &middot; {releases.length}</h3>

<ul class="releases">
	{#each releases as release (release.slug)}
		<li>
			{#if isOpen(release.slug)}
				<div class="row" data-open="true">
					<span class="slug">{release.slug} &middot; open below</span>
					<span class="title">{release.title}</span>
					<span class="meta">
						{release.taskCount} tasks &middot; {release.documentedOn
							? `documented ${release.documentedOn}`
							: 'not documented'}
					</span>
				</div>
			{:else}
				<!-- A bare <button>. A release row is a three-line block filling the
				     screen's width; Button is a centred pill with a fixed height.
				     Named in the report as a component the library does not have. -->
				<button
					type="button"
					class="row"
					onclick={(event) => onOpenRelease(release.slug, event.currentTarget)}
				>
					<span class="slug">{release.slug}</span>
					<span class="title">{release.title}</span>
					<span class="meta">
						{release.taskCount} tasks &middot; {release.documentedOn
							? `documented ${release.documentedOn}`
							: 'not documented'}
					</span>
				</button>
			{/if}
		</li>
	{/each}
</ul>

<style>
	.blurb {
		margin: 0 0 var(--space-5);
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

	.releases {
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
		/* Not --filter-control-height: that token drops to 2.25rem from 640px up
		   and lands under the 44px touch minimum. --space-7 is 48px everywhere. */
		min-height: var(--space-7);
		padding: var(--space-3);
		text-align: left;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
	}

	/* Already beneath you on the stack: still readable, not a target. */
	.row[data-open='true'] {
		background: var(--surface-hover-subtle);
		cursor: default;
		color: var(--text-muted);
	}

	.row:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	.slug {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: inherit;
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
