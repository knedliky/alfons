<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Pagination from '../../components/tables/Pagination.svelte';

	const { Story } = defineMeta({
		title: 'Tables/Pagination',
		component: Pagination,
		tags: ['autodocs'],
		argTypes: {
			page: { control: { type: 'number' } },
			pageCount: { control: { type: 'number' } },
			size: {
				control: { type: 'select' },
				options: ['sm', 'default']
			},
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			}
		}
	});
</script>

<Story name="Default" asChild>
	<Pagination page={1} pageCount={5} />
</Story>

<Story name="Many Pages" asChild>
	<Pagination page={7} pageCount={24} />
</Story>

<Story name="With Summary" asChild>
	<div style="width: 560px">
		<Pagination page={2} pageCount={12} summary="21–40 of 234" />
	</div>
</Story>

<Story name="Small" asChild>
	<Pagination page={3} pageCount={9} size="sm" />
</Story>

<Story name="Admin Theme" asChild>
	<Pagination page={4} pageCount={10} theme="admin" />
</Story>
