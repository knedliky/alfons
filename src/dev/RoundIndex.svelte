<script lang="ts">
	/**
	 * The landing view at /dev: every round on disk, its brief and approaches.
	 * Dev chrome, not a library component — it never ships to a consumer.
	 */
	import type { Round } from './types.ts';

	let { rounds, navigate }: { rounds: Round[]; navigate: (to: string) => void } = $props();
</script>

<div class="index">
	<header>
		<h1>Prototyping rounds</h1>
		<p>
			Each round is five distinctly different approaches to one page, built in parallel and
			watchable live. Provision one with the /prototype skill.
		</p>
	</header>

	{#if rounds.length === 0}
		<p class="empty">
			No rounds yet. Run /prototype in an Alfons session to provision one; it appears here without a
			restart.
		</p>
	{:else}
		<ul>
			{#each rounds as round (round.page)}
				<li>
					<a
						href="/dev/{round.page}"
						onclick={(event) => {
							event.preventDefault();
							navigate(`/dev/${round.page}`);
						}}
					>
						<strong>{round.title}</strong>
						<span class="status">{round.status}</span>
					</a>
					<p class="brief">{round.brief}</p>
					<p class="approaches">
						{round.approaches.map((entry) => entry.title).join(' · ')}
					</p>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.index {
		max-width: 44rem;
		margin: 0 auto;
		padding: var(--space-8, 4rem) var(--space-5, 1.5rem);
		color: var(--text-primary);
	}

	header p,
	.empty {
		color: var(--text-secondary);
	}

	ul {
		list-style: none;
		padding: 0;
		display: grid;
		gap: var(--space-5, 1.5rem);
	}

	li {
		border: 1px solid var(--border-glass);
		border-radius: 0.75rem;
		padding: var(--space-5, 1.5rem);
		background: var(--card-bg);
	}

	a {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		color: var(--text-primary);
		text-decoration: none;
	}

	.status {
		color: var(--accent-tertiary);
		font-size: 0.8rem;
	}

	.brief {
		color: var(--text-secondary);
	}

	.approaches {
		color: var(--text-muted);
		font-size: 0.85rem;
	}
</style>
