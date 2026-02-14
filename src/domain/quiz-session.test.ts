import { describe, expect, test } from "bun:test";
import { InMemoryStorage } from "../infrastructure/in-memory-storage";
import { QuizSession } from "./quiz-session";

describe("QuizSession", () => {
	test("initialize and get first item", () => {
		const storage = new InMemoryStorage();
		const session = new QuizSession(storage);
		session.initialize();

		const result = session.getNextItem();
		expect(result).not.toBeNull();
		expect(result?.item.prompt).toBeTruthy();
		expect(result?.itemId).toBeTruthy();
	});

	test("submit correct answer creates review record", () => {
		const storage = new InMemoryStorage();
		const session = new QuizSession(storage);
		session.initialize();

		const result = session.getNextItem();
		expect(result).not.toBeNull();
		session.submitAnswer(result?.itemId ?? "", true);

		const record = storage.getReviewRecord(result?.itemId ?? "");
		expect(record).toBeDefined();
		expect(record?.consecutiveSuccesses).toBe(1);
	});

	test("submit incorrect answer resets consecutiveSuccesses", () => {
		const storage = new InMemoryStorage();
		const session = new QuizSession(storage);
		session.initialize();

		const result = session.getNextItem();
		expect(result).not.toBeNull();
		session.submitAnswer(result?.itemId ?? "", false);

		const record = storage.getReviewRecord(result?.itemId ?? "");
		expect(record).toBeDefined();
		expect(record?.consecutiveSuccesses).toBe(0);
	});

	test("new item introduction is tracked", () => {
		const storage = new InMemoryStorage();
		const session = new QuizSession(storage);
		session.initialize();

		const dateKey = new Date().toISOString().slice(0, 10);
		expect(storage.getNewItemsIntroducedToday(dateKey)).toBe(0);

		const result = session.getNextItem();
		expect(result).not.toBeNull();
		session.submitAnswer(result?.itemId ?? "", true);

		expect(storage.getNewItemsIntroducedToday(dateKey)).toBe(1);
	});

	test("always returns an item when tried items exist", () => {
		const storage = new InMemoryStorage();
		storage.saveUserConfig({
			...storage.getUserConfig(),
			selectedTables: new Set([2]),
			newItemsPerSession: 1,
		});

		const session = new QuizSession(storage);
		session.initialize();

		// Answer first item to create a tried item
		const first = session.getNextItem();
		expect(first).not.toBeNull();
		session.submitAnswer(first?.itemId ?? "", true);

		// Should still get items (never null when tried items exist)
		const next = session.getNextItem();
		expect(next).not.toBeNull();
	});
});
