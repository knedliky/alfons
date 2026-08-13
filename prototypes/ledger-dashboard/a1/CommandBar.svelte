<script lang="ts" module>
	import type { Task } from './corpus';

	export interface CommandBarProps {
		tasks: Task[];
		/** The task the page is currently resolved to, so the row can mark itself. */
		resolvedId: string;
		onResolve: (id: string) => void;
		/** The page recedes while the panel is open, so the bar owns the view. */
		onOpenChange?: (open: boolean) => void;
	}

	interface ResultGroup {
		release: string;
		project: string;
		tasks: Task[];
	}
</script>

<script lang="ts">
	/**
	 * The command bar — the reason this page exists.
	 *
	 * Typeahead matches on title, id, project and release, because the journey
	 * starts from a vague memory of a title rather than an id. Results are
	 * grouped by release rather than ranked flat: recognising the right task
	 * is mostly recognising the work it sat next to.
	 */
	import { Card, Chip, Icon, Input } from '@alfons/design';
	import { releaseBySlug } from './corpus';
	import TaskRow from './TaskRow.svelte';

	let { tasks, resolvedId, onResolve, onOpenChange }: CommandBarProps = $props();

	let query = $state('');
	let focused = $state(false);
	let activeIndex = $state(0);
	let field = $state<HTMLDivElement | null>(null);

	const needle = $derived(query.trim().toLowerCase());

	const matches = $derived(
		needle.length === 0
			? []
			: tasks
					.filter((task) =>
						`${task.id} ${task.title} ${task.project} ${task.release}`
							.toLowerCase()
							.includes(needle)
					)
					.slice(0, 8)
	);

	const groups = $derived(
		matches.reduce<ResultGroup[]>((accumulated, task) => {
			const existing = accumulated.find((group) => group.release === task.release);
			if (existing) {
				existing.tasks.push(task);
				return accumulated;
			}
			accumulated.push({ release: task.release, project: task.project, tasks: [task] });
			return accumulated;
		}, [])
	);

	/** Flat order the arrow keys walk, which is the grouped order read top to bottom. */
	const walkOrder = $derived(groups.flatMap((group) => group.tasks));

	const open = $derived(focused && needle.length > 0 && walkOrder.length > 0);

	/* Reset the highlight whenever the result set changes underneath it. */
	$effect(() => {
		void needle;
		activeIndex = 0;
	});

	$effect(() => {
		onOpenChange?.(open);
	});

	/* Cmd-K from anywhere on the page: the bar is the page's primary control,
	   so it answers the shortcut people already have in their hands. */
	$effect(() => {
		const onKeydown = (event: KeyboardEvent) => {
			if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				field?.querySelector('input')?.focus();
			}
		};
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});

	function resolve(id: string) {
		onResolve(id);
		query = '';
		focused = false;
	}

	function onFieldKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			query = '';
			return;
		}
		if (!open) return;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			activeIndex = (activeIndex + 1) % walkOrder.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			activeIndex = (activeIndex - 1 + walkOrder.length) % walkOrder.length;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			resolve(walkOrder[activeIndex].id);
		}
	}
</script>

<div class="command" data-open={open}>
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class="field"
		bind:this={field}
		onfocusin={() => (focused = true)}
		onkeydown={onFieldKeydown}
	>
		<span class="leading" aria-hidden="true"><Icon name="search" size="lg" /></span>
		<Input
			class="command-input"
			type="search"
			placeholder="Find a task by anything you remember of its title"
			aria-label="Search the corpus"
			autocomplete="off"
			bind:value={query}
		/>
		<span class="trailing">
			{#if needle.length > 0}
				<span class="count">{matches.length} of {tasks.length}</span>
			{:else}
				<Chip label="⌘K" size="sm" />
			{/if}
		</span>
	</div>

	{#if open}
		<Card variant="elevated" size="flush" class="results">
			<ul class="groups">
				{#each groups as group (group.release)}
					{@const release = releaseBySlug.get(group.release)}
					<li class="group">
						<p class="group-head">
							<span class="group-slug">{group.release}</span>
							<span class="group-title">{release?.title ?? group.project}</span>
							<span class="group-count">{release?.taskCount ?? group.tasks.length} tasks</span>
						</p>
						<ul class="rows">
							{#each group.tasks as task (task.id)}
								<li>
									<TaskRow
										{task}
										active={walkOrder[activeIndex]?.id === task.id}
										current={task.id === resolvedId}
										showRelease={false}
										onSelect={resolve}
									/>
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
			<p class="hint">
				<span>Arrow keys to walk</span>
				<span>Enter resolves the page to the task</span>
				<span>Escape clears</span>
			</p>
		</Card>
	{/if}
</div>

<style>
	.command {
		position: relative;
		/* The field is the page's primary control, so it is sized like one. The
		   height comes from the token the Input already reads. */
		--input-height: var(--space-8);
	}

	.field {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-4);
		padding-inline: var(--space-5);
		background: var(--elevation-2-bg);
		border: 1px solid var(--card-border);
		box-shadow: var(--elevation-2);
		transition:
			box-shadow var(--transition-slow),
			border-color var(--transition-slow);
	}

	.field:focus-within {
		border-color: var(--accent-border);
		box-shadow: var(--elevation-3);
	}

	.leading {
		display: flex;
		color: var(--text-muted);
		transition: color var(--transition-fast);
	}

	.field:focus-within .leading {
		color: var(--accent);
	}

	/* The field itself shows focus, so the input inside it does not draw a
	   second ring — one control, one focus affordance. */
	.field :global(.command-input),
	.field :global(.command-input:focus),
	.field :global(.command-input:focus-visible) {
		background: transparent;
		border: none;
		outline: none;
		box-shadow: none;
		padding-inline: 0;
		font-family: var(--font-body);
		font-size: var(--text-lead);
	}

	/* The user agent's search-clear glyph arrives in the browser's own blue,
	   which is the one colour on the page nobody chose. Escape clears instead. */
	.field :global(.command-input::-webkit-search-cancel-button) {
		appearance: none;
		display: none;
	}

	.trailing {
		display: flex;
		align-items: center;
	}

	.count {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}

	/* The panel is the only floating surface on the page, so it takes the top
	   of the elevation ladder and nothing else competes with it. */
	.command :global(.results) {
		position: absolute;
		inset-inline: 0;
		top: calc(100% + var(--space-2));
		z-index: var(--z-dropdown);
		overflow: hidden;
		box-shadow: var(--shadow-popover);
		animation: settle var(--duration-fast) var(--ease-spring) both;
	}

	@keyframes settle {
		from {
			opacity: 0;
			transform: translateY(calc(var(--space-2) * -1));
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.groups,
	.rows {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.group-head {
		display: flex;
		align-items: baseline;
		gap: var(--space-3);
		margin: 0;
		padding: var(--space-3) var(--space-5);
		background: var(--surface-dark-subtle);
		border-bottom: 1px solid var(--card-border);
	}

	.group-slug {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: var(--chart-axis-letter-spacing);
		text-transform: uppercase;
		color: var(--text-primary);
	}

	.group-title {
		flex: 1;
		min-width: 0;
		font-family: var(--font-body);
		font-size: var(--text-micro);
		color: var(--text-muted);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.group-count {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}

	.hint {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-5);
		margin: 0;
		padding: var(--space-3) var(--space-5);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
