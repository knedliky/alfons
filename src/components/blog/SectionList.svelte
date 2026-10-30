<script lang="ts" module>
	export interface SectionListEntry {
		/** The section's element id, the target of the entry's anchor. */
		id: string;
		/** Short section handle, the same one the article's rail shows. */
		kicker: string;
	}

	export interface SectionListProps {
		sections: SectionListEntry[];
		/** Index of the current section, or -1 when none is current yet. */
		activeIndex?: number;
		/** Takes over from the anchor, e.g. to close a sheet before scrolling.
		    Without it the entries are plain in-page links. */
		onPick?: (index: number) => void;
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * SectionList — the article's contents as a numbered list of in-page
	 * links, with the section under the reading line marked current.
	 *
	 * Promoted from the article-page round (AL-034), where it fills the
	 * phone's contents sheet opened from ReadingFloor. Each entry is a real
	 * anchor, so the list works with no script; with script, onPick takes
	 * over so the consumer can close the sheet before the page moves.
	 *
	 * Usage:
	 *   <SectionList {sections} {activeIndex} onPick={jumpTo} />
	 */
	let { sections, activeIndex = -1, onPick, class: className = '' }: SectionListProps = $props();

	function pick(event: MouseEvent, index: number): void {
		if (!onPick) return;
		event.preventDefault();
		onPick(index);
	}
</script>

<ol class="section-list {className}">
	{#each sections as section, index (section.id)}
		<li class="section-item" class:section-item-current={index === activeIndex}>
			<a
				class="section-link"
				href="#{section.id}"
				aria-current={index === activeIndex ? 'location' : undefined}
				onclick={(event) => pick(event, index)}
			>
				<span class="section-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
				<span class="section-kicker">{section.kicker}</span>
			</a>
		</li>
	{/each}
</ol>

<style>
	.section-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.section-link {
		display: grid;
		grid-template-columns: var(--space-6) 1fr;
		gap: var(--space-2);
		align-items: baseline;
		/* A full-width row at thumb height, so the sheet is a list of targets
		   rather than a list of words. */
		min-height: var(--input-height-lg);
		padding: var(--space-2) 0;
		color: var(--text-secondary);
		text-decoration: none;
		border-bottom: 1px solid var(--border-hairline);
		transition: color var(--transition-fast);
	}

	.section-link:hover {
		color: var(--text-primary);
	}

	.section-link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
	}

	.section-number {
		font-family: var(--font-monospace);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.section-kicker {
		font-family: var(--font-body);
		font-size: var(--text-caption);
		line-height: var(--lh-snug);
	}

	/* The current section is the one place the accent appears in the list:
	   it answers "where am I" at a glance without a second marker. */
	.section-item-current .section-link {
		color: var(--text-primary);
	}

	.section-item-current .section-number {
		color: var(--accent);
	}
</style>
