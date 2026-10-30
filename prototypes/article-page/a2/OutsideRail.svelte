<script lang="ts">
	/**
	 * OutsideRail — today's lamp rail, moved off the sheet into its own gutter.
	 *
	 * Because the gutter belongs to the rail alone, the section labels no longer
	 * need to hide inside a hover flyout: every label is always readable, and a
	 * hairline track under each lamp fills as that section is read. Each stop is
	 * an in-page link, so it works without script and reads as navigation to a
	 * screen reader. The host decides where the gutter exists; the rail only
	 * draws the reading position it is given.
	 */
	import type { ReadingPosition, SectionStop } from './readingProgress';

	interface Props {
		stops: SectionStop[];
		position: ReadingPosition;
	}

	let { stops, position }: Props = $props();
</script>

<nav class="outside-rail" aria-label="Sections">
	<p class="rail-heading">Contents</p>
	<ol class="rail-stops">
		{#each stops as stop, index (stop.id)}
			{@const progress = position.sectionProgress[index] ?? 0}
			{@const active = position.activeIndex === index}
			<li
				class="rail-stop"
				class:rail-stop-lit={progress > 0}
				class:rail-stop-active={active}
				style:--lamp-colour={stop.lampColour}
				style:--stop-progress={progress}
			>
				<a class="rail-link" href="#{stop.id}" aria-current={active ? 'location' : undefined}>
					<span class="rail-lamp" aria-hidden="true"></span>
					<span class="rail-label">{stop.kicker}</span>
				</a>
				<span class="rail-track" aria-hidden="true"></span>
			</li>
		{/each}
	</ol>
</nav>

<style>
	.outside-rail {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.rail-heading {
		margin: 0;
		font: var(--type-spec);
		letter-spacing: var(--ls-caps);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.rail-stops {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	/* The lamp and its track share the first column, so the track runs from
	   one lamp down to the next like the capsule did on the sheet. Lamp colour
	   and read share arrive inline; these are the resting values before the
	   first measurement lands. */
	.rail-stop {
		--lamp-colour: var(--accent);
		--stop-progress: 0;
		position: relative;
		padding-bottom: var(--space-3);
	}

	.rail-link {
		display: grid;
		grid-template-columns: var(--space-2) 1fr;
		align-items: baseline;
		gap: var(--space-3);
		color: var(--text-muted);
		text-decoration: none;
		transition: color var(--transition-fast);
	}

	.rail-link:hover,
	.rail-stop-active .rail-link {
		color: var(--text-primary);
	}

	.rail-link:focus-visible {
		outline: none;
		box-shadow: var(--focus-ring);
		border-radius: var(--radius-1);
	}

	/* The lamp keeps the console lens of today's rail: dark until its section
	   is reached, then lit in the section's own brand colour. */
	.rail-lamp {
		align-self: center;
		width: var(--space-2);
		height: var(--space-2);
		background: var(--led-off);
		box-shadow:
			var(--shadow-part),
			0 0 0 1px var(--el-edge-shade);
		transition:
			background var(--transition-fast),
			box-shadow var(--transition-fast);
	}

	.rail-stop-lit .rail-lamp {
		background: radial-gradient(
			circle at 38% 30%,
			color-mix(in oklab, var(--lamp-colour), white 50%),
			var(--lamp-colour) 72%
		);
		box-shadow:
			var(--shadow-part),
			var(--shadow-rail-lamp);
	}

	.rail-label {
		font: var(--type-small);
		text-wrap: balance;
	}

	/* Hairline track from this lamp to the next; its lit length is the share
	   of the section already read. */
	.rail-track {
		position: absolute;
		top: calc(var(--space-2) + var(--space-3));
		bottom: 0;
		left: calc(var(--space-2) / 2 - 0.5px);
		width: 1px;
		background: linear-gradient(
			to bottom,
			var(--lamp-colour) calc(var(--stop-progress) * 100%),
			var(--border-hairline) calc(var(--stop-progress) * 100%)
		);
	}

	.rail-stop:last-child .rail-track {
		display: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.rail-link,
		.rail-lamp {
			transition: none;
		}
	}
</style>
