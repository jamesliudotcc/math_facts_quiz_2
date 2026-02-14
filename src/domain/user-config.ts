import { QuizFormat } from "./quiz-format";

export type UserConfig = {
	readonly selectedTables: ReadonlySet<number>;
	readonly enabledFormats: ReadonlySet<QuizFormat>;
};

export const DEFAULT_USER_CONFIG: UserConfig = {
	selectedTables: new Set([2, 3, 4, 5]),
	enabledFormats: new Set<QuizFormat>([QuizFormat.MUL, QuizFormat.MUL_MISS]),
};
