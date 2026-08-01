<script lang="ts">
	/**
	 * LongreadProseSection — one heading-derived passage of a DB-backed
	 * article (ADH-033, amending D-111).
	 *
	 * The light sibling of LongreadSection: it registers with the host
	 * LongreadArticle's context so the progress rail tracks scroll focus,
	 * but renders only LongreadProse over sanitised section HTML — the
	 * markdown's own h2 is the heading, so no title is injected, and article
	 * prose never adopts the numbered-section opacity dimming. Registration
	 * is browser-only ($effect), so SSR output and no-JS readers get the
	 * full column; used outside a LongreadArticle the section renders as
	 * plain prose.
	 *
	 * Content arrives either as the html prop or as a children snippet
	 * (ADH-051) — composed segment content rendered inside the same prose
	 * styling. Both pass straight through to LongreadProse, where children
	 * wins when both are given.
	 */
	import type { Snippet } from 'svelte';
	import { getLongreadContext } from './context';
	import LongreadProse from './LongreadProse.svelte';

	interface Props {
		/** Rail label for this section — unique within the article (it doubles
		    as the render key upstream). */
		kicker: string;
		/**
		 * Pre-sanitised HTML only — passed straight through to LongreadProse,
		 * which injects it via {@html} and performs no sanitisation of its
		 * own. Never pass raw markdown or user input. One heading-derived
		 * slice of the article body, opening h2 included. Atlas feeds this
		 * prop exclusively from its server-side sanitiser, renderArticleSections
		 * in $lib/server/markdown.ts. Ignored when children is provided.
		 */
		html?: string;
		/** Composed section content rendered instead of the html prop. */
		children?: Snippet;
	}

	let { kicker, html = '', children }: Props = $props();

	const context = getLongreadContext();
	let root = $state<HTMLElement>();
	let index = $state(-1);

	$effect(() => {
		if (context && root && index === -1) {
			index = context.register(root);
		}
	});
</script>

<section bind:this={root} class="longread-prose-section" aria-label={kicker}>
	<LongreadProse {html} {children} />
</section>

<style>
	/* Mirrors LongreadSection's layout shell — full-width flex centring so
	   the prose column keeps the article's axis, and scroll-margin so rail
	   clicks land clear of the fixed header. Deliberately no opacity or
	   in-view rules: dimming stays exclusive to the numbered-section
	   treatment on coded routes. */
	.longread-prose-section {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		scroll-margin-top: var(--scroll-margin-top);
	}
</style>
