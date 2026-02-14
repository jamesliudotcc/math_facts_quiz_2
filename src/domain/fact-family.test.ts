import { describe, expect, test } from "bun:test";
import { createFactFamily, factFamilyId } from "./fact-family";

describe("createFactFamily", () => {
	test("normalizes factor order so factor1 <= factor2", () => {
		const ff = createFactFamily(5, 3);
		expect(ff.factor1).toBe(3);
		expect(ff.factor2).toBe(5);
		expect(ff.product).toBe(15);
	});

	test("already-ordered factors stay the same", () => {
		const ff = createFactFamily(2, 7);
		expect(ff.factor1).toBe(2);
		expect(ff.factor2).toBe(7);
		expect(ff.product).toBe(14);
	});

	test("square family has equal factors", () => {
		const ff = createFactFamily(4, 4);
		expect(ff.factor1).toBe(4);
		expect(ff.factor2).toBe(4);
		expect(ff.product).toBe(16);
	});
});

describe("factFamilyId", () => {
	test("returns deterministic id string", () => {
		const ff = createFactFamily(3, 5);
		expect(factFamilyId(ff)).toBe("3x5");
	});

	test("id is same regardless of input order", () => {
		const a = createFactFamily(5, 3);
		const b = createFactFamily(3, 5);
		expect(factFamilyId(a)).toBe(factFamilyId(b));
	});
});
