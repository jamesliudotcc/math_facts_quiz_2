import { describe, expect, test } from "bun:test";
import { createAttempt } from "../domain/attempt";
import { QuizFormat } from "../domain/quiz-format";
import { DEFAULT_USER_CONFIG } from "../domain/user-config";
import { InMemoryStorage } from "./in-memory-storage";

describe("InMemoryStorage", () => {
	test("saves and retrieves attempts for a family", () => {
		const storage = new InMemoryStorage();
		const attempt = createAttempt("3x5", QuizFormat.MUL, true, 1000);
		storage.saveAttempt(attempt);
		expect(storage.getAttempts("3x5")).toEqual([attempt]);
	});

	test("returns empty array for family with no attempts", () => {
		const storage = new InMemoryStorage();
		expect(storage.getAttempts("nope")).toEqual([]);
	});

	test("getAllAttempts returns all saved attempts", () => {
		const storage = new InMemoryStorage();
		storage.saveAttempt(createAttempt("a", QuizFormat.MUL, true, 1000));
		storage.saveAttempt(createAttempt("b", QuizFormat.DIV, false, 2000));
		expect(storage.getAllAttempts()).toHaveLength(2);
	});

	test("getAttempts filters by familyId", () => {
		const storage = new InMemoryStorage();
		storage.saveAttempt(createAttempt("a", QuizFormat.MUL, true, 1000));
		storage.saveAttempt(createAttempt("b", QuizFormat.DIV, false, 2000));
		storage.saveAttempt(createAttempt("a", QuizFormat.MUL_MISS, false, 3000));
		expect(storage.getAttempts("a")).toHaveLength(2);
		expect(storage.getAttempts("b")).toHaveLength(1);
	});

	test("clearAllAttempts removes all attempts", () => {
		const storage = new InMemoryStorage();
		storage.saveAttempt(createAttempt("a", QuizFormat.MUL, true, 1000));
		storage.saveAttempt(createAttempt("b", QuizFormat.DIV, false, 2000));
		storage.clearAllAttempts();
		expect(storage.getAllAttempts()).toEqual([]);
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
