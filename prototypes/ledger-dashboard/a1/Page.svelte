<script lang="ts">
	/**
	 * Ledger — the corpus dashboard — approach 1 of 5: Command surface
	 *
	 * Direction: search is not a filter on this page, it is the page. The
	 * command bar takes the full measure and the top of the elevation ladder;
	 * every region below it is a consequence of what the bar resolved to, and
	 * rearranges when that changes. Restrained palette, real elevation,
	 * generous rows, one accent spent on the row under the cursor.
	 */
	import {
		Card,
		Chip,
		Container,
		Footer,
		Header,
		MainLayout,
		PageFrame,
		PageHeader,
		PageSection
	} from '@alfons/design';

	import CommandBar from './CommandBar.svelte';
	import ReleaseProgress from './ReleaseProgress.svelte';
	import StatusMark from './StatusMark.svelte';
	import TaskRow from './TaskRow.svelte';
	import TransitionTape from './TransitionTape.svelte';
	import {
		corpusFigures,
		releaseBySlug,
		seedTransitions,
		tasks as seedTasks,
		type Task,
		type Transition
	} from './corpus';

	/* The corpus updates while you watch, so the page holds its own copy and
	   patches it from the feed rather than re-reading a static import. */
	let liveTasks = $state<Task[]>(seedTasks.map((task) => ({ ...task })));
	let resolvedId = $state('AL-012');
	let searching = $state(false);

	const resolved = $derived(liveTasks.find((task) => task.id === resolvedId) ?? liveTasks[0]);
	const release = $derived(releaseBySlug.get(resolved.release));
	const siblings = $derived(liveTasks.filter((task) => task.release === resolved.release));

	const phases = $derived.by(() => {
		const numbers = [...new Set(siblings.map((task) => task.phase))].sort((a, b) => a - b);
		return numbers.map((phase) => ({
			phase,
			tasks: siblings.filter((task) => task.phase === phase)
		}));
	});

	const dependencies = $derived(
		resolved.dependsOn
			.map((id) => liveTasks.find((task) => task.id === id))
			.filter((task): task is Task => task !== undefined)
	);

	const dependents = $derived(liveTasks.filter((task) => task.dependsOn.includes(resolved.id)));

	function applyTransition(transition: Transition) {
		liveTasks = liveTasks.map((task) =>
			task.id === transition.taskId ? { ...task, status: transition.to } : task
		);
	}

	function resolveTo(id: string) {
		resolvedId = id;
	}
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}

	<main class="command-surface" data-searching={searching}>
		<!-- Region 1 — the command bar, and the only thing above the fold. -->
		<PageSection maxWidth="calc(var(--page-content-max-width) + var(--space-10))">
			<Container maxWidth="full" padding={false}>
				<div class="masthead">
					<div class="masthead-title">
						<PageHeader
							title="Ledger"
							subtitle="Every task, release and decision in the corpus. Start by typing what you half-remember."
							align="left"
							spacing="compact"
						/>
					</div>
					<dl class="figures">
						{#each corpusFigures as figure (figure.label)}
							<div class="figure">
								<dt>{figure.label}</dt>
								<dd>{figure.value}</dd>
							</div>
						{/each}
					</dl>
				</div>

				<div class="bar">
					<CommandBar
						tasks={liveTasks}
						{resolvedId}
						onResolve={resolveTo}
						onOpenChange={(open) => (searching = open)}
					/>
				</div>
			</Container>
		</PageSection>

		<!-- Region 2 — what the bar resolved to. -->
		<div class="downstream">
			<PageSection maxWidth="calc(var(--page-content-max-width) + var(--space-10))">
				<Container maxWidth="full" padding={false}>
					<Card variant="elevated">
						<p class="eyebrow">Resolved to</p>
						<div class="dossier-head">
							<span class="dossier-id">{resolved.id}</span>
							<StatusMark status={resolved.status} />
						</div>
						<h2 class="dossier-title">{resolved.title}</h2>

						<dl class="facts">
							<div class="fact">
								<dt>project</dt>
								<dd>{resolved.project}</dd>
							</div>
							<div class="fact">
								<dt>release</dt>
								<dd>{resolved.release}</dd>
							</div>
							<div class="fact">
								<dt>phase</dt>
								<dd>{resolved.phase}</dd>
							</div>
							<div class="fact">
								<dt>type</dt>
								<dd>{resolved.type}</dd>
							</div>
							<div class="fact">
								<dt>risk</dt>
								<dd>{resolved.risk}</dd>
							</div>
							<div class="fact">
								<dt>created</dt>
								<dd>{resolved.createdOn}</dd>
							</div>
							<div class="fact">
								<dt>completed</dt>
								<dd>{resolved.completedOn ?? '—'}</dd>
							</div>
							<div class="fact">
								<dt>steps</dt>
								<dd>{resolved.stepCount}</dd>
							</div>
							<div class="fact">
								<dt>criteria</dt>
								<dd>{resolved.criterionCount}</dd>
							</div>
							<div class="fact">
								<dt>file changes</dt>
								<dd>{resolved.fileChangeCount}</dd>
							</div>
							<div class="fact">
								<dt>latest attempt</dt>
								<dd>
									{#if resolved.latestAttempt === null}
										not attempted
									{:else}
										{resolved.latestAttempt} · {resolved.latestVerdict} · {resolved.latestSealedOn}
									{/if}
								</dd>
							</div>
						</dl>
					</Card>
				</Container>
			</PageSection>

			<!-- Region 3 — the shape of the work around it. -->
			<PageSection maxWidth="calc(var(--page-content-max-width) + var(--space-10))">
				<Container maxWidth="full" padding={false}>
					<MainLayout
						asidePosition="right"
						asideWidth="22rem"
						gap="xl"
						stickyTop="calc(var(--header-height) + var(--space-5))"
					>
						{#snippet main()}
							<div class="release">
								<header class="release-head">
									<p class="eyebrow">The release it belongs to</p>
									<h2 class="release-title">{release?.title ?? resolved.release}</h2>
									<p class="release-slug">{resolved.release}</p>
								</header>

								<ReleaseProgress
									tasks={siblings}
									caption="the {siblings.length} tasks on this release, by status"
								/>

								<ol class="phases">
									{#each phases as group (group.phase)}
										<li class="phase">
											<h3 class="phase-head">
												<span class="phase-number">Phase {group.phase}</span>
												<span class="phase-rule" aria-hidden="true"></span>
												<span class="phase-count">{group.tasks.length}</span>
											</h3>
											<ul class="phase-rows">
												{#each group.tasks as task (task.id)}
													<li>
														<TaskRow
															{task}
															current={task.id === resolved.id}
															showRelease={false}
															onSelect={resolveTo}
														/>
													</li>
												{/each}
											</ul>
										</li>
									{/each}
								</ol>
							</div>
						{/snippet}

						{#snippet aside()}
							<div class="aside">
								<section class="panel">
									<h3 class="panel-head">Release</h3>
									<dl class="panel-facts">
										<div class="fact">
											<dt>project</dt>
											<dd>{release?.project ?? resolved.project}</dd>
										</div>
										<div class="fact">
											<dt>tasks</dt>
											<dd>{release?.taskCount ?? siblings.length}</dd>
										</div>
										<div class="fact">
											<dt>documented</dt>
											<dd>{release?.documentedOn ?? 'not yet'}</dd>
										</div>
										<div class="fact">
											<dt>kind</dt>
											<dd>{release?.isBucket ? 'bucket' : 'release'}</dd>
										</div>
									</dl>
									{#if release && release.tags.length > 0}
										<div class="tags">
											{#each release.tags as tag (tag)}
												<Chip label={tag} size="sm" />
											{/each}
										</div>
									{/if}
								</section>

								<section class="panel">
									<h3 class="panel-head">Depends on</h3>
									{#if dependencies.length === 0}
										<p class="panel-empty">Nothing. This one can start on its own.</p>
									{:else}
										<ul class="panel-rows">
											{#each dependencies as task (task.id)}
												<li>
													<TaskRow {task} compact showRelease onSelect={resolveTo} />
												</li>
											{/each}
										</ul>
									{/if}
								</section>

								<section class="panel">
									<h3 class="panel-head">Waiting on it</h3>
									{#if dependents.length === 0}
										<p class="panel-empty">Nothing is blocked behind this one.</p>
									{:else}
										<ul class="panel-rows">
											{#each dependents as task (task.id)}
												<li>
													<TaskRow {task} compact showRelease onSelect={resolveTo} />
												</li>
											{/each}
										</ul>
									{/if}
								</section>

								<section class="panel">
									<TransitionTape seed={seedTransitions} onTransition={applyTransition} />
								</section>
							</div>
						{/snippet}
					</MainLayout>
				</Container>
			</PageSection>
		</div>
	</main>
</PageFrame>

<style>
	/* The status encoding, declared once. Every mark, segment and tape line on
	   this page inherits from here, so the map cannot drift between regions. */
	.command-surface {
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
	}

	.masthead {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: var(--space-5);
	}

	/* The headline takes the measure it needs and no more, so the figures sit
	   beside it rather than pushing the command bar down the page. */
	.masthead-title {
		flex: 1 1 24rem;
		max-width: var(--section-header-max-width);
	}

	.figures {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-6);
		margin: 0 0 var(--space-5);
	}

	.figure dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: var(--chart-axis-letter-spacing);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.figure dd {
		margin: 0;
		font-family: var(--font-display);
		font-size: var(--text-lead);
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	/* The bar stays put while the corpus scrolls past it. */
	.bar {
		position: sticky;
		top: calc(var(--header-height) + var(--space-3));
		z-index: var(--z-sticky);
		padding-block: var(--space-3);
		background: var(--bg-primary);
	}

	/* Interaction is the layout: while the panel is open everything downstream
	   recedes, so the results are read against a quiet page rather than a busy
	   one. It never moves — only its weight changes. */
	.downstream {
		transition:
			opacity var(--transition-slow),
			filter var(--transition-slow);
	}

	[data-searching='true'] .downstream {
		opacity: var(--opacity-tertiary);
		filter: blur(var(--frost-2));
		pointer-events: none;
	}

	.eyebrow {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: var(--chart-axis-letter-spacing);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.dossier-head {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin-top: var(--space-3);
	}

	.dossier-id {
		font-family: var(--font-mono);
		font-size: var(--text-ui);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--chart-axis-letter-spacing);
		color: var(--text-secondary);
	}

	.dossier-title {
		margin: var(--space-3) 0 var(--space-6);
		max-width: var(--section-header-max-width);
		font-family: var(--font-display);
		font-size: 2rem;
		line-height: 1.15;
		color: var(--text-primary);
	}

	.facts,
	.panel-facts {
		display: grid;
		gap: var(--space-4) var(--space-6);
		margin: 0;
	}

	.facts {
		grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
		padding-top: var(--space-5);
		border-top: 1px solid var(--card-border);
	}

	.fact dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		letter-spacing: var(--chart-axis-letter-spacing);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.fact dd {
		margin: var(--space-1) 0 0;
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.release {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.release-title {
		margin: var(--space-3) 0 var(--space-1);
		font-family: var(--font-display);
		font-size: 1.5rem;
		line-height: 1.2;
		color: var(--text-primary);
	}

	.release-slug {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.phases,
	.phase-rows,
	.panel-rows {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.phases {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.phase-head {
		display: flex;
		align-items: center;
		gap: var(--space-4);
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 500;
		letter-spacing: var(--chart-axis-letter-spacing);
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	/* Recessive rule, in the grid colour rather than the border colour. */
	.phase-rule {
		flex: 1;
		height: 1px;
		background: var(--grid-colour-accent);
	}

	.phase-count {
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}

	.aside {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.panel-head {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 500;
		letter-spacing: var(--chart-axis-letter-spacing);
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.panel-facts {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		margin-top: var(--space-4);
	}

	.panel-empty {
		margin: 0;
		font-family: var(--font-body);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}

	@media (prefers-reduced-motion: reduce) {
		.downstream {
			transition: none;
		}
	}
</style>
