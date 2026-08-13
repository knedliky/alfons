<script lang="ts" module>
	import type { TaskStatus } from './corpus.ts';

	export interface StatusMarkProps {
		status: TaskStatus;
		/** Hide the word and leave only the glyph — legal only where a label sits adjacent. */
		glyphOnly?: boolean;
	}
</script>

<script lang="ts">
	/**
	 * StatusMark — the one place a task status becomes visible.
	 *
	 * Shape and word carry the encoding; colour only reinforces it. A dense
	 * table is exactly where a colour-only column stops being readable, so
	 * every status gets its own glyph and every glyph keeps its word.
	 *
	 * The colour comes from --status-<name>, declared once at the page root, so
	 * the mapping cannot drift between the table, the legend and the ticker.
	 */
	let { status, glyphOnly = false }: StatusMarkProps = $props();
</script>

<span class="mark" data-status={status} title={status}>
	<svg class="glyph" viewBox="0 0 12 12" aria-hidden="true">
		{#if status === 'pending'}
			<circle cx="6" cy="6" r="1.75" fill="currentColor" />
		{:else if status === 'triaged'}
			<circle cx="6" cy="6" r="3.75" fill="none" stroke="currentColor" stroke-width="1.5" />
		{:else if status === 'building'}
			<circle cx="6" cy="6" r="3.75" fill="none" stroke="currentColor" stroke-width="1.5" />
			<path d="M6 1.5 A4.5 4.5 0 0 0 6 10.5 Z" fill="currentColor" />
		{:else if status === 'verifying'}
			<circle cx="6" cy="6" r="3.75" fill="none" stroke="currentColor" stroke-width="1.5" />
			<circle cx="6" cy="6" r="1.5" fill="currentColor" />
		{:else if status === 'done'}
			<circle cx="6" cy="6" r="4.5" fill="currentColor" />
		{:else if status === 'blocked'}
			<path
				d="M2.5 2.5 L9.5 9.5 M9.5 2.5 L2.5 9.5"
				stroke="currentColor"
				stroke-width="1.75"
				stroke-linecap="square"
			/>
		{:else if status === 'wontfix'}
			<path d="M2 6 H10" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" />
		{:else}
			<rect
				x="1.5"
				y="1.5"
				width="6"
				height="6"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
			/>
			<rect
				x="4.5"
				y="4.5"
				width="6"
				height="6"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
			/>
		{/if}
	</svg>
	{#if glyphOnly}
		<span class="visually-hidden">{status}</span>
	{:else}
		<span class="word">{status}</span>
	{/if}
</span>

<style>
	.mark {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--status-pending);
		white-space: nowrap;
	}

	/* One declaration per status, all reading the page-root custom properties. */
	.mark[data-status='pending'] {
		color: var(--status-pending);
	}
	.mark[data-status='triaged'] {
		color: var(--status-triaged);
	}
	.mark[data-status='building'] {
		color: var(--status-building);
	}
	.mark[data-status='verifying'] {
		color: var(--status-verifying);
	}
	.mark[data-status='done'] {
		color: var(--status-done);
	}
	.mark[data-status='blocked'] {
		color: var(--status-blocked);
	}
	.mark[data-status='wontfix'] {
		color: var(--status-wontfix);
	}
	.mark[data-status='duplicate'] {
		color: var(--status-duplicate);
	}

	.glyph {
		width: var(--space-3);
		height: var(--space-3);
		flex: none;
	}

	.word {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 500;
		letter-spacing: 0.02em;
		/* The word is data, so it stays legible; the glyph carries the colour. */
		color: var(--text-secondary);
	}

	/* done and blocked are the two states Simon scans for, so their word
	   carries the state colour as well as the glyph. */
	.mark[data-status='done'] .word,
	.mark[data-status='blocked'] .word {
		color: currentColor;
	}

	.visually-hidden {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
</style>
