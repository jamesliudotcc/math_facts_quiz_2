import { describe, expect, test } from "bun:test";
import { createNewReviewRecord } from "./review-record";
import { processReview } from "./review-service";

describe("processReview", () => {
	const now = new Date("2025-06-15");

	test("correct answer on new record sets next review to tomorrow", () => {
		const record = createNewReviewRecord("3x5:a*b");
		const updated = processReview(record, 4, now);
		expect(updated.nextReviewDate).toBe("2025-06-16");
		expect(updated.repetitions).toBe(1);
		expect(updated.interval).toBe(1);
	});

	test("second correct answer sets next review 6 days out", () => {
		const record = {
			...createNewReviewRecord("3x5:a*b"),
			repetitions: 1,
			interval: 1,
		};
		const updated = processReview(record, 4, now);
		expect(updated.nextReviewDate).toBe("2025-06-21");
		expect(updated.interval).toBe(6);
	});

	test("incorrect answer resets and sets next review to tomorrow", () => {
		const record = {
			...createNewReviewRecord("3x5:a*b"),
			repetitions: 5,
			interval: 30,
			easeFactor: 2.5,
		};
		const updated = processReview(record, 1, now);
		expect(updated.nextReviewDate).toBe("2025-06-16");
		expect(updated.repetitions).toBe(0);
		expect(updated.interval).toBe(1);
	});

	test("preserves item id", () => {
		const record = createNewReviewRecord("2x7:p/a");
		const updated = processReview(record, 4, now);
		expect(updated.itemId).toBe("2x7:p/a");
	});
});
