<script lang="ts">
	/**
	 * LongreadProse — the flat longread body: the template's serif reading
	 * styles applied over sanitised article HTML.
	 *
	 * Mirrors LongreadSection's passage CSS (reading serif via --font-display,
	 * primary text, 1.85 leading, 42rem measure) without the numbered-section
	 * treatment — no divider, no scroll-focus dimming (D-111). The HTML it
	 * injects must already be sanitised server-side (renderArticleBody in
	 * $lib/server/markdown); this component never receives raw markdown or
	 * user input.
	 *
	 * Alternatively the consumer supplies a children snippet (ADH-051) —
	 * composed content, e.g. an html/island segment interleave — rendered
	 * inside the same prose styling instead of the html prop. When both are
	 * given, children wins.
	 */
	import type { Snippet } from 'svelte';

	interface Props {
		/**
		 * Pre-sanitised HTML only — this component injects the value via
		 * {@html} and performs no sanitisation of its own. Never pass raw
		 * markdown or user input. Atlas feeds this prop exclusively from its
		 * server-side sanitiser, renderArticleBody in $lib/server/markdown.ts.
		 * Ignored when children is provided.
		 */
		html?: string;
		/** Composed prose content rendered instead of the html prop. */
		children?: Snippet;
	}

	let { html = '', children }: Props = $props();
</script>

<div class="longread-prose">
	{#if children}
		{@render children()}
	{:else}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- Safe: sanitised by renderArticleBody's allow-list before it reaches this component. -->
		{@html html}
	{/if}
</div>

<style>
	.longread-prose {
		max-width: 42rem;
		width: 100%;
	}

	/* Template-wide prose mirrored from LongreadSection's passage rules:
	   reading serif (IBM Plex Serif via --font-display), primary text, and
	   1.85 leading — serif reads tighter than sans at the same leading, so
	   the editorial column needs the extra room to breathe. Body copy is
	   never a supporting grey. */
	.longread-prose :global(p),
	.longread-prose :global(li) {
		font-family: var(--font-display);
		font-size: var(--text-body);
		line-height: 1.85;
		color: var(--text-primary);
	}

	.longread-prose :global(p) {
		margin: 0 0 var(--space-5);
	}

	.longread-prose :global(ul),
	.longread-prose :global(ol) {
		margin: 0 0 var(--space-5);
		padding-left: var(--space-5);
	}

	.longread-prose :global(li) {
		margin: 0 0 var(--space-2);
	}

	.longread-prose :global(strong) {
		color: var(--text-primary);
		font-weight: 600;
	}

	/* Headings share the display serif; the h2 carries the between-passage
	   rhythm the numbered section titles used to provide. */
	.longread-prose :global(h2) {
		font-family: var(--font-display);
		font-size: 1.875rem;
		line-height: 1.2;
		color: var(--text-primary);
		margin: var(--space-6) 0 var(--space-4);
	}

	.longread-prose :global(h3) {
		font-family: var(--font-display);
		font-size: 1.375rem;
		line-height: 1.3;
		color: var(--text-primary);
		margin: var(--space-5) 0 var(--space-3);
	}

	/* Links keep body colour under an accent underline; hover turns them
	   fully accent. */
	.longread-prose :global(a) {
		color: var(--text-primary);
		text-decoration: underline;
		text-decoration-color: var(--accent);
		text-underline-offset: 0.2em;
		transition: color var(--transition-fast);
	}

	.longread-prose :global(a:hover) {
		color: var(--accent);
	}

	/* Article images bleed to the full measure; captions are mono microtype —
	   the one place grey text belongs (mirrors LongreadFigure's caption). */
	.longread-prose :global(img) {
		display: block;
		width: 100%;
		height: auto;
		border-radius: var(--radius-surface);
		margin: var(--space-6) 0;
	}

	.longread-prose :global(figure) {
		margin: var(--space-6) 0;
	}

	.longread-prose :global(figure img) {
		margin: 0;
	}

	.longread-prose :global(figcaption) {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
		margin-top: var(--space-3);
	}

	/* Pull-quote idiom: an accent rule with italic serif at lead size. */
	.longread-prose :global(blockquote) {
		border-left: 3px solid var(--accent);
		margin: var(--space-6) 0;
		padding: var(--space-2) 0 var(--space-2) var(--space-5);
		font-style: italic;
	}

	.longread-prose :global(blockquote p) {
		font-size: var(--text-lead);
		line-height: 1.6;
		margin: 0 0 var(--space-3);
	}

	.longread-prose :global(blockquote p:last-child) {
		margin-bottom: 0;
	}

	/* Inline code is mono on a subtle card wash. */
	.longread-prose :global(code) {
		font-family: var(--font-mono);
		font-size: 0.875em;
		color: var(--text-primary);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: 0;
		padding: 0.1em 0.35em;
	}

	/* Code blocks sit in mono on the card wash, scrolling sideways rather
	   than breaking the measure. */
	.longread-prose :global(pre) {
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-surface);
		padding: var(--space-4);
		margin: 0 0 var(--space-5);
		overflow-x: auto;
	}

	.longread-prose :global(pre code) {
		display: block;
		background: none;
		border: none;
		padding: 0;
		font-size: 0.875rem;
		line-height: 1.7;
	}

	.longread-prose :global(hr) {
		border: none;
		border-top: 1px solid var(--card-border);
		margin: var(--space-6) 0;
	}
</style>
