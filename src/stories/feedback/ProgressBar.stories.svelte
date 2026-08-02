<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import ProgressBar from '../../components/feedback/ProgressBar.svelte';

	const { Story } = defineMeta({
		title: 'Feedback/ProgressBar',
		component: ProgressBar,
		tags: ['autodocs'],
		argTypes: {
			value: { control: { type: 'number' } },
			tone: {
				control: { type: 'select' },
				options: ['accent', 'success', 'warning', 'error', 'info']
			},
			size: {
				control: { type: 'select' },
				options: ['sm', 'default', 'lg']
			},
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			}
		}
	});
</script>

<Story name="Determinate" asChild args={{ value: 64 }}>
	<div style="width: 320px"><ProgressBar value={64} /></div>
</Story>

<Story name="With Label" asChild>
	<div style="width: 320px"><ProgressBar value={64} label="Uploading" showValue /></div>
</Story>

<Story name="Indeterminate" asChild>
	<div style="width: 320px"><ProgressBar label="Processing" /></div>
</Story>

<Story name="Tones" asChild>
	<div style="width: 320px; display: flex; flex-direction: column; gap: var(--space-4)">
		<ProgressBar value={100} tone="success" label="Complete" showValue />
		<ProgressBar value={70} tone="warning" label="Nearly full" showValue />
		<ProgressBar value={95} tone="error" label="Critical" showValue />
		<ProgressBar value={40} tone="info" label="Informational" showValue />
	</div>
</Story>

<Story name="Sizes" asChild>
	<div style="width: 320px; display: flex; flex-direction: column; gap: var(--space-4)">
		<ProgressBar value={64} size="sm" />
		<ProgressBar value={64} />
		<ProgressBar value={64} size="lg" />
	</div>
</Story>
