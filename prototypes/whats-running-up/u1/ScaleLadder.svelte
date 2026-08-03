<script lang="ts">
	/**
	 * The one control, now with four rungs instead of two.
	 *
	 * The winning approach used a segmented control and named both of its scales
	 * on screen at all times, because with two positions "the other one" and "all
	 * of them" are the same set. That does not survive a fourth position. Four
	 * segments on a 370px phone are 84px each, and the names this ladder has to
	 * carry are release slugs — `prototype-loop-v1` is seventeen characters, and
	 * a segment that renders it as `prototy…` is the clipped promise the grid
	 * cell already refused to make. So the control names the two rungs you can
	 * reach from here rather than all four, which is still every move available
	 * in a single tap and still one control.
	 *
	 * It is not a stepper over an abstract number. Each half prints the actual
	 * destination under the direction — `WIDER` over `prototype-loop-v1` — which
	 * is how it answers the problem that two runners have different ladders.
	 * Zooming out of AL-014 and out of ATL-118 lead to different places and the
	 * control says so before the tap rather than after it; nothing here ever
	 * implies a single fixed destination. Measured: moving the current cell with
	 * an arrow key rewrites this label live, prototype-loop-v1 to
	 * schema-lives-here to auth-hardening, one press at a time.
	 *
	 * The kind — task, release, project — is spoken in the aria-label but is not
	 * printed. It did not fit beside the direction word without wrapping the
	 * slug into an ellipsis, and between naming the kind and naming the place,
	 * the place is the one the reader cannot infer from the destination itself.
	 *
	 * The four ticks are the thing two positions never needed: with two scales
	 * "the other one" is the position indicator, with four it is not. They are
	 * decorative to a screen reader because the page's live readout already says
	 * which rung and what it holds, and a second announcement would talk over it.
	 *
	 * ToggleGroup was the library's segmented control and was the right answer at
	 * two positions. At four it is not usable here at all: its 44px minimum is on
	 * the shell rather than the segments, so the targets are 34px, and it marks
	 * the active option with colour and a thumb but emits no aria-pressed. The
	 * winning approach patched the first through :global and worked around the
	 * second; a four-way version would have needed the segment widths patched as
	 * well, at which point nothing of the atom is left. Reported, not fixed.
	 *
	 * Bare <button>s. Button is a pill with its own padding and a single centred
	 * label; a two-line rung with a verb over a slug is a Button in name only.
	 * Named plainly in the report.
	 */
	import { Icon } from '@alfons/design';
	import { LADDER, type Destination, type Scale } from './scale.ts';

	let {
		rung,
		closerTo,
		widerTo,
		onchange
	}: {
		/** Which rung is current, 0-based, for the ticks. */
		rung: number;
		/** The destination one rung closer, or null at the bottom of the ladder. */
		closerTo: Destination | null;
		/** The destination one rung wider, or null at the top. */
		widerTo: Destination | null;
		onchange: (next: Scale) => void;
	} = $props();
</script>

<div class="ladder" role="group" aria-label="Scale">
	<!-- Position only. The readout in the heading row carries the announcement. -->
	<div class="ticks" aria-hidden="true">
		{#each LADDER as step, position (step)}
			<span class="tick" data-current={position === rung ? 'true' : undefined}></span>
		{/each}
	</div>

	<div class="steps">
		<button
			type="button"
			class="step"
			data-direction="closer"
			disabled={closerTo === null}
			aria-label={closerTo
				? `Closer, to the ${closerTo.rung.kind} ${closerTo.rung.name}`
				: 'Closer, unavailable — this is the closest scale'}
			onclick={() => closerTo && onchange(closerTo.scale)}
		>
			<span class="verb">
				<Icon name="chevron-down" size="sm" />
				<span>closer</span>
			</span>
			<span class="name">{closerTo ? closerTo.rung.name : 'closest'}</span>
		</button>

		<button
			type="button"
			class="step"
			data-direction="wider"
			disabled={widerTo === null}
			aria-label={widerTo
				? `Wider, to the ${widerTo.rung.kind} ${widerTo.rung.name}`
				: 'Wider, unavailable — this is the widest scale'}
			onclick={() => widerTo && onchange(widerTo.scale)}
		>
			<span class="verb">
				<span>wider</span>
				<Icon name="chevron-up" size="sm" />
			</span>
			<span class="name">{widerTo ? widerTo.rung.name : 'widest'}</span>
		</button>
	</div>
</div>

<style>
	.ladder {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.ticks {
		display: flex;
		gap: var(--space-2);
	}

	/* Neutral. A rung is not a status and may not take a status colour. */
	.tick {
		flex: 1;
		height: var(--space-1);
		background: var(--border-glass);
	}

	.tick[data-current='true'] {
		background: var(--text-primary);
	}

	.steps {
		display: flex;
		gap: var(--space-2);
	}

	.step {
		appearance: none;
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		/* Well past the 44px minimum; this is the control a thumb reaches for on
		   every screen of this page, so it is the last thing to be made small. */
		min-height: var(--filter-control-height);
		padding: var(--space-2);
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		color: var(--text-primary);
		cursor: pointer;
	}

	.step[data-direction='closer'] {
		text-align: left;
		align-items: flex-start;
	}

	.step[data-direction='wider'] {
		text-align: right;
		align-items: flex-end;
	}

	.step:disabled {
		cursor: default;
		opacity: var(--state-disabled-opacity);
	}

	.step:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: var(--space-1);
	}

	.verb {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* The destination, spelled out. Measured at 370px: each half is 165px wide,
	   and `prototype-loop-v1` — the longest slug any runner can reach today — is
	   133px at this size. That is the whole budget, and it is what killed the
	   idea of naming the kind on the verb line as well: `RELEASE · WIDER` wrapped
	   onto two lines and pushed the slug into an ellipsis. The kind survives in
	   the aria-label and on the destination's own heading. `hidden` rather than
	   `clip` because text-overflow needs it, and no horizontal gesture lives down
	   here for a scroll container to eat. */
	.name {
		max-width: 100%;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		line-height: 1.2;
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
