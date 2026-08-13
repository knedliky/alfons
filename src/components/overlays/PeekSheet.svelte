<script lang="ts" module>
	import type { Snippet } from 'svelte';

	export interface PeekSheetProps {
		/** The kind of thing being peeked — "Release", "Project". */
		rank: string;
		/** The name of the thing being peeked. */
		name: string;
		/**
		 * The commit control's full label — "Go to release schema-lives-here",
		 * never a bare "Open". The second stage of a two-stage gesture stays
		 * discoverable by being plainly named.
		 */
		commitLabel: string;
		reducedMotion: boolean;
		onCommit: () => void;
		/**
		 * Called by every dismissal — scrim tap, swipe-down past the threshold,
		 * the Close control. The page should route it (and Escape, and the
		 * phone's back) through one history.back(), so there is one back and not
		 * two that can disagree.
		 */
		onDismiss: () => void;
		children: Snippet;
	}
</script>

<script lang="ts">
	/**
	 * PeekSheet — an application bottom sheet: a partial layer over where the
	 * reader stands, cheap to raise, cheap to put down, with one pinned
	 * full-width commit control in the thumb's reach.
	 *
	 * This is not Modal. Modal is a centred scale-in confirmation dialog styled
	 * with --admin-* tokens; a sheet is a public-surface glance at a place, and
	 * the prototype round that produced this measured Modal as three ways wrong
	 * for the job. The library now has both, and they are different answers.
	 *
	 * Modal to the keyboard without a hand-rolled focus trap: role="dialog",
	 * aria-modal, and THE PAGE marking everything beneath it inert is the whole
	 * fence — a second trap would be a second implementation of the same rule.
	 * Focus lands on the labelled region on arrival, and re-lands when `name`
	 * changes, because a sheet that silently becomes a different subject has
	 * lost a screen reader.
	 *
	 * Fixed chrome beneath the sheet (an app tab bar, a dev harness pager) can
	 * raise the commit bar with --screen-bottom-inset; it defaults to nothing.
	 *
	 * Usage:
	 *   <PeekSheet rank="Release" name={slug} commitLabel="Go to release {slug}"
	 *     reducedMotion={reduced} onCommit={commit} onDismiss={back}>
	 *     ...body...
	 *   </PeekSheet>
	 */
	import Button from '../atoms/Button.svelte';
	import Icon from '../atoms/Icon.svelte';

	let { rank, name, commitLabel, reducedMotion, onCommit, onDismiss, children }: PeekSheetProps =
		$props();

	let region = $state<HTMLElement | null>(null);

	// On arrival AND on swap: `name` in the dependency list is what makes a
	// glance that changes subject re-announce itself.
	$effect(() => {
		void name;
		region?.focus();
	});

	// The swipe-down. Pointer capture on the grip only — the body scrolls, and a
	// sheet that dismisses because the reader scrolled its list is a sheet that
	// punishes reading. Past the threshold the release hands off to onDismiss;
	// short of it the sheet settles back.
	let dragOffset = $state(0);
	let dragging = $state(false);
	let dragStart = 0;

	function onGripDown(event: PointerEvent) {
		dragging = true;
		dragStart = event.clientY;
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}

	function onGripMove(event: PointerEvent) {
		if (!dragging) return;
		dragOffset = Math.max(0, event.clientY - dragStart);
	}

	function onGripUp() {
		if (!dragging) return;
		dragging = false;
		if (dragOffset > 72) onDismiss();
		dragOffset = 0;
	}

	function rise(node: HTMLElement, { reduced }: { reduced: boolean }) {
		void node;
		return {
			duration: reduced ? 0 : 220,
			css: (t: number) => `transform: translateY(${(1 - t) * 100}%)`
		};
	}

	function fade(node: HTMLElement, { reduced }: { reduced: boolean }) {
		void node;
		return {
			duration: reduced ? 0 : 180,
			css: (t: number) => `opacity: ${t}`
		};
	}
</script>

<!-- The scrim is a dismissal surface, not a control a keyboard needs: Escape
     and the Close button are the keyboard's two ways out, so the scrim stays
     out of the tab order and out of the accessibility tree. -->
<div
	class="scrim"
	aria-hidden="true"
	onclick={onDismiss}
	in:fade={{ reduced: reducedMotion }}
	out:fade={{ reduced: reducedMotion }}
></div>

<!-- svelte-ignore a11y_no_noninteractive_element_to_interactive_role -- the
     sheet IS a dialog: modal to the keyboard, labelled, focus-managed. A
     <section> carrying role="dialog" is the honest element here. -->
