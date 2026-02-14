import type { ReviewRecord } from "./review-record";

export function processReview(
	record: ReviewRecord,
	correct: boolean,
	nowMs: number,
): ReviewRecord {
	return {
		itemId: record.itemId,
		lastTriedTime: nowMs,
		lastSuccessTime: correct ? nowMs : record.lastSuccessTime,
		consecutiveSuccesses: correct ? record.consecutiveSuccesses + 1 : 0,
	};
}
