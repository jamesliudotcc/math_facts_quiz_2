import type { StoragePort } from "../domain/ports";
import type { ReviewRecord } from "../domain/review-record";
import type { UserConfig } from "../domain/user-config";
import { DEFAULT_USER_CONFIG } from "../domain/user-config";

export class InMemoryStorage implements StoragePort {
	private records = new Map<string, ReviewRecord>();
	private config: UserConfig = DEFAULT_USER_CONFIG;
	private newItemCounts = new Map<string, number>();

	getReviewRecord(itemId: string): ReviewRecord | undefined {
		return this.records.get(itemId);
	}

	saveReviewRecord(record: ReviewRecord): void {
		this.records.set(record.itemId, record);
	}

	getAllReviewRecords(): ReviewRecord[] {
		return [...this.records.values()];
	}

	getUserConfig(): UserConfig {
		return this.config;
	}

	saveUserConfig(config: UserConfig): void {
		this.config = config;
	}

	getNewItemsIntroducedToday(dateKey: string): number {
		return this.newItemCounts.get(dateKey) ?? 0;
	}

	incrementNewItemsIntroducedToday(dateKey: string): void {
		const current = this.newItemCounts.get(dateKey) ?? 0;
		this.newItemCounts.set(dateKey, current + 1);
	}
}
