/**
 * Prototyping rounds — provisioning and promotion.
 *
 * A round is five distinctly different answers to one page brief, rendered
 * side by side at /dev/<page-name> so the strongest can be promoted into the
 * library. The server's job is the same here as everywhere else: keep five
 * agents building against one system rather than five. So the seeded shells
 * come from the manifest — the live shell tier, the live header and footer —
 * not from a template that would drift the day a component is retired.
 *
 * Both functions are pure over the loaded manifest and return file plans; the
 * caller writes the files. The dev app then discovers rounds from the tree
 * (import.meta.glob over prototypes/), so there is no registry to update and
 * none to drift.
 */
import { review } from '../rules/index.js';
import type { ComponentEntry, Manifest, Surface } from '../manifest/types.js';

export interface ApproachRequest {
	/** Directory slug under the round; defaults to a1..a5 by position. */
	slug?: string;
	/** Short name of the design direction, e.g. "Editorial broadsheet". */
	title: string;
	/** What this approach explores and which constraint it pushes. */
	direction: string;
}

export interface PrototypeRoundRequest {
	/** Kebab-case page slug; becomes the /dev/<page-name> path segment. */
	page: string;
	title: string;
	/** The brief distilled from the discovery questions, in full sentences. */
	brief: string;
	surface?: Surface;
	/** The ledger release this round runs under, e.g. proto-landing-page. */
	release?: string;
	approaches: ApproachRequest[];
}

export interface PlannedFile {
	path: string;
	contents: string;
}

export interface PrototypeRoundPlan {
	page: string;
	url: string;
	files: PlannedFile[];
	/** Components the seeds import, so the caller can see none were invented. */
	componentsUsed: string[];
	notes: string[];
}

/** A component that can actually be imported: exported and not on its way out. */
function usable(manifest: Manifest, name: string): ComponentEntry | null {
	const entry = manifest.components.find((candidate) => candidate.name === name);
	if (!entry || !entry.exported) return null;
	return (entry.lifecycle?.status ?? 'live') === 'live' ? entry : null;
}

/** The first live, exported shell-tier layout, preferring the named one. */
function shellFor(manifest: Manifest, preferred: string): ComponentEntry | null {
	return (
		usable(manifest, preferred) ??
		manifest.components.find(
			(entry) =>
				entry.layoutTier === 'shell' &&
				entry.exported &&
				(entry.lifecycle?.status ?? 'live') === 'live'
		) ??
		null
	);
}

