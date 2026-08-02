<script lang="ts" module>
	export interface AvatarPerson {
		src?: string;
		initials?: string;
		alt?: string;
	}

	export interface AvatarGroupProps {
		people: AvatarPerson[];
		/** Max avatars before collapsing into "+N" */
		max?: number;
		/** Portrait size variant */
		size?: 'avatar' | 'circle' | 'portrait';
		/** Additional CSS classes */
		class?: string;
	}
</script>

<script lang="ts">
	/**
	 * AvatarGroup — a row of overlapping Portraits with a trailing "+N" overflow
	 * chip. Pass people ({ src, initials, alt }); max caps how many show before
	 * collapsing into the count. Later avatars sit under earlier ones.
	 *
	 * Usage:
	 *   <AvatarGroup people={[{ src: '/a.jpg' }, { initials: 'SK' }]} max={4} />
	 */
	import Portrait from './Portrait.svelte';

	let { people = [], max = 4, size = 'avatar', class: className = '' }: AvatarGroupProps = $props();

	const shown = $derived(people.slice(0, max));
	const overflow = $derived(people.length - shown.length);
</script>

<span class="motif-avatars {className}">
	{#each shown as person, i (i)}
		<span class="motif-avatars-item" style:z-index={shown.length - i}>
			<Portrait {size} src={person.src} initials={person.initials} alt={person.alt ?? ''} />
		</span>
	{/each}
	{#if overflow > 0}
		<span
			class="motif-avatars-item motif-avatars-more"
			style:z-index={0}
			aria-label="{overflow} more"
		>
			+{overflow}
		</span>
	{/if}
</span>

<style>
	.motif-avatars {
		display: inline-flex;
		align-items: center;
	}

	.motif-avatars-item {
		display: inline-flex;
		margin-left: -0.6rem;
		border-radius: 50%;
		box-shadow: 0 0 0 2px var(--bg-primary);
	}

	.motif-avatars-item:first-child {
		margin-left: 0;
	}

	/* The ring around each avatar comes from the item's own box-shadow, so the
	   Portrait's border and shadow are suppressed to avoid doubling the edge. */
	.motif-avatars-item :global(.portrait) {
		border-color: transparent;
		box-shadow: none;
	}

	.motif-avatars-more {
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: var(--bg-glass-solid);
		border: none;
		color: var(--text-secondary);
		font-family: var(--font-mono);
		font-size: 0.75rem;
		font-weight: 600;
	}
</style>
