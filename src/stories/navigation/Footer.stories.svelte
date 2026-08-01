<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import Footer from '../../components/navigation/Footer.svelte';

	const { Story } = defineMeta({
		title: 'Navigation/Footer',
		component: Footer,
		tags: ['autodocs'],
		parameters: { layout: 'fullscreen' }
	});
</script>

<Story name="Default" asChild>
	<Footer />
</Story>

<Story name="No Newsletter" asChild>
	<Footer newsletter={null} />
</Story>

<Story name="Two Link Columns" asChild>
	<Footer
		columns={[
			{
				heading: 'Explore',
				links: [
					{ label: 'Blog', href: '#blog' },
					{ label: 'Experiments', href: '#experiments' }
				]
			},
			{
				heading: 'Connect',
				links: [
					{ label: 'GitHub', href: '#github' },
					{ label: 'Email', href: '#email' }
				]
			}
		]}
	/>
</Story>
