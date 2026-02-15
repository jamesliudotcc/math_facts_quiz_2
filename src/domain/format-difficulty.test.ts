import { describe, expect, test } from "bun:test";
import { FORMAT_WEIGHT, selectFormatForMastery } from "./format-difficulty";
import { QuizFormat } from "./quiz-format";

describe("FORMAT_WEIGHT", () => {
	test("MUL has weight 1", () => {
		expect(FORMAT_WEIGHT[QuizFormat.MUL]).toBe(1);
	});

	test("MUL_MISS and DIV have weight 2", () => {
		expect(FORMAT_WEIGHT[QuizFormat.MUL_MISS]).toBe(2);
		expect(FORMAT_WEIGHT[QuizFormat.DIV]).toBe(2);
	});

	test("DIV_MISS formats have weight 3", () => {
		expect(FORMAT_WEIGHT[QuizFormat.DIV_MISS_DIVISOR]).toBe(3);
		expect(FORMAT_WEIGHT[QuizFormat.DIV_MISS_DIVIDEND]).toBe(3);
	});
});

describe("selectFormatForMastery", () => {
	const allFormats = new Set([
		QuizFormat.MUL,
		QuizFormat.MUL_MISS,
		QuizFormat.DIV,
		QuizFormat.DIV_MISS_DIVISOR,
		QuizFormat.DIV_MISS_DIVIDEND,
	]);

	// With all formats enabled and 0 successes:
	// Weighted array (FORMAT_TIERS order, highest first):
	//   DIV_MISS_DIVISOR: 0.1, DIV_MISS_DIVIDEND: 0.1, DIV: 0.1, MUL_MISS: 0.1, MUL: 1
	// Total = 1.4

	test("0 successes, roll=0 selects first entry (DIV_MISS_DIVISOR) with tiny weight", () => {
		const result = selectFormatForMastery(0, allFormats, () => 0);
		expect(result).toBe(QuizFormat.DIV_MISS_DIVISOR);
	});

	test("0 successes, high roll selects MUL (dominant weight)", () => {
		const result = selectFormatForMastery(0, allFormats, () => 0.999);
		expect(result).toBe(QuizFormat.MUL);
	});

	test("6 successes, all tiers qualifying, weights are proportional to excess", () => {
		// DIV_MISS_DIVISOR: 1+(6-6)=1, DIV_MISS_DIVIDEND: 1, DIV: 1+(6-4)=3, MUL_MISS: 1+(6-2)=5, MUL: 1+(6-0)=7
		// Total = 17
		// roll=0 → DIV_MISS_DIVISOR (first, weight 1)
		const result = selectFormatForMastery(6, allFormats, () => 0);
		expect(result).toBe(QuizFormat.DIV_MISS_DIVISOR);
	});

	test("6 successes, mid-roll hits DIV", () => {
		// Cumulative: DIV_MISS_DIVISOR[0-1], DIV_MISS_DIVIDEND[1-2], DIV[2-5], MUL_MISS[5-10], MUL[10-17]
		// roll at 2.5/17 ≈ 0.147 → lands in DIV range
		const result = selectFormatForMastery(6, allFormats, () => 2.5 / 17);
		expect(result).toBe(QuizFormat.DIV);
	});

	test("disabled formats are excluded", () => {
		const mulOnly = new Set([QuizFormat.MUL]);
		// Only MUL available, any roll returns MUL
		expect(selectFormatForMastery(6, mulOnly, () => 0)).toBe(QuizFormat.MUL);
		expect(selectFormatForMastery(6, mulOnly, () => 0.999)).toBe(
			QuizFormat.MUL,
		);
	});

	test("skips disabled higher tiers, selects from enabled lower tiers", () => {
		const divOnly = new Set([QuizFormat.DIV]);
		// At 6 successes, DIV qualifies: weight = 1+(6-4)=3
		expect(selectFormatForMastery(6, divOnly, () => 0)).toBe(QuizFormat.DIV);
	});

	test("2 successes with MUL and MUL_MISS gives MUL_MISS qualifying weight", () => {
		const formats = new Set([QuizFormat.MUL, QuizFormat.MUL_MISS]);
		// MUL_MISS: 1+(2-2)=1, MUL: 1+(2-0)=3, total=4
		// roll=0 → MUL_MISS (first in tier order)
		expect(selectFormatForMastery(2, formats, () => 0)).toBe(
			QuizFormat.MUL_MISS,
		);
		// roll near 1 → MUL
		expect(selectFormatForMastery(2, formats, () => 0.999)).toBe(
			QuizFormat.MUL,
		);
	});

	test("non-qualifying formats still have small chance (0.1 weight)", () => {
		const formats = new Set([QuizFormat.MUL, QuizFormat.MUL_MISS]);
		// At 0 successes: MUL_MISS: 0.1 (not qualifying), MUL: 1, total=1.1
		// roll=0 → MUL_MISS (first entry, tiny weight but roll=0 hits it)
		expect(selectFormatForMastery(0, formats, () => 0)).toBe(
			QuizFormat.MUL_MISS,
		);
	});

	test("fallback returns first enabled format when no tiers match", () => {
		// Use a format set with a made-up scenario: empty tier matches
		// This tests the weighted.length === 0 fallback
		const emptyTierFormats = new Set(["UNKNOWN" as unknown as QuizFormat]);
		const result: string = selectFormatForMastery(
			0,
			emptyTierFormats,
			() => 0.5,
		);
		expect(result).toBe("UNKNOWN");
	});
});
