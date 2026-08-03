<script lang="ts">
	/**
	 * The visible control and the keyboard path, for a deck whose swipe is free.
	 *
	 * A vertical deck gets its gesture from the platform, so the swipe needed no
	 * code — but that is only one of the three routes the brief requires, and the
	 * other two still have to be built. These are they: two buttons that move the
	 * page one card, and arrow keys on those buttons that do the same thing
	 * without a pointer.
	 *
	 * They live in the sticky count bar rather than floating over the card. A
	 * floating control on a phone sits exactly where the card's progress figures
	 * are, and the reader would be covering the numbers they came for.
	 *
	 * The readout between them is deliberate and it is the answer to "does the
	 * scrollbar do the work". On a desktop it very nearly does; on a phone the
	 * scrollbar is a hint that fades a second after the finger lifts, so a reader
	 * glancing at a still page has no position at all. The readout is what is
	 * left when the scrollbar has gone.
	 */
	import { tick } from 'svelte';
	import { Button, Icon } from '@alfons/design';

	let {
		index,
		total,
		onSelect
	}: { index: number; total: number; onSelect: (next: number) => void } = $props();

	// Button renders its own <button>, so the wrapper is what can be bound and the
	// element inside it is what can take focus.
	let previousWrapper = $state<HTMLElement | null>(null);
	let nextWrapper = $state<HTMLElement | null>(null);

	function focusInside(wrapper: HTMLElement | null) {
		wrapper?.querySelector('button')?.focus();
	}

	const atFirst = $derived(index === 0);
	const atLast = $derived(index === total - 1);

	function move(to: number) {
		const next = Math.min(Math.max(to, 0), total - 1);
		if (next === index) return;
		onSelect(next);
	}

	/**
	 * Roving focus, adapted to a pair rather than a rail. A button that moves the
	 * deck to an end also disables itself, and focus on a disabled button is
	 * focus lost — so the move hands focus to the sibling, and a second press of
	 * the same arrow keeps working. n2 solved the same problem across its ticks.
	 */
	async function keepFocus(landed: number) {
		// After the DOM has caught up, not before. Pressing End then Home lost
		// focus entirely without this await: the sibling was still disabled from
		// the previous index when focus() was called, so the call did nothing and
		// the browser had already blurred the button that had just disabled
		// itself. The keyboard reader was left with nothing focused.
		await tick();
		if (landed === 0) focusInside(nextWrapper);
		else if (landed === total - 1) focusInside(previousWrapper);
	}

	function onKeydown(event: KeyboardEvent) {
		// The axis is vertical, so the arrows are vertical. Left and right would be
		// a horizontal deck's keys on a deck that does not move that way.
		const jump =
			event.key === 'ArrowDown' || event.key === 'PageDown'
				? index + 1
				: event.key === 'ArrowUp' || event.key === 'PageUp'
					? index - 1
					: event.key === 'Home'
						? 0
						: event.key === 'End'
							? total - 1
							: null;
		if (jump === null) return;
		event.preventDefault();
		const landed = Math.min(Math.max(jump, 0), total - 1);
		move(landed);
		keepFocus(landed);
	}
</script>

<div class="controls">
	<div bind:this={previousWrapper}>
		<Button
			variant="secondary"
			size="icon"
			type="button"
			aria-label="Previous task"
			disabled={atFirst}
			onclick={() => move(index - 1)}
			onkeydown={onKeydown}
		>
			<Icon name="chevron-up" size="md" />
		</Button>
	</div>

	<p class="readout" aria-live="polite">
		<!-- The digits are the sighted reading; the sentence is the spoken one.
		     Announcing both would read "two slash four, card two of four". -->
		<span class="digits" aria-hidden="true">
			<span class="current">{index + 1}</span>
			<span class="divider">/</span>
			<span class="total">{total}</span>
		</span>
		<span class="assistive">card {index + 1} of {total}</span>
	</p>

	<div bind:this={nextWrapper}>
		<Button
			variant="secondary"
			size="icon"
			type="button"
			aria-label="Next task"
			disabled={atLast}
			onclick={() => move(index + 1)}
			onkeydown={onKeydown}
		>
			<Icon name="chevron-down" size="md" />
		</Button>
	</div>
</div>

<style>
	.controls {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex: none;
	}

	.readout {
		margin: 0;
		position: relative;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		white-space: nowrap;
		/* Neutral. Status colour on this page means building or verifying, and a
		   coloured position readout would be colour carrying a second meaning. */
		color: var(--text-muted);
	}

	.digits {
		display: flex;
		align-items: baseline;
		gap: var(--space-1);
	}

	.current {
		color: var(--text-primary);
	}

	.divider {
		color: var(--text-muted);
	}

	.total {
		color: var(--text-secondary);
	}

	/* The library has no visually-hidden utility, so this is local. The digits
	   read as "2 / 4" to a screen reader, which is not a sentence; the sentence
	   is what the live region should announce. */
	.assistive {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		overflow: clip;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
