import { describe, expect, test } from "bun:test";
import { sm2 } from "./sm2";

describe("sm2", () => {
	test("first correct answer gives interval of 1", () => {
		const result = sm2({
			quality: 4,
			repetitions: 0,
			easeFactor: 2.5,
			interval: 0,
		});
		expect(result.interval).toBe(1);
		expect(result.repetitions).toBe(1);
	});

	test("second correct answer gives interval of 6", () => {
		const result = sm2({
			quality: 4,
			repetitions: 1,
			easeFactor: 2.5,
			interval: 1,
		});
		expect(result.interval).toBe(6);
		expect(result.repetitions).toBe(2);
	});

	test("third correct answer multiplies interval by ease factor", () => {
		const result = sm2({
			quality: 4,
			repetitions: 2,
			easeFactor: 2.5,
			interval: 6,
		});
		expect(result.interval).toBe(15); // round(6 * 2.5)
		expect(result.repetitions).toBe(3);
	});

	test("incorrect answer resets repetitions and sets interval to 1", () => {
		const result = sm2({
			quality: 1,
			repetitions: 5,
			easeFactor: 2.5,
			interval: 30,
		});
		expect(result.interval).toBe(1);
		expect(result.repetitions).toBe(0);
		expect(result.easeFactor).toBe(2.5); // unchanged on fail
	});

	test("ease factor decreases for quality 3", () => {
		const result = sm2({
			quality: 3,
			repetitions: 2,
			easeFactor: 2.5,
			interval: 6,
		});
		expect(result.easeFactor).toBeLessThan(2.5);
	});

	test("ease factor increases for quality 5", () => {
		const result = sm2({
			quality: 5,
			repetitions: 2,
			easeFactor: 2.5,
			interval: 6,
		});
		expect(result.easeFactor).toBeGreaterThan(2.5);
	});

	test("ease factor never drops below 1.3", () => {
		const result = sm2({
			quality: 3,
			repetitions: 2,
			easeFactor: 1.3,
			interval: 6,
		});
		expect(result.easeFactor).toBeGreaterThanOrEqual(1.3);
	});
});
