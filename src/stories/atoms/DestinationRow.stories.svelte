<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DestinationRow from '../../components/atoms/DestinationRow.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/DestinationRow',
		component: DestinationRow,
		tags: ['autodocs'],
		argTypes: {
			fill: {
				control: { type: 'select' },
				options: ['card', 'subtle']
			},
			edge: {
				control: { type: 'select' },
				options: ['box', 'top']
			}
		}
	});

	const noop = () => {};
</script>

<Story name="Default" asChild>
	<div class="frame">
		<DestinationRow rank="Release" name="schema-lives-here" onactivate={noop} />
	</div>
</Story>

<!-- The mono cue word names the first stage of a two-stage gesture: this tap
     glances, it does not go. -->
<Story name="Peek cue" asChild>
	<div class="frame">
		<DestinationRow rank="Project" name="ledger" cue="peek" fill="subtle" onactivate={noop} />
	</div>
</Story>

<Story name="Multi-line" asChild>
	<div class="frame">
		<DestinationRow
			name="auth-hardening"
			secondary="Auth hardening — one refresh in flight and a truthful 401"
			meta="7 tasks · not documented"
			cue="peek"
			onactivate={noop}
		/>
	</div>
</Story>

<!-- edge="top" for a row living flush on the floor of a clipped parent: only a
     top rule, and the focus ring moves inside. -->
<Story name="Flush in a cell" asChild>
	<div class="frame">
		<div class="cell-stand-in">
			<DestinationRow
				name="schema-lives-here"
				secondary="ledger"
				cue="peek"
				chevron={false}
				fill="subtle"
				edge="top"
				onactivate={noop}
			/>
		</div>
	</div>
</Story>

<style>
	.frame {
		padding: 1.5rem;
		max-width: 24rem;
	}

	.cell-stand-in {
		border: 1px solid var(--card-border);
		background: var(--card-bg);
		padding-top: 3rem;
		overflow: clip;
	}
</style>
