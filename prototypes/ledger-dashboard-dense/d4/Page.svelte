<script lang="ts">
	/**
	 * Ledger — the corpus dashboard, dense — approach 4 of 5: Keyboard terminal
	 *
	 * Direction: take the terminal premise to its end. The keyboard is the
	 * primary input, not a set of shortcuts bolted onto a mouse page. Row
	 * movement, band movement, incremental search, column focus, sorting and
	 * inline expansion are all reachable without touching a pointer.
	 *
	 * The question it exists to answer: does a dense table plus a real cursor
	 * model beat a command palette at "I half-remember a title"? Round one's a1
	 * answered that journey by pulling matches out of the corpus into a floating
	 * panel. This answers it by moving through the corpus in place.
	 *
	 * Hence the two search modes, which are the whole argument:
	 *
	 *   /  seek   — does not filter. It marks every match and walks the cursor
	 *               between them, leaving all eighty-seven rows where they are.
	 *               The release band above the cursor, the siblings below it and
	 *               the neighbours either side stay on screen, which is exactly
	 *               the context the brief says a match has to carry to be
	 *               recognised on sight. A palette cannot show it because a
	 *               palette has left the corpus behind.
	 *   f  filter — narrows to the matches, for when the memory is good enough
	 *               that the surroundings are noise. Kept because seek is the
	 *               wrong tool at eleven matches spread over four hundred rows.
	 *
	 * Seek is the default that / reaches, because the failure a palette has is
	 * not finding the row — it is what it costs to look around the row once
	 * found.
	 */
	import {
		Container,
		Footer,
		Header,
		Input,
		Label,
		PageFrame,
		PageHeader,
		PageSection
	} from '@alfons/design';
	import { untrack } from 'svelte';
	import KeyCap from './KeyCap.svelte';
	import KeyLegend, { type KeyGroup } from './KeyLegend.svelte';
	import StatusMark from './StatusMark.svelte';
	import TaskGrid, { COLUMNS, type SortColumn } from './TaskGrid.svelte';
	import {
		IN_FLIGHT_STATUSES,
		OPEN_STATUSES,
		PROJECTS,
		RELEASE_BY_SLUG,
		RELEASES,
		TASKS,
		type Task,
		type TaskStatus
	} from './corpus';

	const STATUS_ORDER: TaskStatus[] = [
		'blocked',
		'building',
		'verifying',
		'triaged',
		'pending',
		'done',
		'wontfix',
		'duplicate'
	];

	const RISK_ORDER = ['destructive', 'high', 'medium', 'low'];
	const VERDICT_ORDER = ['fail', 'partial', 'pass', ''];

	/**
	 * How far Page Up and Page Down travel. A constant rather than a measured
	 * viewport: the rows are a fixed height and a page that changes length as
	 * the window resizes is a page you cannot build a habit on.
	 */
	const PAGE_ROWS = 20;

	const GRID_ID = 'ledger-grid';
	const SEARCH_ID = 'ledger-search';
	const LEGEND_ID = 'ledger-key-legend';

	type SearchMode = 'idle' | 'seek' | 'filter';

	let mode = $state<SearchMode>('idle');
	let term = $state('');
	let sortColumn = $state<SortColumn>('release');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let expandedId = $state<string | null>(null);
	let focusedColumn = $state<SortColumn | null>(null);
	let legendOpen = $state(false);
	let feedPaused = $state(false);
	let gridFocused = $state(false);
	let announcement = $state('Cursor on the first row. Press question mark for every key.');

	/**
	 * The cursor is an id, never an index.
	 *
	 * This is the one decision the live feed forces on this approach and on no
	 * other. A correction arriving over SSE can re-sort the table underneath
	 * the view — when the sort is by status, a task moving to done travels the
	 * length of the page. An index cursor would stay at row 41 and silently
	 * point at a different task; an id cursor travels with its row. Everything
	 * downstream — scroll, expansion, seek position — is derived from the id.
	 */
	let cursorId = $state<string | null>(null);

	/** The row the seek started from, so incremental typing searches forward from there. */
	let seekAnchor = $state(0);

	let grid = $state<ReturnType<typeof TaskGrid> | null>(null);

	/**
	 * The feed corrects statuses underneath the view, so the rendered status is
	 * the corpus status overlaid with whatever the feed has since said. Keeping
	 * the override separate means the seed data is never mutated.
	 */
	let feedStatuses = $state<Record<string, TaskStatus>>({});
	let feedLog = $state<{ id: string; from: TaskStatus; to: TaskStatus; at: string }[]>([]);
	let recentlyMoved = $state<string[]>([]);

	const tasks = $derived(
		TASKS.map((task) => (feedStatuses[task.id] ? { ...task, status: feedStatuses[task.id] } : task))
	);

	const needle = $derived(term.trim().toLowerCase());

	function matchesTerm(task: Task, against: string): boolean {
		return `${task.id} ${task.title} ${task.project} ${task.release} ${task.type} ${task.status}`
			.toLowerCase()
			.includes(against);
	}

	/**
	 * Seek does not filter, so only filter mode narrows. The held row is the
	 * live-feed case: a correction that pushes the cursor's task out of the
	 * filter does not delete the row out from under the cursor, it keeps it in
	 * place with a dashed rule until the cursor moves off it of its own accord.
	 */
	const visible = $derived.by(() => {
		if (mode !== 'filter' || needle.length === 0) return tasks;
		const kept = tasks.filter((task) => matchesTerm(task, needle));
		if (cursorId !== null && !kept.some((task) => task.id === cursorId)) {
			const held = tasks.find((task) => task.id === cursorId);
			if (held) kept.push(held);
		}
		return kept;
	});

	const heldId = $derived.by(() => {
		if (mode !== 'filter' || needle.length === 0 || cursorId === null) return null;
		const cursorTask = tasks.find((task) => task.id === cursorId);
		if (!cursorTask) return null;
		return matchesTerm(cursorTask, needle) ? null : cursorId;
	});

	function sortKey(task: Task, column: SortColumn): string | number {
		switch (column) {
			case 'status':
				return STATUS_ORDER.indexOf(task.status);
			case 'id':
				return task.id;
			case 'title':
				return task.title.toLowerCase();
			case 'project':
				return task.project;
			case 'release':
				return task.release;
			case 'phase':
				return task.phase;
			case 'type':
				return task.type;
			case 'risk':
				return RISK_ORDER.indexOf(task.risk);
			case 'steps':
				return task.stepCount;
			case 'criteria':
				return task.criterionCount;
			case 'files':
				return task.fileChangeCount;
			case 'attempt':
				return task.latestAttempt;
			case 'verdict':
				return VERDICT_ORDER.indexOf(task.latestVerdict ?? '');
			case 'created':
				return task.createdOn;
			case 'sealed':
				return task.latestSealedOn ?? '';
		}
	}

	const rows = $derived.by(() => {
		const direction = sortDirection === 'asc' ? 1 : -1;
		return [...visible].sort((a, b) => {
			const left = sortKey(a, sortColumn);
			const right = sortKey(b, sortColumn);
			if (left < right) return -1 * direction;
			if (left > right) return 1 * direction;
			// Phase then id, so a release always reads as a running order.
			if (a.phase !== b.phase) return a.phase - b.phase;
			return a.id.localeCompare(b.id);
		});
	});

	const grouped = $derived(sortColumn === 'release');

	const cursorIndex = $derived(rows.findIndex((task) => task.id === cursorId));
	const cursorTask = $derived(cursorIndex === -1 ? null : rows[cursorIndex]);

	/** Marked in place while seeking. Empty in every other mode. */
	const matchIds = $derived.by(() => {
		if (mode !== 'seek' || needle.length === 0) return new Set<string>();
		return new Set(rows.filter((task) => matchesTerm(task, needle)).map((task) => task.id));
	});

	/** The seek walk order is simply the table's own order, top to bottom. */
	const matchOrder = $derived(rows.filter((task) => matchIds.has(task.id)).map((task) => task.id));
	const matchPosition = $derived(cursorId === null ? -1 : matchOrder.indexOf(cursorId));

	const counts = $derived.by(() => {
		const open = tasks.filter((task) => OPEN_STATUSES.includes(task.status)).length;
		const inFlight = tasks.filter((task) => IN_FLIGHT_STATUSES.includes(task.status)).length;
		const blocked = tasks.filter((task) => task.status === 'blocked').length;
		return { open, inFlight, blocked };
	});

	const statusTally = $derived.by(() => {
		const tally: Record<string, number> = {};
		for (const status of STATUS_ORDER) tally[status] = 0;
		for (const task of tasks) tally[task.status] = (tally[task.status] ?? 0) + 1;
		return tally;
	});

	/* ---- cursor movement ---- */

	function setCursor(id: string | null, note?: string) {
		if (id === null) return;
		cursorId = id;
		if (note) announcement = note;
	}

	function moveBy(delta: number) {
		if (rows.length === 0) return;
		const from = cursorIndex === -1 ? 0 : cursorIndex;
		const next = Math.min(rows.length - 1, Math.max(0, from + delta));
		setCursor(rows[next].id, describe(rows[next], next));
	}

	function moveTo(index: number) {
		if (rows.length === 0) return;
		const clamped = Math.min(rows.length - 1, Math.max(0, index));
		setCursor(rows[clamped].id, describe(rows[clamped], clamped));
	}

	function describe(task: Task, index: number): string {
		return `${task.id}, ${task.title}, ${task.status}, ${task.release}, phase ${task.phase}. Row ${index + 1} of ${rows.length}.`;
	}

	/**
	 * A band is a run of equal values down whatever column the table is sorted
	 * by — releases when sorted by release, statuses when sorted by status.
	 * Defining it against the sort rather than fixing it to release means the
	 * bracket keys always move by whatever structure is currently on screen.
	 */
	function bandValue(task: Task): string {
		return String(sortKey(task, sortColumn));
	}

	function moveBand(direction: 1 | -1) {
		if (rows.length === 0) return;
		const from = cursorIndex === -1 ? 0 : cursorIndex;
		const current = bandValue(rows[from]);
		if (direction === 1) {
			for (let index = from + 1; index < rows.length; index += 1) {
				if (bandValue(rows[index]) !== current) {
					moveTo(index);
					return;
				}
			}
			moveTo(rows.length - 1);
			return;
		}
		// Backwards means the top of this band first, then the top of the one
		// before it — the behaviour a section key has everywhere else.
		let start = from;
		while (start > 0 && bandValue(rows[start - 1]) === current) start -= 1;
		if (start < from) {
			moveTo(start);
			return;
		}
		if (start === 0) return;
		const previous = bandValue(rows[start - 1]);
		let previousStart = start - 1;
		while (previousStart > 0 && bandValue(rows[previousStart - 1]) === previous) previousStart -= 1;
		moveTo(previousStart);
	}

	/* ---- seek ---- */

	function jumpToMatch(direction: 1 | -1, fromIndex: number) {
		if (needle.length === 0 || rows.length === 0) return;
		for (let step = 1; step <= rows.length; step += 1) {
			const index = (fromIndex + direction * step + rows.length * step) % rows.length;
			if (matchesTerm(rows[index], needle)) {
				const position = matchOrder.indexOf(rows[index].id) + 1;
				setCursor(
					rows[index].id,
					`Match ${position === 0 ? 1 : position} of ${matchOrder.length}. ${describe(rows[index], index)}`
				);
				return;
			}
		}
		announcement = `No task matches ${term.trim()}.`;
	}

	/**
	 * Incremental seek. Guarded by a remembered term rather than written as a
	 * plain effect on rows, because rows changes on every feed tick and an
	 * unguarded effect would drag the cursor back to the anchor every five
	 * seconds while a person was still reading.
	 */
	let lastSeekTerm = '';
	$effect(() => {
		const current = term;
		const currentMode = mode;
		untrack(() => {
			if (currentMode !== 'seek') {
				lastSeekTerm = '';
				return;
			}
			if (current === lastSeekTerm) return;
			lastSeekTerm = current;
			if (current.trim().length === 0) return;
			// Search forward from where the seek began, so extending a term keeps
			// walking down the page rather than restarting at the top.
			jumpToMatch(1, seekAnchor - 1);
		});
	});

	/**
	 * Filtering is an intentional narrowing, so the cursor follows it to the
	 * first surviving row. That is the opposite of the feed case above, where
	 * the person did nothing and the row is held instead.
	 */
	let lastFilterTerm = '';
	$effect(() => {
		const current = term;
		const currentMode = mode;
		untrack(() => {
			if (currentMode !== 'filter') {
				lastFilterTerm = '';
				return;
			}
			if (current === lastFilterTerm) return;
			lastFilterTerm = current;
			if (cursorId !== null && rows.some((task) => task.id === cursorId)) return;
			if (rows.length > 0) setCursor(rows[0].id);
		});
	});

	/* ---- modes ---- */

	function focusSearch() {
		document.getElementById(SEARCH_ID)?.focus();
	}

	function enterSeek() {
		mode = 'seek';
		term = '';
		lastSeekTerm = '';
		seekAnchor = cursorIndex === -1 ? 0 : cursorIndex;
		announcement = 'Seek. Type to walk the cursor to a match; the table stays where it is.';
		queueMicrotask(focusSearch);
	}

	function enterFilter() {
		mode = 'filter';
		term = '';
		lastFilterTerm = '';
		announcement = 'Filter. Type to narrow the table to matching rows.';
		queueMicrotask(focusSearch);
	}

	function leaveSearch(clear: boolean) {
		if (clear) {
			term = '';
			mode = 'idle';
			announcement = 'Search cleared.';
		} else {
			announcement =
				mode === 'seek'
					? `Seek held at ${cursorId ?? 'no row'}. n and shift-n walk the remaining matches.`
					: `Filter held at ${rows.length} rows.`;
		}
		focusGrid();
	}

	function focusGrid() {
		grid?.focusGrid();
	}

	function toggleExpand(id: string | null) {
		if (id === null) return;
		expandedId = expandedId === id ? null : id;
		announcement = expandedId === id ? `${id} expanded.` : `${id} collapsed.`;
	}

	function changeSort(column: SortColumn) {
		if (sortColumn === column) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortColumn = column;
			sortDirection = 'asc';
		}
		announcement = `Sorted by ${column}, ${sortDirection === 'asc' ? 'ascending' : 'descending'}. The cursor stayed on ${cursorId ?? 'no row'}.`;
	}

	function moveColumn(delta: number) {
		const currentIndex = focusedColumn ? COLUMNS.findIndex((c) => c.id === focusedColumn) : -1;
		const next = Math.min(
			COLUMNS.length - 1,
			Math.max(0, currentIndex === -1 ? (delta > 0 ? 0 : COLUMNS.length - 1) : currentIndex + delta)
		);
		focusedColumn = COLUMNS[next].id;
		announcement = `Column ${COLUMNS[next].fullName ?? COLUMNS[next].header}. Press s to sort by it.`;
	}

	/* ---- the key model ---- */

	/** Set by the first g of a gg chord and cleared by the next key, whatever it is. */
	let pendingChord = $state<string | null>(null);

	function handleFieldKey(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			leaveSearch(term.trim().length === 0);
			return;
		}
		if (event.key === 'Enter') {
			event.preventDefault();
			if (mode === 'seek') {
				jumpToMatch(event.shiftKey ? -1 : 1, cursorIndex);
				return;
			}
			leaveSearch(false);
			return;
		}
		// The arrows keep working while the field has focus, so a match can be
		// stepped past without leaving the term half-typed.
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			moveBy(1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			moveBy(-1);
		}
	}

	function handleKey(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		const tag = target?.tagName;
		if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) {
			handleFieldKey(event);
			return;
		}

		// Browser and platform shortcuts keep their meaning; only ctrl-d and
		// ctrl-u are claimed, because they are the half-page keys every terminal
		// pager already has and neither is bound in a browser.
		if (event.metaKey || event.altKey) return;
		if (event.ctrlKey && event.key !== 'd' && event.key !== 'u') return;

		const chord = pendingChord;
		pendingChord = null;

		if (chord === 'g' && event.key === 'g') {
			event.preventDefault();
			moveTo(0);
			focusGrid();
			return;
		}

		// Shift plus an arrow is band movement, so it is settled before the
		// unshifted arrows below claim the same key.
		if (event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
			event.preventDefault();
			moveBand(event.key === 'ArrowDown' ? 1 : -1);
			focusGrid();
			return;
		}

		switch (event.key) {
			case 'j':
			case 'ArrowDown':
				event.preventDefault();
				moveBy(1);
				focusGrid();
				break;
			case 'k':
			case 'ArrowUp':
				event.preventDefault();
				moveBy(-1);
				focusGrid();
				break;
			// Braces rather than brackets for band movement: the dev harness's
			// own approach pager already owns [ and ], and a prototype that
			// steals a key from the thing reviewing it cannot be reviewed.
			case '}':
				event.preventDefault();
				moveBand(1);
				focusGrid();
				break;
			case '{':
				event.preventDefault();
				moveBand(-1);
				focusGrid();
				break;
			case 'PageDown':
				event.preventDefault();
				moveBy(PAGE_ROWS);
				focusGrid();
				break;
			case 'PageUp':
				event.preventDefault();
				moveBy(-PAGE_ROWS);
				focusGrid();
				break;
			case 'd':
				if (!event.ctrlKey) return;
				event.preventDefault();
				moveBy(Math.round(PAGE_ROWS / 2));
				focusGrid();
				break;
			case 'u':
				if (!event.ctrlKey) return;
				event.preventDefault();
				moveBy(-Math.round(PAGE_ROWS / 2));
				focusGrid();
				break;
			case 'g':
				pendingChord = 'g';
				break;
			case 'G':
			case 'End':
				event.preventDefault();
				moveTo(rows.length - 1);
				focusGrid();
				break;
			case 'Home':
				event.preventDefault();
				moveTo(0);
				focusGrid();
				break;
			case '/':
				event.preventDefault();
				enterSeek();
				break;
			case 'f':
				event.preventDefault();
				enterFilter();
				break;
			case 'n':
				event.preventDefault();
				jumpToMatch(1, cursorIndex);
				focusGrid();
				break;
			case 'N':
				event.preventDefault();
				jumpToMatch(-1, cursorIndex);
				focusGrid();
				break;
			case 'Enter':
			case 'o':
				event.preventDefault();
				toggleExpand(cursorId);
				focusGrid();
				break;
			case 'h':
				event.preventDefault();
				moveColumn(-1);
				focusGrid();
				break;
			case 'l':
				event.preventDefault();
				moveColumn(1);
				focusGrid();
				break;
			case 's':
				event.preventDefault();
				changeSort(focusedColumn ?? sortColumn);
				focusGrid();
				break;
			case 't':
				event.preventDefault();
				if (feedLog.length > 0) {
					setCursor(feedLog[0].id, `Jumped to the last correction, ${feedLog[0].id}.`);
					focusGrid();
				} else {
					announcement = 'The feed has not corrected anything yet this session.';
				}
				break;
			case 'p':
				event.preventDefault();
				feedPaused = !feedPaused;
				announcement = feedPaused
					? 'Feed paused. The table will not move underneath the cursor.'
					: 'Feed resumed.';
				break;
			case '?':
				event.preventDefault();
				legendOpen = !legendOpen;
				announcement = legendOpen ? 'Key legend open.' : 'Key legend closed.';
				break;
			case 'Escape':
				event.preventDefault();
				// One Escape undoes one thing, innermost first.
				if (expandedId !== null) {
					toggleExpand(expandedId);
				} else if (focusedColumn !== null) {
					focusedColumn = null;
					announcement = 'Column focus cleared.';
				} else if (mode !== 'idle') {
					leaveSearch(true);
				} else if (legendOpen) {
					legendOpen = false;
				}
				break;
			default:
				break;
		}
	}

	$effect(() => {
		window.addEventListener('keydown', handleKey);
		return () => window.removeEventListener('keydown', handleKey);
	});

	/** Start on the first row so the cursor is never a thing you have to summon. */
	$effect(() => {
		if (cursorId === null && rows.length > 0) cursorId = rows[0].id;
	});

	/**
	 * A scripted stand-in for the SSE feed. Scripted rather than random so the
	 * five approaches can be compared against the same sequence of events.
	 */
	const SCRIPTED_TRANSITIONS: { id: string; to: TaskStatus }[] = [
		{ id: 'AL-015', to: 'verifying' },
		{ id: 'ATL-116', to: 'verifying' },
		{ id: 'AL-014', to: 'done' },
		{ id: 'FN-023', to: 'verifying' },
		{ id: 'GW-007', to: 'blocked' },
		{ id: 'MTV-080', to: 'verifying' },
		{ id: 'DOM-005', to: 'blocked' },
		{ id: 'LDG-043', to: 'done' },
		{ id: 'SCR-060', to: 'verifying' },
		{ id: 'MTV-082', to: 'verifying' }
	];

	let feedCursor = 0;

	$effect(() => {
		if (feedPaused) return;
		const timer = setInterval(() => {
			const event = SCRIPTED_TRANSITIONS[feedCursor % SCRIPTED_TRANSITIONS.length];
			feedCursor += 1;
			const current = TASKS.find((task) => task.id === event.id);
			const currentStatus = feedStatuses[event.id] ?? current?.status;
			if (!currentStatus || currentStatus === event.to) return;

			feedStatuses = { ...feedStatuses, [event.id]: event.to };
			feedLog = [
				{
					id: event.id,
					from: currentStatus,
					to: event.to,
					at: new Date().toTimeString().slice(0, 8)
				},
				...feedLog
			].slice(0, 4);

			recentlyMoved = [...recentlyMoved, event.id];
			setTimeout(() => {
				recentlyMoved = recentlyMoved.filter((id) => id !== event.id);
			}, 2000);
		}, 5200);

		return () => clearInterval(timer);
	});

	const KEY_GROUPS: KeyGroup[] = [
		{
			heading: 'Move the cursor',
			bindings: [
				{ keys: ['j', '↓'], does: 'Next row' },
				{ keys: ['k', '↑'], does: 'Previous row' },
				{
					keys: ['}', '⇧↓'],
					does: 'Next band — the next run of whatever column sorts the table'
				},
				{ keys: ['{', '⇧↑'], does: 'Top of this band, then the top of the one before it' },
				{ keys: ['PgDn'], does: `Down ${PAGE_ROWS} rows` },
				{ keys: ['PgUp'], does: `Up ${PAGE_ROWS} rows` },
				{ keys: ['Ctrl', 'd'], join: 'then', does: `Down ${Math.round(PAGE_ROWS / 2)} rows` },
				{ keys: ['Ctrl', 'u'], join: 'then', does: `Up ${Math.round(PAGE_ROWS / 2)} rows` },
				{ keys: ['g', 'g'], join: 'then', does: 'First row' },
				{ keys: ['⇧G', 'End'], does: 'Last row' }
			]
		},
		{
			heading: 'Find',
			bindings: [
				{ keys: ['/'], does: 'Seek — mark every match and walk the cursor to them, table unmoved' },
				{ keys: ['f'], does: 'Filter — narrow the table to matching rows' },
				{ keys: ['n'], does: 'Next match' },
				{ keys: ['⇧N'], does: 'Previous match' },
				{ keys: ['↵'], does: 'In the field: next match. ⇧↵ for the previous one' },
				{ keys: ['Esc'], does: 'Leave the field, keeping the cursor. Again to clear the term' }
			]
		},
		{
			heading: 'Read and order',
			bindings: [
				{ keys: ['↵', 'o'], does: 'Open the cursor row — release, siblings, dependencies' },
				{ keys: ['h'], does: 'Focus the column to the left' },
				{ keys: ['l'], does: 'Focus the column to the right' },
				{ keys: ['s'], does: 'Sort by the focused column; again to reverse it' },
				{ keys: ['Esc'], does: 'Close the row, then the column focus, then the search' }
			]
		},
		{
			heading: 'The live feed',
			bindings: [
				{ keys: ['t'], does: 'Jump the cursor to the task the feed last corrected' },
				{ keys: ['p'], does: 'Pause the feed so nothing moves underneath you' },
				{ keys: ['?'], does: 'This legend' }
			]
		}
	];

	/** The six keys that carry the page, shown permanently beside the search. */
	const PRIMARY_KEYS: { key: string; does: string }[] = [
		{ key: 'j', does: 'down' },
		{ key: 'k', does: 'up' },
		{ key: '/', does: 'seek' },
		{ key: 'f', does: 'filter' },
		{ key: '↵', does: 'open' },
		{ key: '?', does: 'keys' }
	];
