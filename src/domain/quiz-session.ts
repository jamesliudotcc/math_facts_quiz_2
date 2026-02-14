import type { Attempt } from "./attempt";
import type { FactFamily } from "./fact-family";
import { factFamilyId } from "./fact-family";
import { generateFactFamilies } from "./fact-family-generator";
import { selectFormatForMastery } from "./format-difficulty";
import type { StoragePort } from "./ports";
import { deriveFamilyStats, selectBatch } from "./quiz-engine";
import type { QuizFormat } from "./quiz-format";
import type { RenderedQuizItem } from "./quiz-item";
import { renderQuizItem } from "./quiz-item";
import { processReview } from "./review-service";

export type QuizResult = {
	readonly item: RenderedQuizItem;
	readonly familyId: string;
	readonly format: QuizFormat;
};

const BATCH_SIZE = 10;

export class QuizSession {
	private allFamilyIds: string[] = [];
	private familyMap = new Map<string, FactFamily>();
	private batch: string[] = [];
	private batchIndex = 0;

	constructor(private storage: StoragePort) {}

	initialize(): void {
		const config = this.storage.getUserConfig();
		const families = generateFactFamilies(config.selectedTables);

		this.allFamilyIds = [];
		this.familyMap.clear();
		this.batch = [];
		this.batchIndex = 0;

		for (const family of families) {
			const id = factFamilyId(family);
			this.allFamilyIds.push(id);
			this.familyMap.set(id, family);
		}

		this.refreshBatch();
	}

	getNextItem(): QuizResult | null {
		if (this.allFamilyIds.length === 0) return null;

		if (this.batchIndex >= this.batch.length) {
			this.refreshBatch();
		}

		const familyId = this.batch[this.batchIndex];
		this.batchIndex++;

		const family = this.familyMap.get(familyId);
		if (!family) return null;

		const config = this.storage.getUserConfig();
		const attempts = this.storage.getAttempts(familyId);
		const stats = deriveFamilyStats(attempts);
		const format = selectFormatForMastery(
			stats.effectiveSuccesses,
			config.enabledFormats,
		);

		return {
			item: renderQuizItem({ family, format }),
			familyId,
			format,
		};
	}

	getAllAttempts(): Attempt[] {
		return this.storage.getAllAttempts();
	}

	submitAnswer(familyId: string, format: QuizFormat, correct: boolean): void {
		const nowMs = Date.now();
		const attempt = processReview(familyId, format, correct, nowMs);
		this.storage.saveAttempt(attempt);
	}

	private refreshBatch(): void {
		const attempts = this.storage.getAllAttempts();
		const nowMs = Date.now();
		this.batch = selectBatch(this.allFamilyIds, attempts, BATCH_SIZE, nowMs);
		this.batchIndex = 0;
	}
}
