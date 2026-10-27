<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import FormGroup from '../../components/forms/FormGroup.svelte';

	// Admin stories run under the admin overlay through `parameters.theme`,
	// which .storybook/preview.js writes to data-theme on <html> (D-238).
	const ADMIN = { theme: 'admin' };

	const { Story } = defineMeta({
		title: 'Forms/FormGroup',
		component: FormGroup,
		tags: ['autodocs'],
		argTypes: {
			label: { control: { type: 'text' } },
			hint: { control: { type: 'text' } },
			error: { control: { type: 'text' } },
			successMessage: { control: { type: 'text' } },
			required: { control: { type: 'boolean' } }
		}
	});
</script>

<Story
	name="Default — with hint"
	asChild
	parameters={ADMIN}
	args={{
		label: 'Organisation name',
		htmlFor: 'org-name-fg',
		hint: 'Enter the registered legal name of your organisation.'
	}}
>
	<FormGroup
		label="Organisation name"
		htmlFor="org-name-fg"
		hint="Enter the registered legal name of your organisation."
	>
		<input
			id="org-name-fg"
			type="text"
			placeholder="Acme Pty Ltd"
			aria-describedby="org-name-fg-description"
			style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--border-hairline); border-radius: 0; background: var(--bg-primary); color: var(--text-primary);"
		/>
	</FormGroup>
</Story>

<Story
	name="Required"
	asChild
	parameters={ADMIN}
	args={{ label: 'Full name', htmlFor: 'full-name-fg', required: true }}
>
	<FormGroup label="Full name" htmlFor="full-name-fg" required>
		<input
			id="full-name-fg"
			type="text"
			placeholder="Jane Smith"
			aria-describedby="full-name-fg-description"
			style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--border-hairline); border-radius: 0; background: var(--bg-primary); color: var(--text-primary);"
		/>
	</FormGroup>
</Story>

<Story
	name="Error state"
	asChild
	parameters={ADMIN}
	args={{
		label: 'Contact email',
		htmlFor: 'email-fg',
		required: true,
		error: 'Please enter a valid email address'
	}}
>
	<FormGroup
		label="Contact email"
		htmlFor="email-fg"
		required
		error="Please enter a valid email address"
	>
		<input
			id="email-fg"
			type="email"
			value="not-an-email"
			aria-invalid="true"
			aria-describedby="email-fg-description"
			style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--colour-error, #ef4444); border-radius: 0; background: var(--bg-primary); color: var(--text-primary);"
		/>
	</FormGroup>
</Story>

<Story
	name="No description"
	asChild
	parameters={ADMIN}
	args={{ label: 'Department', htmlFor: 'department-fg' }}
>
	<FormGroup label="Department" htmlFor="department-fg">
		<input
			id="department-fg"
			type="text"
			placeholder="Engineering"
			style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--border-hairline); border-radius: 0; background: var(--bg-primary); color: var(--text-primary);"
		/>
	</FormGroup>
</Story>

<Story
	name="Public theme with hint"
	asChild
	args={{
		label: 'Your name',
		htmlFor: 'name-pub',
		hint: "We'll use this as your display name."
	}}
>
	<FormGroup label="Your name" htmlFor="name-pub" hint="We'll use this as your display name.">
		<input
			id="name-pub"
			type="text"
			placeholder="Jane Smith"
			aria-describedby="name-pub-description"
			style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--border, #ddd); border-radius: 0;"
		/>
	</FormGroup>
</Story>

<Story
	name="Custom success message"
	asChild
	parameters={ADMIN}
	args={{
		label: 'ABN',
		htmlFor: 'abn-fg',
		successMessage: 'ABN verified',
		hint: 'Your 11-digit Australian Business Number.'
	}}
>
	<FormGroup
		label="ABN"
		htmlFor="abn-fg"
		successMessage="ABN verified"
		hint="Your 11-digit Australian Business Number."
	>
		<input
			id="abn-fg"
			type="text"
			value="51 824 753 556"
			aria-describedby="abn-fg-description"
			style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--border-hairline); border-radius: 0; background: var(--bg-primary); color: var(--text-primary);"
		/>
	</FormGroup>
</Story>
