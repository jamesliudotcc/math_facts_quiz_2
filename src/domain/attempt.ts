import type { QuizFormat } from "./quiz-format";

export type Attempt = {
	readonly familyId: string;
	readonly format: QuizFormat;
	readonly timestamp: number; // epoch ms
	readonly correct: boolean;
};

export function createAttempt(
	familyId: string,
	format: QuizFormat,
	correct: boolean,
	nowMs: number,
): Attempt {
	return { familyId, format, timestamp: nowMs, correct };
}