function escapeAttribute(value: string): string {
	return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

/**
 * One seeded Page.svelte: the production shell with nothing inside it yet.
 *
 * The seed must pass review_markup untouched — an agent whose starting point
 * already carries findings learns that findings are ambient noise. It also
 * carries the working marker from the first moment, so the glow overlay shows
 * each approach the instant the round is provisioned.
 */
function seedPage(
	manifest: Manifest,
	round: PrototypeRoundRequest,
	approach: Required<ApproachRequest>,
	position: number,
	notes: string[]
): string {
	const surface = round.surface ?? 'public';
	const shell = shellFor(manifest, 'PageFrame');
	const header = usable(manifest, 'Header');
	const footer = usable(manifest, 'Footer');
	const region = usable(manifest, 'PageSection');
	const container = usable(manifest, 'Container');
	const pageHeader = usable(manifest, 'PageHeader');

	for (const [name, entry] of [
		['a shell layout', shell],
		['Header', header],
		['Footer', footer]
	] as const) {
		if (!entry) notes.push(`${name} is not live and exported; the seed omits it.`);
	}

	const imports = [shell, header, footer, region, container, pageHeader]
		.filter((entry): entry is ComponentEntry => Boolean(entry))
		.map((entry) => entry.name)
		.sort();

	const marker = escapeAttribute(`${approach.title} — seeded shell, composing the base layer`);
	const headerSnippet = header ? `\t{#snippet header()}<${header.name} />{/snippet}\n` : '';
	const footerSnippet = footer ? `\t{#snippet footer()}<${footer.name} />{/snippet}\n` : '';

	const headline = pageHeader
		? `\t\t\t\t<${pageHeader.name}\n` +
			`\t\t\t\t\ttitle="${escapeAttribute(round.title)}"\n` +
			`\t\t\t\t\tsubtitle="${escapeAttribute(approach.title)}"\n` +
			`\t\t\t\t/>`
		: `\t\t\t\t<h1>${round.title}</h1>`;

	const inner = [
		region ? `\t\t<${region.name}>` : null,
		container ? `\t\t\t<${container.name}>` : null,
		headline,
		container ? `\t\t\t</${container.name}>` : null,
		region ? `\t\t</${region.name}>` : null
	]
		.filter((line): line is string => Boolean(line))
		.join('\n');

	const shellOpen = shell ? `<${shell.name}${surface === 'admin' ? ' theme="admin"' : ''}>\n` : '';
	const shellClose = shell ? `</${shell.name}>\n` : '';

	return (
		`<script lang="ts">\n` +
		`\t/**\n` +
		`\t * ${round.title} — approach ${position} of ${round.approaches.length}: ${approach.title}\n` +
		`\t *\n` +
		`\t * Direction: ${approach.direction}\n` +
		`\t *\n` +
		`\t * Brief: ${round.brief}\n` +
		`\t *\n` +
		`\t * Owned by one agent. Build from the base layer up — shell, then\n` +
		`\t * regions, then containers, then components — and keep\n` +
		`\t * data-alfons-working="what you are composing" on the region under\n` +
		`\t * construction so the build can be watched live at /dev/${round.page}.\n` +
		`\t * Remove the marker when the region is finished.\n` +
		`\t */\n` +
		(imports.length ? `\timport { ${imports.join(', ')} } from '@alfons/design';\n` : '') +
		`</script>\n\n` +
		shellOpen +
		headerSnippet +
		footerSnippet +
		`\t<main data-alfons-working="${marker}">\n` +
		inner +
		`\n\t</main>\n` +
		shellClose
	);
}

export function planPrototypeRound(
	manifest: Manifest,
	request: PrototypeRoundRequest
): PrototypeRoundPlan {
	const notes: string[] = [];

	if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(request.page)) {
		throw new Error(`Page slugs are kebab-case; got "${request.page}".`);
	}
	if (request.approaches.length !== 5) {
		throw new Error(
			`A round is five distinctly different approaches; got ${request.approaches.length}. ` +
				`Fewer explores too little of the space, more splits attention past usefulness.`
		);
	}

	const approaches = request.approaches.map((approach, index) => ({
		slug: approach.slug ?? `a${index + 1}`,
		title: approach.title,
		direction: approach.direction
	}));

	const slugs = new Set(approaches.map((approach) => approach.slug));
	if (slugs.size !== approaches.length) {
		throw new Error('Approach slugs must be distinct; each agent owns exactly one directory.');
	}
	const titles = new Set(approaches.map((approach) => approach.title.toLowerCase()));
	if (titles.size !== approaches.length) {
		throw new Error(
			'Approach titles must be distinct — five names for the same direction is one approach.'
		);
	}

	const files: PlannedFile[] = [
		{
			path: `prototypes/${request.page}/round.json`,
			contents:
				JSON.stringify(
					{
						page: request.page,
						title: request.title,
						brief: request.brief,
						surface: request.surface ?? 'public',
						release: request.release ?? null,
						status: 'exploring',
						approaches: approaches.map((approach) => ({
							...approach,
							deviations: []
						}))
					},
					null,
					'\t'
				) + '\n'
		}
	];

	const componentsUsed = new Set<string>();
	approaches.forEach((approach, index) => {
		const contents = seedPage(manifest, request, approach, index + 1, notes);
		for (const match of contents.matchAll(/import \{ ([^}]+) \}/g)) {
			for (const name of match[1]!.split(',')) componentsUsed.add(name.trim());
		}
		files.push({ path: `prototypes/${request.page}/${approach.slug}/Page.svelte`, contents });
	});

	// The seed promises it passes review; hold the promise here rather than in
	// a test that could drift from this code.
	for (const file of files) {
		if (!file.path.endsWith('.svelte')) continue;
		const result = review(file.contents, manifest, request.surface ?? 'public');
		if (result.parseError || result.violations.length) {
			throw new Error(
				`Seed for ${file.path} does not pass its own review: ` +
					(result.parseError ?? result.violations.map((violation) => violation.rule).join(', '))
			);
		}
	}

	notes.push(
		'Write these files, then the round is live at the URL once `bun run dev` is running ' +
			'and Atlas’s Caddy carries the /dev reverse proxy. This server touches no files.'
	);

	return {
		page: request.page,
		url: `https://atlas.localhost/dev/${request.page}`,
		files,
		componentsUsed: [...componentsUsed].sort(),
		notes
	};
}

