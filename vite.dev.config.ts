import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url));

// The prototyping surface — `bun run dev`.
//
// Serves src/dev under base /dev so Atlas's Caddy can reverse-proxy
// atlas.localhost/dev/* straight through with paths intact. Prototypes are
// discovered from prototypes/ via import.meta.glob, so provisioning a round is
// writing files: HMR picks them up with nothing to restart.
//
// The aliases resolve '@alfons/design' exactly as a consumer's bundler would
// via the exports map (types and svelte conditions point at src). Prototype
// markup therefore imports the library by its published name, which is what
// lets a winning page move to a real consumer unchanged.
export default defineConfig({
	root: 'src/dev',
	base: '/dev/',
	publicDir: false,
	plugins: [
		tailwindcss(),
		svelte(),
		{
			// The watcher follows the Vite root (src/dev), and prototypes/ sits
			// outside it — without this, a newly provisioned round is invisible
			// until a restart, which breaks the promise that provisioning is
			// just writing files. Invalidation is explicit as well: Vite's own
			// glob invalidation does not fire for adds outside the root, so a
			// new round would compile against the old glob until restart.
			name: 'alfons-watch-prototypes',
			configureServer(server) {
				server.watcher.add(fromRoot('./prototypes'));
				const republish = (file: string) => {
					if (!file.includes('/prototypes/')) return;
					server.moduleGraph.invalidateAll();
					server.ws.send({ type: 'full-reload' });
				};
				server.watcher.on('add', republish);
				server.watcher.on('unlink', republish);
				server.watcher.on('addDir', republish);
			}
		}
	],
	resolve: {
		alias: {
			'@alfons/design/public': fromRoot('./src/tokens/public.css'),
			'@alfons/design/admin': fromRoot('./src/tokens/admin.css'),
			'@alfons/design/base': fromRoot('./src/tokens/base.css'),
			'@alfons/design/form-states': fromRoot('./src/tokens/form-states.css'),
			'@alfons/design': fromRoot('./src/index.ts')
		}
	},
	server: {
		port: 6008,
		strictPort: true,
		fs: { allow: [repoRoot] }
	}
});
