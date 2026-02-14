export type FactFamily = {
	readonly factor1: number;
	readonly factor2: number;
	readonly product: number;
};

export function createFactFamily(a: number, b: number): FactFamily {
	const factor1 = Math.min(a, b);
	const factor2 = Math.max(a, b);
	return { factor1, factor2, product: factor1 * factor2 };
}

export function factFamilyId(ff: FactFamily): string {
	return `${ff.factor1}x${ff.factor2}`;
}
