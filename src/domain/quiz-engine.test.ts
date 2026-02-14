import { describe, expect, test } from "bun:test";
import type { Attempt } from "./attempt";
import {
	deriveFamilyStats,
	desiredInterval,
	familyScore,
	selectBatch,
} from "./quiz-engine";
import { QuizFormat } from "./quiz-format";

function attempt(
	familyId: string,
	format: QuizFormat,
	correct: boolean,
	timestamp: number,
): Attempt {
	return { familyId, format, timestamp, correct };
}

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

describe("deriveFamilyStats", () => {
	test("no attempts returns zero stats", () => {
		const stats = deriveFamilyStats([]);
		expect(stats.lastTriedTime).toBe(0);
		expect(stats.effectiveSuccesses).toBe(0);
	});

	test("single correct MUL attempt gives weight 1", () => {
		const attempts = [attempt("3x5", QuizFormat.MUL, true, 5000)];
		const stats = deriveFamilyStats(attempts);
		expect(stats.lastTriedTime).toBe(5000);
		expect(stats.effectiveSuccesses).toBe(1);
	});

	test("single correct DIV attempt gives weight 2", () => {
		const attempts = [attempt("3x5", QuizFormat.DIV, true, 5000)];
		const stats = deriveFamilyStats(attempts);
		expect(stats.effectiveSuccesses).toBe(2);
	});

	test("weights sum for consecutive successes", () => {
		const attempts = [
			attempt("3x5", QuizFormat.MUL, false, 1000),
			attempt("3x5", QuizFormat.MUL, true, 2000), // +1
			attempt("3x5", QuizFormat.DIV, true, 3000), // +2
			attempt("3x5", QuizFormat.DIV_MISS_DIVISOR, true, 4000), // +3
		];
		const stats = deriveFamilyStats(attempts);
		expect(stats.effectiveSuccesses).toBe(6);
		expect(stats.lastTriedTime).toBe(4000);
	});

	test("failure breaks consecutive streak", () => {
		const attempts = [
			attempt("3x5", QuizFormat.MUL, true, 1000),
			attempt("3x5", QuizFormat.DIV, true, 2000),
			attempt("3x5", QuizFormat.MUL, false, 3000),
		];
		const stats = deriveFamilyStats(attempts);
		expect(stats.effectiveSuccesses).toBe(0);
		expect(stats.lastTriedTime).toBe(3000);
	});
});

describe("familyScore", () => {
	test("never-tried family has infinite score", () => {
		expect(familyScore([], 1000)).toBe(Number.POSITIVE_INFINITY);
	});

	test("recently tried family has low score", () => {
		const nowMs = 100_000;
		const attempts = [attempt("a", QuizFormat.MUL, true, nowMs - 5_000)];
		const score = familyScore(attempts, nowMs);
		expect(score).toBeCloseTo(5_000 / 30_000, 5);
	});

	test("overdue family has score > 1", () => {
		const nowMs = 100_000;
		const attempts = [attempt("a", QuizFormat.MUL, true, nowMs - 60_000)];
		const score = familyScore(attempts, nowMs);
		expect(score).toBe(2);
	});
});

describe("selectBatch", () => {
	const nowMs = 1_000_000;

	test("returns new families when none have been tried", () => {
		const result = selectBatch(["a", "b", "c"], [], 2, nowMs);
		expect(result).toHaveLength(2);
		expect(result).toContain("a");
		expect(result).toContain("b");
	});

	test("returns most overdue families first", () => {
		const attempts = [
			attempt("a", QuizFormat.MUL, true, nowMs - 20_000),
			attempt("b", QuizFormat.MUL, true, nowMs - 60_000),
		];
		const result = selectBatch(["a", "b"], attempts, 1, nowMs);
		expect(result).toEqual(["b"]);
	});

	test("returns empty for empty family list", () => {
		expect(selectBatch([], [], 10, nowMs)).toEqual([]);
	});

	test("returns all families when fewer than batchSize", () => {
		const result = selectBatch(["a", "b"], [], 10, nowMs);
		expect(result).toHaveLength(2);
	});

	test("failed families score higher than well-known families", () => {
		const attempts = [
			attempt("failed", QuizFormat.MUL, false, nowMs - 15_000),
			attempt("known", QuizFormat.MUL, true, nowMs - 15_000),
			attempt("known", QuizFormat.MUL, true, nowMs - 14_000),
			attempt("known", QuizFormat.MUL, true, nowMs - 13_000),
		];
		const result = selectBatch(["failed", "known"], attempts, 1, nowMs);
		expect(result).toEqual(["failed"]);
	});

	test("new families take priority over tried families", () => {
		const attempts = [attempt("tried", QuizFormat.MUL, true, nowMs - 60_000)];
		const result = selectBatch(["new-family", "tried"], attempts, 1, nowMs);
		expect(result).toEqual(["new-family"]);
	});
});
