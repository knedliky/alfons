<script lang="ts">
	/**
	 * StatusMark — the ledger's eight statuses, each as a shape plus a word.
	 *
	 * The library's Badge carries five semantic variants (default, success,
	 * warning, error, info) and the ledger has eight statuses, so the mapping
	 * would have to collapse two pairs onto one colour. It also encodes by
	 * colour alone. Both are why this is local rather than a Badge.
	 *
	 * Colour comes from the --status-* set declared once at the page root, so
	 * the encoding cannot drift between the search results, the release
	 * narrative and the chart's own margin note.
	 */
	import type { TaskStatus } from './corpus.ts';

	interface Props {
		status: TaskStatus;
		/** Bare mark for dense rows; word for anywhere the reader is scanning. */
		showLabel?: boolean;
		size?: 'sm' | 'md';
	}

	let { status, showLabel = true, size = 'md' }: Props = $props();

	/**
	 * A distinct shape per status, so the mark survives being read by someone
	 * who cannot separate the hues. The glyph is drawn in CSS from a single
	 * square; the modifier class chooses how it is cut.
	 */
	const SHAPES: Record<TaskStatus, string> = {
		pending: 'hollow',
		triaged: 'hollow-thick',
		building: 'half',
		verifying: 'ring',
		done: 'solid',
		blocked: 'cross',
		wontfix: 'strike',
		duplicate: 'stack'
	};

	const shape = $derived(SHAPES[status]);
</script>

<span class="status-mark" data-size={size} style:--mark-colour="var(--status-{status})">
	<span class="glyph" data-shape={shape} aria-hidden="true"></span>
	{#if showLabel}<span class="word">{status}</span>{:else}<span class="sr-only">{status}</span>{/if}
</span>

<style>
	.status-mark {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-secondary);
		white-space: nowrap;
	}

	.status-mark[data-size='sm'] {
		gap: var(--space-1);
	}

	.glyph {
		flex: none;
		width: 10px;
		height: 10px;
		border: 1.5px solid var(--mark-colour);
		position: relative;
	}

	.status-mark[data-size='sm'] .glyph {
		width: var(--space-2);
		height: var(--space-2);
	}

	.glyph[data-shape='hollow'] {
		border-width: 1px;
		opacity: 0.8;
	}

	.glyph[data-shape='hollow-thick'] {
		border-width: 2px;
	}

	/* Half-filled: the work has started but nothing has been judged. */
	.glyph[data-shape='half'] {
		background: linear-gradient(
			to top,
			var(--mark-colour) 0 50%,
			transparent 50% 100%
		);
	}

	.glyph[data-shape='ring']::after {
		content: '';
		position: absolute;
		inset: 2px;
		background: var(--mark-colour);
	}

	.glyph[data-shape='solid'] {
		background: var(--mark-colour);
	}

	.glyph[data-shape='cross']::before,
	.glyph[data-shape='cross']::after {
		content: '';
		position: absolute;
		inset: 50% -1px;
		border-top: 1.5px solid var(--mark-colour);
	}

	.glyph[data-shape='cross']::before {
		transform: rotate(45deg);
	}

	.glyph[data-shape='cross']::after {
		transform: rotate(-45deg);
	}

	.glyph[data-shape='strike'] {
		border-style: dashed;
	}

	/* Two squares offset: the same work, recorded twice. */
	.glyph[data-shape='stack'] {
		border-style: dotted;
	}

	.glyph[data-shape='stack']::after {
		content: '';
		position: absolute;
		inset: calc(var(--space-1) * -1) calc(var(--space-1) * -1) 2px 2px;
		border: 1px dotted var(--mark-colour);
		opacity: 0.6;
	}

	.word {
		color: var(--text-secondary);
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
