import { getContext, setContext } from 'svelte';

export interface RadioOption {
	value: string;
	label?: string;
	description?: string;
	disabled?: boolean;
}

/**
 * Context contract shared between RadioGroup and its Radio children. The
 * properties are getters into the group's reactive state, so a Radio reads
 * live values without prop drilling.
 */
export interface RadioGroupContext {
	readonly current: string | undefined;
	readonly name: string;
	readonly disabled: boolean;
	readonly theme: 'public' | 'admin';
	select: (value: string) => void;
}

const RADIO_GROUP_KEY = Symbol('motif-radio-group');

export function setRadioGroupContext(context: RadioGroupContext): void {
	setContext(RADIO_GROUP_KEY, context);
}

export function getRadioGroupContext(): RadioGroupContext | undefined {
	return getContext<RadioGroupContext | undefined>(RADIO_GROUP_KEY);
}
