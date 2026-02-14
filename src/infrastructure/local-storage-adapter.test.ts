import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { createNewReviewRecord } from "../domain/review-record";
import { DEFAULT_USER_CONFIG } from "../domain/user-config";
import { LocalStorageAdapter } from "./local-storage-adapter";

// Minimal localStorage polyfill for Bun test environment
function createMockLocalStorage(): Storage {
	const store = new Map<string, string>();
	return {
		getItem: (key: string) => store.get(key) ?? null,
		setItem: (key: string, value: string) => store.set(key, value),
		removeItem: (key: string) => store.delete(key),
		clear: () => store.clear(),
		get length() {
			return store.size;
		},
		key: (index: number) => [...store.keys()][index] ?? null,
	};
}

beforeEach(() => {
	globalThis.localStorage = createMockLocalStorage();
});

afterEach(() => {
	// @ts-expect-error cleanup
	delete globalThis.localStorage;
});

describe("LocalStorageAdapter", () => {
	test("persists and loads review records across instances", () => {
		const adapter1 = new LocalStorageAdapter();
		const record = createNewReviewRecord("3x5:mul");
		adapter1.saveReviewRecord(record);

		const adapter2 = new LocalStorageAdapter();
		expect(adapter2.getReviewRecord("3x5:mul")).toEqual(record);
	});

	test("returns default config when none saved", () => {
		const adapter = new LocalStorageAdapter();
		const config = adapter.getUserConfig();
		expect(config.selectedTables).toEqual(DEFAULT_USER_CONFIG.selectedTables);
	});

	test("persists user config with Set serialization", () => {
		const adapter1 = new LocalStorageAdapter();
		adapter1.saveUserConfig({
			...DEFAULT_USER_CONFIG,
			selectedTables: new Set([2, 3]),
		});

		const adapter2 = new LocalStorageAdapter();
		const config = adapter2.getUserConfig();
		expect(config.selectedTables).toEqual(new Set([2, 3]));
	});

	test("getAllReviewRecords returns all records", () => {
		const adapter = new LocalStorageAdapter();
		adapter.saveReviewRecord(createNewReviewRecord("a"));
		adapter.saveReviewRecord(createNewReviewRecord("b"));
		expect(adapter.getAllReviewRecords()).toHaveLength(2);
	});
});
