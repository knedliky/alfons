<script lang="ts" module>
	export interface RelatedArticle {
		slug: string;
		category: string;
		title: string;
		publishedLabel: string;
	}
</script>

<script lang="ts">
	/**
	 * RelatedArticles — what to read next, set as a plain ruled list in the same
	 * column as the essay rather than a grid of raised cards.
	 *
	 * Each row is one link: category and date in supporting grey above a title in
	 * the reading serif, so the list reads like the end matter of a printed book.
	 */
	interface Props {
		articles: RelatedArticle[];
	}

	let { articles }: Props = $props();
</script>

<section class="related-articles" aria-labelledby="related-articles-heading">
	<h2 class="related-articles__heading" id="related-articles-heading">Keep reading</h2>
	<ul class="related-articles__list">
		{#each articles as related (related.slug)}
			<li class="related-articles__item">
				<a class="related-articles__link" href="/blog/{related.slug}">
					<span class="related-articles__meta">
						{related.category} · {related.publishedLabel}
					</span>
					<span class="related-articles__title">{related.title}</span>
				</a>
			</li>
		{/each}
	</ul>
</section>

<style>
	.related-articles__heading {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-weight: var(--fw-regular);
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 var(--space-4);
	}

	.related-articles__list {
		list-style: none;
		margin: 0;
		padding: 0;
		border-top: 1px solid var(--border-hairline);
	}

	.related-articles__item {
		border-bottom: 1px solid var(--border-hairline);
	}

	.related-articles__link {
		display: grid;
		gap: var(--space-1);
		padding: var(--space-4) 0;
		text-decoration: none;
	}

	.related-articles__link:focus-visible {
		outline: 2px solid var(--focus);
		outline-offset: var(--space-1);
	}

	.related-articles__meta {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}

	.related-articles__title {
		font: var(--type-h3);
		color: var(--text-primary);
		transition: color var(--transition-fast);
	}

	.related-articles__link:hover .related-articles__title {
		color: var(--accent);
	}
</style>
