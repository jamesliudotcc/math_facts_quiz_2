import type { Attempt } from "../domain/attempt";
import type { StoragePort } from "../domain/ports";
import type { UserConfig } from "../domain/user-config";
import { DEFAULT_USER_CONFIG } from "../domain/user-config";

export class InMemoryStorage implements StoragePort {
	private attempts: Attempt[] = [];
	private config: UserConfig = DEFAULT_USER_CONFIG;

	getAttempts(familyId: string): Attempt[] {
		return this.attempts.filter((a) => a.familyId === familyId);
	}

	getAllAttempts(): Attempt[] {
		return [...this.attempts];
	}

	saveAttempt(attempt: Attempt): void {
		this.attempts.push(attempt);
	}

	clearAllAttempts(): void {
		this.attempts = [];
	}

	getUserConfig(): UserConfig {
		return this.config;
	}

	saveUserConfig(config: UserConfig): void {
		this.config = config;
	}
}
