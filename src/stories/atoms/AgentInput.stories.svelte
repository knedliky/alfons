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
     surface width. The surface is a full stadium pill (--radius-pill); the skill
     pill and submit button keep their own round identity via the same token. -->

<Story name="Default" asChild>
	<div class="frame">
		<AgentInput placeholder="ask me anything" />
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
</style>
