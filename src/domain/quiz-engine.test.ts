import { describe, expect, test } from "bun:test";
import { selectNextItem } from "./quiz-engine";
import type { ReviewRecord } from "./review-record";
import { DEFAULT_USER_CONFIG } from "./user-config";

describe("selectNextItem", () => {
	const now = new Date("2025-06-15");
	const config = DEFAULT_USER_CONFIG;

	test("returns overdue item first", () => {
		const records = new Map<string, ReviewRecord>([
			[
				"3x5:a*b",
				{
					itemId: "3x5:a*b",
					easeFactor: 2.5,
					interval: 1,
					repetitions: 1,
					nextReviewDate: "2025-06-14", // overdue
				},
			],
		]);

		const result = selectNextItem(
			["3x5:a*b", "3x5:b*a"],
			records,
			now,
			0,
			config,
		);
		expect(result).toBe("3x5:a*b");
	});

	test("returns most overdue item when multiple are overdue", () => {
		const records = new Map<string, ReviewRecord>([
			[
				"3x5:a*b",
				{
					itemId: "3x5:a*b",
					easeFactor: 2.5,
					interval: 1,
					repetitions: 1,
					nextReviewDate: "2025-06-14",
				},
			],
			[
				"3x5:b*a",
				{
					itemId: "3x5:b*a",
					easeFactor: 2.5,
					interval: 1,
					repetitions: 1,
					nextReviewDate: "2025-06-10", // more overdue
				},
			],
		]);

		const result = selectNextItem(
			["3x5:a*b", "3x5:b*a"],
			records,
			now,
			0,
			config,
		);
		expect(result).toBe("3x5:b*a");
	});

	test("returns new item when no overdue and under cap", () => {
		const records = new Map<string, ReviewRecord>();
		const result = selectNextItem(
			["3x5:a*b", "3x5:b*a"],
			records,
			now,
			0,
			config,
		);
		expect(result).toBe("3x5:a*b");
	});

	test("returns null when new items cap is reached and nothing overdue", () => {
		const records = new Map<string, ReviewRecord>();
		const result = selectNextItem(
			["3x5:a*b"],
			records,
			now,
			config.newItemsPerSession, // at cap
			config,
		);
		expect(result).toBe(null);
	});

	test("returns failed item (repetitions=0) when nothing else available", () => {
		const records = new Map<string, ReviewRecord>([
			[
				"3x5:a*b",
				{
					itemId: "3x5:a*b",
					easeFactor: 2.5,
					interval: 1,
					repetitions: 0, // failed/reset
					nextReviewDate: "2025-06-15",
				},
			],
		]);

		const result = selectNextItem(
			["3x5:a*b"],
			records,
			now,
			config.newItemsPerSession, // at cap
			config,
		);
		expect(result).toBe("3x5:a*b");
	});

	test("returns null when all items are reviewed and not due", () => {
		const records = new Map<string, ReviewRecord>([
			[
				"3x5:a*b",
				{
					itemId: "3x5:a*b",
					easeFactor: 2.5,
					interval: 6,
					repetitions: 2,
					nextReviewDate: "2025-06-20", // future
				},
			],
		]);

		const result = selectNextItem(
			["3x5:a*b"],
			records,
			now,
			config.newItemsPerSession,
			config,
		);
		expect(result).toBe(null);
	});
});
