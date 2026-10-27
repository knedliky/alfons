import type { Meta, StoryObj } from '@storybook/svelte';
import Input from '../../components/atoms/Input.svelte';

const meta = {
	title: 'Atoms/Input',
	component: Input,
	tags: ['autodocs'],
	argTypes: {
		size: {
			control: { type: 'select' },
			options: ['default', 'sm']
		},
		disabled: {
			control: { type: 'boolean' }
		},
		placeholder: {
			control: { type: 'text' }
		},
		value: {
			control: { type: 'text' }
		}
	}
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: { placeholder: 'Enter text...' }
};

export const WithValue: Story = {
	args: { value: 'Hello World' }
};

export const Placeholder: Story = {
	args: { placeholder: 'Search components...' }
};

export const Small: Story = {
	args: { placeholder: 'Small input', size: 'sm' }
};

export const Disabled: Story = {
	args: { value: 'Cannot edit', disabled: true }
};

/** Under the admin overlay, which .storybook/preview.js applies from `parameters.theme`. */
export const AdminTheme: Story = {
	parameters: { theme: 'admin' },
	args: { placeholder: 'Admin input' }
};
