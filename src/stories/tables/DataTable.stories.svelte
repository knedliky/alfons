<script module>
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import DataTable from '../../components/tables/DataTable.svelte';

	const { Story } = defineMeta({
		title: 'Tables/DataTable',
		component: DataTable,
		tags: ['autodocs'],
		argTypes: {
			loading: {
				control: { type: 'boolean' }
			},
			selectable: {
				control: { type: 'boolean' }
			},
			emptyMessage: {
				control: { type: 'text' }
			},
			sortColumn: {
				control: { type: 'text' }
			},
			sortDirection: {
				control: { type: 'select' },
				options: ['asc', 'desc']
			}
		}
	});

	/** Column definitions for the organisations table. */
	const organisationColumns = [
		{ id: 'name', header: 'Organisation', accessor: 'name' },
		{ id: 'status', header: 'Status', accessor: 'status' },
		{ id: 'plan', header: 'Plan', accessor: 'plan' },
		{ id: 'created', header: 'Created', accessor: 'created' },
		{
			id: 'seats',
			header: 'Seats',
			accessor: 'seats',
			sortable: true,
			formatter: (value) => String(value)
		}
	];

	/** Sample organisations dataset. */
	const organisationRows = [
		{
			id: 'org-001',
			name: 'Acme Pty Ltd',
			status: 'Active',
			plan: 'Professional',
			created: '12/01/2026',
			seats: 24
		},
		{
			id: 'org-002',
			name: 'Blue Horizon Technologies',
			status: 'Active',
			plan: 'Enterprise',
			created: '03/02/2026',
			seats: 150
		},
		{
			id: 'org-003',
			name: 'Koala Digital',
			status: 'Pending',
			plan: 'Starter',
			created: '28/02/2026',
			seats: 5
		},
		{
			id: 'org-004',
			name: 'Southbank Analytics',
			status: 'Suspended',
			plan: 'Professional',
			created: '15/03/2026',
			seats: 12
		},
		{
			id: 'org-005',
			name: 'Ironbark Solutions',
			status: 'Active',
			plan: 'Enterprise',
			created: '02/04/2026',
			seats: 88
		}
	];
</script>

<Story
	name="Default"
	asChild
	args={{
		columns: organisationColumns,
		rows: organisationRows,
		sortColumn: 'name',
		sortDirection: 'asc',
		loading: false,
		selectable: false
	}}
>
	<DataTable
		columns={organisationColumns}
		rows={organisationRows}
		rowKey={(row) => row.id}
		sortColumn="name"
		sortDirection="asc"
		onSortChange={() => {}}
		loading={false}
		selectable={false}
	/>
</Story>

<Story
	name="Selectable"
	asChild
	args={{
		columns: organisationColumns,
		rows: organisationRows,
		sortColumn: 'name',
		sortDirection: 'asc',
		loading: false,
		selectable: true
	}}
>
	<DataTable
		columns={organisationColumns}
		rows={organisationRows}
		rowKey={(row) => row.id}
		sortColumn="name"
		sortDirection="asc"
		onSortChange={() => {}}
		selectable={true}
		selectedKeys={new Set()}
		onSelectionChange={() => {}}
		loading={false}
	/>
</Story>

<Story
	name="Sorted Descending"
	asChild
	args={{
		columns: organisationColumns,
		rows: organisationRows,
		sortColumn: 'seats',
		sortDirection: 'desc',
		loading: false,
		selectable: false
	}}
>
	<DataTable
		columns={organisationColumns}
		rows={[...organisationRows].sort((a, b) => b.seats - a.seats)}
		rowKey={(row) => row.id}
		sortColumn="seats"
		sortDirection="desc"
		onSortChange={() => {}}
		loading={false}
		selectable={false}
	/>
</Story>

<Story
	name="Empty State"
	asChild
	args={{
		columns: organisationColumns,
		rows: [],
		loading: false,
		selectable: false,
		emptyMessage: 'No organisations found. Add one to get started.'
	}}
>
	<DataTable
		columns={organisationColumns}
		rows={[]}
		rowKey={(row) => row.id}
		loading={false}
		selectable={false}
		emptyMessage="No organisations found. Add one to get started."
	/>
</Story>

<Story
	name="Loading"
	asChild
	args={{
		columns: organisationColumns,
		rows: [],
		loading: true,
		selectable: false
	}}
>
	<DataTable
		columns={organisationColumns}
		rows={[]}
		rowKey={(row) => row.id}
		loading={true}
		selectable={false}
	/>
</Story>

<Story
	name="Loading With Rows"
	asChild
	args={{
		columns: organisationColumns,
		rows: organisationRows,
		loading: true,
		selectable: false
	}}
>
	<DataTable
		columns={organisationColumns}
		rows={organisationRows}
		rowKey={(row) => row.id}
		sortColumn="name"
		sortDirection="asc"
		onSortChange={() => {}}
		loading={true}
		selectable={false}
	/>
</Story>
