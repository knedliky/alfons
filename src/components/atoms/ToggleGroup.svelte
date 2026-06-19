<script lang="ts" module>
	export interface ToggleGroupOption<T extends string = string> {
		value: T;
		label: string;
	}

	export interface ToggleGroupProps<T extends string = string> {
		options: ToggleGroupOption<T>[];
		selected: T;
		onchange: (value: T) => void;
		class?: string;
	}
</script>

<script lang="ts" generics="T extends string = string">
	/**
	 * ToggleGroup — a pill-button segmented control, one value selected at a time.
	 *
	 * A compact glass-backed toolbar filter: each option is a button, the active one
	 * tinted by a single sliding "thumb" that animates between options (the same
	 * measure-and-transition technique the site header uses for its nav underline).
	 * Pinned to --filter-control-height so it lines up with the sm Select and any
	 * other filter control in the same toolbar, even when the row wraps.
	 */
	import { untrack } from 'svelte';

	let { options, selected, onchange, class: className = '' }: ToggleGroupProps<T> = $props();

	let container = $state<HTMLDivElement | null>(null);
	let buttonRefs: Record<string, HTMLButtonElement> = $state({});

	// Geometry of the sliding thumb, measured from the active button. `ready`
	// gates the CSS transition so the thumb snaps to its first position on mount
	// rather than sliding in from the container's edge.
	let thumb = $state({ left: 0, top: 0, width: 0, height: 0, ready: false });

	/** Measure the active button relative to the container's padding box and move
	 *  the thumb to cover it. Rect maths (not offsetLeft) keeps it exact across
	 *  the container's 1px border. */
	function measureThumb(): void {
		const active = buttonRefs[selected];
		if (!active || !container) return;

		const styles = getComputedStyle(container);
		const borderLeft = parseFloat(styles.borderLeftWidth) || 0;
		const borderTop = parseFloat(styles.borderTopWidth) || 0;

		const containerRect = container.getBoundingClientRect();
		const buttonRect = active.getBoundingClientRect();

		thumb = {
			left: buttonRect.left - containerRect.left - borderLeft,
			top: buttonRect.top - containerRect.top - borderTop,
			width: buttonRect.width,
			height: buttonRect.height,
			ready: untrack(() => thumb.ready)
		};
	}

	// Re-measure whenever the selection changes (and on first mount). Reading
	// `selected` and the ref map registers them as dependencies.
	$effect(() => {
		void selected;
		void buttonRefs;
		measureThumb();

		// Enable transitions only after the first measured position has painted,
		// so the initial render snaps into place without a visible slide.
		if (!untrack(() => thumb.ready)) {
			const id = requestAnimationFrame(() => {
				thumb = { ...untrack(() => thumb), ready: true };
			});
			return () => cancelAnimationFrame(id);
		}
	});

	// Re-measure on size changes — the font-size ramp at the sm breakpoint, label
	// edits, or option-count changes all shift the active button's box.
	$effect(() => {
		if (!container) return;
		const observer = new ResizeObserver(() => measureThumb());
		observer.observe(container);
		for (const button of Object.values(buttonRefs)) observer.observe(button);
		return () => observer.disconnect();
	});

	// The thumb is hidden until its first real measurement, so a zero-width thumb
	// never flashes at the container's corner before the active button is read.
	const thumbVisible = $derived(thumb.width > 0);
</script>

<div class="toggle-group {className}" bind:this={container}>
	<span
		class="toggle-thumb"
		class:toggle-thumb--visible={thumbVisible}
		class:toggle-thumb--ready={thumb.ready}
		style="transform: translate({thumb.left}px, {thumb.top}px); width: {thumb.width}px; height: {thumb.height}px;"
		aria-hidden="true"
	></span>
	{#each options as option}
		<button
			bind:this={buttonRefs[option.value]}
			class="toggle-btn"
			class:toggle-btn--active={selected === option.value}
			onclick={() => onchange(option.value)}
		>
			{option.label}
		</button>
	{/each}
</div>

<style>
	/* Container — glass-compatible background and border. min-height pins this to
	   the shared filter-control rhythm so it always matches the sibling filters,
	   even when the toolbar wraps onto multiple rows. position: relative anchors
	   the sliding thumb. */
	.toggle-group {
		position: relative;
		display: inline-flex;
		align-items: stretch;
		min-height: var(--filter-control-height);
		gap: 0.0625rem;
		padding: 0.25rem;
		background: var(--card-bg);
		border: 1px solid var(--card-border);
		/* Full pill. */
		border-radius: var(--radius-pill);
	}

	/* Sliding thumb — the single tinted pill that moves to sit behind the active
	   button. Sits below the buttons (z-index) so their labels stay legible. Its
	   transform/width/height are set inline from the measured active button. */
	.toggle-thumb {
		position: absolute;
		top: 0;
		left: 0;
		z-index: 0;
		border-radius: var(--radius-pill);
		background: var(--card-border);
		opacity: 0;
		pointer-events: none;
	}

	.toggle-thumb--visible {
		opacity: 1;
	}

	/* Transition gated behind --ready so the thumb snaps to its first position on
	   mount, then slides for every subsequent selection — mirrors the header nav
	   indicator's 0.25s ease. */
	.toggle-thumb--ready {
		transition:
			transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
			width 0.25s cubic-bezier(0.4, 0, 0.2, 1),
			height 0.25s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@media (prefers-reduced-motion: reduce) {
		.toggle-thumb--ready {
			transition: none;
		}
	}

	/* Inactive button — muted text, no background. Height is governed by the
	   container (min-height + align-items: stretch), so buttons set none.
	   position: relative + z-index lifts the label above the sliding thumb. */
	.toggle-btn {
		position: relative;
		z-index: 1;
		/* Centre the label now that the button stretches to the container height. */
		display: inline-flex;
		align-items: center;
		justify-content: center;
		font-family: var(--font-mono);
		font-size: 0.6875rem;
		/* Pin the line-height so the label can't inherit the page's taller body
		   line-height and push the button past the shared --filter-control-height
		   (which left the group ~3.6px taller than sibling sm Selects). */
		line-height: 1.4;
		border: none;
		border-radius: var(--radius-pill);
		padding: 0.2rem 0.6rem;
		cursor: pointer;
		color: var(--text-muted);
		background: transparent;
		transition: color var(--transition-fast);
	}

	.toggle-btn:hover {
		color: var(--text-primary);
	}

	/* Active state — primary text; the tinted background is supplied by the
	   sliding thumb behind it, not a per-button fill. */
	.toggle-btn--active,
	.toggle-btn--active:hover {
		color: var(--text-primary);
	}

	/* Relaxed typography on wider viewports — height tracks --filter-control-height. */
	@media (min-width: 640px) {
		.toggle-btn {
			font-size: 0.75rem;
			padding: 0.25rem 0.75rem;
		}
	}
</style>
