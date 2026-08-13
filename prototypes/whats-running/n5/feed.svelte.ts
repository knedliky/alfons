/**
 * The simulated SSE feed behind approach n5.
 *
 * This approach renders the feed and lets state fall out of it, so the feed is
 * the model and the runner list is derived from it — not the other way round.
 * A task on the page is a task an event put there, and a task leaving the page
 * is an event too, which is why a departure lingers long enough to be read as
 * "finished" or "blocked" rather than simply disappearing.
 *
 * Real SSE would deliver the same shapes; only `start()` would change.
 */

export type Status = 'triaged' | 'building' | 'verifying' | 'done' | 'blocked';

/** The only two statuses this page renders. Everything else is a departure. */
export type RunningStatus = 'building' | 'verifying';

export interface RunningTask {
	id: string;
	title: string;
	project: string;
	release: string;
	phase: number;
	status: RunningStatus;
	/** When the task entered its current status, as epoch milliseconds. */
	enteredAt: number;
	/** Set once the task has left; the channel shows the departure, then goes. */
	departing: 'done' | 'blocked' | null;
}

export interface Transition {
	key: number;
	taskId: string;
	title: string;
	from: Status;
	to: Status;
	at: number;
}

/** Which scene to open on. The query string picks it; there is no on-page control. */
export type Scene = 'cycle' | 'running' | 'idle';

/**
 * How long a departed task stays on screen. Long enough to read a word and a
 * colour, short enough that the page is honest about what is running now.
 */
const DEPARTURE_LINGER_MS = 4000;

/** The tape is a trailing log, not a history. Three is what fits a glance. */
const TAPE_DEPTH = 3;

type Seed = Omit<RunningTask, 'enteredAt' | 'departing'>;

const OPENING_RUNNERS: Seed[] = [
	{
		id: 'AL-014',
		title: 'Skill: /prototype — the one-question-at-a-time journey and the five-agent fan-out',
		project: 'alfons',
		release: 'prototype-loop-v1',
		phase: 2,
		status: 'verifying'
	},
	{
		id: 'LDG-041',
		title: 'Regenerate base.sql from the live corpus, and the test that proves it matches',
		project: 'ledger',
		release: 'schema-lives-here',
		phase: 1,
		status: 'building'
	},
	{
		id: 'ATL-118',
		title: 'Serve the catalogue as a static Caddy mount rather than through the gateway',
		project: 'atlas',
		release: 'catalogue-without-a-token',
		phase: 3,
		status: 'building'
	},
	{
		id: 'GW-072',
		title: 'Rotate bearer tokens without dropping an in-flight request',
		project: 'gateway',
		release: 'token-rotation-v2',
		phase: 2,
		status: 'verifying'
	}
];

const LATER_ARRIVALS: Seed[] = [
	{
		id: 'MTV-009',
		title: 'Retire the shredder and the XML documents it fed',
		project: 'motivka',
		release: 'xml-is-gone',
		phase: 1,
		status: 'building'
	},
	{
		id: 'ATL-121',
		title: 'Reverse-proxy /dev straight through with the paths intact',
		project: 'atlas',
		release: 'catalogue-without-a-token',
		phase: 1,
		status: 'building'
	}
];

interface Step {
	/** Delay before this step, in milliseconds. */
	after: number;
	move?: { id: string; to: Status };
	arrive?: Seed;
	restart?: true;
}

/**
 * The watched sequence: four running, drained one at a time by a different kind
 * of event each time, a long genuine silence, then work arriving again. The
 * silence is deliberately the longest stretch — it is the state the page lives
 * in, so it is the state a viewer should spend the most time looking at.
 */
const SCRIPT: Step[] = [
	{ after: 6000, move: { id: 'LDG-041', to: 'verifying' } },
	{ after: 7000, move: { id: 'ATL-118', to: 'blocked' } },
	{ after: 8000, move: { id: 'AL-014', to: 'done' } },
	{ after: 8000, move: { id: 'GW-072', to: 'done' } },
	{ after: 7000, move: { id: 'LDG-041', to: 'done' } },
	{ after: 26000, arrive: LATER_ARRIVALS[0] },
	{ after: 9000, arrive: LATER_ARRIVALS[1] },
	{ after: 8000, move: { id: 'MTV-009', to: 'verifying' } },
	{ after: 10000, restart: true }
];

