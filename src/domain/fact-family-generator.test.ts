import { describe, expect, test } from "bun:test";
import { generateFactFamilies } from "./fact-family-generator";

describe("generateFactFamilies", () => {
	test("single table produces 10 families", () => {
		const families = generateFactFamilies(new Set([3]));
		expect(families).toHaveLength(10);
	});

	test("all tables (1-10) produce 55 unique families", () => {
		const families = generateFactFamilies(
			new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
		);
		expect(families).toHaveLength(55);
	});

	test("two overlapping tables deduplicate shared families", () => {
		const families = generateFactFamilies(new Set([2, 3]));
		// table 2: 1x2,2x2,2x3,2x4,...,2x10 = 10
		// table 3: 1x3,2x3(dup),3x3,3x4,...,3x10 = 10, minus 2x3 dup = 9 new
		expect(families).toHaveLength(19);
	});

	test("empty selection produces no families", () => {
		const families = generateFactFamilies(new Set());
		expect(families).toHaveLength(0);
	});
});
