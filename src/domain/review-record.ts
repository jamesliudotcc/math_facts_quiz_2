export type ReviewRecord = {
	readonly itemId: string;
	readonly easeFactor: number;
	readonly interval: number;
	readonly repetitions: number;
	readonly nextReviewDate: string; // ISO date string YYYY-MM-DD
};

export function createNewReviewRecord(itemId: string): ReviewRecord {
	return {
		itemId,
		easeFactor: 2.5,
		interval: 0,
		repetitions: 0,
		nextReviewDate: "1970-01-01",
	};
}
