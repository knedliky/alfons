/**
 * Theme Context System
 *
 * Provides route-based theme variant detection for components.
 * Admin routes automatically use admin styling, public routes use public styling.
 */

import { getContext, setContext } from 'svelte';

export type ThemeVariant = 'admin' | 'public';

const THEME_CONTEXT_KEY = Symbol('alfons-theme-context');

interface ThemeContext {
	variant: ThemeVariant;
}

export function createThemeContext(variant: ThemeVariant): void {
	setContext(THEME_CONTEXT_KEY, { variant });
}

export function getThemeVariant(): ThemeVariant {
	const context = getContext<ThemeContext | undefined>(THEME_CONTEXT_KEY);
	return context?.variant ?? 'public';
}

export function isAdminContext(): boolean {
	return getThemeVariant() === 'admin';
}

export function isPublicContext(): boolean {
	return getThemeVariant() === 'public';
}
