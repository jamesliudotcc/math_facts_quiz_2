export const QuizFormat = {
	A_TIMES_B: "a*b",
	B_TIMES_A: "b*a",
	A_TIMES_WHAT: "a*?=p",
	WHAT_TIMES_B: "?*b=p",
	P_DIV_A: "p/a",
	P_DIV_B: "p/b",
} as const;

export type QuizFormat = (typeof QuizFormat)[keyof typeof QuizFormat];

export const ALL_QUIZ_FORMATS: readonly QuizFormat[] =
	Object.values(QuizFormat);
