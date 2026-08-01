<script lang="ts">
	import { Pane } from 'tweakpane';

	/**
	 * ShadowsLab — interactive reference for the Motif elevation ladder (public.css §10b).
	 *
	 * Shows the three levels as the real surfaces they map to — L1 resting card,
	 * L2 raised input, L3 floating dropdown — each composing all four cues (edge,
	 * cast, frost, fill) so depth reads as a true composite, on a calm canvas. A
	 * live Tweakpane tuner drives the five scalars; dragging a knob writes an
	 * override onto :root (document.documentElement), which recomputes
	 * --elevation-1/2/3, --frost-*, and --el-edge-* so every surface updates at once.
	 *
	 * Dark mode only — the ladder's fill/edge cues are tuned for the dark canvas.
	 */

	// The five tunable scalars. `unit: true` carries a 'px' suffix (frost blurs);
	// the rest are unitless alphas/scales.
	const SCALARS = [
		{ prop: '--el-rim', key: 'elRim', label: '--el-rim', min: 0, max: 0.2, step: 0.005, unit: false },
		{ prop: '--el-cast-depth', key: 'elCastDepth', label: '--el-cast-depth', min: 0, max: 0.6, step: 0.01, unit: false },
		{ prop: '--el-cast-spread', key: 'elCastSpread', label: '--el-cast-spread', min: 0, max: 20, step: 0.5, unit: false },
		{ prop: '--el-fill', key: 'elFill', label: '--el-fill', min: 0, max: 1, step: 0.01, unit: false },
		{ prop: '--frost-2', key: 'frost2', label: '--frost-2', min: 0, max: 20, step: 0.5, unit: true },
		{ prop: '--frost-3', key: 'frost3', label: '--frost-3', min: 0, max: 30, step: 0.5, unit: true }
	];

	// Component aliases that resolve onto the ladder (or stand alone).
	const ALIASES = [
		{ token: '--card-shadow', maps: '--elevation-1 · L1' },
		{ token: '--card-shadow-hover', maps: '--elevation-2 · L2' },
		{ token: '--shadow-glass', maps: '--elevation-2 · L2' },
		{ token: '--select-dropdown-shadow', maps: '--elevation-3 · L3' },
		{ token: '--tooltip-shadow', maps: '--elevation-3 · L3' },
		{ token: '--shadow-header', maps: 'standalone · 0 1px 2px' },
		{ token: '--button-shadow-hover', maps: 'standalone · sunset glow' },
		{ token: '--button-shadow-active', maps: 'standalone · inset press' },
		{ token: '--admin-shadow', maps: 'admin namespace · standalone' }
	];

	let tunerEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!tunerEl) return;
		const root = document.documentElement;
		const read = (prop: string) => parseFloat(getComputedStyle(root).getPropertyValue(prop)) || 0;

		// Seed the panel from the live token defaults so it starts where the design
		// system actually sits (post Merlin-depth tuning), not at hardcoded guesses.
		const params: Record<string, number> = {};
		for (const s of SCALARS) params[s.key] = read(s.prop);

		const apply = () => {
			for (const s of SCALARS) {
				root.style.setProperty(s.prop, s.unit ? `${params[s.key]}px` : String(params[s.key]));
			}
		};

		const pane = new Pane({ container: tunerEl, title: 'Elevation scalars — one knob moves the whole ladder' });
		for (const s of SCALARS) {
			pane.addBinding(params, s.key, { label: s.label, min: s.min, max: s.max, step: s.step });
		}
		pane.on('change', apply);
		pane.addButton({ title: 'Copy CSS' }).on('click', () => {
			const body = SCALARS.map((s) => `\t${s.prop}: ${s.unit ? `${params[s.key]}px` : params[s.key]};`).join('\n');
			navigator.clipboard?.writeText(`:root {\n${body}\n}`);
		});
		apply();

		return () => {
			pane.dispose();
			// Restore stylesheet defaults so overrides don't leak to other stories
			// (Storybook reuses one preview iframe across the whole catalogue).
			for (const s of SCALARS) root.style.removeProperty(s.prop);
		};
	});
</script>

