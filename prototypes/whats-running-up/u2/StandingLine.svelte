<script lang="ts" module>
	export interface Segment {
		label: string;
		/** Read aloud so "alfons" is heard as a project rather than a word. */
		kind: 'running' | 'project' | 'release' | 'task';
		/** Absent on the segment the reader is already standing on. */
		onSelect?: () => void;
	}
</script>

<script lang="ts">
	/**
	 * The line the whole approach is: project, release, task, printed once and
	 * always, with every ancestor one tap away.
	 *
	 * On the library
	 * --------------
	 * `find_components('breadcrumb')` DOES return one — Breadcrumb, live, in
	 * navigation. The brief said there was none. It is not usable here and both
	 * halves of that are reported:
	 *
	 * - It is built out of `<a href>`. Going up on this page is a change of view
	 *   inside one prototype route, not a document fetch. An href would be a claim
	 *   about a URL that does not exist, and it would leave /dev entirely.
	 * - Its segments are text with no height. On a phone page whose premise is
	 *   one-handed use, a 20px tall tap target is the defect that ToggleGroup was
	 *   already reported for. This one needs 44px, which cannot be added from
	 *   outside without reaching into its class names.
	 * - It sets `font-size: 0.875rem` and `font-weight: 500` as literals, neither
	 *   of which is a token, and hover is its only affordance.
	 *
	 * So this is local, and the useful finding is not "the library lacks a
	 * breadcrumb" but "the library's breadcrumb is a document-navigation atom and
	 * this is an application one".
	 *
	 * On the shape
	 * ------------
	 * `<nav>` with an accessible name, an `<ol>` because the order is the meaning,
	 * and `aria-current="page"` on the last segment. The last segment is not a
	 * button: you are already there, and a control that does nothing is furniture.
	 * That is also what makes the touch problem survivable — three segments, two
	 * targets.
	 *
	 * Interactive segments are underlined. Nothing on this page may depend on
	 * hover or a pointer, and an underline is the one affordance that is legible
	 * standing still.
	 *
	 * The nav never scrolls in either axis. It sits inside a card that sits inside
	 * the swipe deck, and a scroll container here would swallow the horizontal
	 * swipe exactly as a scrolling card does. The release segment truncates
	 * instead — see the note on `.slug`.
	 */
	import { Icon } from '@alfons/design';

	let { segments, label }: { segments: Segment[]; label: string } = $props();

	const description: Record<Segment['kind'], string> = {
		running: 'the running view',
		project: 'project',
		release: 'release',
		task: 'task'
	};

	/**
	 * Where a label may be cut, if it has to be cut at all.
	 *
	 * Measured at 370px: the line has 296px, the project takes 68, the task takes
	 * 68–77, the two chevrons take 32, and the release is left with about 127.
	 * `prototype-loop-v1` wants 149. Three characters have to go.
	 *
	 * Taking them off the end is the default and it is sometimes the wrong end. A
	 * versioned slug carries its subject at the head and its version at the tail —
	 * `gateway-v1` and `gateway-v2` differ in one character, the last — so a
	 * tail-ellipsis turns two different releases into the same string. Those slugs
	 * are split before the version: the head truncates and the version is always
	 * rendered whole, so `prototype-loop-v1` becomes `prototype-lo…v1`.
	 *
	 * The rule is a version suffix specifically, NOT "the last hyphen". The first
	 * attempt was the last hyphen and it rendered `auth-hardening` as
	 * `au…hardening`, which is worse than the default it replaced: the tail there
	 * is a word, not an identifier, and words are recognised from the front.
	 * Anything without a version falls back to a plain trailing ellipsis.
	 *
	 * Two spans and `flex: none` on the second, rather than a JS measurement: it
	 * costs nothing when the label fits, and there is no observer to keep in step
	 * with a resize.
	 */
	const VERSION_SUFFIX = /-(v\d+|\d+)$/;

	function split(segment: Segment): { head: string; tail: string } {
		if (segment.kind !== 'release') return { head: segment.label, tail: '' };
		const version = segment.label.match(VERSION_SUFFIX);
		if (!version) return { head: segment.label, tail: '' };
		const cut = segment.label.length - version[1].length;
		return { head: segment.label.slice(0, cut), tail: segment.label.slice(cut) };
	}
</script>

<nav class="line" aria-label={label}>
	<ol>
		{#each segments as segment, position (segment.kind + segment.label)}
			{@const parts = split(segment)}
			<li class="step" data-kind={segment.kind}>
				{#if segment.onSelect}
					<button
						type="button"
						class="segment"
						aria-label="Go up to {description[segment.kind]} {segment.label}"
						onclick={segment.onSelect}
					>
						<!-- The visible text may be truncated; the aria-label above never is,
						     so a screen reader always hears the whole slug. -->
						<span class="slug">{parts.head}</span>
						{#if parts.tail}<span class="tail">{parts.tail}</span>{/if}
					</button>
				{:else}
					<span class="segment here" aria-current="page">
						<span class="slug">{parts.head}</span>
						{#if parts.tail}<span class="tail">{parts.tail}</span>{/if}
					</span>
				{/if}

				{#if position < segments.length - 1}
					<span class="sep" aria-hidden="true"><Icon name="chevron-right" size="sm" /></span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>

<style>
	.line {
		/* Not a scroll container in either axis. `clip` is the only value that is
		   not one; `hidden` and `auto` both are, and this sits inside the deck. */
		overflow: clip;
	}

	ol {
		display: flex;
		align-items: center;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	/* The first segment sits flush with everything below it. This was a negative
	   margin on the list to start with, which measured correctly and rendered
	   wrong: above 640px the page drops its inline padding, so the list hung 8px
	   outside .screen and its `overflow: hidden` sliced the `r` off `running`.
	   Dropping the padding instead costs the first segment 8px of target width —
	   measured 60px on the narrowest label, still well over the 44px floor. */
	.step:first-child .segment {
		padding-inline-start: 0;
	}

	.step {
		display: flex;
		align-items: center;
		min-width: 0;
	}

	/* The project and the task hold their width; the release is the one that gives
	   ground. See .slug. */
	.step[data-kind='release'] {
		flex: 0 1 auto;
		min-width: 0;
	}

	.step[data-kind='running'],
	.step[data-kind='project'],
	.step[data-kind='task'] {
		flex: none;
	}

	.segment {
		appearance: none;
		display: inline-flex;
		align-items: center;
		/* 44px. Every interactive segment is a full touch target, and the current
		   one matches it so the line does not change height when the reader moves
		   from a card to the release it belongs to. */
		min-height: var(--filter-control-height);
		min-width: 0;
		padding-inline: var(--space-2);
		background: none;
		border: none;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		letter-spacing: 0.02em;
		color: var(--text-secondary);
		cursor: pointer;
	}

	/* Not a status and not an accent: the hierarchy is not a state, so it takes no
	   status hue. The underline, not the colour, is what says "tappable". */
	button.segment {
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
	}

	.segment.here {
		color: var(--text-primary);
		cursor: default;
	}

	/* Ellipsis needs `hidden`; `clip` refuses to render one. Safe only because this
	   element has no scrollable overflow to begin with — it is one line of text
	   with no wrapping — so it can never actually scroll. The parent .line still
	   carries `clip` as the real guarantee. */
	.slug {
		flex: 0 1 auto;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* The half of a release slug that never gives ground. See split(). */
	.tail {
		flex: none;
		white-space: nowrap;
	}

	.sep {
		display: flex;
		align-items: center;
		flex: none;
		color: var(--text-muted);
	}

	.segment:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: -2px;
	}
</style>
