import type { FactFamily } from "./fact-family";
import { factFamilyId } from "./fact-family";
import { QuizFormat } from "./quiz-format";

export type QuizItem = {
	readonly family: FactFamily;
	readonly format: QuizFormat;
};

export function quizItemId(item: QuizItem): string {
	return `${factFamilyId(item.family)}:${item.format}`;
}

export type RenderedQuizItem = {
	readonly prompt: string;
	readonly answer: number;
};

export function renderQuizItem(item: QuizItem): RenderedQuizItem {
	const { factor1: a, factor2: b, product: p } = item.family;
	switch (item.format) {
		case QuizFormat.A_TIMES_B:
			return { prompt: `${a} × ${b} = ?`, answer: p };
		case QuizFormat.B_TIMES_A:
			return { prompt: `${b} × ${a} = ?`, answer: p };
		case QuizFormat.A_TIMES_WHAT:
			return { prompt: `${a} × ? = ${p}`, answer: b };
		case QuizFormat.WHAT_TIMES_B:
			return { prompt: `? × ${b} = ${p}`, answer: a };
		case QuizFormat.P_DIV_A:
			return { prompt: `${p} ÷ ${a} = ?`, answer: b };
		case QuizFormat.P_DIV_B:
			return { prompt: `${p} ÷ ${b} = ?`, answer: a };
	}
}

export function applicableFormats(family: FactFamily): readonly QuizFormat[] {
	if (family.factor1 === family.factor2) {
		return [QuizFormat.A_TIMES_B, QuizFormat.A_TIMES_WHAT, QuizFormat.P_DIV_A];
	}
	return Object.values(QuizFormat);
}
