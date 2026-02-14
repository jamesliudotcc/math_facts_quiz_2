import { describe, expect, test } from "bun:test";
import { QuizFormat } from "./quiz-format";
import { processReview } from "./review-service";

describe("processReview", () => {
	const nowMs = 1_000_000;

	test("correct answer creates attempt with correct=true", () => {
		const attempt = processReview("3x5", QuizFormat.MUL, true, nowMs);
		expect(attempt.familyId).toBe("3x5");
		expect(attempt.format).toBe(QuizFormat.MUL);
		expect(attempt.timestamp).toBe(nowMs);
		expect(attempt.correct).toBe(true);
	});

	test("incorrect answer creates attempt with correct=false", () => {
		const attempt = processReview("3x5", QuizFormat.MUL, false, nowMs);
		expect(attempt.familyId).toBe("3x5");
		expect(attempt.timestamp).toBe(nowMs);
		expect(attempt.correct).toBe(false);
	});

	test("preserves family id and format", () => {
		const attempt = processReview("2x7", QuizFormat.DIV, true, nowMs);
		expect(attempt.familyId).toBe("2x7");
		expect(attempt.format).toBe(QuizFormat.DIV);
	});
});