export function createInstrument(scene: Scene) {
	let runners = $state<RunningTask[]>([]);
	let tape = $state<Transition[]>([]);
	/** Ticks once a second so every elapsed reading stays live off one timer. */
	let now = $state(Date.now());
	let key = 0;

	function seedRunners() {
		const at = Date.now();
		runners = OPENING_RUNNERS.map((seed, index) => ({
			...seed,
			// Stagger the start times so the elapsed readings differ, as they would.
			enteredAt: at - (index + 1) * 137_000,
			departing: null
		}));
	}

	function record(task: { id: string; title: string }, from: Status, to: Status) {
		key += 1;
		tape = [{ key, taskId: task.id, title: task.title, from, to, at: Date.now() }, ...tape].slice(
			0,
			TAPE_DEPTH
		);
	}

	function move(id: string, to: Status) {
		const task = runners.find((candidate) => candidate.id === id);
		if (!task || task.departing) return;
		record(task, task.status, to);

		if (to === 'building' || to === 'verifying') {
			task.status = to;
			task.enteredAt = Date.now();
			return;
		}

		task.departing = to;
		setTimeout(() => {
			runners = runners.filter((candidate) => candidate.id !== id);
		}, DEPARTURE_LINGER_MS);
	}

	function arrive(seed: Seed) {
		record(seed, 'triaged', seed.status);
		runners = [...runners, { ...seed, enteredAt: Date.now(), departing: null }];
	}

	function start() {
		const timers: ReturnType<typeof setTimeout>[] = [];
		const clock = setInterval(() => (now = Date.now()), 1000);

		if (scene === 'idle') {
			// An idle instrument still knows why it is idle. Seeding the last
			// departure is the whole content of the empty state.
			key += 1;
			tape = [
				{
					key,
					taskId: 'LDG-041',
					title: OPENING_RUNNERS[1].title,
					from: 'verifying',
					to: 'done',
					at: Date.now() - 74_000
				}
			];
		} else {
			seedRunners();
			// A feed replays its recent events on connect, so the tape is never
			// blank on arrival — the page can say what just happened before it
			// has watched anything happen itself.
			key += 2;
			tape = [
				{
					key,
					taskId: 'GW-072',
					title: OPENING_RUNNERS[3].title,
					from: 'building',
					to: 'verifying',
					at: Date.now() - 549_000
				},
				{
					key: key - 1,
					taskId: 'AL-014',
					title: OPENING_RUNNERS[0].title,
					from: 'building',
					to: 'verifying',
					at: Date.now() - 138_000
				}
			].sort((a, b) => b.at - a.at);
		}

		if (scene === 'cycle') {
			const run = () => {
				let elapsed = 0;
				for (const step of SCRIPT) {
					elapsed += step.after;
					timers.push(
						setTimeout(() => {
							if (step.move) move(step.move.id, step.move.to);
							if (step.arrive) arrive(step.arrive);
							if (step.restart) {
								tape = [];
								seedRunners();
								run();
							}
						}, elapsed)
					);
				}
			};
			run();
		}

		return () => {
			clearInterval(clock);
			for (const timer of timers) clearTimeout(timer);
		};
	}

	return {
		start,
		get runners() {
			return runners;
		},
		get tape() {
			return tape;
		},
		get now() {
			return now;
		},
		/** Only tasks still running; a departing one is on screen but not counted. */
		get liveCount() {
			return runners.filter((task) => !task.departing).length;
		},
		get buildingCount() {
			return runners.filter((task) => !task.departing && task.status === 'building').length;
		},
		get verifyingCount() {
			return runners.filter((task) => !task.departing && task.status === 'verifying').length;
		},
		get lastMovement() {
			return tape[0] ?? null;
		}
	};
}

/**
 * Read the scene from the query string. No on-page control earns its place.
 *
 * Matched rather than parsed with URLSearchParams: the lint rule bans that
 * mutable built-in in Svelte source, and this is a one-shot read that has no
 * business being reactive anyway.
 */
export function sceneFromLocation(): Scene {
	const query = location.search;
	if (query.includes('scene=idle')) return 'idle';
	if (query.includes('scene=running')) return 'running';
	return 'cycle';
}

const COUNT_WORDS = ['Nothing', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];

export function countWord(count: number): string {
	return COUNT_WORDS[count] ?? String(count);
}

/** Elapsed as a spoken-length reading: seconds under a minute, then m, then h. */
export function elapsed(since: number, now: number): string {
	const seconds = Math.max(0, Math.floor((now - since) / 1000));
	if (seconds < 60) return `${seconds}s`;
	const minutes = Math.floor(seconds / 60);
	if (minutes < 60) return `${minutes}m ${String(seconds % 60).padStart(2, '0')}s`;
	return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

/**
 * 24-hour clock, Australian convention.
 *
 * Intl formats an epoch number directly, which sidesteps the lint rule against
 * the mutable Date built-in without dragging in SvelteDate for what is only
 * ever a one-way read.
 */
const CLOCK = new Intl.DateTimeFormat('en-AU', {
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	hour12: false
});

export function clockTime(at: number): string {
	return CLOCK.format(at);
}

/** The word a departure is read by. A finish and a block must never look alike. */
export function departureWord(to: 'done' | 'blocked'): string {
	return to === 'done' ? 'finished' : 'blocked';
}
