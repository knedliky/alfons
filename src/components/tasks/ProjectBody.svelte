<script lang="ts" module>
	export interface ProjectBodyProps {
		project: ProjectSummary;
		releases: ReleaseSummary[];
		onPeekRelease: (slug: string, opener: HTMLElement) => void;
	}
</script>

<script lang="ts">
	/**
	 * ProjectBody — a project's substance, rendered the same in a peek and in
	 * the place.
	 *
	 * One line about it, then its releases — nothing else, because anything more
	 * is a corpus browser, which this is not. Every release row is a tappable
	 * glance carrying the "peek" cue; nothing renders as inert text, and what
	 * changes for a release already open beneath the reader is what committing
	 * means — a return, not a push — which is the page's decision, not this
	 * component's.
	 *
	 * Usage:
	 *   <ProjectBody {project} {releases} onPeekRelease={raise} />
	 */
	import DestinationRow from '../atoms/DestinationRow.svelte';
	import type { ProjectSummary, ReleaseSummary } from './types.js';

	let { project, releases, onPeekRelease }: ProjectBodyProps = $props();

	function metaLine(release: ReleaseSummary): string {
		const documented = release.documentedOn
			? `documented ${release.documentedOn}`
			: 'not documented';
		return `${release.taskCount} tasks · ${documented}`;
	}
</script>

<p class="blurb">{project.blurb}</p>

<h3 class="heading">Releases &middot; {releases.length}</h3>

<ul class="releases">
	{#each releases as release (release.slug)}
		<li>
			<DestinationRow
				name={release.slug}
				secondary={release.title}
				meta={metaLine(release)}
				cue="peek"
				onactivate={(opener) => onPeekRelease(release.slug, opener)}
			/>
		</li>
	{/each}
</ul>

<style>
	.blurb {
		margin: 0 0 var(--space-4);
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
</style>
