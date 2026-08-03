<script lang="ts">
	/**
	 * The ancestry, brought to the reader instead of the reader being sent to it.
	 *
	 * This is the whole of approach u4. Everything else on the page is the winning
	 * approach unchanged. Four decisions make it what it is, and each is a claim
	 * that can be checked on screen rather than taken on trust.
	 *
	 * 1. HOW FAR IT RISES: its top edge sits at 32% of the running screen, which is
	 *    68% of a sheet in production and 58% here once the prototyping harness's
	 *    pager is cleared. Measured at 370x800 that leaves 173px of a 465px card on
	 *    screen — its status mark, its id, and the first three lines of its title.
	 *    The argument of this approach is that the reader never leaves the card, and
	 *    an argument you cannot see is an assertion; 37% of the card is the evidence.
	 *    A full-height sheet would show more of the release and would be
	 *    indistinguishable from a push, which is approach u3's job and not this
	 *    one's. The scrim behind is --surface-overlay-subtle (30%) rather than
	 *    --overlay-scrim (60%) for the same reason: dimming the card to
	 *    illegibility would throw away the only evidence that it is still there.
	 *    What it costs is real — the release listing shows about two phases before
	 *    the reader has to scroll, where a full-height sheet would show four.
	 *
	 * 2. ONE SHEET, TWO LEVELS. The project does not rise over the release. A stack
	 *    of sheets is a stack, and conceding depth twice would concede the whole
	 *    argument. Both levels are in one scroll: the project as a three-fact strip
	 *    at the top, the release as the body beneath it. The project strip is
	 *    deliberately thin — a name and two counts — because the honest thing to
	 *    say is that this page consults a project rather than opens one.
	 *
	 * 3. DISMISSAL IS AT LEAST AS CHEAP AS SUMMONING. Summoning costs one tap.
	 *    Dismissal costs one tap on the card behind, or one tap on the close
	 *    control, or one downward swipe on the handle, or one Escape. Four routes
	 *    against one.
	 *
	 * 4. THE GESTURE ARBITRATION IS STRUCTURAL, NOT CONDITIONAL. The classic bug is
	 *    a sheet whose content scrolls and which also dismisses on a downward drag:
	 *    the two fight, and resolving it by sniffing scrollTop gives a gesture that
	 *    works at the top of a list and silently stops working further down — a
	 *    gesture whose availability depends on state the reader cannot see.
	 *
	 *    Here the drag lives on one element and one element only: the grabber, a
	 *    44px full-width strip carrying touch-action: none. It is sticky, so it
	 *    never leaves the screen and the gesture is never out of reach; everything
	 *    below it scrolls and never dismisses. There is no state in which either is
	 *    ambiguous, and no scroll position at which either changes behaviour.
	 *
	 *    Verified, not assumed: a CDP touch swipe down on the grabber dismisses; the
	 *    same swipe on the content below scrolls it 220px to 0 and leaves the sheet
	 *    open; and with the sheet shut, a horizontal touch swipe still moves the
	 *    deck a full card.
	 *
	 * On the honest question of whether this is a second level in disguise: it is a
	 * modal, and a modal is depth. What it is not is a destination — there is no
	 * URL, no history entry, no back affordance, and no state left behind when it
	 * closes. See Page.svelte for the rest of that argument.
	 *
	 * Alfons's Modal was checked and rejected; the reasons are recorded in the
	 * report and in Page.svelte.
	 */
	import { Button, Chip, Icon } from '@alfons/design';
	import { documentedLine, phasesOf, type Project, type Release } from './hierarchy.ts';
	import StatusMark from './StatusMark.svelte';

	let {
		open,
		release,
		project,
		fromTaskId,
		onclose
	}: {
		open: boolean;
		release: Release | null;
		project: Project | null;
		/** The task the reader was reading. Marked in the list so their place is visible. */
		fromTaskId: string;
		onclose: () => void;
	} = $props();

	// One generated id, two derived. $props.id() may be called once per component,
	// and the dialog needs both a label and a description.
	const uid = $props.id();
	const labelId = `${uid}-title`;
	const contextId = `${uid}-context`;

	let panel = $state<HTMLElement | null>(null);

	const phases = $derived(release ? phasesOf(release) : []);

	// Focus, and where it goes back to. Captured from the live document rather
	// than passed in, because the trigger is whichever card the reader had open
	// and the deck owns that, not this component.
	let restoreTo: HTMLElement | null = null;
	let wasOpen = false;

	$effect(() => {
		if (open && !wasOpen) {
			wasOpen = true;
			restoreTo = document.activeElement as HTMLElement | null;
			// The panel takes the focus, not the close button: focusing the dialog
			// itself is what makes a screen reader read its name and its context
			// line before anything else.
			queueMicrotask(() => panel?.focus());
		} else if (!open && wasOpen) {
			wasOpen = false;
			const target = restoreTo;
			restoreTo = null;
			// After the page has lifted `inert` from the deck; an inert element
			// cannot take focus, so restoring in the same tick silently fails.
			queueMicrotask(() => target?.focus());
		}
	});

	function focusables(): HTMLElement[] {
		if (!panel) return [];
		const candidates = panel.querySelectorAll<HTMLElement>(
			'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
		);
		return [...candidates].filter((element) => element.offsetParent !== null);
	}

	/**
	 * The trap. `inert` on the page behind already stops focus leaving into the
	 * deck, but it does not wrap: Tab off the last control would land in the
	 * browser's own chrome and the reader would have to Tab all the way back. This
	 * cycles instead, in both directions.
	 */
	function onKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			onclose();
			return;
		}
		if (event.key !== 'Tab') return;
		const stops = focusables();
		if (stops.length === 0) return;
		const first = stops[0];
		const last = stops[stops.length - 1];
		const active = document.activeElement;
		if (active === panel) {
			// Focus is on the dialog itself. Forward goes to the first control,
			// backward wraps to the last.
			event.preventDefault();
			(event.shiftKey ? last : first).focus();
			return;
		}
		if (!event.shiftKey && active === last) {
			event.preventDefault();
			first.focus();
		} else if (event.shiftKey && active === first) {
			event.preventDefault();
			last.focus();
		}
	}

	// Swipe down to dismiss, bound to the handle and header only. See note 4 above.
	let dragBy = $state(0);
	let dragging = $state(false);
	let grabbedAt = 0;

	function grabStart(event: PointerEvent) {
		dragging = true;
		grabbedAt = event.clientY;
		dragBy = 0;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function grabMove(event: PointerEvent) {
		if (!dragging) return;
		// Downward only. Dragging a sheet upward past its own top edge is a
		// rubber-band effect with nothing behind it.
		dragBy = Math.max(0, event.clientY - grabbedAt);
	}

	function grabEnd(event: PointerEvent) {
		if (!dragging) return;
		dragging = false;
		(event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
		const travelled = dragBy;
		dragBy = 0;
		// A quarter of the sheet, capped so a tall sheet does not need a longer
		// swipe than a thumb has room for.
		const threshold = Math.min(96, (panel?.offsetHeight ?? 0) * 0.25);
		if (travelled > threshold) onclose();
	}
</script>

{#if open && release}
	<!-- The scrim is the fourth dismissal route: tapping the card behind. It is a
	     button rather than a div with a click handler so it is a real target with a
	     real name, and it is deliberately OUTSIDE the dialog so the trap does not
	     cycle through it. It sits outside the page's inert subtree too, which is
	     what lets it stay clickable while the deck cannot be reached. -->
	<button
		type="button"
		class="scrim"
		class:still={dragging}
		aria-label="Dismiss and return to the task"
		onclick={onclose}
	></button>

	<div class="riser" class:still={dragging}>
		<!-- A <div> rather than a <section>: a sectioning element cannot take an
		     interactive role, and role="dialog" is what makes this a sheet rather
		     than a panel that slid up. -->
		<div
			class="sheet"
			role="dialog"
			aria-modal="true"
			aria-labelledby={labelId}
			aria-describedby={contextId}
			tabindex="-1"
			bind:this={panel}
			onkeydown={onKeydown}
			style:transform={dragBy > 0 ? `translateY(${dragBy}px)` : undefined}
			style:transition={dragging ? 'none' : undefined}
		>
			<header class="grab">
				<!-- The grabber is a real button, not a decorative bar with pointer
				     handlers on its parent. Three things follow from that and all
				     three are wanted: the gesture surface is 44px of full-width
				     target, a keyboard reaches it, and a plain tap on it dismisses —
				     so the affordance that says "drag me down" also works for a
				     reader who cannot drag. touch-action: none, so the browser hands
				     us the gesture instead of trying to scroll the sheet with it. -->
				<button
					type="button"
					class="handle"
					aria-label="Dismiss: drag down, or activate"
					onclick={onclose}
					onpointerdown={grabStart}
					onpointermove={grabMove}
					onpointerup={grabEnd}
					onpointercancel={grabEnd}
				>
					<span class="bar"></span>
				</button>
				<div class="head">
					<div class="names">
						<p class="ancestry" id={contextId}>
							<span class="level-word">Release in</span>
							<span class="project">{release.project}</span>
						</p>
						<h2 class="title" id={labelId}>{release.title}</h2>
						<p class="slug">{release.slug}</p>
					</div>
					<Button
						variant="secondary"
						size="icon"
						type="button"
						aria-label="Close and return to the task"
						onclick={onclose}
					>
						<Icon name="close" size="md" />
					</Button>
				</div>
			</header>

			<!-- The scrolling is done by the dialog itself, not by this div. A
			     scrollable region that nothing can focus cannot be scrolled by
			     keyboard at all, and the fixes for that are both worse than moving
			     the overflow up one element: tabindex="0" on a non-interactive div
			     is an a11y defect in its own right, and a keydown handler
			     reimplements what the browser already does. The dialog carries
			     tabindex="-1" and takes focus on open, so arrow keys and Page
			     Up/Down scroll it the moment it is announced. -->
			<div class="body">
				<!-- LEVEL: PROJECT. Three facts and no link. -->
				<section class="level" aria-label="Project">
					<h3 class="level-heading">Project</h3>
					<p class="project-name">{project ? project.slug : release.project}</p>
					{#if project}
						<dl class="facts">
							<div class="fact">
								<dt>Releases</dt>
								<dd>{project.releaseCount}</dd>
							</div>
							<div class="fact">
								<dt>Running now</dt>
								<dd>{project.runningCount}</dd>
							</div>
						</dl>
					{/if}
				</section>

				<!-- LEVEL: RELEASE. -->
				<section class="level" aria-label="Release detail">
					<h3 class="level-heading">Release</h3>

					<ul class="tags">
						{#each release.tags as tag (tag)}
							<li><Chip label={tag} size="sm" /></li>
						{/each}
					</ul>

					<p class="documented">
						{documentedLine(release)}
						<span class="dot-sep" aria-hidden="true">&middot;</span>
						{release.taskCount}
						{release.taskCount === 1 ? 'task' : 'tasks'}
					</p>

					{#if phases.length === 0}
						<p class="documented">Its tasks are not loaded on this page.</p>
					{:else}
						<!-- Every task, not only the running ones. A release listing filtered
						     to building and verifying would say a four-task release has one
						     task in it, which is a lie about the release told in order to
						     protect a rule about the deck. Recorded as a breach. -->
						{#each phases as phase (phase.number)}
							<section class="phase" aria-label="Phase {phase.number}">
								<h4 class="phase-heading">Phase {phase.number}</h4>
								<ul class="tasks">
									{#each phase.tasks as task (task.id)}
										<li
											class="task"
											aria-current={task.id === fromTaskId ? 'true' : undefined}
										>
											<span class="task-top">
												<span class="task-id">{task.id}</span>
												<StatusMark status={task.status} size="micro" />
											</span>
											<span class="task-title">{task.title}</span>
											{#if task.id === fromTaskId}
												<span class="here">the task you are reading</span>
											{/if}
										</li>
									{/each}
								</ul>
							</section>
						{/each}
					{/if}
				</section>
			</div>
		</div>
	</div>
{/if}

<style>
	/* The scrim is fixed and the sheet is absolute, and the split is deliberate.
	   The SHEET belongs to the card: above a phone the page caps its column at
	   34rem and a sheet spanning 1280px would be an overlay on the browser rather
	   than one on the card. The SCRIM belongs to the whole viewport, because
	   modality is not a visual effect — `inert` stops the deck taking focus, but
	   nothing stops a mouse reaching the site header above it, and a column-width
	   scrim would have left a dialog that a pointer could simply walk around. */
	.scrim {
		appearance: none;
		position: fixed;
		inset: 0;
		/* --z-widget, not --z-overlay. Measured: the site Header sits at --z-widget
		   (50) and an overlay at 30 is walked straight over by a mouse — the dialog
		   was modal to the keyboard and to a screen reader and not to a pointer. */
		z-index: var(--z-widget);
		padding: 0;
		border: none;
		cursor: pointer;
		/* 30%, not 60%. The card behind has to stay readable — it is the evidence
		   that the reader never left. */
		background: var(--surface-overlay-subtle);
		animation: fade var(--duration-fast) ease;
	}

	/* THE MEASUREMENT, and it is stated as a top edge rather than a height on
	   purpose. What this approach is claiming is a quantity of card left visible,
	   not a quantity of sheet, so the number that must not move is where the sheet
	   STOPS: 32% down the running screen. Pinning a height instead would have let
	   the harness clearance below eat into the card above, which is the one thing
	   that must not give.

	   Measured at 370x800: the screen is 720px, the sheet is 418px of it, and
	   173px of the 465px card stays on view — 37% of the card, which is its status
	   mark, its id and the first three lines of its title. At 1280x900 the page
	   caps its column at 544px and the sheet caps with it, 407px of a 704px
	   screen: a sheet over a card, not an overlay on a browser.

	   In production, where the harness clearance is zero, this is 68% of the
	   screen. Here it is 58%, and the difference is the pager, not the design. */
	.riser {
		position: absolute;
		inset-inline: 0;
		top: 32%;
		bottom: var(--harness-clearance, 0px);
		/* One above the scrim, and both above the site header for the same reason. */
		z-index: calc(var(--z-widget) + 1);
		display: flex;
		animation: rise var(--duration-normal) var(--ease-spring);
	}

	/* The dialog IS the scroll container. Overflow is stated on BOTH axes: an
	   unstated overflow-x computes to a scrolling value the moment overflow-y is
	   set, and a second horizontal scroller on a page whose card scale is driven
	   by a horizontal swipe is a bug waiting for a wide word. */
	.sheet {
		display: flex;
		flex-direction: column;
		width: 100%;
		min-height: 0;
		overflow-y: auto;
		overflow-x: hidden;
		/* A scroll past the end of the sheet must not become a scroll of the page
		   behind it or a browser refresh gesture. */
		overscroll-behavior: contain;
		background: var(--elevation-2-bg);
		border: 1px solid var(--card-border);
		box-shadow: var(--shadow-modal);
		backdrop-filter: blur(var(--frost-3));
		-webkit-backdrop-filter: blur(var(--frost-3));
		transition: transform var(--transition-normal);
	}

	.sheet:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: calc(var(--space-1) * -1);
	}

	/* Sticky, so the grabber and the close control never scroll away. A sheet you
	   have to scroll back up to close is exactly the trap the brief warns about,
	   and it is also what keeps the drag surface outside the scrolled content. */
	.grab {
		position: sticky;
		top: 0;
		z-index: var(--z-raised);
		flex: none;
		display: flex;
		flex-direction: column;
		padding: 0 var(--space-4) var(--space-4);
		/* Opaque, because the release listing scrolls underneath it. */
		background: var(--bg-glass-solid);
		border-bottom: 1px solid var(--card-border);
	}

	/* A bare <button>, named in the report. Button is a pill with its own height,
	   padding and centred label; this is a full-bleed gesture strip whose only
	   content is a 4px bar, and every one of Button's own properties would have to
	   be undone. */
	.handle {
		appearance: none;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		/* 44px of drag surface, from the touch-target token. The whole strip is the
		   gesture, not the 64px bar drawn inside it. */
		min-height: var(--filter-control-height);
		padding: 0;
		background: transparent;
		border: none;
		cursor: grab;
		/* The arbitration, in one declaration: this surface is the reader's, not
		   the browser's. The body below scrolls; this never does. */
		touch-action: none;
	}

	.handle:active {
		cursor: grabbing;
	}

	.handle:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: calc(var(--space-1) * -1);
	}

	.bar {
		width: var(--space-8);
		height: var(--space-1);
		background: var(--border-glass-hover);
	}

	.head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.names {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.ancestry {
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.level-word {
		color: var(--text-muted);
	}

	.project {
		color: var(--text-secondary);
	}

	.title {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lead);
		line-height: 1.2;
		color: var(--text-primary);
		text-wrap: balance;
	}

	.slug {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.body {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		padding: var(--space-4);
	}

	.level {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.level-heading {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--text-muted);
	}

	.project-name {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-lead);
		color: var(--text-primary);
	}

	.facts {
		margin: 0;
		display: flex;
		gap: var(--space-5);
	}

	.fact {
		display: flex;
		align-items: baseline;
		gap: var(--space-2);
	}

	.fact dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.fact dd {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-ui);
		color: var(--text-primary);
	}

	.tags {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.documented {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-secondary);
	}

	.dot-sep {
		color: var(--text-muted);
	}

	.phase {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding-top: var(--space-3);
		border-top: 1px solid var(--card-border);
	}

	.phase-heading {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	.tasks {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.task {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.task-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.task-id {
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		letter-spacing: 0.04em;
		color: var(--text-secondary);
	}

	.task-title {
		font-size: var(--text-caption);
		line-height: 1.35;
		color: var(--text-primary);
	}

	/* Neutral. Being the task the reader came from is not a status, and tinting it
	   would put a ninth meaning on eight status colours. The marker is the point of
	   this whole approach made small: the reader's place is not only kept, it is
	   printed inside the thing they went up to. */
	.task[aria-current='true'] {
		margin-inline: calc(var(--space-3) * -1);
		padding: var(--space-2) var(--space-3);
		background: var(--surface-hover-subtle);
		border-left: 2px solid var(--text-primary);
	}

	.here {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	@keyframes rise {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}

	@keyframes fade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	/* While a finger is on the handle the sheet must track it exactly. A transition
	   here would make the drag feel like it was being negotiated. */
	.riser.still,
	.scrim.still {
		animation: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.riser,
		.scrim {
			animation: none;
		}

		.sheet {
			transition: none;
		}
	}
</style>
