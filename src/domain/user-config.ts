import type { QuizFormat } from "./quiz-format";
import { ALL_QUIZ_FORMATS } from "./quiz-format";

export type UserConfig = {
	readonly selectedTables: ReadonlySet<number>;
	readonly enabledFormats: ReadonlySet<QuizFormat>;
};

export const DEFAULT_USER_CONFIG: UserConfig = {
	selectedTables: new Set([2, 3, 4, 5, 6, 7, 8, 9, 10]),
	enabledFormats: new Set(ALL_QUIZ_FORMATS),
};
