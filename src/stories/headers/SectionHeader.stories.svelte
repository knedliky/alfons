<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import SectionHeader from '../../components/headers/SectionHeader.svelte';

	const { Story } = defineMeta({
		title: 'Headers/SectionHeader',
		component: SectionHeader,
		tags: ['autodocs'],
		argTypes: {
			title: {
				control: { type: 'text' }
			},
			subtitle: {
				control: { type: 'text' }
			},
			align: {
				control: { type: 'select' },
				options: ['left', 'center', 'right']
			},
			spacing: {
				control: { type: 'select' },
				options: ['compact', 'standard', 'spacious']
			},
			variant: {
				control: { type: 'select' },
				options: ['public', 'admin']
			},
			accentColour: {
				control: { type: 'select' },
				options: ['default', 'depth']
			}
		}
	});
</script>

<Story
	name="Default"
	asChild
	args={{ title: 'Featured Roles', align: 'center', spacing: 'standard', variant: 'public' }}
>
	<SectionHeader title="Featured Roles" align="center" spacing="standard" variant="public" />
</Story>

<Story
	name="With Subtitle"
	asChild
	args={{
		title: 'Featured Roles',
		subtitle: 'Discover opportunities matched to your skills and experience.',
		align: 'center',
		spacing: 'standard',
		variant: 'public'
	}}
>
	<SectionHeader
		title="Featured Roles"
		subtitle="Discover opportunities matched to your skills and experience."
		align="center"
		spacing="standard"
		variant="public"
	/>
</Story>

<Story
	name="Left Aligned"
	asChild
	args={{
		title: 'Recent Activity',
		subtitle: 'Actions taken across your account in the past 30 days.',
		align: 'left',
		spacing: 'standard',
		variant: 'public'
	}}
>
	<SectionHeader
		title="Recent Activity"
		subtitle="Actions taken across your account in the past 30 days."
		align="left"
		spacing="standard"
		variant="public"
	/>
</Story>

<Story
	name="With Accent Bar Default"
	asChild
	args={{
		title: 'Core Capabilities',
		subtitle: 'The foundational skills that underpin your professional profile.',
		align: 'center',
		spacing: 'standard',
		variant: 'public',
		accentColour: 'default'
	}}
>
	<SectionHeader
		title="Core Capabilities"
		subtitle="The foundational skills that underpin your professional profile."
		align="center"
		spacing="standard"
		variant="public"
		accentColour="default"
	/>
</Story>

<Story
	name="With Accent Bar Depth"
	asChild
	args={{
		title: 'Methodology',
		subtitle: 'How we analyse labour market signals to surface relevant insights.',
		align: 'left',
		spacing: 'standard',
		variant: 'public',
		accentColour: 'depth'
	}}
>
	<SectionHeader
		title="Methodology"
		subtitle="How we analyse labour market signals to surface relevant insights."
		align="left"
		spacing="standard"
		variant="public"
		accentColour="depth"
	/>
</Story>

<Story
	name="Admin Variant"
	asChild
	args={{
		title: 'Organisation Overview',
		subtitle: 'Key metrics and member activity for this organisation.',
		align: 'left',
		spacing: 'compact',
		variant: 'admin'
	}}
>
	<SectionHeader
		title="Organisation Overview"
		subtitle="Key metrics and member activity for this organisation."
		align="left"
		spacing="compact"
		variant="admin"
	/>
</Story>

<Story
	name="Compact Spacing"
	asChild
	args={{
		title: 'Skill Gaps',
		align: 'left',
		spacing: 'compact',
		variant: 'public'
	}}
>
	<SectionHeader title="Skill Gaps" align="left" spacing="compact" variant="public" />
</Story>

<Story
	name="Spacious"
	asChild
	args={{
		title: 'Why Motif',
		subtitle: 'Consistent, token-driven design across every surface in the ecosystem.',
		align: 'center',
		spacing: 'spacious',
		variant: 'public'
	}}
>
	<SectionHeader
		title="Why Motif"
		subtitle="Consistent, token-driven design across every surface in the ecosystem."
		align="center"
		spacing="spacious"
		variant="public"
	/>
</Story>
