import { describe, expect, test } from "bun:test";
import { createNewReviewRecord } from "../domain/review-record";
import { DEFAULT_USER_CONFIG } from "../domain/user-config";
import { InMemoryStorage } from "./in-memory-storage";

describe("InMemoryStorage", () => {
	test("stores and retrieves review records", () => {
		const storage = new InMemoryStorage();
		const record = createNewReviewRecord("3x5:mul");
		storage.saveReviewRecord(record);
		expect(storage.getReviewRecord("3x5:mul")).toEqual(record);
	});

	test("returns undefined for missing record", () => {
		const storage = new InMemoryStorage();
		expect(storage.getReviewRecord("nope")).toBeUndefined();
	});

	test("getAllReviewRecords returns all saved records", () => {
		const storage = new InMemoryStorage();
		storage.saveReviewRecord(createNewReviewRecord("a"));
		storage.saveReviewRecord(createNewReviewRecord("b"));
		expect(storage.getAllReviewRecords()).toHaveLength(2);
	});

	test("stores and retrieves user config", () => {
		const storage = new InMemoryStorage();
		expect(storage.getUserConfig()).toEqual(DEFAULT_USER_CONFIG);
		const newConfig = {
			...DEFAULT_USER_CONFIG,
			selectedTables: new Set([2, 3]),
		};
		storage.saveUserConfig(newConfig);
		expect(storage.getUserConfig().selectedTables).toEqual(new Set([2, 3]));
	});
});
