import { beforeEach, describe, expect, test } from "bun:test";
import type { Attempt } from "../domain/attempt";
import { QuizFormat } from "../domain/quiz-format";
import { DEFAULT_USER_CONFIG } from "../domain/user-config";
import { AsyncStorageAdapter } from "./async-storage-adapter";

// Minimal AsyncStorage mock for Bun test environment
function createMockAsyncStorage() {
	const store = new Map<string, string>();
	return {
		getItem: async (key: string) => store.get(key) ?? null,
		setItem: async (key: string, value: string) => {
			store.set(key, value);
		},
		removeItem: async (key: string) => {
			store.delete(key);
		},
		clear: async () => store.clear(),
		multiGet: async (keys: string[]) =>
			keys.map((k) => [k, store.get(k) ?? null] as [string, string | null]),
		multiSet: async (pairs: [string, string][]) => {
			for (const [k, v] of pairs) store.set(k, v);
		},
		multiRemove: async (keys: string[]) => {
			for (const k of keys) store.delete(k);
		},
		getAllKeys: async () => [...store.keys()],
		mergeItem: async () => {},
		multiMerge: async () => {},
	};
}

let mockStorage: ReturnType<typeof createMockAsyncStorage>;

beforeEach(() => {
	mockStorage = createMockAsyncStorage();
});

describe("AsyncStorageAdapter", () => {
	test("returns empty attempts when nothing saved", async () => {
		const adapter = await AsyncStorageAdapter.create(mockStorage);
		expect(adapter.getAllAttempts()).toEqual([]);
	});

	test("returns default config when none saved", async () => {
		const adapter = await AsyncStorageAdapter.create(mockStorage);
		const config = adapter.getUserConfig();
		expect(config.selectedTables).toEqual(DEFAULT_USER_CONFIG.selectedTables);
		expect(config.enabledFormats).toEqual(DEFAULT_USER_CONFIG.enabledFormats);
	});

	test("persists and loads attempts across instances", async () => {
		const adapter1 = await AsyncStorageAdapter.create(mockStorage);
		const attempt: Attempt = {
			familyId: "3x5",
			format: QuizFormat.MUL,
			timestamp: 1000,
			correct: true,
		};
		adapter1.saveAttempt(attempt);

		// Wait for fire-and-forget write
		await new Promise((r) => setTimeout(r, 10));

		const adapter2 = await AsyncStorageAdapter.create(mockStorage);
		expect(adapter2.getAttempts("3x5")).toEqual([attempt]);
	});

	test("persists user config with Set serialization", async () => {
		const adapter1 = await AsyncStorageAdapter.create(mockStorage);
		adapter1.saveUserConfig({
			...DEFAULT_USER_CONFIG,
			selectedTables: new Set([2, 3]),
		});

		await new Promise((r) => setTimeout(r, 10));

		const adapter2 = await AsyncStorageAdapter.create(mockStorage);
		const config = adapter2.getUserConfig();
		expect(config.selectedTables).toEqual(new Set([2, 3]));
	});

	test("getAllAttempts returns all attempts", async () => {
		const adapter = await AsyncStorageAdapter.create(mockStorage);
		adapter.saveAttempt({
			familyId: "a",
			format: QuizFormat.MUL,
			timestamp: 1000,
			correct: true,
		});
		adapter.saveAttempt({
			familyId: "b",
			format: QuizFormat.DIV,
			timestamp: 2000,
			correct: false,
		});
		expect(adapter.getAllAttempts()).toHaveLength(2);
	});

	test("ignores legacy itemId-based attempts on load", async () => {
		const legacyAttempts = [
			{ itemId: "3x5:mul", timestamp: 1000, correct: true },
			{
				familyId: "3x5",
				format: QuizFormat.MUL,
				timestamp: 2000,
				correct: true,
			},
		];
		await mockStorage.setItem(
			"mathfacts:attempts",
			JSON.stringify(legacyAttempts),
		);

		const adapter = await AsyncStorageAdapter.create(mockStorage);
		const attempts = adapter.getAllAttempts();
		expect(attempts).toHaveLength(1);
		expect(attempts[0].familyId).toBe("3x5");
	});

	test("clearAllAttempts removes all attempts and persists", async () => {
		const adapter1 = await AsyncStorageAdapter.create(mockStorage);
		adapter1.saveAttempt({
			familyId: "a",
			format: QuizFormat.MUL,
			timestamp: 1000,
			correct: true,
		});
		adapter1.clearAllAttempts();

		await new Promise((r) => setTimeout(r, 10));

		const adapter2 = await AsyncStorageAdapter.create(mockStorage);
		expect(adapter2.getAllAttempts()).toEqual([]);
	});

	test("getAttempts filters by familyId", async () => {
		const adapter = await AsyncStorageAdapter.create(mockStorage);
		adapter.saveAttempt({
			familyId: "a",
			format: QuizFormat.MUL,
			timestamp: 1000,
			correct: true,
		});
		adapter.saveAttempt({
			familyId: "b",
			format: QuizFormat.DIV,
			timestamp: 2000,
			correct: false,
		});
		expect(adapter.getAttempts("a")).toHaveLength(1);
		expect(adapter.getAttempts("a")[0].familyId).toBe("a");
	});
});
