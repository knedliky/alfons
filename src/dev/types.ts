/** The round.json contract, shared by the dev app's views. */
export interface Approach {
	slug: string;
	title: string;
	direction: string;
	deviations?: string[];
}

export interface Round {
	page: string;
	title: string;
	brief: string;
	surface: 'public' | 'admin';
	release: string | null;
	status: string;
	approaches: Approach[];
}
