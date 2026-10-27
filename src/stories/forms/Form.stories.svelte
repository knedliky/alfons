<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Form from '../../components/forms/Form.svelte';

	// Admin stories run under the admin overlay through `parameters.theme`,
	// which .storybook/preview.js writes to data-theme on <html> (D-238).
	const ADMIN = { theme: 'admin' };

	const { Story } = defineMeta({
		title: 'Forms/Form',
		component: Form,
		tags: ['autodocs'],
		argTypes: {
			status: {
				control: { type: 'select' },
				options: ['idle', 'success', 'error']
			},
			statusMessage: { control: { type: 'text' } }
		}
	});
</script>

<Story
	name="Default — idle"
	asChild
	parameters={ADMIN}
	args={{ status: 'idle', statusMessage: '' }}
>
	<Form status="idle">
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<div>
				<label
					for="org-name"
					style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;"
				>
					Organisation name
				</label>
				<input
					id="org-name"
					type="text"
					placeholder="Acme Pty Ltd"
					style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--border-hairline); border-radius: 0; background: var(--bg-primary); color: var(--text-primary);"
				/>
			</div>
			<div>
				<label
					for="contact-email"
					style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;"
				>
					Contact email
				</label>
				<input
					id="contact-email"
					type="email"
					placeholder="hello@example.com.au"
					style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--border-hairline); border-radius: 0; background: var(--bg-primary); color: var(--text-primary);"
				/>
			</div>
			<button
				type="submit"
				style="height: 44px; padding: 0 1.5rem; font-size: 0.9375rem; font-weight: 500; background: var(--accent, #7c3aed); color: #fff; border: none; border-radius: 0; cursor: pointer;"
			>
				Save changes
			</button>
		</div>
	</Form>
</Story>

<Story
	name="Success state"
	asChild
	parameters={ADMIN}
	args={{ status: 'success', statusMessage: 'Organisation updated successfully.' }}
>
	<Form status="success" statusMessage="Organisation updated successfully.">
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<div>
				<label
					for="org-name-s"
					style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;"
				>
					Organisation name
				</label>
				<input
					id="org-name-s"
					type="text"
					value="Acme Pty Ltd"
					style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--border-hairline); border-radius: 0; background: var(--bg-primary); color: var(--text-primary);"
				/>
			</div>
			<button
				type="submit"
				style="height: 44px; padding: 0 1.5rem; font-size: 0.9375rem; font-weight: 500; background: var(--accent, #7c3aed); color: #fff; border: none; border-radius: 0; cursor: pointer;"
			>
				Save changes
			</button>
		</div>
	</Form>
</Story>

<Story
	name="Error state"
	asChild
	parameters={ADMIN}
	args={{
		status: 'error',
		statusMessage: 'Failed to update organisation. Please try again.'
	}}
>
	<Form status="error" statusMessage="Failed to update organisation. Please try again.">
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<div>
				<label
					for="org-name-e"
					style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;"
				>
					Organisation name
				</label>
				<input
					id="org-name-e"
					type="text"
					value="Acme Pty Ltd"
					style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--border-hairline); border-radius: 0; background: var(--bg-primary); color: var(--text-primary);"
				/>
			</div>
			<button
				type="submit"
				style="height: 44px; padding: 0 1.5rem; font-size: 0.9375rem; font-weight: 500; background: var(--accent, #7c3aed); color: #fff; border: none; border-radius: 0; cursor: pointer;"
			>
				Save changes
			</button>
		</div>
	</Form>
</Story>

<Story name="Public theme" asChild args={{ status: 'idle', statusMessage: '' }}>
	<Form status="idle">
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<div>
				<label
					for="full-name-p"
					style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;"
				>
					Full name
				</label>
				<input
					id="full-name-p"
					type="text"
					placeholder="Jane Smith"
					style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--border, #ddd); border-radius: 0;"
				/>
			</div>
			<div>
				<label
					for="email-p"
					style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;"
				>
					Email address
				</label>
				<input
					id="email-p"
					type="email"
					placeholder="jane@example.com.au"
					style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--border, #ddd); border-radius: 0;"
				/>
			</div>
			<button
				type="submit"
				style="height: 44px; padding: 0 1.5rem; font-size: 0.9375rem; font-weight: 500; background: var(--colour-primary, #7c3aed); color: #fff; border: none; border-radius: 0; cursor: pointer;"
			>
				Get started
			</button>
		</div>
	</Form>
</Story>
