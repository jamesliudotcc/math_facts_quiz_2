import type { StoragePort } from "../domain/ports";
import { ALL_QUIZ_FORMATS, type QuizFormat } from "../domain/quiz-format";
import type { ReviewRecord } from "../domain/review-record";
import type { UserConfig } from "../domain/user-config";
import { DEFAULT_USER_CONFIG } from "../domain/user-config";

const KEYS = {
	REVIEW_RECORDS: "mathfacts:reviewRecords",
	USER_CONFIG: "mathfacts:userConfig",
} as const;

export class LocalStorageAdapter implements StoragePort {
	private records: Map<string, ReviewRecord>;
	private config: UserConfig;

	constructor() {
		this.records = this.loadRecords();
		this.config = this.loadConfig();
	}

	getReviewRecord(itemId: string): ReviewRecord | undefined {
		return this.records.get(itemId);
	}

	saveReviewRecord(record: ReviewRecord): void {
		this.records.set(record.itemId, record);
		this.persistRecords();
	}

	getAllReviewRecords(): ReviewRecord[] {
		return [...this.records.values()];
	}

	getUserConfig(): UserConfig {
		return this.config;
	}

	saveUserConfig(config: UserConfig): void {
		this.config = config;
		this.persistConfig();
	}

	private loadRecords(): Map<string, ReviewRecord> {
		const raw = localStorage.getItem(KEYS.REVIEW_RECORDS);
		if (!raw) return new Map();
		const arr: ReviewRecord[] = JSON.parse(raw);
		return new Map(arr.map((r) => [r.itemId, r]));
	}

	private persistRecords(): void {
		localStorage.setItem(
			KEYS.REVIEW_RECORDS,
			JSON.stringify([...this.records.values()]),
		);
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
