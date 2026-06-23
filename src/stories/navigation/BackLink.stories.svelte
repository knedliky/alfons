<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import BackLink from '../../components/navigation/BackLink.svelte';

	const { Story } = defineMeta({
		title: 'Navigation/BackLink',
		component: BackLink,
		tags: ['autodocs'],
		argTypes: {
			href: {
				control: { type: 'text' }
			},
			label: {
				control: { type: 'text' }
			},
			fixed: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<!--
	Note: BackLink calls getThemeVariant() which reads from Svelte context.
	In Storybook without a parent context provider, getThemeVariant() falls
	back to 'public' gracefully (returns context?.variant ?? 'public').
	No SvelteKit-only imports are used — this component is safe in Storybook.

	The `fixed` prop sets a CSS custom property on document.documentElement via
	$effect. This works in a browser story canvas but has no visible effect in
	the Storybook docs panel since there is no fixed header reference element.
-->

<Story name="Default" asChild args={{ href: '/blog', label: 'Back to Blog', fixed: false }}>
	<BackLink href="/blog" label="Back to Blog" />
</Story>

<Story
	name="Back to Organisations"
	asChild
	args={{ href: '/organisations', label: 'Back to Organisations', fixed: false }}
>
	<BackLink href="/organisations" label="Back to Organisations" />
</Story>

<Story
	name="Back to Search Results"
	asChild
	args={{ href: '/roles', label: 'Back to Search Results', fixed: false }}
>
	<BackLink href="/roles" label="Back to Search Results" />
</Story>

<Story
	name="Back to Dashboard"
	asChild
	args={{ href: '/admin', label: 'Back to Dashboard', fixed: false }}
>
	<BackLink href="/admin" label="Back to Dashboard" />
</Story>
