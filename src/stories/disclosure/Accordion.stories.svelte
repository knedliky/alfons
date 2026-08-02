<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Accordion from '../../components/disclosure/Accordion.svelte';

	const { Story } = defineMeta({
		title: 'Disclosure/Accordion',
		component: Accordion,
		tags: ['autodocs'],
		argTypes: {
			type: {
				control: { type: 'select' },
				options: ['single', 'multiple']
			}
		}
	});

	const faqs = [
		{
			id: 'what',
			title: 'What is Motivka?',
			content:
				'A personal agent ecosystem — one orchestrator at the centre of a set of domain reasoners.'
		},
		{
			id: 'how',
			title: 'How do the experiments work?',
			content: 'Each experiment is a public lab note: rough findings published without polish.'
		},
		{
			id: 'when',
			title: 'When do new posts land?',
			content: 'Whenever the work says something worth writing down.'
		},
		{ id: 'closed', title: 'A disabled section', content: 'Not reachable.', disabled: true }
	];
</script>

<Story name="Single" asChild>
	<div style="max-width: 560px">
		<Accordion items={faqs} defaultOpen="what" />
	</div>
</Story>

<Story name="Multiple" asChild>
	<div style="max-width: 560px">
		<Accordion items={faqs} type="multiple" defaultOpen={['what', 'how']} />
	</div>
</Story>

<Story name="All Closed" asChild>
	<div style="max-width: 560px">
		<Accordion items={faqs.slice(0, 3)} />
	</div>
</Story>
