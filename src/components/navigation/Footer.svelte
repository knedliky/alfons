<script lang="ts" module>
	export interface FooterLink {
		label: string;
		href: string;
	}

	export interface FooterColumn {
		heading: string;
		links: FooterLink[];
	}

	export interface FooterContact {
		abn?: string;
		email?: string;
	}

	export interface FooterNewsletter {
		heading: string;
		subheading?: string;
	}

	export interface FooterProps {
		brand?: string;
		description?: string;
		contact?: FooterContact | null;
		columns?: FooterColumn[];
		newsletter?: FooterNewsletter | null;
		legalLinks?: FooterLink[];
		year?: number;
		onNavigate?: (href: string) => void;
		onSubscribe?: (email: string) => void;
	}
</script>

<script lang="ts">
	/**
	 * Footer — site-wide footer over a radial gradient that lifts the page
	 * ground for text readability (transparent background, so the flat page
	 * shows through). A brand column (wordmark + blurb + contact), configurable
	 * link columns, an optional newsletter row, and a bottom bar with copyright
	 * and legal links.
	 *
	 * Usage:
	 *   <Footer onNavigate={goto} onSubscribe={subscribe} />
	 */
	const DEFAULT_COLUMNS: FooterColumn[] = [
		{
			heading: 'Quick Links',
			links: [
				{ label: 'Blog', href: '#blog' },
				{ label: 'Experiments', href: '#experiments' },
				{ label: 'About', href: '#about' }
			]
		}
	];

	let {
		brand = 'Motivka',
		description = "Motivka is Simon's personal agent and growing digital twin. Context, tools, and all the good stuff in between. Melbourne & Prague.",
		contact = { abn: 'ABN 59 178 907 431', email: 'hello@motivka.com' },
		columns = DEFAULT_COLUMNS,
		newsletter = {
			heading: 'Follow along',
			subheading: 'Ideas, builds, and the thinking behind Motivka.'
		},
		legalLinks = [{ label: 'Privacy Policy', href: '#privacy' }],
		year = new Date().getFullYear(),
		onNavigate,
		onSubscribe
	}: FooterProps = $props();

	let email = $state('');

	function go(event: MouseEvent, href: string) {
		if (onNavigate && href) {
			event.preventDefault();
			onNavigate(href);
		}
	}

	function submit(event: SubmitEvent) {
		event.preventDefault();
		onSubscribe?.(email);
		email = '';
	}
</script>

