import type { Meta, StoryObj } from '@storybook/svelte';
import Pill from '../../components/atoms/Pill.svelte';

const meta = {
	title: 'Atoms/Pill',
	component: Pill,
	tags: ['autodocs'],
	argTypes: {
		label: {
			control: { type: 'text' }
		},
		size: {
			control: { type: 'select' },
			options: ['sm', 'md']
		},
		fill: {
			control: { type: 'select' },
			options: ['soft', 'solid', 'outline']
		},
		colour: {
			control: { type: 'select' },
			options: [
				'default',
				'agents',
				'workflows',
				'synthesis',
				'data',
				'design',
				'infra',
				'finance',
				'technology',
				'healthcare-education',
				'legal',
				'engineering-trades',
				'marketing-communications',
				'operations-admin'
			]
		},
		tint: {
			control: { type: 'text' }
		}
	}
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Soft: Story = {
	args: { label: 'Operations & Admin', size: 'sm', fill: 'soft', colour: 'operations-admin' }
};

export const Solid: Story = {
	args: { label: 'Creative', size: 'md', fill: 'solid', tint: 'var(--burnt-sunset)' }
};

export const Outline: Story = {
	args: { label: 'Design', size: 'md', fill: 'outline', colour: 'design' }
};

export const CustomTint: Story = {
	args: { label: 'Custom', size: 'sm', fill: 'soft', tint: 'oklch(0.7 0.14 340)' }
};
