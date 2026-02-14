import { generateFactFamilies } from "./fact-family-generator";
import type { StoragePort } from "./ports";
import { selectNextItem } from "./quiz-engine";
import type { QuizItem, RenderedQuizItem } from "./quiz-item";
import { applicableFormats, quizItemId, renderQuizItem } from "./quiz-item";
import type { ReviewRecord } from "./review-record";
import { createNewReviewRecord } from "./review-record";
import { processReview } from "./review-service";

export type QuizResult = {
	readonly item: RenderedQuizItem;
	readonly itemId: string;
};

export class QuizSession {
	private allItemIds: string[] = [];
	private itemMap = new Map<string, QuizItem>();

	constructor(private storage: StoragePort) {}

	initialize(): void {
		const config = this.storage.getUserConfig();
		const families = generateFactFamilies(config.selectedTables);

		this.allItemIds = [];
		this.itemMap.clear();

		for (const family of families) {
			const formats = applicableFormats(family);
			for (const format of formats) {
				if (config.enabledFormats.has(format)) {
					const item: QuizItem = { family, format };
					const id = quizItemId(item);
					this.allItemIds.push(id);
					this.itemMap.set(id, item);
				}
			}
		}
	}

	getNextItem(): QuizResult | null {
		const config = this.storage.getUserConfig();
		const nowMs = Date.now();
		const dateKey = new Date(nowMs).toISOString().slice(0, 10);
		const newToday = this.storage.getNewItemsIntroducedToday(dateKey);

		const records = new Map<string, ReviewRecord>();
		for (const id of this.allItemIds) {
			const record = this.storage.getReviewRecord(id);
			if (record) {
				records.set(id, record);
			}
		}

		const nextId = selectNextItem(
			this.allItemIds,
			records,
			nowMs,
			newToday,
			config,
		);

		if (nextId === null) return null;

		const item = this.itemMap.get(nextId);
		if (!item) return null;
		return {
			item: renderQuizItem(item),
			itemId: nextId,
		};
	}

	submitAnswer(itemId: string, correct: boolean): void {
		const nowMs = Date.now();
		const dateKey = new Date(nowMs).toISOString().slice(0, 10);

		let record = this.storage.getReviewRecord(itemId);
		const isNew = !record;

		if (!record) {
			record = createNewReviewRecord(itemId);
		}

		const updated = processReview(record, correct, nowMs);
		this.storage.saveReviewRecord(updated);

		if (isNew) {
			this.storage.incrementNewItemsIntroducedToday(dateKey);
		}
	}
}