</script>

<PageFrame>
	{#snippet header()}<Header />{/snippet}
	{#snippet footer()}<Footer />{/snippet}

	<!--
		Every status colour is declared once, on .ledger, so the grid, the feed
		and the legend cannot drift apart. wontfix and duplicate are closed
		without being finished, so they take the muted tone pending has and rely
		on their own glyph to stay distinguishable.
	-->
	<main class="ledger">
		<PageSection maxWidth="1680px" class="band band-masthead">
			<Container maxWidth="full" padding={false}>
				<p class="kicker">ledger · context corpus · live · keyboard</p>
				<PageHeader
					title="Every task, under one cursor"
					subtitle="Move with j and k, seek with slash, open with return. Nothing is behind a filter and nothing needs a mouse — though everything answers one."
					align="left"
					spacing="none"
				/>

				<dl class="figures">
					<div class="figure-cell">
						<dt>Open</dt>
						<dd>{counts.open}</dd>
						<p>pending, triaged, building or verifying</p>
					</div>
					<div class="figure-cell">
						<dt>In flight</dt>
						<dd>{counts.inFlight}</dd>
						<p>an agent is on it right now</p>
					</div>
					<div class="figure-cell">
						<dt>Blocked</dt>
						<dd>{counts.blocked}</dd>
						<p>waiting on a task in another release</p>
					</div>
					<div class="figure-cell">
						<dt>Corpus</dt>
						<dd>{tasks.length}</dd>
						<p>{RELEASES.length} releases across {PROJECTS.length} projects</p>
					</div>
				</dl>
			</Container>
		</PageSection>

		<PageSection maxWidth="1680px" class="band band-search">
			<Container maxWidth="full" padding={false}>
				<div class="console">
					<div class="search">
						<Label for={SEARCH_ID} class="search-label">
							{mode === 'filter' ? 'Filter the corpus' : 'Seek through the corpus'}
						</Label>
						<div class="search-field" data-mode={mode}>
							<span class="search-prompt" aria-hidden="true">{mode === 'filter' ? '≡' : '/'}</span>
							<Input
								id={SEARCH_ID}
								class="search-input"
								type="search"
								bind:value={term}
								placeholder={mode === 'filter'
									? 'narrow to a title, an id, a release, a project'
									: 'a half-remembered title — the table stays put and the cursor comes to it'}
								autocomplete="off"
								onfocus={() => {
									if (mode === 'idle') mode = 'seek';
								}}
							/>
						</div>

						<div class="modes" role="group" aria-label="Search mode">
							<button
								type="button"
								class="mode"
								class:on={mode === 'seek'}
								aria-pressed={mode === 'seek'}
								onclick={enterSeek}
							>
								<KeyCap key="/" active={mode === 'seek'} />
								<span>seek in place</span>
							</button>
							<button
								type="button"
								class="mode"
								class:on={mode === 'filter'}
								aria-pressed={mode === 'filter'}
								onclick={enterFilter}
							>
								<KeyCap key="f" active={mode === 'filter'} />
								<span>filter the table</span>
							</button>
							<button
								type="button"
								class="mode"
								class:on={feedPaused}
								aria-pressed={feedPaused}
								onclick={() => (feedPaused = !feedPaused)}
							>
								<KeyCap key="p" active={feedPaused} />
								<span>{feedPaused ? 'feed paused' : 'feed live'}</span>
							</button>
						</div>
					</div>

					<div class="rail-keys">
						<p class="rail-head">Primary keys</p>
						<ul class="rail-list" class:live={gridFocused}>
							{#each PRIMARY_KEYS as primary (primary.key)}
								<li><KeyCap key={primary.key} /><span>{primary.does}</span></li>
							{/each}
						</ul>
						<p class="rail-note">
							{gridFocused
								? 'The table has focus. Every key above is live.'
								: 'Click the table or press any movement key to take the cursor.'}
						</p>
					</div>

					<div class="feed">
						<p class="feed-head">Feed <KeyCap key="t" /></p>
						<ul class="feed-list">
							{#each feedLog as entry (entry.id + entry.at)}
								<li>
									<span class="feed-time figure">{entry.at}</span>
									<span class="task-id">{entry.id}</span>
									<StatusMark status={entry.from} />
									<span class="feed-arrow" aria-hidden="true">→</span>
									<StatusMark status={entry.to} />
								</li>
							{/each}
							{#if feedLog.length === 0}
								<li class="feed-idle">Connected. No transitions yet this session.</li>
							{/if}
						</ul>
					</div>
				</div>

				<!--
					The status line. Visible and live at once: a terminal's bottom
					line, and the thing a screen reader hears when a mode changes or
					a seek lands. Cursor movement itself is not announced here —
					aria-activedescendant already reads the row.
				-->
				<p class="status-line" aria-live="polite">
					<span class="status-cell">
						<span class="figure">{rows.length}</span> of
						<span class="figure">{tasks.length}</span> rows
					</span>
					<span class="status-cell">
						cursor <span class="task-id">{cursorTask?.id ?? '—'}</span> at
						<span class="figure">{cursorIndex + 1}</span>
					</span>
					{#if mode === 'seek' && needle.length > 0}
						<span class="status-cell status-strong">
							match <span class="figure">{matchPosition + 1}</span> of
							<span class="figure">{matchOrder.length}</span>
						</span>
					{:else if mode === 'filter' && needle.length > 0}
						<span class="status-cell status-strong">
							filtered to “{term.trim()}”
						</span>
					{/if}
					<span class="status-cell">
						sort <span class="status-strong">{sortColumn}</span>
						{sortDirection === 'asc' ? '↑' : '↓'}
					</span>
					{#if focusedColumn}
						<span class="status-cell"
							>column <span class="status-strong">{focusedColumn}</span></span
						>
					{/if}
					{#if heldId}
						<span class="status-cell status-strong">
							{heldId} held — the feed moved it out of the filter
						</span>
					{/if}
					<span class="status-spacer"></span>
					<span class="status-cell status-said">{announcement}</span>
				</p>
			</Container>
		</PageSection>

		<PageSection maxWidth="100%" class="band band-table">
			<TaskGrid
				bind:this={grid}
				{rows}
				releases={RELEASE_BY_SLUG}
				allTasks={tasks}
				{sortColumn}
				{sortDirection}
				onSortChange={changeSort}
				{grouped}
				{expandedId}
				onToggleExpand={toggleExpand}
				{cursorId}
				onCursorChange={(id) => setCursor(id)}
				{focusedColumn}
				onColumnFocus={(column) => (focusedColumn = column)}
				{term}
				{matchIds}
				seeking={mode === 'seek'}
				{recentlyMoved}
				{heldId}
				gridId={GRID_ID}
				onGridFocus={(focused) => (gridFocused = focused)}
			/>
			{#if rows.length === 0}
				<p class="no-rows">
					No task matches “{term.trim()}”. The search reads id, title, project, release, type and
					status. Press Escape to clear it.
				</p>
			{/if}
		</PageSection>

		<PageSection maxWidth="1680px" class="band band-legend">
			<Container maxWidth="full" padding={false}>
				<KeyLegend
					groups={KEY_GROUPS}
					open={legendOpen}
					onToggle={() => (legendOpen = !legendOpen)}
					id={LEGEND_ID}
				/>

				<div class="legend">
					<div class="legend-block">
						<h2>Status</h2>
						<ul class="legend-list">
							{#each STATUS_ORDER as status (status)}
								<li>
									<StatusMark {status} />
									<span class="legend-count figure">{statusTally[status] ?? 0}</span>
								</li>
							{/each}
						</ul>
						<p class="legend-note">
							Every status carries a glyph and a word as well as its colour, so the column survives
							being read without colour at all.
						</p>
					</div>

					<div class="legend-block">
						<h2>Columns</h2>
						<dl class="legend-keys">
							<div>
								<dt>Ph</dt>
								<dd>phase within the release</dd>
							</div>
							<div>
								<dt>Stp</dt>
								<dd>steps recorded on the task</dd>
							</div>
							<div>
								<dt>Crt</dt>
								<dd>acceptance criteria</dd>
							</div>
							<div>
								<dt>Fls</dt>
								<dd>file changes declared</dd>
							</div>
							<div>
								<dt>Att</dt>
								<dd>latest verification attempt</dd>
							</div>
						</dl>
						<p class="legend-note">
							High and destructive risk is underlined rather than coloured — colour on this page
							means state and nothing else.
						</p>
					</div>
				</div>
			</Container>
		</PageSection>
	</main>
</PageFrame>

<style>
	.ledger {
		/* The one place status colour is defined. */
		--status-pending: var(--text-muted);
		--status-triaged: var(--sky-blue);
		--status-building: var(--amber);
		--status-verifying: var(--blush-pink);
		--status-done: var(--olive-green);
		--status-blocked: var(--fire-engine-red);
		--status-wontfix: var(--text-muted);
		--status-duplicate: var(--text-muted);

		font-variant-numeric: tabular-nums;
	}

	/* PageSection is built for editorial breathing room; a terminal wants the
	   space back, so the vertical rhythm is tightened region by region. */
	.ledger :global(.band) {
		padding-block: var(--space-6);
	}

	.ledger :global(.band-masthead) {
		padding-block-start: var(--space-7);
		padding-block-end: var(--space-5);
	}

	.ledger :global(.band-search) {
		padding-block: var(--space-5);
	}

	.ledger :global(.band-table) {
		padding-block: 0;
		padding-inline: 0;
	}

	.ledger :global(.band-legend) {
		padding-block: var(--space-6) var(--space-7);
	}

	.ledger :global(.search-input) {
		height: calc(var(--input-height) * 1.15);
		font-family: var(--font-mono);
		font-size: var(--text-lead);
		border-width: 2px;
	}

	/* The UA cancel button paints its own blue, which is the one colour on this
	   page that answers to nothing. type="search" is kept for the semantics. */
	.ledger :global(.search-input::-webkit-search-cancel-button) {
		appearance: none;
	}

	.kicker {
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	/* ---- headline figures ---- */

	.figures {
		display: flex;
		flex-wrap: wrap;
		gap: 0;
		margin: var(--space-5) 0 0;
		padding: 0;
		border-top: 2px solid var(--border-glass-hover);
		border-bottom: 2px solid var(--border-glass-hover);
	}

	.figure-cell {
		flex: 1 1 12rem;
		padding: var(--space-3) var(--space-4);
		border-left: 1px solid var(--border-glass);
	}

	.figure-cell:first-child {
		padding-left: 0;
		border-left: none;
	}

	.figure-cell dt {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.figure-cell dd {
		margin: var(--space-1) 0 0;
		font-family: var(--font-display);
		/* No token spans the display sizes, so the scale is derived from one
		   rather than guessed at as a literal. */
		font-size: calc(var(--text-lead) * 2.2);
		line-height: 1;
		font-variant-numeric: tabular-nums;
		color: var(--text-primary);
	}

	.figure-cell p {
		margin: var(--space-2) 0 0;
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	/* ---- console ---- */

	.console {
		display: grid;
		grid-template-columns: minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr);
		gap: var(--space-5);
		align-items: start;
	}

	/* The console's three columns need a laptop to hold their own; below that
	   the search field is what matters and it takes the full width. */
	@media (max-width: 1280px) {
		.console {
			grid-template-columns: minmax(0, 1fr);
		}
	}

	.ledger :global(.search-label) {
		display: block;
		margin-bottom: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-secondary);
	}

	.search-field {
		display: flex;
		align-items: stretch;
		gap: var(--space-3);
	}

	.search-prompt {
		display: flex;
		align-items: center;
		font-family: var(--font-mono);
		font-size: calc(var(--text-lead) * 1.4);
		line-height: 1;
		color: var(--accent);
	}

	/* Filter is the borrowed mode, so its prompt is quieter than seek's. */
	.search-field[data-mode='filter'] .search-prompt {
		color: var(--text-secondary);
	}

	.modes {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		margin-top: var(--space-3);
	}

	.mode {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		padding: 0;
		background: none;
		border: none;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
		cursor: pointer;
	}

	.mode.on,
	.mode:hover,
	.mode:focus-visible {
		color: var(--text-primary);
	}

	/* ---- the key rail ---- */

	.rail-head,
	.feed-head {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin: 0 0 var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.rail-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 7rem), 1fr));
		gap: var(--space-1) var(--space-3);
		margin: 0;
		padding: 0;
		list-style: none;
		opacity: var(--state-hover-opacity);
		transition: opacity var(--transition-fast);
	}

	/* The rail brightens when the grid takes focus, so the page says when the
	   keys are live rather than leaving it to be guessed at. */
	.rail-list.live {
		opacity: 1;
	}

	.rail-list li {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.rail-note {
		margin: var(--space-2) 0 0;
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	/* ---- feed ---- */

	.feed-list {
		margin: 0;
		padding: 0;
		list-style: none;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
	}

	.feed-list li {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-block: var(--space-1);
	}

	.feed-time,
	.feed-arrow,
	.feed-idle {
		color: var(--text-muted);
	}

	.task-id {
		font-family: var(--font-mono);
		font-weight: 600;
		color: var(--text-secondary);
	}

	/* ---- status line ---- */

	.status-line {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-2) var(--space-4);
		margin: var(--space-4) 0 0;
		padding-top: var(--space-2);
		border-top: 2px solid var(--border-glass-hover);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-muted);
	}

	.status-line .figure {
		font-weight: 700;
		color: var(--text-primary);
	}

	.status-strong {
		color: var(--text-secondary);
	}

	.status-spacer {
		flex: 1;
	}

	.status-said {
		color: var(--text-secondary);
	}

	.no-rows {
		margin: 0;
		padding: var(--space-6) var(--page-padding-x);
		font-family: var(--font-mono);
		font-size: var(--text-caption);
		color: var(--text-muted);
	}

	/* ---- legend ---- */

	.legend {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
		gap: var(--space-6);
		padding-top: var(--space-5);
		border-top: 1px solid var(--border-glass);
	}

	.legend-block h2 {
		margin: 0 0 var(--space-3);
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.legend-list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 10rem), 1fr));
		gap: var(--space-1) var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.legend-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		padding-block: var(--space-1);
		border-bottom: 1px solid var(--border-glass);
	}

	.legend-count {
		font-family: var(--font-mono);
		font-size: var(--text-micro);
		color: var(--text-secondary);
	}

	.legend-keys {
		margin: 0;
		font-family: var(--font-mono);
		font-size: var(--text-micro);
	}

	.legend-keys div {
		display: flex;
		gap: var(--space-3);
		padding-block: var(--space-1);
		border-bottom: 1px solid var(--border-glass);
	}

	.legend-keys dt {
		min-width: var(--space-7);
		font-weight: 700;
		color: var(--text-secondary);
	}

	.legend-keys dd {
		margin: 0;
		color: var(--text-muted);
	}

	.legend-note {
		margin: var(--space-3) 0 0;
		font-size: var(--text-micro);
		color: var(--text-muted);
	}
</style>
