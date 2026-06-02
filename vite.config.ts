import { writeFileSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

// ---------------------------------------------------------------------------
// Type declaration generator
//
// vite-plugin-dts cannot correctly extract named exports (interfaces, types)
// from Svelte 5 <script lang="ts" module> blocks — it resolves .svelte files
// through the ambient `declare module "*.svelte"` shim, which only exposes the
// default (component) export. This custom plugin writes the declaration files
// directly, mirroring the source module scripts faithfully.
// ---------------------------------------------------------------------------

function motifTypesPlugin() {
	return {
		name: 'motif-types',
		// Run after Rollup has finished writing all JS output files.
		closeBundle() {
			const distDir = resolve(__dirname, 'dist');

			// Ensure subdirectories exist before writing
			mkdirSync(resolve(distDir, 'components/atoms'), { recursive: true });
			mkdirSync(resolve(distDir, 'components/admin'), { recursive: true });

			// ------------------------------------------------------------------
			// contexts/theme.d.ts  (already correct via vite-plugin-dts fallback,
			// but we write it here for consistency)
			// ------------------------------------------------------------------
			mkdirSync(resolve(distDir, 'src/contexts'), { recursive: true });
			writeFileSync(
				resolve(distDir, 'src/contexts/theme.d.ts'),
				[
					"import { getContext, setContext } from 'svelte';",
					'',
					"export type ThemeVariant = 'admin' | 'public';",
					'',
					'export declare function createThemeContext(variant: ThemeVariant): void;',
					'export declare function getThemeVariant(): ThemeVariant;',
					'export declare function isAdminContext(): boolean;',
					'export declare function isPublicContext(): boolean;',
				].join('\n') + '\n',
			);

			// ------------------------------------------------------------------
			// Atom component declarations
			// ------------------------------------------------------------------

			writeFileSync(
				resolve(distDir, 'components/atoms/Button.svelte.d.ts'),
				[
					"import type { HTMLButtonAttributes } from 'svelte/elements';",
					"import type { Snippet } from 'svelte';",
					'',
					'export interface ButtonProps extends HTMLButtonAttributes {',
					"	variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'link';",
					"	size?: 'default' | 'sm' | 'lg' | 'icon';",
					"	theme?: 'admin' | 'public';",
					'	class?: string;',
					'	children?: Snippet;',
					'}',
					'',
					'declare const Button: import("svelte").Component<ButtonProps>;',
					'export default Button;',
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/atoms/Input.svelte.d.ts'),
				[
					"import type { HTMLInputAttributes } from 'svelte/elements';",
					"import type { ThemeVariant } from '../../src/contexts/theme.js';",
					'',
					'export interface InputProps extends Omit<HTMLInputAttributes, "size"> {',
					'	theme?: ThemeVariant;',
					"	size?: 'default' | 'sm';",
					'	class?: string;',
					'	value?: string | number;',
					'}',
					'',
					'declare const Input: import("svelte").Component<InputProps>;',
					'export default Input;',
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/atoms/Label.svelte.d.ts'),
				[
					"import type { HTMLLabelAttributes } from 'svelte/elements';",
					"import type { Snippet } from 'svelte';",
					'',
					'export interface LabelProps extends HTMLLabelAttributes {',
					'	class?: string;',
					'	children: Snippet;',
					'}',
					'',
					'declare const Label: import("svelte").Component<LabelProps>;',
					'export default Label;',
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/atoms/Select.svelte.d.ts'),
				[
					'export interface SelectOption {',
					'	value: string;',
					'	label: string;',
					'	style?: string;',
					'}',
					'',
					'export interface SelectProps {',
					'	value: string;',
					'	options: SelectOption[];',
					'	placeholder?: string;',
					"	size?: 'default' | 'sm';",
					'	class?: string;',
					'	error?: boolean;',
					'	disabled?: boolean;',
					"	theme?: 'admin' | 'public';",
					'	onchange?: (value: string) => void;',
					'}',
					'',
					'declare const Select: import("svelte").Component<SelectProps>;',
					'export default Select;',
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/atoms/Textarea.svelte.d.ts'),
				[
					"import type { HTMLTextareaAttributes } from 'svelte/elements';",
					"import type { ThemeVariant } from '../../src/contexts/theme.js';",
					'',
					'export interface TextareaProps extends HTMLTextareaAttributes {',
					'	theme?: ThemeVariant;',
					'	class?: string;',
					'	value?: string;',
					'}',
					'',
					'declare const Textarea: import("svelte").Component<TextareaProps>;',
					'export default Textarea;',
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/atoms/Toggle.svelte.d.ts'),
				[
					'export interface ToggleProps {',
					'	id?: string;',
					'	name?: string;',
					'	checked: boolean;',
					'	disabled?: boolean;',
					'	onchange?: (checked: boolean) => void;',
					'}',
					'',
					'declare const Toggle: import("svelte").Component<ToggleProps>;',
					'export default Toggle;',
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/atoms/Pill.svelte.d.ts'),
				[
					"export type PillColour = 'default' | 'agents' | 'workflows' | 'synthesis' | 'data' | 'design' | 'infra' | 'finance' | 'technology' | 'healthcare-education' | 'legal' | 'engineering-trades' | 'marketing-communications' | 'operations-admin';",
					'',
					"export type PillFill = 'soft' | 'solid' | 'outline';",
					'',
					'export interface PillProps {',
					'	label: string;',
					"	size?: 'sm' | 'md';",
					'	colour?: PillColour;',
					"	fill?: PillFill;",
					'	tint?: string;',
					'	class?: string;',
					'}',
					'',
					'declare const Pill: import("svelte").Component<PillProps>;',
					'export default Pill;',
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/atoms/Tooltip.svelte.d.ts'),
				[
					"import type { Snippet } from 'svelte';",
					'',
					'export interface TooltipProps {',
					'	text: string;',
					"	position?: 'top' | 'bottom' | 'left' | 'right';",
					"	variant?: 'default' | 'admin';",
					'	children: Snippet;',
					'}',
					'',
					'declare const Tooltip: import("svelte").Component<TooltipProps>;',
					'export default Tooltip;',
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/atoms/Portrait.svelte.d.ts'),
				[
					'export interface PortraitProps {',
					'	src?: string;',
					'	alt?: string;',
					"	size: 'avatar' | 'circle' | 'portrait';",
					'	initials?: string;',
					'	interactive?: boolean;',
					'	class?: string;',
					'}',
					'',
					'declare const Portrait: import("svelte").Component<PortraitProps>;',
					'export default Portrait;',
				].join('\n') + '\n',
			);

			// ------------------------------------------------------------------
			// Admin component declarations
			// ------------------------------------------------------------------

			writeFileSync(
				resolve(distDir, 'components/admin/StatusBadge.svelte.d.ts'),
				[
					'export interface StatusConfig {',
					"	[statusValue: string]: { label: string; colour: 'success' | 'warning' | 'error' | 'info' | 'neutral' };",
					'}',
					'',
					'export interface StatusBadgeProps {',
					'	status: string;',
					'	config: StatusConfig;',
					"	size?: 'sm' | 'md';",
					'}',
					'',
					'declare const StatusBadge: import("svelte").Component<StatusBadgeProps>;',
					'export default StatusBadge;',
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/admin/BulkActionModal.svelte.d.ts'),
				[
					'export interface BulkActionModalProps {',
					'	visible: boolean;',
					'	itemCount: number;',
					"	itemType: 'message' | 'subscriber' | 'post';",
					"	action?: 'delete' | 'archive' | string;",
					'	description?: string;',
					'	confirmLabel?: string;',
					"	confirmVariant?: 'danger' | 'primary';",
					'	onConfirm: () => void;',
					'	onCancel: () => void;',
					'}',
					'',
					'declare const BulkActionModal: import("svelte").Component<BulkActionModalProps>;',
					'export default BulkActionModal;',
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/admin/DeleteConfirmModal.svelte.d.ts'),
				[
					'export interface DeleteConfirmModalProps {',
					'	visible: boolean;',
					'	itemLabel?: string;',
					'	onConfirm: () => void;',
					'	onCancel: () => void;',
					'}',
					'',
					'declare const DeleteConfirmModal: import("svelte").Component<DeleteConfirmModalProps>;',
					'export default DeleteConfirmModal;',
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/admin/Modal.svelte.d.ts'),
				[
					"import type { Snippet } from 'svelte';",
					'',
					'export interface ModalProps {',
					'	open: boolean;',
					'	onclose: () => void;',
					'	title?: string;',
					'	children: Snippet;',
					'}',
					'',
					'declare const Modal: import("svelte").Component<ModalProps>;',
					'export default Modal;',
				].join('\n') + '\n',
			);

			// ------------------------------------------------------------------
			// Barrel index files for atoms and admin
			// ------------------------------------------------------------------

			writeFileSync(
				resolve(distDir, 'components/atoms/index.d.ts'),
				[
					"export { default as Button } from './Button.svelte';",
					"export type { ButtonProps } from './Button.svelte';",
					'',
					"export { default as Input } from './Input.svelte';",
					"export type { InputProps } from './Input.svelte';",
					'',
					"export { default as Select } from './Select.svelte';",
					"export type { SelectProps, SelectOption } from './Select.svelte';",
					'',
					"export { default as Textarea } from './Textarea.svelte';",
					"export type { TextareaProps } from './Textarea.svelte';",
					'',
					"export { default as Label } from './Label.svelte';",
					"export type { LabelProps } from './Label.svelte';",
					'',
					"export { default as Toggle } from './Toggle.svelte';",
					"export type { ToggleProps } from './Toggle.svelte';",
					'',
					"export { default as Pill } from './Pill.svelte';",
					"export type { PillProps, PillColour, PillFill } from './Pill.svelte';",
					'',
					"export { default as Tooltip } from './Tooltip.svelte';",
					"export type { TooltipProps } from './Tooltip.svelte';",
					'',
					"export { default as Portrait } from './Portrait.svelte';",
					"export type { PortraitProps } from './Portrait.svelte';",
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/admin/index.d.ts'),
				[
					"export { default as StatusBadge } from './StatusBadge.svelte';",
					"export type { StatusBadgeProps, StatusConfig } from './StatusBadge.svelte';",
					'',
					"export { default as BulkActionModal } from './BulkActionModal.svelte';",
					"export type { BulkActionModalProps } from './BulkActionModal.svelte';",
					'',
					"export { default as DeleteConfirmModal } from './DeleteConfirmModal.svelte';",
					"export type { DeleteConfirmModalProps } from './DeleteConfirmModal.svelte';",
					'',
					"export { default as Modal } from './Modal.svelte';",
					"export type { ModalProps } from './Modal.svelte';",
				].join('\n') + '\n',
			);

			writeFileSync(
				resolve(distDir, 'components/index.d.ts'),
				[
					"export * from './atoms/index.js';",
					"export * from './admin/index.js';",
				].join('\n') + '\n',
			);

			// ------------------------------------------------------------------
			// Root index.d.ts — the types entry point referenced by package.json
			// ------------------------------------------------------------------

			writeFileSync(
				resolve(distDir, 'index.d.ts'),
				[
					'/**',
					' * Motif Design Library',
					' *',
					' * CSS tokens are separate entry points — import them directly:',
					' *   @import "@motif/design/public";',
					' *   @import "@motif/design/admin";',
					' *   @import "@motif/design/base";',
					' *',
					' * Component usage:',
					' *   import { Button, Input } from "@motif/design";',
					' */',
					"export * from './components/index.js';",
				].join('\n') + '\n',
			);

			console.log('[motif-types] Declaration files written to dist/');
		},
	};
}

// Build configuration for the Motif design library.
// Produces an ES module output with each component individually importable,
// so consumers can import specific atoms without pulling in the entire library.
export default defineConfig({
	// Tailwind 4 is added via the official Vite plugin — no separate config file required.
	// The svelte plugin handles Svelte component compilation as before.
	// motifTypesPlugin() writes declaration files in closeBundle since vite-plugin-dts
	// cannot resolve named exports from Svelte 5 <script module> blocks.
	plugins: [tailwindcss(), svelte(), motifTypesPlugin()],

	build: {
		lib: {
			// Entry point that re-exports all public components and tokens
			entry: 'src/index.ts',
			name: 'MotifDesign',
			// Produce ES module format only — tree-shakeable and compatible
			// with modern SvelteKit consumers
			formats: ['es'],
		},

		rollupOptions: {
			// Exclude Svelte itself from the bundle — consumers supply their own
			// version, preventing duplicate Svelte instances at runtime
			external: ['svelte', /^svelte\//],

			output: {
				// Preserve the original module structure so each component
				// file remains individually importable (e.g. @motif/design/Button)
				preserveModules: true,
				// Strip the src/ prefix so dist/ mirrors the public API surface:
				// components/atoms/Button.js not src/components/atoms/Button.js.
				// Keeps output paths stable as the component count grows.
				preserveModulesRoot: 'src',
				// Explicitly fix the output extension — prevents Rollup falling back
				// to auto-detection as the module graph expands.
				entryFileNames: '[name].js',
			},
		},
	},
});
