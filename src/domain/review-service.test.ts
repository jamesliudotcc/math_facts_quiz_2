import { describe, expect, test } from "bun:test";
import { createNewReviewRecord } from "./review-record";
import { processReview } from "./review-service";

describe("processReview", () => {
	const nowMs = 1_000_000;

	test("correct answer sets lastTriedTime and lastSuccessTime", () => {
		const record = createNewReviewRecord("3x5:a*b");
		const updated = processReview(record, true, nowMs);
		expect(updated.lastTriedTime).toBe(nowMs);
		expect(updated.lastSuccessTime).toBe(nowMs);
		expect(updated.consecutiveSuccesses).toBe(1);
	});

	test("incorrect answer sets lastTriedTime but not lastSuccessTime", () => {
		const record = createNewReviewRecord("3x5:a*b");
		const updated = processReview(record, false, nowMs);
		expect(updated.lastTriedTime).toBe(nowMs);
		expect(updated.lastSuccessTime).toBe(0);
		expect(updated.consecutiveSuccesses).toBe(0);
	});

	test("incorrect answer resets consecutiveSuccesses", () => {
		const record = {
			itemId: "3x5:a*b",
			lastTriedTime: 500_000,
			lastSuccessTime: 500_000,
			consecutiveSuccesses: 5,
		};
		const updated = processReview(record, false, nowMs);
		expect(updated.consecutiveSuccesses).toBe(0);
		expect(updated.lastSuccessTime).toBe(500_000); // preserved
	});

	test("correct answer increments consecutiveSuccesses", () => {
		const record = {
			itemId: "3x5:a*b",
			lastTriedTime: 500_000,
			lastSuccessTime: 500_000,
			consecutiveSuccesses: 3,
		};
		const updated = processReview(record, true, nowMs);
		expect(updated.consecutiveSuccesses).toBe(4);
		expect(updated.lastSuccessTime).toBe(nowMs);
	});

	test("preserves item id", () => {
		const record = createNewReviewRecord("2x7:p/a");
		const updated = processReview(record, true, nowMs);
		expect(updated.itemId).toBe("2x7:p/a");
	});
});
