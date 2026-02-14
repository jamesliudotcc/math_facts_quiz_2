import { type Attempt, createAttempt } from "./attempt";
import type { QuizFormat } from "./quiz-format";

export function processReview(
	familyId: string,
	format: QuizFormat,
	correct: boolean,
	nowMs: number,
): Attempt {
	return createAttempt(familyId, format, correct, nowMs);
}