<div class="lab">
	<div class="tuner" bind:this={tunerEl}></div>

	<p class="note">
		L1 rests, L2 lifts, L3 floats. Each surface composes all four cues — lit edge, cast shadow,
		frost blur, surface fill. The scalars above move the whole ladder coherently; drag one to
		retune, then <strong>Copy CSS</strong> to promote the values into <code>public.css</code>.
	</p>

	<div class="stage">
		<!-- L1 — resting card -->
		<div class="example">
			<span class="eyebrow">L1 · Resting</span>
			<div class="surface l1 card">
				<h4 class="s-title">Occupation card</h4>
				<p class="s-body">Rests flat on the page. Most cards and panels live at this level.</p>
			</div>
			<code class="cap">--elevation-1 · cards</code>
		</div>

		<!-- L2 — raised input -->
		<div class="example">
			<span class="eyebrow">L2 · Raised</span>
			<div class="surface l2 input">
				<span class="ph">Search occupations</span>
				<span class="caret"></span>
			</div>
			<code class="cap">--elevation-2 · inputs · hovered cards</code>
		</div>

		<!-- L3 — floating dropdown over content (so the frost blur reads) -->
		<div class="example">
			<span class="eyebrow">L3 · Floating</span>
			<div class="float-wrap">
				<div class="behind" aria-hidden="true">
					<span></span><span></span><span></span><span></span><span></span>
				</div>
				<div class="surface l3 menu">
					<div class="mi active">Data Analyst</div>
					<div class="mi">Software Engineer</div>
					<div class="mi">Registered Nurse</div>
				</div>
			</div>
			<code class="cap">--elevation-3 · dropdowns · tooltips · modals</code>
		</div>
	</div>

	<table class="ref">
		<thead>
			<tr><th>Alias token</th><th>Resolves to</th></tr>
		</thead>
		<tbody>
			{#each ALIASES as a}
				<tr><td><code>{a.token}</code></td><td>{a.maps}</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.lab {
		display: flex;
		flex-direction: column;
		gap: 24px;
		padding: 24px;
		max-width: 960px;
		font-family: system-ui, sans-serif;
		color: var(--text-primary);
	}

	.tuner {
		max-width: 360px;
	}

	.note {
		margin: 0;
		font-size: 13px;
		line-height: 1.55;
		color: var(--text-secondary);
		max-width: 68ch;
	}

	.note code {
		font-family: monospace;
		font-size: 12px;
		color: var(--text-primary);
	}

	/* Calm, on-brand ground — soft gradient blobs, no loud pattern. */
	.stage {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: center;
		gap: 40px;
		padding: 52px 40px;
		border-radius: 0;
		background:
			radial-gradient(42% 55% at 18% 22%, oklch(62% 0.19 32 / 0.28), transparent 70%),
			radial-gradient(40% 52% at 82% 72%, oklch(66% 0.12 250 / 0.2), transparent 70%),
			var(--bg-primary, #161010);
	}

	.example {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 14px;
		width: 248px;
	}

	.eyebrow {
		font-family: monospace;
		font-size: 11px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.cap {
		font-family: monospace;
		font-size: 10px;
		color: var(--text-muted);
		text-align: center;
	}

	/* The four composed cues live here. The per-level modifier sets fill (background),
	   cast (box-shadow) and frost (backdrop-blur); edge is the shared rim border. */
	.surface {
		width: 100%;
		border-radius: 0;
		border-top: 1px solid var(--el-edge-light);
		border-left: 1px solid var(--el-edge-light);
		border-right: 1px solid var(--el-edge-shade);
		border-bottom: 1px solid var(--el-edge-shade);
	}

	.surface.l1 {
		background: var(--elevation-1-bg);
		box-shadow: var(--elevation-1);
		backdrop-filter: blur(var(--frost-1));
		-webkit-backdrop-filter: blur(var(--frost-1));
	}
	.surface.l2 {
		background: var(--elevation-2-bg);
		box-shadow: var(--elevation-2);
		backdrop-filter: blur(var(--frost-2));
		-webkit-backdrop-filter: blur(var(--frost-2));
	}
	.surface.l3 {
		background: var(--elevation-3-bg);
		box-shadow: var(--elevation-3);
		backdrop-filter: blur(var(--frost-3));
		-webkit-backdrop-filter: blur(var(--frost-3));
	}

	/* L1 — a real card */
	.card {
		padding: 20px;
	}
	.s-title {
		margin: 0 0 8px;
		font-size: 15px;
		font-weight: 600;
		color: var(--text-primary);
	}
	.s-body {
		margin: 0;
		font-size: 13px;
		line-height: 1.5;
		color: var(--text-secondary);
	}

	/* L2 — a text input */
	.input {
		display: flex;
		align-items: center;
		gap: 2px;
		height: 48px;
		padding: 0 16px;
	}
	.ph {
		font-size: 14px;
		color: var(--text-muted);
	}
	.caret {
		width: 1px;
		height: 18px;
		margin-left: 2px;
		background: var(--accent, #ce2029);
	}

	/* L3 — a floating dropdown over faint page text, so the frost blur is obvious */
	.float-wrap {
		position: relative;
		width: 100%;
		padding-top: 18px;
	}
	.behind {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 9px;
		padding: 8px 6px;
	}
	.behind span {
		height: 7px;
		border-radius: 0;
		background: oklch(100% 0 0 / 16%);
	}
	.behind span:nth-child(odd) {
		width: 92%;
	}
	.behind span:nth-child(even) {
		width: 70%;
	}
	.menu {
		position: relative;
		padding: 6px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.mi {
		padding: 9px 12px;
		border-radius: 0;
		font-size: 13px;
		color: var(--text-secondary);
	}
	.mi.active {
		background: var(--select-selected-bg, oklch(45% 0.22 25 / 15%));
		color: var(--text-primary);
	}

	.ref {
		border-collapse: collapse;
		width: 100%;
		max-width: 520px;
		font-size: 12px;
	}
	.ref th,
	.ref td {
		text-align: left;
		padding: 7px 12px;
		border-bottom: 1px solid var(--card-border, oklch(95% 0 0 / 10%));
	}
	.ref th {
		color: var(--text-secondary);
		font-weight: 600;
	}
	.ref td code {
		font-family: monospace;
		font-size: 11px;
		color: var(--text-primary);
	}
</style>
