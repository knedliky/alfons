<script lang="ts">
	/**
	 * CommentsPlaceholder — where the article's comments sit, as a quiet stand-in.
	 *
	 * The round keeps comments' content and only explores their place on the
	 * page, so this renders the heading, a count and one sample reply in the
	 * column's own typography; the real thread replaces the body in production.
	 */
	interface Props {
		count: number;
	}

	let { count }: Props = $props();
</script>

<section class="comments-placeholder" aria-labelledby="comments-placeholder-heading">
	<h2 class="comments-placeholder__heading" id="comments-placeholder-heading">
		Comments <span class="comments-placeholder__count">{count}</span>
	</h2>
	<article class="comments-placeholder__comment">
		<p class="comments-placeholder__byline">A reader · 19 March 2026</p>
		<p class="comments-placeholder__body">
			The point about training someone else's agent stayed with me. Would you share how Motivka
			keeps its context on your own machine?
		</p>
	</article>
	<p class="comments-placeholder__note">The conversation continues on the published page.</p>
</section>

<style>
	.comments-placeholder__heading {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-weight: var(--fw-regular);
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
		color: var(--text-muted);
		margin: 0 0 var(--space-4);
	}

	.comments-placeholder__count {
		color: var(--text-secondary);
	}

	.comments-placeholder__comment {
		border-top: 1px solid var(--border-hairline);
		border-bottom: 1px solid var(--border-hairline);
		padding: var(--space-4) 0;
	}

	.comments-placeholder__byline {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
		margin: 0 0 var(--space-2);
	}

	.comments-placeholder__body {
		font-family: var(--font-display);
		font-size: var(--text-body);
		line-height: 1.85;
		color: var(--text-primary);
		margin: 0;
	}

	.comments-placeholder__note {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
		margin: var(--space-4) 0 0;
	}
</style>
