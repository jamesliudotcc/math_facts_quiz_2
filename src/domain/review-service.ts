import type { ReviewRecord } from "./review-record";
import { sm2 } from "./sm2";

export function processReview(
	record: ReviewRecord,
	quality: number,
	now: Date,
): ReviewRecord {
	const result = sm2({
		quality,
		repetitions: record.repetitions,
		easeFactor: record.easeFactor,
		interval: record.interval,
	});

	const nextDate = new Date(now);
	nextDate.setDate(nextDate.getDate() + result.interval);
	const nextReviewDate = nextDate.toISOString().slice(0, 10);

	return {
		itemId: record.itemId,
		easeFactor: result.easeFactor,
		interval: result.interval,
		repetitions: result.repetitions,
		nextReviewDate,
	};
}
