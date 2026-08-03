<script lang="ts" module>
	export interface KeyBinding {
		/** Keys that all do the same thing, e.g. ['j', '↓']. */
		keys: string[];
		/** Separator drawn between the keys: 'or' for alternatives, 'then' for a chord. */
		join?: 'or' | 'then';
		does: string;
	}

	export interface KeyGroup {
		heading: string;
		bindings: KeyBinding[];
	}

	export interface KeyLegendProps {
		groups: KeyGroup[];
		open: boolean;
		onToggle: () => void;
		/** Reflected onto the panel so ? can scroll it into view when it opens. */
		id: string;
	}

	function bindingCount(groups: KeyGroup[]): number {
		return groups.reduce((total, group) => total + group.bindings.length, 0);
	}
</script>

<script lang="ts">
	/**
	 * KeyLegend — the whole key model, written down.
	 *
	 * A keyboard model nobody can see is a private tool, so this is not a
	 * tooltip and not a modal. It is a region of the page, always in the DOM,
	 * collapsed by default and opened by ? or by its own button. Non-modal
	 * because a modal steals focus from the grid, and the one thing a person
	 * reading this panel wants to do is try a key against the table behind it.
	 */
	import KeyCap from './KeyCap.svelte';

	let { groups, open, onToggle, id }: KeyLegendProps = $props();
</script>

<div class="legend">
	<button type="button" class="toggle" aria-expanded={open} aria-controls={id} onclick={onToggle}>
		<span class="toggle-label">Keys</span>
		<KeyCap key="?" active={open} />
		<span class="toggle-state">{open ? 'hide' : 'show all ' + bindingCount(groups)}</span>
	</button>

	{#if open}
		<div class="panel" {id}>
			{#each groups as group (group.heading)}
				<section class="group">
					<h3>{group.heading}</h3>
					<dl>
						{#each group.bindings as binding (binding.does)}
							<div class="binding">
								<!--
									Keyed by index, not by the key itself: a chord like g then g
									repeats a cap, and keying by value crashes the block.
								-->
								<dt>
									{#each binding.keys as key, index (index)}
										{#if index > 0}<span class="join">{binding.join ?? 'or'}</span>{/if}
										<KeyCap {key} />
									{/each}
								</dt>
								<dd>{binding.does}</dd>
							</div>
						{/each}
					</dl>
				</section>
			{/each}
		</div>
	{/if}
</div>

<style>
	.legend {
		border-top: 2px solid var(--border-glass-hover);
	}

	.toggle {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		width: 100%;
		padding: var(--space-3) 0;
		background: none;
		border: none;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-align: left;
		color: var(--text-muted);
		cursor: pointer;
	}

	.toggle-label {
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.toggle:hover .toggle-label,
	.toggle:focus-visible .toggle-label {
		color: var(--text-primary);
	}

	.panel {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
		gap: var(--space-5) var(--space-6);
		padding-block: var(--space-2) var(--space-5);
	}

	.group h3 {
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	dl {
		margin: 0;
	}

	.binding {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		padding-block: var(--space-1);
		border-bottom: 1px solid var(--border-glass);
	}

	dt {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		/* Fixed so the descriptions line up into a readable column rather than
		   ragging with the width of each binding. */
		min-width: var(--space-8);
		flex: none;
	}

	dd {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}

	.join {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
