export type ReviewRecord = {
	readonly itemId: string;
	readonly lastTriedTime: number; // epoch ms, 0 = never
	readonly lastSuccessTime: number; // epoch ms, 0 = never succeeded
	readonly consecutiveSuccesses: number; // resets on failure
};

export function createNewReviewRecord(itemId: string): ReviewRecord {
	return {
		itemId,
		lastTriedTime: 0,
		lastSuccessTime: 0,
		consecutiveSuccesses: 0,
	};
}
