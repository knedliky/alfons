<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import PageHeader from '../../components/headers/PageHeader.svelte';

	const { Story } = defineMeta({
		title: 'Headers/PageHeader',
		component: PageHeader,
		tags: ['autodocs'],
		argTypes: {
			title: {
				control: { type: 'text' }
			},
			subtitle: {
				control: { type: 'text' }
			},
			excerpt: {
				control: { type: 'text' }
			},
			align: {
				control: { type: 'select' },
				options: ['left', 'center', 'right']
			},
			spacing: {
				control: { type: 'select' },
				options: ['compact', 'standard', 'spacious', 'none']
			},
			variant: {
				control: { type: 'select' },
				options: ['public', 'admin', 'article']
			},
			glitch: {
				control: { type: 'boolean' }
			},
			pixelate: {
				control: { type: 'boolean' }
			}
		}
	});
</script>

<Story
	name="Default"
	asChild
	args={{ title: 'Organisations', align: 'center', spacing: 'standard', variant: 'public' }}
>
	<PageHeader title="Organisations" align="center" spacing="standard" variant="public" />
</Story>

<Story
	name="With Subtitle"
	asChild
	args={{
		title: 'Organisations',
		subtitle: 'Manage your organisation memberships and permissions.',
		align: 'center',
		spacing: 'standard',
		variant: 'public'
	}}
>
	<PageHeader
		title="Organisations"
		subtitle="Manage your organisation memberships and permissions."
		align="center"
		spacing="standard"
		variant="public"
	/>
</Story>

<Story
	name="Left Aligned"
	asChild
	args={{
		title: 'Labour Market Insights',
		subtitle: 'Explore trending roles and skill gaps across the Australian workforce.',
		align: 'left',
		spacing: 'standard',
		variant: 'public'
	}}
>
	<PageHeader
		title="Labour Market Insights"
		subtitle="Explore trending roles and skill gaps across the Australian workforce."
		align="left"
		spacing="standard"
		variant="public"
	/>
</Story>

<Story
	name="Admin Variant"
	asChild
	args={{
		title: 'User Management',
		subtitle: 'Create, suspend, and manage user accounts.',
		align: 'left',
		spacing: 'standard',
		variant: 'admin'
	}}
>
	<PageHeader
		title="User Management"
		subtitle="Create, suspend, and manage user accounts."
		align="left"
		spacing="standard"
		variant="admin"
	/>
</Story>

<Story
	name="Article Variant"
	asChild
	args={{
		title: 'Building Intelligent Systems in 2026',
		subtitle: 'Analysis',
		excerpt:
			'A practical guide to designing agent systems that are reliable, observable, and aligned with real-world constraints.',
		align: 'left',
		spacing: 'none',
		variant: 'article'
	}}
>
	<PageHeader
		title="Building Intelligent Systems in 2026"
		subtitle="Analysis"
		excerpt="A practical guide to designing agent systems that are reliable, observable, and aligned with real-world constraints."
		align="left"
		spacing="none"
		variant="article"
	/>
</Story>

<Story
	name="Compact Spacing"
	asChild
	args={{
		title: 'Settings',
		align: 'left',
		spacing: 'compact',
		variant: 'public'
	}}
>
	<PageHeader title="Settings" align="left" spacing="compact" variant="public" />
</Story>

<Story
	name="Spacious"
	asChild
	args={{
		title: 'Welcome to Motif',
		subtitle: 'A design system built for clarity, consistency, and speed.',
		align: 'center',
		spacing: 'spacious',
		variant: 'public'
	}}
>
	<PageHeader
		title="Welcome to Motif"
		subtitle="A design system built for clarity, consistency, and speed."
		align="center"
		spacing="spacious"
		variant="public"
	/>
</Story>
