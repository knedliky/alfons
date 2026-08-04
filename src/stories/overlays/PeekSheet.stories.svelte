<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PeekSheet from '../../components/overlays/PeekSheet.svelte';

	const { Story } = defineMeta({
		title: 'Overlays/PeekSheet',
		component: PeekSheet,
		tags: ['autodocs']
	});

	const noop = () => {};
</script>

<script lang="ts">
	let raised = $state(false);
</script>

<!-- The sheet is position: fixed, so it rises over the whole story viewport.
     Raise it to see the grip, the partial height and the pinned commit bar;
     every dismissal in production routes through one history.back(). -->
<Story name="Default" asChild>
	<div class="frame">
		<button type="button" class="raise" onclick={() => (raised = true)}>Raise the sheet</button>
		{#if raised}
			<PeekSheet
				rank="Release"
				name="schema-lives-here"
				commitLabel="Go to release schema-lives-here"
				reducedMotion={false}
				onCommit={noop}
				onDismiss={() => (raised = false)}
			>
				<p class="body-stand-in">
					The peeked subject's body renders here — in production, a ReleaseBody or ProjectBody,
					shown whole rather than as a teaser.
				</p>
			</PeekSheet>
		{/if}
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		min-height: 24rem;
	}

	.raise {
		font: inherit;
		padding: 0.5rem 1rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
	}

	.body-stand-in {
		margin: 0;
		padding-block: 1rem;
		color: var(--text-secondary);
	}
</style>
