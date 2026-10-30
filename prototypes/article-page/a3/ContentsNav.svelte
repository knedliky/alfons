<script lang="ts" module>
	export interface ContentsEntry {
		id: string;
		label: string;
	}
</script>

<script lang="ts">
	/**
	 * ContentsNav — the article's section contents, in one of two shapes.
	 *
	 * Wide: a numbered list under a mono heading, meant to sit in its own grid
	 * column (the page makes that column sticky), with the section in view
	 * marked by the accent rule. Narrow: the same list folded into a single
	 * Alfons Accordion item, so on a phone it costs one row until opened and
	 * closes itself once a section is chosen. It is never fixed or floating;
	 * the page decides where it sits.
	 */
	import { Accordion } from '@alfons/design';

	interface Props {
		entries: ContentsEntry[];
		activeId: string | null;
		collapsible: boolean;
	}

	let { entries, activeId, collapsible }: Props = $props();

	let openId = $state<string | null>(null);

	const summary = $derived(`Contents, ${entries.length} sections`);

	let navElement = $state<HTMLElement>();

	const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

	// The Accordion animates its panel shut. Scrolling while it collapses
	// aims at a target that is still moving up the page, so the jump waits
	// for the collapse to finish (or a short fallback if no transition runs).
	function waitForCollapse(): Promise<void> {
		if (!navElement || prefersReducedMotion()) return Promise.resolve();
		const nav = navElement;
		return new Promise((resolve) => {
			const finish = () => {
				nav.removeEventListener('transitionend', onTransitionEnd);
				clearTimeout(fallback);
				resolve();
			};
			const onTransitionEnd = (event: TransitionEvent) => {
				if (event.propertyName === 'grid-template-rows') finish();
			};
			const fallback = setTimeout(finish, 600);
			nav.addEventListener('transitionend', onTransitionEnd);
		});
	}

	async function goToSection(event: MouseEvent, id: string) {
		const target = document.getElementById(id);
		if (!target) return;
		event.preventDefault();
		if (collapsible && openId !== null) {
			openId = null;
			await waitForCollapse();
		}
		target.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
		history.replaceState(history.state, '', `#${id}`);
	}

	function ordinal(index: number): string {
		return String(index + 1).padStart(2, '0');
	}
</script>

{#snippet contentsList()}
	<ol class="contents__list">
		{#each entries as entry, index (entry.id)}
			<li class="contents__item">
				<a
					href="#{entry.id}"
					class="contents__link"
					class:contents__link--active={entry.id === activeId}
					aria-current={entry.id === activeId ? 'location' : undefined}
					onclick={(event) => goToSection(event, entry.id)}
				>
					<span class="contents__ordinal">{ordinal(index)}</span>
					<span class="contents__label">{entry.label}</span>
				</a>
			</li>
		{/each}
	</ol>
{/snippet}

<nav bind:this={navElement} class="contents" aria-label="Contents">
	{#if collapsible}
		<Accordion items={[{ id: 'contents', title: summary, content: contentsList }]} bind:open={openId} />
	{:else}
		<p class="contents__heading">Contents</p>
		{@render contentsList()}
	{/if}
</nav>

<style>
	.contents__heading {
		margin: 0 0 var(--space-4);
		font: var(--type-spec);
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.contents__list {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.contents__link {
		display: grid;
		grid-template-columns: auto 1fr;
		column-gap: var(--space-3);
		padding: var(--space-2) 0 var(--space-2) var(--space-3);
		border-left: 1px solid var(--border-hairline);
		font: var(--type-small);
		color: var(--text-secondary);
		text-decoration: none;
		transition:
			color var(--transition-fast),
			border-color var(--transition-fast);
	}

	.contents__link:hover {
		color: var(--text-primary);
	}

	.contents__link:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	/* The section in view keeps the accent rule, so the column reads as a
	   position marker as well as a list. */
	.contents__link--active {
		color: var(--text-primary);
		border-left-color: var(--accent);
	}

	.contents__ordinal {
		font: var(--type-spec);
		line-height: inherit;
		color: var(--text-muted);
	}

	.contents__link--active .contents__ordinal {
		color: var(--accent);
	}
</style>
