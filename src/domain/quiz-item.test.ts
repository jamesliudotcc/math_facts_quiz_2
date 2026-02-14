import { describe, expect, test } from "bun:test";
import { createFactFamily } from "./fact-family";
import { QuizFormat } from "./quiz-format";
import { applicableFormats, quizItemId, renderQuizItem } from "./quiz-item";

describe("quizItemId", () => {
	test("returns deterministic id", () => {
		const family = createFactFamily(3, 5);
		expect(quizItemId({ family, format: QuizFormat.A_TIMES_B })).toBe(
			"3x5:a*b",
		);
	});
});

describe("renderQuizItem", () => {
	const family = createFactFamily(3, 5);

	test("a × b = ?", () => {
		const r = renderQuizItem({ family, format: QuizFormat.A_TIMES_B });
		expect(r.prompt).toBe("3 × 5 = ?");
		expect(r.answer).toBe(15);
	});

	test("b × a = ?", () => {
		const r = renderQuizItem({ family, format: QuizFormat.B_TIMES_A });
		expect(r.prompt).toBe("5 × 3 = ?");
		expect(r.answer).toBe(15);
	});

	test("a × ? = p", () => {
		const r = renderQuizItem({ family, format: QuizFormat.A_TIMES_WHAT });
		expect(r.prompt).toBe("3 × ? = 15");
		expect(r.answer).toBe(5);
	});

	test("? × b = p", () => {
		const r = renderQuizItem({ family, format: QuizFormat.WHAT_TIMES_B });
		expect(r.prompt).toBe("? × 5 = 15");
		expect(r.answer).toBe(3);
	});

	test("p ÷ a = ?", () => {
		const r = renderQuizItem({ family, format: QuizFormat.P_DIV_A });
		expect(r.prompt).toBe("15 ÷ 3 = ?");
		expect(r.answer).toBe(5);
	});

	test("p ÷ b = ?", () => {
		const r = renderQuizItem({ family, format: QuizFormat.P_DIV_B });
		expect(r.prompt).toBe("15 ÷ 5 = ?");
		expect(r.answer).toBe(3);
	});
});

describe("applicableFormats", () => {
	test("non-square family has 6 formats", () => {
		const family = createFactFamily(3, 5);
		expect(applicableFormats(family)).toHaveLength(6);
	});

	test("square family has 3 formats (deduped)", () => {
		const family = createFactFamily(4, 4);
		const formats = applicableFormats(family);
		expect(formats).toHaveLength(3);
		expect(formats).toContain(QuizFormat.A_TIMES_B);
		expect(formats).toContain(QuizFormat.A_TIMES_WHAT);
		expect(formats).toContain(QuizFormat.P_DIV_A);
	});
});
