import type { Meta, StoryObj } from '@storybook/svelte';
import Select from '../../components/atoms/Select.svelte';

const sampleOptions = [
	{ value: 'draft', label: 'Draft' },
	{ value: 'published', label: 'Published' },
	{ value: 'archived', label: 'Archived' }
];

const fontOptions = [
	{ value: 'switzer', label: 'Switzer', style: "font-family: 'Switzer'" },
	{ value: 'ibm-plex-serif', label: 'IBM Plex Serif', style: "font-family: 'IBM Plex Serif'" },
	{ value: 'azeret', label: 'Azeret Mono', style: "font-family: 'Azeret Mono Variable'" },
	{ value: 'rock-salt', label: 'Rock Salt', style: "font-family: 'Rock Salt'" }
];

const occupationOptions = [
	{ value: 'data-analyst', label: 'Data Analyst' },
	{ value: 'software-engineer', label: 'Software Engineer' },
	{ value: 'registered-nurse', label: 'Registered Nurse' },
	{ value: 'electrician', label: 'Electrician' },
	{ value: 'primary-teacher', label: 'Primary School Teacher' },
	{ value: 'civil-engineer', label: 'Civil Engineer' },
	{ value: 'accountant', label: 'Accountant' },
	{ value: 'graphic-designer', label: 'Graphic Designer' },
	{ value: 'project-manager', label: 'Project Manager' },
	{ value: 'physiotherapist', label: 'Physiotherapist' }
];

const meta = {
	title: 'Atoms/Select',
	component: Select,
	tags: ['autodocs'],
	argTypes: {
		theme: {
			control: { type: 'select' },
			options: ['public', 'admin']
		},
		size: {
			control: { type: 'select' },
			options: ['default', 'sm']
		},
		error: {
			control: { type: 'boolean' }
		},
		disabled: {
			control: { type: 'boolean' }
		},
		placeholder: {
			control: { type: 'text' }
		}
	}
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		options: sampleOptions,
		value: '',
		placeholder: 'Select status',
		theme: 'public'
	}
};

export const WithSelection: Story = {
	args: {
		options: sampleOptions,
		value: 'published',
		theme: 'public'
	}
};

export const WithFontStyles: Story = {
	args: {
		options: fontOptions,
		value: '',
		placeholder: 'Select font',
		theme: 'public'
	}
};

export const Small: Story = {
	args: {
		options: sampleOptions,
		value: '',
		placeholder: 'Small select',
		size: 'sm',
		theme: 'public'
	}
};

export const Error: Story = {
	args: {
		options: sampleOptions,
		value: '',
		placeholder: 'Select status',
		error: true,
		theme: 'public'
	}
};

export const Disabled: Story = {
	args: {
		options: sampleOptions,
		value: 'draft',
		disabled: true,
		theme: 'public'
	}
};

export const AdminTheme: Story = {
	args: {
		options: sampleOptions,
		value: '',
		placeholder: 'Select status',
		theme: 'admin'
	}
};

export const Searchable: Story = {
	args: {
		options: occupationOptions,
		value: '',
		placeholder: 'Select an occupation',
		searchable: true,
		searchPlaceholder: 'Search occupations...',
		theme: 'public'
	}
};
