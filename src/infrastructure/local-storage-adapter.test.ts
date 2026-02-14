import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import type { Attempt } from "../domain/attempt";
import { QuizFormat } from "../domain/quiz-format";
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
	test("persists and loads attempts across instances", () => {
		const adapter1 = new LocalStorageAdapter();
		const attempt: Attempt = {
			familyId: "3x5",
			format: QuizFormat.MUL,
			timestamp: 1000,
			correct: true,
		};
		adapter1.saveAttempt(attempt);

		const adapter2 = new LocalStorageAdapter();
		expect(adapter2.getAttempts("3x5")).toEqual([attempt]);
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

	test("getAllAttempts returns all attempts", () => {
		const adapter = new LocalStorageAdapter();
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

	test("ignores legacy itemId-based attempts on load", () => {
		const legacyAttempts = [
			{ itemId: "3x5:mul", timestamp: 1000, correct: true },
			{
				familyId: "3x5",
				format: QuizFormat.MUL,
				timestamp: 2000,
				correct: true,
			},
		];
		localStorage.setItem("mathfacts:attempts", JSON.stringify(legacyAttempts));

		const adapter = new LocalStorageAdapter();
		const attempts = adapter.getAllAttempts();
		expect(attempts).toHaveLength(1);
		expect(attempts[0].familyId).toBe("3x5");
	});

	test("clearAllAttempts removes all attempts and persists", () => {
		const adapter1 = new LocalStorageAdapter();
		adapter1.saveAttempt({
			familyId: "a",
			format: QuizFormat.MUL,
			timestamp: 1000,
			correct: true,
		});
		adapter1.clearAllAttempts();

		const adapter2 = new LocalStorageAdapter();
		expect(adapter2.getAllAttempts()).toEqual([]);
	});
});
