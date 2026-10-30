<script lang="ts" module>
	export interface SectionEntry {
		id: string;
		kicker: string;
	}
</script>

<script lang="ts">
	/**
	 * SectionList — the article's contents as an ordered list of in-page links,
	 * with the section under the reading line marked current.
	 *
	 * One list, two homes: the phone's contents sheet and the desktop's margin
	 * dock. Each entry is a real anchor, so the list still works with no
	 * script; with script, onPick takes over to scroll inside whichever element
	 * is scrolling and to close the sheet.
	 */
	interface Props {
		sections: SectionEntry[];
		activeIndex: number;
		onPick: (index: number) => void;
	}

	let { sections, activeIndex, onPick }: Props = $props();

	function pick(event: MouseEvent, index: number) {
		event.preventDefault();
		onPick(index);
	}
</script>

<ol class="section-list">
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
		font-family: var(--font-mono);
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
