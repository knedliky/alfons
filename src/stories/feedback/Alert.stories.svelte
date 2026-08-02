<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Alert from '../../components/feedback/Alert.svelte';

	const { Story } = defineMeta({
		title: 'Feedback/Alert',
		component: Alert,
		tags: ['autodocs'],
		argTypes: {
			type: {
				control: { type: 'select' },
				options: ['info', 'success', 'warning', 'error']
			},
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			},
			icon: { control: { type: 'boolean' } }
		}
	});

	function noop() {
		// Storybook demo callback
	}
</script>

<Story name="Info" asChild>
	<div style="max-width: 480px">
		<Alert type="info" title="Heads up">The export runs nightly at 02:00.</Alert>
	</div>
</Story>

<Story name="Success" asChild>
	<div style="max-width: 480px">
		<Alert type="success" title="Saved">Your changes are live.</Alert>
	</div>
</Story>

<Story name="Warning" asChild>
	<div style="max-width: 480px">
		<Alert type="warning" title="Storage nearly full">
			You have used 92% of the available space.
		</Alert>
	</div>
</Story>

<Story name="Error Dismissable" asChild>
	<div style="max-width: 480px">
		<Alert type="error" title="Publish failed" onDismiss={noop}>
			The server rejected the request. Try again in a moment.
		</Alert>
	</div>
</Story>

<Story name="Without Icon" asChild>
	<div style="max-width: 480px">
		<Alert type="info" icon={false}>A quiet, icon-free note.</Alert>
	</div>
</Story>

<Story name="All Types" asChild>
	<div style="max-width: 480px; display: flex; flex-direction: column; gap: var(--space-3)">
		<Alert type="info" title="Info">Tinted glass fill from the sky hue.</Alert>
		<Alert type="success" title="Success">Olive-green confirmation.</Alert>
		<Alert type="warning" title="Warning">Amber caution.</Alert>
		<Alert type="error" title="Error">Fire-engine-red failure.</Alert>
	</div>
</Story>
