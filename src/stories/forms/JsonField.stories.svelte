<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import JsonField from '../../components/forms/JsonField.svelte';

	const { Story } = defineMeta({
		title: 'Forms/JsonField',
		component: JsonField,
		tags: ['autodocs'],
		argTypes: {
			label: { control: { type: 'text' } },
			placeholder: { control: { type: 'text' } },
			error: { control: { type: 'text' } },
			required: { control: { type: 'boolean' } },
			disabled: { control: { type: 'boolean' } }
		}
	});

	const sampleMetadata = {
		source: 'linkedin',
		referral_code: 'REF-2026-AU',
		utm: {
			campaign: 'job-seeker-may',
			medium: 'email'
		}
	};

	const sampleConfig = {
		notifications: {
			email: true,
			sms: false
		},
		visibility: 'public',
		locale: 'en-AU'
	};
</script>

<Story
	name="Default — empty"
	asChild
	args={{ name: 'metadata', label: 'Metadata', value: null }}
>
	<JsonField
		name="metadata"
		label="Metadata"
		value={null}
		onchange={() => {}}
	/>
</Story>

<Story
	name="With object value"
	asChild
	args={{ name: 'metadata', label: 'Metadata', value: sampleMetadata }}
>
	<JsonField
		name="metadata"
		label="Metadata"
		value={sampleMetadata}
		onchange={() => {}}
	/>
</Story>

<Story
	name="Configuration object"
	asChild
	args={{ name: 'config', label: 'Notification settings', value: sampleConfig }}
>
	<JsonField
		name="config"
		label="Notification settings"
		value={sampleConfig}
		onchange={() => {}}
	/>
</Story>

<Story
	name="Required"
	asChild
	args={{ name: 'metadata', label: 'Metadata', value: null, required: true }}
>
	<JsonField
		name="metadata"
		label="Metadata"
		value={null}
		required
		onchange={() => {}}
	/>
</Story>

<Story
	name="With error"
	asChild
	args={{ name: 'metadata', label: 'Metadata', value: null, error: 'Invalid JSON — check syntax and try again' }}
>
	<JsonField
		name="metadata"
		label="Metadata"
		value={null}
		error="Invalid JSON — check syntax and try again"
		onchange={() => {}}
	/>
</Story>

<Story
	name="Disabled"
	asChild
	args={{ name: 'raw_payload', label: 'Raw payload', value: sampleMetadata, disabled: true }}
>
	<JsonField
		name="raw_payload"
		label="Raw payload"
		value={sampleMetadata}
		disabled
		onchange={() => {}}
	/>
</Story>
