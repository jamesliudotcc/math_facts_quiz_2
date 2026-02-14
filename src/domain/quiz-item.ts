import type { FactFamily } from "./fact-family";
import { QuizFormat } from "./quiz-format";

export type QuizItem = {
	readonly family: FactFamily;
	readonly format: QuizFormat;
};

export type RenderedQuizItem = {
	readonly prompt: string;
	readonly answer: number;
};

function pickFactor(family: FactFamily): "factor1" | "factor2" {
	if (family.factor1 === family.factor2) return "factor1";
	return Math.random() < 0.5 ? "factor1" : "factor2";
}

export function renderQuizItem(item: QuizItem): RenderedQuizItem {
	const { factor1, factor2, product } = item.family;
	switch (item.format) {
		case QuizFormat.MUL:
			return { prompt: `${factor1} × ${factor2} = ?`, answer: product };
		case QuizFormat.MUL_MISS: {
			const shown = pickFactor(item.family);
			const hidden = shown === "factor1" ? "factor2" : "factor1";
			const a = item.family[shown];
			const b = item.family[hidden];
			return { prompt: `${a} × ? = ${product}`, answer: b };
		}
		case QuizFormat.DIV: {
			const divisor = pickFactor(item.family);
			const quotient = divisor === "factor1" ? "factor2" : "factor1";
			return {
				prompt: `${product} ÷ ${item.family[divisor]} = ?`,
				answer: item.family[quotient],
			};
		}
		case QuizFormat.DIV_MISS_DIVISOR: {
			const quotient = pickFactor(item.family);
			const divisor = quotient === "factor1" ? "factor2" : "factor1";
			return {
				prompt: `${product} ÷ ? = ${item.family[quotient]}`,
				answer: item.family[divisor],
			};
		}
		case QuizFormat.DIV_MISS_DIVIDEND: {
			const divisor = pickFactor(item.family);
			const quotient = divisor === "factor1" ? "factor2" : "factor1";
			return {
				prompt: `? ÷ ${item.family[divisor]} = ${item.family[quotient]}`,
				answer: product,
			};
		}
	}
}
