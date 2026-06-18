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

	/* Override the shared --radius-message that the surface reads. The pill and
	   submit keep their round identity regardless (they track --radius-pill, not
	   the surface), so these variants only reshape the container: --radius-lg gives
	   a tighter rounded square, --radius-pill a full stadium. */
	:global(.agent-input.tight) {
		--radius-message: var(--radius-lg);
	}

	:global(.agent-input.pill) {
		--radius-message: var(--radius-pill);
	}
</style>