<footer class="motif-footer">
	<div class="motif-footer-overlay" aria-hidden="true"></div>
	<div class="motif-footer-content">
		<div class="motif-footer-columns">
			<div class="motif-footer-brand-col">
				<a href="#top" class="motif-footer-brand" onclick={(e) => go(e, '#top')}>{brand}</a>
				{#if description}<p class="motif-footer-text">{description}</p>{/if}
				{#if contact}
					<div>
						{#if contact.abn}<p class="motif-footer-text">{contact.abn}</p>{/if}
						{#if contact.email}
							<a href="mailto:{contact.email}" class="motif-footer-link">{contact.email}</a>
						{/if}
					</div>
				{/if}
			</div>
			{#each columns as col (col.heading)}
				<div class="motif-footer-links-col">
					<h3 class="motif-footer-heading">{col.heading}</h3>
					{#each col.links as link (link.label)}
						<a href={link.href} class="motif-footer-link" onclick={(e) => go(e, link.href)}>
							{link.label}
						</a>
					{/each}
				</div>
			{/each}
		</div>

		{#if newsletter}
			<div class="motif-footer-section motif-footer-newsletter">
				<div>
					<h3 class="motif-footer-heading">{newsletter.heading}</h3>
					{#if newsletter.subheading}
						<p class="motif-footer-text motif-footer-subheading">{newsletter.subheading}</p>
					{/if}
				</div>
				<form class="motif-footer-form" onsubmit={submit}>
					<input
						class="motif-footer-input"
						type="email"
						required
						placeholder="you@email.com"
						aria-label="Email address"
						bind:value={email}
					/>
					<button class="motif-footer-submit" type="submit">Subscribe</button>
				</form>
			</div>
		{/if}

		<div class="motif-footer-section motif-footer-bottom">
			<p class="motif-footer-muted">© {year} {brand}. All rights reserved.</p>
			<div class="motif-footer-legal">
				{#each legalLinks as link (link.label)}
					<a href={link.href} class="motif-footer-muted-link" onclick={(e) => go(e, link.href)}>
						{link.label}
					</a>
				{/each}
			</div>
		</div>
	</div>
</footer>

<style>
	.motif-footer {
		position: relative;
		width: 100%;
		box-sizing: border-box;
		padding: var(--space-8) var(--space-5);
		background: transparent;
	}

	.motif-footer-overlay {
		position: absolute;
		inset: 0;
		z-index: 0;
		pointer-events: none;
		background: radial-gradient(
			ellipse 120% 100% at 50% 100%,
			color-mix(in srgb, var(--bg-primary) 95%, transparent) 0%,
			color-mix(in srgb, var(--bg-primary) 80%, transparent) 40%,
			color-mix(in srgb, var(--bg-primary) 50%, transparent) 70%,
			transparent 100%
		);
	}

	.motif-footer-content {
		position: relative;
		z-index: 1;
		max-width: 64rem;
		margin: 0 auto;
	}

	.motif-footer-columns {
		display: grid;
		gap: var(--space-6);
	}

	@media (min-width: 768px) {
		.motif-footer-columns {
			grid-template-columns: 2fr 1fr 1fr;
			gap: var(--space-8);
		}
	}

	.motif-footer-brand {
		font-family: var(--font-wordmark);
		font-weight: 700;
		font-size: 1.5rem;
		letter-spacing: -0.03em;
		color: var(--text-primary);
		text-decoration: none;
	}

	.motif-footer-brand-col {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.motif-footer-text {
		margin: 0;
		max-width: 38ch;
		color: var(--text-secondary);
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.motif-footer-subheading {
		margin-top: var(--space-1);
	}

	.motif-footer-links-col {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.motif-footer-heading {
		margin: 0 0 var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.motif-footer-link {
		color: var(--text-secondary);
		font-size: 0.9375rem;
		text-decoration: none;
		transition: color var(--transition-normal);
		width: fit-content;
	}

	.motif-footer-link:hover {
		color: var(--accent-secondary);
	}

	.motif-footer-section {
		margin-top: var(--space-7);
		padding-top: var(--space-6);
		border-top: 1px solid var(--border-glass);
	}

	.motif-footer-newsletter {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	@media (min-width: 768px) {
		.motif-footer-newsletter {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}
	}

	.motif-footer-form {
		display: flex;
		gap: var(--space-2);
		width: 100%;
		max-width: 420px;
	}

	.motif-footer-input {
		flex: 1;
		min-width: 0;
		height: var(--input-height);
		padding: 0 1.25rem;
		font-family: var(--font-body);
		font-size: 0.9375rem;
		color: var(--text-primary);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		border-radius: var(--radius-message);
		transition: border-color var(--transition-normal);
	}

	.motif-footer-input::placeholder {
		color: var(--text-muted);
	}

	.motif-footer-input:focus {
		outline: none;
		border-color: var(--card-border-hover);
	}

	.motif-footer-submit {
		flex-shrink: 0;
		height: var(--input-height);
		padding: 0 var(--space-5);
		font-family: var(--font-body);
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-on-accent, oklch(1 0 0));
		background: var(--accent);
		border: none;
		border-radius: var(--radius);
		cursor: pointer;
		transition: background-color var(--transition-normal);
	}

	.motif-footer-submit:hover {
		background: var(--accent-hover);
	}

	.motif-footer-bottom {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.motif-footer-muted {
		margin: 0;
		color: var(--text-muted);
		font-size: var(--text-caption);
	}

	.motif-footer-legal {
		display: flex;
		gap: var(--space-4);
	}

	.motif-footer-muted-link {
		color: var(--text-muted);
		font-size: var(--text-caption);
		text-decoration: none;
		transition: color var(--transition-normal);
	}

	.motif-footer-muted-link:hover {
		color: var(--accent-secondary);
	}
</style>
