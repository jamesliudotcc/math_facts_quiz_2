import type { StoragePort } from "../domain/ports";
import type { QuizFormat } from "../domain/quiz-format";
import type { ReviewRecord } from "../domain/review-record";
import type { UserConfig } from "../domain/user-config";
import { DEFAULT_USER_CONFIG } from "../domain/user-config";

const KEYS = {
	REVIEW_RECORDS: "mathfacts:reviewRecords",
	USER_CONFIG: "mathfacts:userConfig",
	NEW_ITEMS: "mathfacts:newItems",
} as const;

export class LocalStorageAdapter implements StoragePort {
	private records: Map<string, ReviewRecord>;
	private config: UserConfig;
	private newItemCounts: Map<string, number>;

	constructor() {
		this.records = this.loadRecords();
		this.config = this.loadConfig();
		this.newItemCounts = this.loadNewItems();
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

	getNewItemsIntroducedToday(dateKey: string): number {
		return this.newItemCounts.get(dateKey) ?? 0;
	}

	incrementNewItemsIntroducedToday(dateKey: string): void {
		const current = this.newItemCounts.get(dateKey) ?? 0;
		this.newItemCounts.set(dateKey, current + 1);
		this.persistNewItems();
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
		return {
			selectedTables: new Set<number>(parsed.selectedTables),
			enabledFormats: new Set<QuizFormat>(parsed.enabledFormats),
			newItemsPerSession: parsed.newItemsPerSession,
		};
	}

	private persistConfig(): void {
		localStorage.setItem(
			KEYS.USER_CONFIG,
			JSON.stringify({
				selectedTables: [...this.config.selectedTables],
				enabledFormats: [...this.config.enabledFormats],
				newItemsPerSession: this.config.newItemsPerSession,
			}),
		);
	}

	private loadNewItems(): Map<string, number> {
		const raw = localStorage.getItem(KEYS.NEW_ITEMS);
		if (!raw) return new Map();
		return new Map(Object.entries(JSON.parse(raw)));
	}

	private persistNewItems(): void {
		localStorage.setItem(
			KEYS.NEW_ITEMS,
			JSON.stringify(Object.fromEntries(this.newItemCounts)),
		);
	}
}
