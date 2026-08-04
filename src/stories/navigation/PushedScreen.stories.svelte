<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PushedScreen from '../../components/navigation/PushedScreen.svelte';

	const { Story } = defineMeta({
		title: 'Navigation/PushedScreen',
		component: PushedScreen,
		tags: ['autodocs']
	});
</script>

<script lang="ts">
	let pushed = $state(false);
</script>

<!-- The screen is position: fixed and opaque — it covers the whole story
     viewport, site chrome included, because a push that leaves the old chrome
     visible is a panel, not a push. In production onBack is history.back(). -->
<Story name="Default" asChild>
	<div class="frame">
		<button type="button" class="push" onclick={() => (pushed = true)}>Push a screen</button>
		{#if pushed}
			<PushedScreen
				rank="Release"
				name="schema-lives-here"
				backLabel="Running"
				reducedMotion={false}
				onBack={() => (pushed = false)}
			>
				<p class="body-stand-in">
					The place's body renders here — in production, a ReleaseBody or ProjectBody. This region
					scrolls; the chrome above it does not.
				</p>
			</PushedScreen>
		{/if}
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		min-height: 24rem;
	}

	.push {
		font: inherit;
		padding: 0.5rem 1rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
	}

	.body-stand-in {
		margin: 0;
		color: var(--text-secondary);
	}
</style>
