<script lang="ts">
	/**
	 * The corpus as one fixed arrangement, and the camera's level of detail.
	 *
	 * Every project is a territory, in the ledger's own order, and it is ALWAYS
	 * rendered — the map never rearranges and never omits, because spatial
	 * memory is the bet: ledger is always below atlas, gateway is always past
	 * motivka, and a reader who has panned this page twice knows the
	 * neighbourhood before they read a word.
	 *
	 * What varies with the camera is magnification, not arrangement. At the
	 * high camera a quiet territory is a thin strip and a territory with a
	 * runner shows that runner lit; with the camera on a place, that place
	 * expands in situ and everything off the camera's path dims and
	 * compresses. That is zoom as level of detail rather than as a CSS
	 * transform, and it is deliberate: a transform-scaled map renders its
	 * distant text unreadably small and its close text absurdly large, eats
	 * the phone's scroll gesture, and gives a screen reader nothing. Here the
	 * pan IS the page's own vertical scroll, every camera stop is a real
	 * focusable element, and the free pinch-pan canvas is declined rather than
	 * degraded.
	 *
	 * Territory heads are bare <button>s (raw-element): a camera stop is a
	 * full-width row with name, count and dots, which Button's centred pill is
	 * not. Same missing component the last two rounds reported.
	 */
	import type { Target } from './camera.ts';
	import { projects, releasesOf, type Project } from './corpus.ts';
	import type { RunningTask } from './tasks.ts';
	import ReleaseBlock from './ReleaseBlock.svelte';

	let {
		target,
		tasks,
		onGo,
		place
	}: {
		target: Target | null;
		tasks: RunningTask[];
		onGo: (next: Target) => void;
		place: (node: HTMLElement, key: string) => { destroy(): void };
	} = $props();

	function runnersIn(projectName: string): RunningTask[] {
		return tasks.filter((task) => task.project === projectName);
	}

	function runnersInRelease(slug: string): RunningTask[] {
		return tasks.filter((task) => task.release === slug);
	}

	function containsTarget(project: Project): boolean {
		if (target === null) return false;
		if (target.kind === 'project') return target.name === project.name;
		if (target.kind === 'release')
			return releasesOf(project.name).some((release) => release.slug === target.slug);
		return runnersIn(project.name).some((task) => task.id === target.id);
	}

	function positionOf(id: string): number {
		return tasks.findIndex((task) => task.id === id) + 1;
	}
</script>

<div class="map" role="group" aria-label="The corpus, every project and release">
	{#each projects as project (project.name)}
		{@const releases = releasesOf(project.name)}
		{@const runners = runnersIn(project.name)}
		{@const holdsCamera = containsTarget(project)}
		{@const expanded = target === null ? runners.length > 0 : holdsCamera}
		<section
			class="territory"
			data-dim={target !== null && !holdsCamera ? 'true' : undefined}
			tabindex="-1"
			use:place={`project/${project.name}`}
			aria-label="Project {project.name}, {releases.length} releases, {runners.length} running"
		>
			<button
				type="button"
				class="head"
				onclick={() => onGo({ kind: 'project', name: project.name })}
				aria-label="Project {project.name}. Move the camera to it."
			>
				<span class="project">{project.name}</span>
				<span class="count">
					{releases.length}
					{releases.length === 1 ? 'release' : 'releases'}
					{#if runners.length > 0}&middot; {runners.length} running{/if}
				</span>
			</button>

			{#if target?.kind === 'project' && target.name === project.name}
				<p class="blurb">{project.blurb}</p>
			{/if}

			{#if expanded && releases.length > 0}
				<div class="releases">
					{#each releases as release (release.slug)}
						{@const own = runnersInRelease(release.slug)}
						<ReleaseBlock
							{release}
							runners={own}
							form={target?.kind === 'release' && target.slug === release.slug
								? 'open'
								: own.length > 0
									? 'lit'
									: 'thin'}
							openTaskId={target?.kind === 'task' ? target.id : null}
							{positionOf}
							runnersTotal={tasks.length}
							onGoRelease={() => onGo({ kind: 'release', slug: release.slug })}
							onGoTask={(id) => onGo({ kind: 'task', id })}
							{place}
						/>
					{/each}
				</div>
			{:else if releases.length === 0}
				<p class="none">no releases recorded</p>
			{/if}
		</section>
	{/each}
</div>

<style>
	.map {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.territory {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		/* Depth of field, not disappearance: with the camera on a place, the rest
		   of the corpus stays exactly where it was, at reading distance's expense.
		   Opacity only — a dimmed territory keeps whatever colour it had. */
		transition: opacity var(--transition-normal);
	}

	.territory[data-dim='true'] {
		opacity: var(--opacity-tertiary);
	}

	.territory:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	@media (prefers-reduced-motion: reduce) {
		.territory {
			transition: none;
		}
	}

	.head {
		appearance: none;
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		width: 100%;
		/* Not --filter-control-height: it drops under 44px from 640px up.
		   --space-7 is 48px everywhere. Inherited finding, re-reported. */
		min-height: var(--space-7);
		padding: var(--space-2) var(--space-3);
		text-align: left;
		background: transparent;
		border: none;
		border-top: 1px solid var(--border-glass);
		color: var(--text-primary);
		cursor: pointer;
	}

	.head:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	.project {
		font-family: var(--font-mono);
		font-size: var(--text-ui);
		letter-spacing: 0.04em;
		color: var(--text-primary);
	}

	.count {
		margin-left: auto;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		white-space: nowrap;
	}

	.blurb {
		margin: 0;
		padding-inline: var(--space-3);
		font-size: var(--text-ui);
		line-height: 1.45;
		color: var(--text-secondary);
	}

	.releases {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-left: var(--space-3);
	}

	.none {
		margin: 0;
		padding-inline: var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
