<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Breadcrumb from '../../components/navigation/Breadcrumb.svelte';

	const { Story } = defineMeta({
		title: 'Navigation/Breadcrumb',
		component: Breadcrumb,
		tags: ['autodocs'],
		argTypes: {
			items: {
				control: { type: 'object' }
			}
		}
	});
</script>

<!--
	Note: Breadcrumb uses <svelte:head> to inject a JSON-LD <script> tag for
	structured data. In the Storybook canvas this renders harmlessly into the
	story iframe's <head>. No SvelteKit-only imports ($app/*, $env/*) are used —
	this component is safe in Storybook.
-->

<Story
	name="Default"
	asChild
	args={{
		items: [
			{ label: 'Home', href: '/' },
			{ label: 'Organisations', href: '/organisations' },
			{ label: 'Acme Pty Ltd' }
		]
	}}
>
	<Breadcrumb
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Organisations', href: '/organisations' },
			{ label: 'Acme Pty Ltd' }
		]}
	/>
</Story>

<Story
	name="Two Levels"
	asChild
	args={{
		items: [{ label: 'Home', href: '/' }, { label: 'Blog' }]
	}}
>
	<Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog' }]} />
</Story>

<Story
	name="Deep Trail"
	asChild
	args={{
		items: [
			{ label: 'Home', href: '/' },
			{ label: 'Roles', href: '/roles' },
			{ label: 'Software Engineering', href: '/roles/software-engineering' },
			{ label: 'Senior Frontend Engineer' }
		]
	}}
>
	<Breadcrumb
		items={[
			{ label: 'Home', href: '/' },
			{ label: 'Roles', href: '/roles' },
			{ label: 'Software Engineering', href: '/roles/software-engineering' },
			{ label: 'Senior Frontend Engineer' }
		]}
	/>
</Story>

<Story
	name="Admin Context"
	asChild
	args={{
		items: [
			{ label: 'Admin', href: '/admin' },
			{ label: 'Organisations', href: '/admin/organisations' },
			{ label: 'Acme Pty Ltd', href: '/admin/organisations/acme' },
			{ label: 'Members' }
		]
	}}
>
	<Breadcrumb
		items={[
			{ label: 'Admin', href: '/admin' },
			{ label: 'Organisations', href: '/admin/organisations' },
			{ label: 'Acme Pty Ltd', href: '/admin/organisations/acme' },
			{ label: 'Members' }
		]}
	/>
</Story>

<Story
	name="Single Item (Root)"
	asChild
	args={{
		items: [{ label: 'Home' }]
	}}
>
	<Breadcrumb items={[{ label: 'Home' }]} />
</Story>