<section
	class="sheet"
	bind:this={region}
	tabindex="-1"
	role="dialog"
	aria-modal="true"
	aria-label="Peek: {rank} {name}"
	style:transform={dragging ? `translateY(${dragOffset}px)` : undefined}
	style:transition={dragging ? 'none' : undefined}
	in:rise={{ reduced: reducedMotion }}
	out:rise={{ reduced: reducedMotion }}
>
	<!-- svelte-ignore a11y_no_static_element_interactions -- the grip is a
	     pointer-gesture surface only; every dismissal it offers also exists as
	     the labelled Close button and Escape, so it needs no role of its own. -->
	<div
		class="grip"
		onpointerdown={onGripDown}
		onpointermove={onGripMove}
		onpointerup={onGripUp}
		onpointercancel={onGripUp}
	>
		<span class="handle" aria-hidden="true"></span>
		<div class="bar">
			<div class="titling">
				<p class="rank">{rank} &middot; peeking</p>
				<h2 class="name">{name}</h2>
			</div>
			<Button
				variant="secondary"
				size="icon"
				type="button"
				aria-label="Dismiss peek"
				onclick={onDismiss}
			>
				<Icon name="close" size="md" />
			</Button>
		</div>
	</div>

	<div class="body">
		{@render children()}
	</div>

	<div class="commit">
		<Button type="button" onclick={onCommit}>
			<span class="commit-label">
				{commitLabel}
				<Icon name="arrow-right" size="md" />
			</span>
		</Button>
	</div>
</section>

<style>
	/* Above the Header and above any pushed screen. Measured, not taste: the
	   site Header sits at --z-widget (50), and a sheet at --z-overlay (30) was
	   modal to the keyboard yet walked around by a mouse. Pushed screens sit at
	   --z-overlay, so --z-widget also keeps a peek raised FROM a pushed screen
	   above that screen. */
	.scrim {
		position: fixed;
		inset: 0;
		z-index: var(--z-widget);
		background: var(--overlay-scrim);
	}

	.sheet {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: var(--z-widget);
		display: flex;
		flex-direction: column;
		/* Partial by definition: enough to read, never the whole screen. The
		   place beneath stays visible above it, which is what makes dismissal
		   feel like putting something down rather than travelling back. */
		height: min(70dvh, 34rem);
		background: var(--bg-primary);
		border-top: 1px solid var(--card-border);
		box-shadow: var(--shadow-modal);
	}

	.sheet:focus-visible {
		outline: 2px solid var(--focus-ring-color);
		outline-offset: calc(var(--space-1) * -1);
	}

	.grip {
		flex: none;
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-2) var(--space-4) var(--space-3);
		/* The grip is the swipe surface, so the browser must not claim the
		   vertical gesture for scrolling the page. */
		touch-action: none;
		cursor: grab;
	}

	.handle {
		align-self: center;
		width: var(--space-6);
		height: var(--space-1);
		background: var(--border-glass);
	}

	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
	}

	.titling {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.rank {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.name {
		margin: 0;
		font-family: var(--font-display);
		/* The type scale stops at --text-lead, a caption size for the name of the
		   thing being peeked. The floor is the token; the ceiling is a literal,
		   inherited from the prototype rounds and recorded there. */
		font-size: clamp(var(--text-lead), 5vw, 1.5rem);
		line-height: 1.15;
		color: var(--text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* The sheet's body scrolls; the sheet does not. Both axes stated, because an
	   unstated overflow-x computes to a scrolling value to match the set one. */
	.body {
		flex: 1;
		min-height: 0;
		padding: 0 var(--space-4);
		overflow-x: hidden;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	.commit {
		flex: none;
		display: flex;
		flex-direction: column;
		padding: var(--space-3) var(--space-4);
		/* --screen-bottom-inset is the documented input for fixed chrome beneath
		   the sheet (a tab bar, a dev harness pager). Nothing by default. */
		padding-bottom: calc(var(--space-3) + var(--screen-bottom-inset, 0px));
		border-top: 1px solid var(--card-border);
		background: var(--bg-primary);
	}

	.commit-label {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	/* Centred by margins, never by transform: the rise transition and the drag
	   both write `transform`, and a translateX(-50%) centring would be
	   overwritten mid-animation, snapping the sheet sideways. */
	@media (min-width: 640px) {
		.sheet {
			width: 100%;
			max-width: 34rem;
			margin-inline: auto;
			border-left: 1px solid var(--card-border);
			border-right: 1px solid var(--card-border);
		}
	}
</style>
