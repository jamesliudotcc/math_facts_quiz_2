import type { ReviewRecord } from "./review-record";
import type { UserConfig } from "./user-config";

const BASE_INTERVAL_MS = 30_000; // 30 seconds
const MULTIPLIER = 3;
const FAILED_INTERVAL_MS = 10_000; // 10 seconds

export function desiredInterval(consecutiveSuccesses: number): number {
	if (consecutiveSuccesses === 0) return FAILED_INTERVAL_MS;
	return BASE_INTERVAL_MS * MULTIPLIER ** (consecutiveSuccesses - 1);
}

export function itemScore(record: ReviewRecord, nowMs: number): number {
	if (record.lastTriedTime === 0) return Number.POSITIVE_INFINITY;
	const elapsed = nowMs - record.lastTriedTime;
	return elapsed / desiredInterval(record.consecutiveSuccesses);
}

export function selectNextItem(
	allItemIds: readonly string[],
	records: ReadonlyMap<string, ReviewRecord>,
	nowMs: number,
	newItemsIntroducedToday: number,
	config: UserConfig,
): string | null {
	if (allItemIds.length === 0) return null;

	let bestId: string | null = null;
	let bestScore = -Infinity;

	for (const id of allItemIds) {
		const record = records.get(id);

		if (!record || record.lastTriedTime === 0) {
			// Never-tried item
			if (newItemsIntroducedToday < config.newItemsPerSession) {
				return id; // Immediately return first new item
			}
			continue; // Skip new items once cap is hit
		}

		const score = itemScore(record, nowMs);
		if (score > bestScore) {
			bestScore = score;
			bestId = id;
		}
	}

	return bestId;
}
