<script lang="ts">
	/**
	 * The floating pager between a round's five approaches.
	 *
	 * Fixed and pointer-transparent except for the pill itself, so it never
	 * occupies layout space or intercepts a click meant for the prototype — the
	 * page underneath must behave exactly as it would without the pager.
	 */
	import type { Round } from './types.ts';

	let {
		round,
		current,
		navigate
	}: { round: Round; current: string; navigate: (to: string) => void } = $props();

	const index = $derived(round.approaches.findIndex((entry) => entry.slug === current));
	const active = $derived(round.approaches[index]);

	function go(offset: number) {
		const next = round.approaches[index + offset];
		if (next) navigate(`/dev/${round.page}/${next.slug}`);
	}
</script>

<svelte:window
	onkeydown={(event) => {
		if (event.target instanceof HTMLElement && event.target.closest('input, textarea')) return;
		if (event.key === '[') go(-1);
		if (event.key === ']') go(1);
	}}
/>

<div class="pager-layer">
	<nav class="pager" aria-label="Prototype approaches" data-alfons-dev-chrome>
		<a
			class="round"
			href="/dev"
			title="All rounds"
			onclick={(event) => {
				event.preventDefault();
				navigate('/dev');
			}}
		>
			{round.title}
		</a>

		<button
			type="button"
			aria-label="Previous approach"
			disabled={index <= 0}
			onclick={() => go(-1)}
		>
			‹
		</button>

		{#each round.approaches as entry, position (entry.slug)}
			<button
				type="button"
				class="dot"
				class:active={entry.slug === current}
				title="{position + 1}. {entry.title} — {entry.direction}"
				aria-label="Approach {position + 1}: {entry.title}"
				onclick={() => navigate(`/dev/${round.page}/${entry.slug}`)}
			>
				{position + 1}
			</button>
		{/each}

		<button
			type="button"
			aria-label="Next approach"
			disabled={index >= round.approaches.length - 1}
			onclick={() => go(1)}
		>
			›
		</button>

		{#if active}
			<span class="label">{active.title}</span>
		{/if}
	</nav>
</div>

<style>
	/* The layer is inert; only the pill takes the pointer back. */
	.pager-layer {
		position: fixed;
		inset: auto 0 var(--space-5, 1.5rem) 0;
		display: flex;
		justify-content: center;
		pointer-events: none;
		z-index: 9999;
	}

	.pager {
		pointer-events: auto;
		display: flex;
		align-items: center;
		gap: var(--space-2, 0.5rem);
		padding: var(--space-2, 0.5rem) var(--space-4, 1rem);
		border-radius: 999px;
		border: 1px solid var(--border-glass);
		background: var(--surface-glass-bg);
		backdrop-filter: blur(12px);
		color: var(--text-secondary);
		font-size: 0.8rem;
	}

	.round {
		color: var(--text-muted);
		text-decoration: none;
		max-width: 12rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.round:hover {
		color: var(--text-primary);
	}

	/* Dev chrome deliberately uses bare buttons: the pager must never appear in
	   a prototype's own markup, and styling it as an Alfons Button would invite
	   exactly that confusion. */
	button {
		appearance: none;
		border: 1px solid transparent;
		background: transparent;
		color: var(--text-secondary);
		width: 1.75rem;
		height: 1.75rem;
		border-radius: 999px;
		cursor: pointer;
		font: inherit;
	}

	button:hover:not(:disabled) {
		background: var(--surface-hover-subtle);
		color: var(--text-primary);
	}

	button:disabled {
		opacity: 0.35;
		cursor: default;
	}

	.dot.active {
		border-color: var(--accent);
		color: var(--text-primary);
		background: var(--accent-bg);
	}

	.label {
		color: var(--text-primary);
		max-width: 14rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
