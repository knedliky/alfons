<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AgentInput from '../../components/atoms/AgentInput.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/AgentInput',
		component: AgentInput,
		tags: ['autodocs'],
		argTypes: {
			placeholder: { control: { type: 'text' } },
			disabled: { control: { type: 'boolean' } },
			floating: { control: { type: 'boolean' } }
		}
	});
</script>

<!-- The input fills its container, so each story is framed at a representative
     surface width. The radii stories (Rounded square / Tight square / Pill) vary
     only --surface-radius to show the inner pill and button staying concentric. -->

<Story name="Default" asChild>
	<div class="frame">
		<AgentInput placeholder="ask me anything" />
	</div>
</Story>

<Story name="Rounded square" asChild>
	<div class="frame">
		<AgentInput placeholder="ask me anything" />
	</div>
</Story>

<Story name="Tight square" asChild>
	<div class="frame">
		<AgentInput class="tight" placeholder="ask me anything" />
	</div>
</Story>

<Story name="Pill" asChild>
	<div class="frame">
		<AgentInput class="pill" placeholder="ask me anything" />
	</div>
</Story>

<Story name="Filled" asChild>
	<div class="frame">
		<AgentInput value="how do I become a data analyst?" placeholder="ask me anything" />
	</div>
</Story>

<Story name="No skill" asChild>
	<div class="frame">
		<AgentInput skill={null} placeholder="ask me anything" />
	</div>
</Story>

<Story name="Floating" asChild>
	<div class="frame">
		<AgentInput floating placeholder="ask me anything" />
	</div>
</Story>

<Story name="Disabled" asChild>
	<div class="frame">
		<AgentInput disabled placeholder="ask me anything" />
	</div>
</Story>

<style>
	.frame {
		width: 420px;
		max-width: 80vw;
	}

	/* Swap the single surface-radius knob; the inner skill pill and submit button
	   follow via the concentric-corner formula. --radius-lg tightens the surface
	   to a rounded square (the button becomes a concentric rounded square);
	   --radius-pill turns the whole input into a stadium (everything fully round). */
	:global(.agent-input.tight) {
		--surface-radius: var(--radius-lg);
	}

	:global(.agent-input.pill) {
		--surface-radius: var(--radius-pill);
	}
</style>
