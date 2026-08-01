<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Form from '../../components/forms/Form.svelte';

	const { Story } = defineMeta({
		title: 'Forms/Form',
		component: Form,
		tags: ['autodocs'],
		argTypes: {
			theme: {
				control: { type: 'select' },
				options: ['public', 'admin']
			},
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
	args={{ theme: 'admin', status: 'idle', statusMessage: '' }}
>
	<Form theme="admin" status="idle">
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<div>
				<label for="org-name" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">
					Organisation name
				</label>
				<input
					id="org-name"
					type="text"
					placeholder="Acme Pty Ltd"
					style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--admin-border, #333); border-radius: 0; background: var(--admin-bg, #1a1a1a); color: var(--admin-text, #fff);"
				/>
			</div>
			<div>
				<label for="contact-email" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">
					Contact email
				</label>
				<input
					id="contact-email"
					type="email"
					placeholder="hello@example.com.au"
					style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--admin-border, #333); border-radius: 0; background: var(--admin-bg, #1a1a1a); color: var(--admin-text, #fff);"
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
	args={{ theme: 'admin', status: 'success', statusMessage: 'Organisation updated successfully.' }}
>
	<Form theme="admin" status="success" statusMessage="Organisation updated successfully.">
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<div>
				<label for="org-name-s" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">
					Organisation name
				</label>
				<input
					id="org-name-s"
					type="text"
					value="Acme Pty Ltd"
					style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--admin-border, #333); border-radius: 0; background: var(--admin-bg, #1a1a1a); color: var(--admin-text, #fff);"
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
	args={{ theme: 'admin', status: 'error', statusMessage: 'Failed to update organisation. Please try again.' }}
>
	<Form theme="admin" status="error" statusMessage="Failed to update organisation. Please try again.">
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<div>
				<label for="org-name-e" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">
					Organisation name
				</label>
				<input
					id="org-name-e"
					type="text"
					value="Acme Pty Ltd"
					style="width: 100%; height: 44px; padding: 0 1rem; font-size: 0.9375rem; border: 1px solid var(--admin-border, #333); border-radius: 0; background: var(--admin-bg, #1a1a1a); color: var(--admin-text, #fff);"
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
	name="Public theme"
	asChild
	args={{ theme: 'public', status: 'idle', statusMessage: '' }}
>
	<Form theme="public" status="idle">
		<div style="display: flex; flex-direction: column; gap: 1rem;">
			<div>
				<label for="full-name-p" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">
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
				<label for="email-p" style="display: block; font-size: 0.875rem; font-weight: 500; margin-bottom: 0.5rem;">
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
