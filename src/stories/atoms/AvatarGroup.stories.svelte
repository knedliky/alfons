<script module lang="ts">
	import { defineMeta } from '@storybook/addon-svelte-csf';
	import AvatarGroup from '../../components/atoms/AvatarGroup.svelte';

	const { Story } = defineMeta({
		title: 'Atoms/AvatarGroup',
		component: AvatarGroup,
		tags: ['autodocs'],
		argTypes: {
			max: { control: { type: 'number' } }
		}
	});

	const team = [
		{ initials: 'SK', alt: 'Simon K' },
		{ initials: 'MV', alt: 'Motivka' },
		{ initials: 'ME', alt: 'Merlin' },
		{ initials: 'SZ', alt: 'Scheherazade' },
		{ initials: 'DV', alt: 'Domovoi' },
		{ initials: 'AT', alt: 'Atlas' }
	];
</script>

<Story name="Default" asChild>
	<AvatarGroup people={team.slice(0, 3)} />
</Story>

<Story name="With Overflow" asChild>
	<AvatarGroup people={team} max={4} />
</Story>

<Story name="Pair" asChild>
	<AvatarGroup people={team.slice(0, 2)} />
</Story>
