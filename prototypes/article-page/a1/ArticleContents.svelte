<script lang="ts" module>
	export interface ContentsEntry {
		id: string;
		label: string;
	}
</script>

<script lang="ts">
	/**
	 * ArticleContents — the article's sections as an inline, numbered list that
	 * sits in the reading flow under the opener, in place of a floating rail.
	 *
	 * Nothing about it is fixed or sticky: it is read once, like a book's
	 * contents page, and scrolls away with the opener. Each entry is an in-page
	 * link to its section, so the browser's own anchor jump does the navigating.
	 */
	interface Props {
		entries: ContentsEntry[];
	}

	let { entries }: Props = $props();
</script>

<nav class="article-contents" aria-labelledby="article-contents-heading">
	<p class="article-contents__heading" id="article-contents-heading">In this essay</p>
	<ol class="article-contents__list">
		{#each entries as entry, position (entry.id)}
			<li class="article-contents__entry">
				<span class="article-contents__number" aria-hidden="true">
					{String(position + 1).padStart(2, '0')}
				</span>
				<a class="article-contents__link" href="#{entry.id}">{entry.label}</a>
			</li>
		{/each}
	</ol>
</nav>

<style>
	.article-contents {
		border-top: 1px solid var(--border-hairline);
		border-bottom: 1px solid var(--border-hairline);
		padding: var(--space-5) 0;
	}

	.article-contents__heading {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 var(--space-4);
	}

	.article-contents__list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-2);
	}

	/* The numeral hangs in its own column so the titles share one left edge. */
	.article-contents__entry {
		display: grid;
		grid-template-columns: 2.5ch 1fr;
		column-gap: var(--space-3);
		align-items: baseline;
	}

	.article-contents__number {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}

	.article-contents__link {
		font-family: var(--font-display);
		font-size: var(--text-body);
		line-height: var(--lh-body);
		color: var(--text-primary);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.article-contents__link:hover {
		color: var(--accent);
	}

	.article-contents__link:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: var(--space-1);
	}
</style>
