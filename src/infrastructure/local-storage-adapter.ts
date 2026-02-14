import type { Attempt } from "../domain/attempt";
import type { StoragePort } from "../domain/ports";
import { ALL_QUIZ_FORMATS, type QuizFormat } from "../domain/quiz-format";
import type { UserConfig } from "../domain/user-config";
import { DEFAULT_USER_CONFIG } from "../domain/user-config";

const KEYS = {
	ATTEMPTS: "mathfacts:attempts",
	USER_CONFIG: "mathfacts:userConfig",
} as const;

export class LocalStorageAdapter implements StoragePort {
	private attempts: Attempt[];
	private config: UserConfig;

	constructor() {
		this.attempts = this.loadAttempts();
		this.config = this.loadConfig();
	}

	getAttempts(familyId: string): Attempt[] {
		return this.attempts.filter((a) => a.familyId === familyId);
	}

	getAllAttempts(): Attempt[] {
		return [...this.attempts];
	}

	saveAttempt(attempt: Attempt): void {
		this.attempts.push(attempt);
		this.persistAttempts();
	}

	clearAllAttempts(): void {
		this.attempts = [];
		this.persistAttempts();
	}

	getUserConfig(): UserConfig {
		return this.config;
	}

	saveUserConfig(config: UserConfig): void {
		this.config = config;
		this.persistConfig();
	}

	private loadAttempts(): Attempt[] {
		const raw = localStorage.getItem(KEYS.ATTEMPTS);
		if (!raw) return [];

		const parsed = JSON.parse(raw) as Record<string, unknown>[];
		// Filter out legacy attempts that have itemId instead of familyId
		// TODO: Remove this legacy filter once all users have migrated
		return parsed.filter((a): a is Attempt => "familyId" in a && "format" in a);
	}

	private persistAttempts(): void {
		localStorage.setItem(KEYS.ATTEMPTS, JSON.stringify(this.attempts));
	}

	private loadConfig(): UserConfig {
		const raw = localStorage.getItem(KEYS.USER_CONFIG);
		if (!raw) return DEFAULT_USER_CONFIG;
		const parsed = JSON.parse(raw);
		const validFormats = new Set<string>(ALL_QUIZ_FORMATS);
		const loaded = (parsed.enabledFormats as string[]).filter((f) =>
			validFormats.has(f),
		);
		return {
			selectedTables: new Set<number>(parsed.selectedTables),
			enabledFormats:
				loaded.length > 0
					? new Set<QuizFormat>(loaded as QuizFormat[])
					: DEFAULT_USER_CONFIG.enabledFormats,
		};
	}

	private persistConfig(): void {
		localStorage.setItem(
			KEYS.USER_CONFIG,
			JSON.stringify({
				selectedTables: [...this.config.selectedTables],
				enabledFormats: [...this.config.enabledFormats],
			}),
		);
	}
}
