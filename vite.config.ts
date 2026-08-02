import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';


// Build configuration for the Alfons design library.
// Produces an ES module output with each component individually importable,
// so consumers can import specific atoms without pulling in the entire library.
export default defineConfig({
	// Tailwind 4 is added via the official Vite plugin — no separate config file required.
	// The svelte plugin handles Svelte component compilation as before.
	plugins: [tailwindcss(), svelte()],

	build: {
		lib: {
			// Entry point that re-exports all public components and tokens
			entry: 'src/index.ts',
			name: 'AlfonsDesign',
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
				// file remains individually importable (e.g. @alfons/design/Button)
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
