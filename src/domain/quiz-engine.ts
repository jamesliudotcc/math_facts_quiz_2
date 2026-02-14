import type { ReviewRecord } from "./review-record";
import type { UserConfig } from "./user-config";

export function selectNextItem(
	allItemIds: readonly string[],
	records: ReadonlyMap<string, ReviewRecord>,
	now: Date,
	newItemsIntroducedToday: number,
	config: UserConfig,
): string | null {
	const todayStr = now.toISOString().slice(0, 10);

	// Priority 1: overdue items (have a record, nextReviewDate <= today)
	const overdueItems: string[] = [];
	for (const id of allItemIds) {
		const record = records.get(id);
		if (record && record.repetitions > 0 && record.nextReviewDate <= todayStr) {
			overdueItems.push(id);
		}
	}

	if (overdueItems.length > 0) {
		// Return the most overdue item (earliest nextReviewDate)
		overdueItems.sort((a, b) => {
			const ra = records.get(a);
			const rb = records.get(b);
			if (!ra || !rb) return 0;
			return ra.nextReviewDate.localeCompare(rb.nextReviewDate);
		});
		return overdueItems[0];
	}

	// Priority 2: new items (no record yet), capped by newItemsPerSession
	if (newItemsIntroducedToday < config.newItemsPerSession) {
		for (const id of allItemIds) {
			if (!records.has(id)) {
				return id;
			}
		}
	}

	// Priority 3: items reviewed today that failed (repetitions === 0, meaning reset)
	for (const id of allItemIds) {
		const record = records.get(id);
		if (
			record &&
			record.repetitions === 0 &&
			record.nextReviewDate <= todayStr
		) {
			return id;
		}
	}

	return null;
}
