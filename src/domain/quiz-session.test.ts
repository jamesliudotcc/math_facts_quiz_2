import { describe, expect, test } from "bun:test";
import { InMemoryStorage } from "../infrastructure/in-memory-storage";
import { QuizFormat } from "./quiz-format";
import { QuizSession } from "./quiz-session";

function getNextItemOrFail(session: QuizSession) {
	const result = session.getNextItem();
	if (!result) throw new Error("Expected a quiz result");
	return result;
}

describe("QuizSession", () => {
	test("initialize and get first item", () => {
		const storage = new InMemoryStorage();
		const session = new QuizSession(storage);
		session.initialize();

		const result = getNextItemOrFail(session);
		expect(result.item.prompt).toBeTruthy();
		expect(result.familyId).toBeTruthy();
		expect(result.format).toBeTruthy();
	});

	test("submit correct answer saves attempt with familyId and format", () => {
		const storage = new InMemoryStorage();
		const session = new QuizSession(storage);
		session.initialize();

		const result = getNextItemOrFail(session);
		session.submitAnswer(result.familyId, result.format, true);

		const attempts = storage.getAttempts(result.familyId);
		expect(attempts).toHaveLength(1);
		expect(attempts[0].correct).toBe(true);
		expect(attempts[0].familyId).toBe(result.familyId);
		expect(attempts[0].format).toBe(result.format);
	});

	test("submit incorrect answer saves attempt", () => {
		const storage = new InMemoryStorage();
		const session = new QuizSession(storage);
		session.initialize();

		const result = getNextItemOrFail(session);
		session.submitAnswer(result.familyId, result.format, false);

		const attempts = storage.getAttempts(result.familyId);
		expect(attempts).toHaveLength(1);
		expect(attempts[0].correct).toBe(false);
	});

	test("always returns an item when families exist", () => {
		const storage = new InMemoryStorage();
		storage.saveUserConfig({
			...storage.getUserConfig(),
			selectedTables: new Set([2]),
		});

		const session = new QuizSession(storage);
		session.initialize();

		const first = getNextItemOrFail(session);
		session.submitAnswer(first.familyId, first.format, true);

		const next = session.getNextItem();
		expect(next).not.toBeNull();
	});

	test("cycles through batch and re-batches", () => {
		const storage = new InMemoryStorage();
		storage.saveUserConfig({
			...storage.getUserConfig(),
			selectedTables: new Set([2]),
		});

		const session = new QuizSession(storage);
		session.initialize();

		const seen = new Set<string>();
		for (let i = 0; i < 15; i++) {
			const result = getNextItemOrFail(session);
			seen.add(result.familyId);
			session.submitAnswer(result.familyId, result.format, true);
		}

		expect(seen.size).toBeGreaterThan(1);
	});

	test("new families start with MUL format", () => {
		const storage = new InMemoryStorage();
		storage.saveUserConfig({
			...storage.getUserConfig(),
			selectedTables: new Set([2]),
			enabledFormats: new Set([
				QuizFormat.MUL,
				QuizFormat.MUL_MISS,
				QuizFormat.DIV,
			]),
		});

		const session = new QuizSession(storage);
		session.initialize();

		const result = getNextItemOrFail(session);
		expect(result.format).toBe(QuizFormat.MUL);
	});

	test("families with no format overlap use only MUL", () => {
		const storage = new InMemoryStorage();
		storage.saveUserConfig({
			...storage.getUserConfig(),
			selectedTables: new Set([2]),
			enabledFormats: new Set([QuizFormat.MUL]),
		});

		const session = new QuizSession(storage);
		session.initialize();

		const result = getNextItemOrFail(session);
		expect(result.format).toBe(QuizFormat.MUL);
	});
});
