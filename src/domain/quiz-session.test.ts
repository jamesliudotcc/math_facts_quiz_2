import { describe, expect, test } from "bun:test";
import { InMemoryStorage } from "../infrastructure/in-memory-storage";
import { QuizSession } from "./quiz-session";

describe("QuizSession", () => {
	test("initialize and get first item", () => {
		const storage = new InMemoryStorage();
		// Default config has tables 2-10 selected
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
		expect(record?.repetitions).toBe(1);
	});

	test("submit incorrect answer resets repetitions", () => {
		const storage = new InMemoryStorage();
		const session = new QuizSession(storage);
		session.initialize();

		const result = session.getNextItem();
		expect(result).not.toBeNull();
		session.submitAnswer(result?.itemId ?? "", false);

		const record = storage.getReviewRecord(result?.itemId ?? "");
		expect(record).toBeDefined();
		expect(record?.repetitions).toBe(0);
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

	test("single table config limits items", () => {
		const storage = new InMemoryStorage();
		storage.saveUserConfig({
			...storage.getUserConfig(),
			selectedTables: new Set([2]),
			newItemsPerSession: 100, // uncap for this test
		});

		const session = new QuizSession(storage);
		session.initialize();

		// Table 2: 10 families. 1 square (2x2) with 3 formats, 9 non-square with 6 formats = 57
		const seenIds = new Set<string>();
		let item = session.getNextItem();
		while (item) {
			expect(seenIds.has(item.itemId)).toBe(false);
			seenIds.add(item.itemId);
			session.submitAnswer(item.itemId, true);
			item = session.getNextItem();
		}
		expect(seenIds.size).toBe(57);
	});
});
