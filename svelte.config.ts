import type { SvelteConfig } from '@sveltejs/vite-plugin-svelte';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config: SvelteConfig = {
	// Use vitePreprocess to handle TypeScript, PostCSS, and other preprocessors
	// inside Svelte component <script> and <style> blocks
	preprocess: vitePreprocess()
};

export default config;
