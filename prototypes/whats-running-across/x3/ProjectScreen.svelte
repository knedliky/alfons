<script lang="ts">
	/**
	 * A project, as a destination: one line about it, then its releases.
	 *
	 * Inherited restraint: no rolled-up task counts, no activity summary, no
	 * chart — the corpus browser the brief refused does not arrive by the door
	 * the relaxation opened.
	 *
	 * One change from the winner: every release row is a destination, including
	 * the one the reader just came from. The stack rendered an already-open
	 * release as inert text to stop release → project → release growing a
	 * frame per jump; in the trail model nothing stacks — opening a release
	 * replaces this screen — so the guard has nothing to guard and the model
	 * forbids no jump. The loop lives in the browser's history, where it is
	 * simply the journey, and on the trail it is one chip per place however
	 * often the reader circles.
	 */
	import type { Project, Release } from './corpus.ts';

	let {
		project,
		releases,
		onOpenRelease
	}: {
		project: Project;
		releases: Release[];
		onOpenRelease: (slug: string, opener: HTMLElement) => void;
	} = $props();
</script>

<p class="blurb">{project.blurb}</p>

<h3 class="heading">Releases &middot; {releases.length}</h3>

<ul class="releases">
	{#each releases as release (release.slug)}
		<li>
			<!-- A bare <button>: a three-line block filling the screen's width;
			     Button is a centred pill with a fixed height. Same reported gap. -->
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
