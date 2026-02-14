import { createFactFamily, type FactFamily, factFamilyId } from "./fact-family";

export function generateFactFamilies(
	selectedTables: ReadonlySet<number>,
): FactFamily[] {
	const seen = new Set<string>();
	const families: FactFamily[] = [];

	for (const table of selectedTables) {
		for (let i = 1; i <= 10; i++) {
			const ff = createFactFamily(table, i);
			const id = factFamilyId(ff);
			if (!seen.has(id)) {
				seen.add(id);
				families.push(ff);
			}
		}
	}

	return families;
}
