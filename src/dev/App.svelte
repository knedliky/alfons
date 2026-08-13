<script lang="ts">
	/**
	 * The prototyping surface at /dev.
	 *
	 * Rounds are discovered from the tree, not from a registry: import.meta.glob
	 * over prototypes/ means provisioning a round is writing files, and HMR makes
	 * them appear with nothing to restart. Routing is /dev/<page>/<approach>,
	 * history-based, so the URL a round is announced at is the URL it lives at.
	 */
	import type { Component } from 'svelte';
	import type { Round } from './types.ts';
	import ApproachPager from './ApproachPager.svelte';
	import RoundIndex from './RoundIndex.svelte';
	import WorkGlow from './WorkGlow.svelte';

	const roundFiles = import.meta.glob('../../prototypes/*/round.json', { eager: true }) as Record<
		string,
		{ default: Round }
	>;
	const pageFiles = import.meta.glob('../../prototypes/*/*/Page.svelte') as Record<
		string,
		() => Promise<{ default: Component }>
	>;

	const rounds: Round[] = Object.values(roundFiles)
		.map((module) => module.default)
		.sort((a, b) => a.page.localeCompare(b.page));

	let path = $state(location.pathname);

	function navigate(to: string) {
		history.pushState({}, '', to);
		path = to;
	}

	const segments = $derived(
		path
			.replace(/^\/dev\/?/, '')
			.split('/')
			.filter(Boolean)
	);
	const round = $derived(rounds.find((candidate) => candidate.page === segments[0]) ?? null);
	const approach = $derived(
		round
			? (round.approaches.find((candidate) => candidate.slug === segments[1]) ??
					round.approaches[0] ??
					null)
			: null
	);

	// The page component loads lazily; tracking the key guards against a slow
	// load landing after the user has already paged on.
	let page = $state<Component | null>(null);
	$effect(() => {
		page = null;
		if (!round || !approach) return;
		const key = `../../prototypes/${round.page}/${approach.slug}/Page.svelte`;
		const load = pageFiles[key];
		if (!load) return;
		load().then((module) => {
			const stillCurrent =
				location.pathname === path && key.includes(`/${round.page}/${approach.slug}/`);
			if (stillCurrent) page = module.default;
		});
	});
</script>

<svelte:window onpopstate={() => (path = location.pathname)} />

{#if round && approach}
	{#if page}
		{@const Page = page}
		<Page />
	{:else}
		<p class="loading">Loading {round.title} — {approach.title}…</p>
	{/if}
	<ApproachPager {round} current={approach.slug} {navigate} />
{:else}
	<RoundIndex {rounds} {navigate} />
{/if}

<WorkGlow />

<style>
	.loading {
		padding: var(--space-8, 4rem);
		color: var(--text-muted);
	}
</style>
