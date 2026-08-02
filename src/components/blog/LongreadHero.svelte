<script lang="ts">
	/**
	 * LongreadHero — the article opener: mono kicker, display title, lead
	 * standfirst and a mono meta row. Centred on the article axis. The
	 * standfirst is body copy, so it carries --text-primary; only the kicker
	 * and meta row use supporting greys.
	 */
	interface Props {
		kicker?: string;
		title: string;
		standfirst?: string;
		/** Short facts joined with a middle dot, e.g. dates or dataset counts. */
		meta?: string[];
	}

	let { kicker, title, standfirst, meta = [] }: Props = $props();
</script>

<header class="longread-hero">
	{#if kicker}
		<p class="hero-kicker">{kicker}</p>
	{/if}
	<h1 class="hero-title">{title}</h1>
	{#if standfirst}
		<p class="hero-standfirst">{standfirst}</p>
	{/if}
	{#if meta.length > 0}
		<p class="hero-meta">{meta.join(' · ')}</p>
	{/if}
</header>

<style>
	.longread-hero {
		text-align: center;
		padding: var(--space-7) 0 var(--space-5);
		max-width: 46rem;
	}

	.hero-kicker {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 var(--space-4);
	}

	.hero-title {
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 6vw, 4rem);
		line-height: 1.02;
		color: var(--text-primary);
		margin: 0 0 var(--space-5);
	}

	.hero-standfirst {
		font-family: var(--font-display);
		font-size: var(--text-lead);
		line-height: 1.55;
		color: var(--text-primary);
		max-width: 36rem;
		margin: 0 auto var(--space-5);
	}

	.hero-meta {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
		margin: 0;
	}
</style>
