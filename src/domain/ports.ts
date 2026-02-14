import type { Attempt } from "./attempt";
import type { UserConfig } from "./user-config";

export interface StoragePort {
	getAttempts(familyId: string): Attempt[];
	getAllAttempts(): Attempt[];
	saveAttempt(attempt: Attempt): void;
	clearAllAttempts(): void;

	getUserConfig(): UserConfig;
	saveUserConfig(config: UserConfig): void;
}
