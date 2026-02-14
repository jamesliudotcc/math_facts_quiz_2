export const QuizFormat = {
	MUL: "mul",
	MUL_MISS: "mul_miss",
	DIV: "div",
	DIV_MISS_DIVISOR: "div_miss_divisor",
	DIV_MISS_DIVIDEND: "div_miss_dividend",
} as const;

export type QuizFormat = (typeof QuizFormat)[keyof typeof QuizFormat];

export const ALL_QUIZ_FORMATS: readonly QuizFormat[] =
	Object.values(QuizFormat);
