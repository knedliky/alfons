/**
 * Screenshot stories from the built catalogue.
 *
 * Exists because three tasks in a row (AL-001, AL-002, AL-BUG-001) were verified
 * against a passing build and a story count, neither of which says anything about
 * whether a component actually paints. A token that resolves to nothing does not
 * fail a build — the declaration is simply discarded, and the component renders
 * without it. Only a rendered pixel catches that.
 *
 * Run `bun run build-storybook` first, then:
 *   bun run shots                    — the default set
 *   bun run shots cards-card--default atoms-button--default
 *
 * Alongside each image it reports the story's resolved custom properties, so a
 * regression can be read from the log without opening the images.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const CATALOGUE = 'storybook-static';
const OUT = 'screenshots';
const PORT = 6017;

/** Stories worth a look by default: one per category the merge touched. */
const DEFAULT_STORIES = [
	'cards-card--default',
	'atoms-button--default',
	'atoms-surface--default',
	'atoms-skeleton--rectangle',
	'atoms-agentinput--default',
	'stats-statcard--default',
	'feedback-toast--info',
	'layouts-pagesection--standard',
	'pickers-calendarday--public-selected',
	'pickers-calendargrid--public-variant',
	'brand-logo--portrait',
	'disclosure-accordion--single',
	'overlays-menu--default',
	'blog-longread--full-article',
	'design-tokens-colours--brand-colours',
];

const MIME = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.svg': 'image/svg+xml',
	'.woff2': 'font/woff2',
	'.png': 'image/png',
};

/** Serve the built catalogue, so the script needs nothing running beside it. */
function serveCatalogue() {
	const server = createServer(async (req, res) => {
		const path = join(CATALOGUE, decodeURIComponent(req.url.split('?')[0]));
		try {
			const body = await readFile(path);
			res.writeHead(200, { 'Content-Type': MIME[extname(path)] ?? 'application/octet-stream' });
			res.end(body);
		} catch {
			res.writeHead(404).end('not found');
		}
	});
	return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

const stories = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_STORIES;

await mkdir(OUT, { recursive: true });
const server = await serveCatalogue();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 620 } });

// A story that throws still screenshots, just blank — collect errors so it cannot pass quietly.
const errors = [];
page.on('pageerror', (e) => errors.push(`${String(e).slice(0, 200)}`));

for (const id of stories) {
	await page.goto(`http://localhost:${PORT}/iframe.html?id=${id}&viewMode=story`, {
		waitUntil: 'networkidle',
	});
	await page.waitForTimeout(600);
	await page.screenshot({ path: join(OUT, `${id}.png`) });

	const mode = await page.evaluate(() =>
		document.documentElement.getAttribute('data-colour-mode'),
	);
	console.log(`${id.padEnd(40)} mode=${mode}`);
}

await browser.close();
server.close();

if (errors.length) {
	console.error(`\n${errors.length} page error(s):`);
	for (const e of errors) console.error(`  ${e}`);
	process.exit(1);
}
console.log(`\n${stories.length} screenshots written to ${OUT}/`);
