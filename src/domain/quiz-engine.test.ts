import { describe, expect, test } from "bun:test";
import { desiredInterval, itemScore, selectNextItem } from "./quiz-engine";
import type { ReviewRecord } from "./review-record";

describe("desiredInterval", () => {
	test("failed items have short interval", () => {
		expect(desiredInterval(0)).toBe(10_000);
	});

	test("first success has base interval", () => {
		expect(desiredInterval(1)).toBe(30_000);
	});

	test("intervals grow exponentially", () => {
		expect(desiredInterval(2)).toBe(90_000);
		expect(desiredInterval(3)).toBe(270_000);
	});
});

describe("itemScore", () => {
	test("never-tried item has infinite score", () => {
		const record: ReviewRecord = {
			itemId: "a",
			lastTriedTime: 0,
			lastSuccessTime: 0,
			consecutiveSuccesses: 0,
		};
		expect(itemScore(record, 1000)).toBe(Number.POSITIVE_INFINITY);
	});

	test("recently tried item has low score", () => {
		const nowMs = 100_000;
		const record: ReviewRecord = {
			itemId: "a",
			lastTriedTime: nowMs - 5_000, // 5s ago, desired 30s
			lastSuccessTime: nowMs - 5_000,
			consecutiveSuccesses: 1,
		};
		const score = itemScore(record, nowMs);
		expect(score).toBeCloseTo(5_000 / 30_000, 5);
	});

	test("overdue item has score > 1", () => {
		const nowMs = 100_000;
		const record: ReviewRecord = {
			itemId: "a",
			lastTriedTime: nowMs - 60_000, // 60s ago, desired 30s
			lastSuccessTime: nowMs - 60_000,
			consecutiveSuccesses: 1,
		};
		const score = itemScore(record, nowMs);
		expect(score).toBe(2);
	});
});

describe("selectNextItem", () => {
	const nowMs = 1_000_000;

	test("returns new item when none have been tried", () => {
		const records = new Map<string, ReviewRecord>();
		const result = selectNextItem(["3x5:a*b", "3x5:b*a"], records, nowMs);
		expect(result).toBe("3x5:a*b");
	});

	test("returns most overdue tried item", () => {
		const records = new Map<string, ReviewRecord>([
			[
				"3x5:a*b",
				{
					itemId: "3x5:a*b",
					lastTriedTime: nowMs - 20_000,
					lastSuccessTime: nowMs - 20_000,
					consecutiveSuccesses: 1,
				},
			],
			[
				"3x5:b*a",
				{
					itemId: "3x5:b*a",
					lastTriedTime: nowMs - 60_000,
					lastSuccessTime: nowMs - 60_000,
					consecutiveSuccesses: 1,
				},
			],
		]);

		const result = selectNextItem(["3x5:a*b", "3x5:b*a"], records, nowMs);
		expect(result).toBe("3x5:b*a");
	});

	test("returns null for empty item list", () => {
		const result = selectNextItem([], new Map(), nowMs);
		expect(result).toBe(null);
	});

	test("returns tried item even when recently tried (never null with tried items)", () => {
		const records = new Map<string, ReviewRecord>([
			[
				"3x5:a*b",
				{
					itemId: "3x5:a*b",
					lastTriedTime: nowMs - 1_000,
					lastSuccessTime: nowMs - 1_000,
					consecutiveSuccesses: 5,
				},
			],
		]);

		const result = selectNextItem(["3x5:a*b"], records, nowMs);
		expect(result).toBe("3x5:a*b");
	});

	test("failed items score higher than well-known items", () => {
		const records = new Map<string, ReviewRecord>([
			[
				"failed",
				{
					itemId: "failed",
					lastTriedTime: nowMs - 15_000,
					lastSuccessTime: 0,
					consecutiveSuccesses: 0,
				},
			],
			[
				"known",
				{
					itemId: "known",
					lastTriedTime: nowMs - 15_000,
					lastSuccessTime: nowMs - 15_000,
					consecutiveSuccesses: 3,
				},
			],
		]);

		const result = selectNextItem(["failed", "known"], records, nowMs);
		expect(result).toBe("failed");
	});

	test("new items take priority over tried items", () => {
		const records = new Map<string, ReviewRecord>([
			[
				"tried",
				{
					itemId: "tried",
					lastTriedTime: nowMs - 60_000,
					lastSuccessTime: nowMs - 60_000,
					consecutiveSuccesses: 1,
				},
			],
		]);

		const result = selectNextItem(["new-item", "tried"], records, nowMs);
		expect(result).toBe("new-item");
	});
});
