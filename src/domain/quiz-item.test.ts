import { describe, expect, test } from "bun:test";
import { createFactFamily } from "./fact-family";
import { QuizFormat } from "./quiz-format";
import { applicableFormats, quizItemId, renderQuizItem } from "./quiz-item";

describe("quizItemId", () => {
	test("returns deterministic id", () => {
		const family = createFactFamily(3, 5);
		expect(quizItemId({ family, format: QuizFormat.MUL })).toBe("3x5:mul");
	});
});

describe("renderQuizItem", () => {
	const family = createFactFamily(3, 5);

	test("mul: factor1 × factor2 = ?", () => {
		const r = renderQuizItem({ family, format: QuizFormat.MUL });
		expect(r.prompt).toBe("3 × 5 = ?");
		expect(r.answer).toBe(15);
	});

	test("mul_miss: shown × ? = product, answer is the hidden factor", () => {
		for (let i = 0; i < 20; i++) {
			const r = renderQuizItem({ family, format: QuizFormat.MUL_MISS });
			expect(r.prompt).toMatch(/^[35] × \? = 15$/);
			if (r.prompt.startsWith("3")) {
				expect(r.answer).toBe(5);
			} else {
				expect(r.answer).toBe(3);
			}
		}
	});

	test("div: product ÷ divisor = ?, answer is quotient", () => {
		for (let i = 0; i < 20; i++) {
			const r = renderQuizItem({ family, format: QuizFormat.DIV });
			expect(r.prompt).toMatch(/^15 ÷ [35] = \?$/);
			if (r.prompt.includes("÷ 3")) {
				expect(r.answer).toBe(5);
			} else {
				expect(r.answer).toBe(3);
			}
		}
	});

	test("div_miss_divisor: product ÷ ? = quotient, answer is divisor", () => {
		for (let i = 0; i < 20; i++) {
			const r = renderQuizItem({
				family,
				format: QuizFormat.DIV_MISS_DIVISOR,
			});
			expect(r.prompt).toMatch(/^15 ÷ \? = [35]$/);
			if (r.prompt.endsWith("= 3")) {
				expect(r.answer).toBe(5);
			} else {
				expect(r.answer).toBe(3);
			}
		}
	});

	test("div_miss_dividend: ? ÷ divisor = quotient, answer is product", () => {
		for (let i = 0; i < 20; i++) {
			const r = renderQuizItem({
				family,
				format: QuizFormat.DIV_MISS_DIVIDEND,
			});
			expect(r.prompt).toMatch(/^\? ÷ [35] = [35]$/);
			expect(r.answer).toBe(15);
			// Verify divisor × quotient = product
			const match = r.prompt.match(/^\? ÷ (\d+) = (\d+)$/);
			expect(match).not.toBeNull();
			expect(Number(match?.[1]) * Number(match?.[2])).toBe(15);
		}
	});

	test("square family always uses consistent factors", () => {
		const square = createFactFamily(4, 4);
		const rendered = renderQuizItem({
			family: square,
			format: QuizFormat.MUL_MISS,
		});
		expect(rendered.prompt).toBe("4 × ? = 16");
		expect(rendered.answer).toBe(4);
	});
});

describe("applicableFormats", () => {
	test("non-square family has 5 formats", () => {
		const family = createFactFamily(3, 5);
		expect(applicableFormats(family)).toHaveLength(5);
	});

	test("square family also has 5 formats", () => {
		const family = createFactFamily(4, 4);
		expect(applicableFormats(family)).toHaveLength(5);
	});
});
