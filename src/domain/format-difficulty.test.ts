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

	test("0 successes returns MUL", () => {
		expect(selectFormatForMastery(0, allFormats)).toBe(QuizFormat.MUL);
	});

	test("1 success returns MUL", () => {
		expect(selectFormatForMastery(1, allFormats)).toBe(QuizFormat.MUL);
	});

	test("2 successes returns MUL_MISS", () => {
		expect(selectFormatForMastery(2, allFormats)).toBe(QuizFormat.MUL_MISS);
	});

	test("4 successes returns DIV", () => {
		expect(selectFormatForMastery(4, allFormats)).toBe(QuizFormat.DIV);
	});

	test("6 successes returns a DIV_MISS format", () => {
		const result = selectFormatForMastery(6, allFormats);
		const divMissFormats: QuizFormat[] = [
			QuizFormat.DIV_MISS_DIVISOR,
			QuizFormat.DIV_MISS_DIVIDEND,
		];
		expect(divMissFormats).toContain(result);
	});

	test("falls back to lower tier when higher tier format not enabled", () => {
		const mulOnly = new Set([QuizFormat.MUL]);
		expect(selectFormatForMastery(6, mulOnly)).toBe(QuizFormat.MUL);
	});

	test("skips to enabled tier", () => {
		const divOnly = new Set([QuizFormat.DIV]);
		expect(selectFormatForMastery(6, divOnly)).toBe(QuizFormat.DIV);
	});
});