// ---------------------------------------------------------------------------
// promote_prototype
// ---------------------------------------------------------------------------

export interface PromotionRequest {
	page: string;
	/** The winning approach's slug. */
	approach: string;
	/** The winning Page.svelte, as text — this server cannot read files. */
	source: string;
	surface?: Surface;
	/** Sources of components the approach created locally, keyed by file name. */
	localComponents?: Record<string, string>;
}

export interface NewComponentRequired {
	name: string;
	reason: string;
	suggestedNext: string;
}

/**
 * The honest half of promotion.
 *
 * A prototype wins on how it looks; it is promoted on what it leaves behind.
 * Anything the approach built as a local .svelte file, and any markup a rule
 * flags, is work the library must absorb before the page ships — naming that
 * here is what keeps the paradigm component-driven rather than page-driven.
 */
export function promotePrototype(manifest: Manifest, request: PromotionRequest) {
	const surface = request.surface ?? 'public';
	const reviews = [
		{ file: 'Page.svelte', ...review(request.source, manifest, surface) },
		...Object.entries(request.localComponents ?? {}).map(([file, source]) => ({
			file,
			...review(source, manifest, surface)
		}))
	];

	const newComponents: NewComponentRequired[] = [];

	// A relative .svelte import is a component the library does not have.
	for (const match of request.source.matchAll(
		/import\s+(\w+)\s+from\s+['"]\.{1,2}\/[^'"]*\.svelte['"]/g
	)) {
		const name = match[1]!;
		const existing = manifest.components.find(
			(entry) => entry.name.toLowerCase() === name.toLowerCase()
		);
		newComponents.push({
			name,
			reason: existing
				? `${name} shadows an existing library component; reconcile rather than duplicate.`
				: `${name} exists only inside this prototype. Promoting the page without ` +
					`promoting the component leaves the library a page behind its own production.`,
			suggestedNext: existing
				? `Compare against ${existing.name} (${existing.path}) and either adopt it or supersede it with a decision.`
				: `scaffold_component name=${name}, move the prototype's implementation into it, add its story.`
		});
	}

	// A bare element a rule flagged is a component that should exist and does not
	// yet have a name — surface it as required work, not as a nag.
	for (const entry of reviews) {
		for (const violation of entry.violations.filter((v) => v.rule === 'raw-element')) {
			newComponents.push({
				name: '(unnamed)',
				reason: `${entry.file}: ${violation.message}`,
				suggestedNext:
					'Either use the existing atom or, if the prototype proved a genuinely new need, scaffold a new one.'
			});
		}
	}

	return {
		page: request.page,
		approach: request.approach,
		honest: true,
		newComponentsRequired: newComponents,
		reviews: reviews.map((entry) => ({
			file: entry.file,
			parseError: entry.parseError,
			violations: entry.violations
		})),
		checklist: [
			'Create every component under newComponentsRequired in src/components/, with stories.',
			'Move the winning page markup to its consumer (or keep it staged here) importing only @alfons/design.',
			'bun run manifest, then bun run manifest:check — the new components must appear as derived facts.',
			'Re-run review_markup over the final markup; deliberate rule breaks need a recorded decision, not silence.',
			'Record the losing approaches’ reasoning in the round release’s document, then delete prototypes/' +
				request.page +
				'/.',
			'Advance the round’s ledger tasks to done, write the release document, merge the round branch to main.'
		]
	};
}
