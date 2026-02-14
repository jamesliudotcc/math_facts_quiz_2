import type { ReviewRecord } from "./review-record";
import type { UserConfig } from "./user-config";

export interface StoragePort {
	getReviewRecord(itemId: string): ReviewRecord | undefined;
	saveReviewRecord(record: ReviewRecord): void;
	getAllReviewRecords(): ReviewRecord[];

	getUserConfig(): UserConfig;
	saveUserConfig(config: UserConfig): void;
}
